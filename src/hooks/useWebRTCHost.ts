import { useEffect, useRef, useState, useCallback } from 'react';
import { socket } from '@/lib/socket';
import { useRoomStore } from '@/store/useRoomStore';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTCHost() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const iceQueuesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const { roomId, quality, fps, streamMode, setConnectionState, setError, setRoom } = useRoomStore();

  const startScreenShare = useCallback(async () => {
    try {
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: {
          displaySurface: 'monitor',
        },
        audio: true,
      };

      // Applying constraints based on user settings
      if (streamMode === 'source' || quality === 'source') {
        (displayMediaOptions.video as MediaTrackConstraints) = {
          ...displayMediaOptions.video as MediaTrackConstraints,
          frameRate: { ideal: fps, max: fps },
          // @ts-ignore
          resizeMode: 'none', // Prevent scaling for sharper text
        };
      } else {
        const height = quality === '1080p' ? 1080 : quality === '720p' ? 720 : quality === '480p' ? 480 : 1080;
        (displayMediaOptions.video as MediaTrackConstraints) = {
          ...displayMediaOptions.video as MediaTrackConstraints,
          height: { ideal: height },
          frameRate: { ideal: fps, max: fps },
        };
      }

      const mediaStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      
      setStream(mediaStream);
      
      mediaStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      // Connect socket and create room
      if (!socket.connected) {
        socket.connect();
      }

      const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      setRoom(newRoomId, true);
      
      socket.emit('create-room', { roomId: newRoomId });
      setConnectionState('connected');

    } catch (err) {
      console.error("Error sharing screen:", err);
      setError("Failed to start screen share. Permission denied or unsupported.");
      setConnectionState('error');
    }
  }, [quality, fps, streamMode, setRoom, setConnectionState, setError]);

  const stopScreenShare = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();
    iceQueuesRef.current.clear();
    socket.disconnect();
    setRoom(null, false);
    setConnectionState('disconnected');
  }, [stream, setRoom, setConnectionState]);

  // Handle renegotiation if settings change
  useEffect(() => {
    if (stream && peersRef.current.size > 0) {
      // Re-apply constraints to existing stream tracks
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const constraints: MediaTrackConstraints = {
          frameRate: { ideal: fps, max: fps }
        };
        
        if (streamMode === 'source' || quality === 'source') {
          // @ts-ignore
          constraints.resizeMode = 'none';
        } else {
          const height = quality === '1080p' ? 1080 : quality === '720p' ? 720 : quality === '480p' ? 480 : 1080;
          constraints.height = { ideal: height };
        }
        
        videoTrack.applyConstraints(constraints).catch(console.error);
        
        // Broadcast quality change to viewers
        socket.emit('host-quality-update', { 
          roomId, 
          quality: { fps, resolution: quality, mode: streamMode } 
        });
      }
    }
  }, [fps, quality, streamMode, stream, roomId]);

  useEffect(() => {
    if (!stream || !roomId) return;

    const handleViewerJoined = async ({ viewerId }: { viewerId: string }) => {
      console.log('Viewer joined:', viewerId);
      if (peersRef.current.has(viewerId)) return;
      
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peersRef.current.set(viewerId, pc);
      iceQueuesRef.current.set(viewerId, []);

      // Add tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { target: viewerId, candidate: event.candidate });
        }
      };

      // Create Offer
      try {
        const offer = await pc.createOffer({
          offerToReceiveVideo: false,
          offerToReceiveAudio: false
        });
        
        // In a real production app, we'd aggressively munge SDP for high bitrates if needed.
        // For standard WebRTC, modifying constraints is often enough.
        
        await pc.setLocalDescription(offer);
        socket.emit('offer', { target: viewerId, offer: pc.localDescription });
      } catch (err) {
        console.error("Error creating offer:", err);
      }
    };

    const handleAnswer = async ({ sender, answer }: { sender: string, answer: RTCSessionDescriptionInit }) => {
      const pc = peersRef.current.get(sender);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          const queue = iceQueuesRef.current.get(sender) || [];
          for (const candidate of queue) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
          }
          iceQueuesRef.current.set(sender, []);
        } catch (err) {
          console.error("Error setting remote description:", err);
        }
      }
    };

    const handleIceCandidate = async ({ sender, candidate }: { sender: string, candidate: RTCIceCandidateInit }) => {
      const pc = peersRef.current.get(sender);
      if (pc) {
        if (!pc.remoteDescription) {
          const queue = iceQueuesRef.current.get(sender) || [];
          queue.push(candidate);
          iceQueuesRef.current.set(sender, queue);
          return;
        }
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ice candidate:", err);
        }
      }
    };

    const handleViewerLeft = ({ viewerId }: { viewerId: string }) => {
      const pc = peersRef.current.get(viewerId);
      if (pc) {
        pc.close();
        peersRef.current.delete(viewerId);
        iceQueuesRef.current.delete(viewerId);
      }
    };

    socket.on('viewer-joined', handleViewerJoined);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('viewer-left', handleViewerLeft);

    return () => {
      socket.off('viewer-joined', handleViewerJoined);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('viewer-left', handleViewerLeft);
    };
  }, [stream, roomId]);

  return { stream, startScreenShare, stopScreenShare };
}
