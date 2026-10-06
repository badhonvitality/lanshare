import { useEffect, useRef, useState, useCallback } from 'react';
import { socket } from '@/lib/socket';
import { useRoomStore } from '@/store/useRoomStore';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTCViewer(targetRoomId: string) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const iceQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const [hostQuality, setHostQuality] = useState<{fps?: number, resolution?: string, mode?: string}>({});
  
  const { setConnectionState, setError, setRoom, roomId } = useRoomStore();

  const connect = useCallback((pin: string) => {
    if (!socket.connected) {
      socket.connect();
    }
    
    setConnectionState('connecting');
    setRoom(targetRoomId, false);
    socket.emit('join-room', { roomId: targetRoomId, pin });
  }, [targetRoomId, setConnectionState, setRoom]);

  const disconnect = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    socket.disconnect();
    setStream(null);
    setConnectionState('disconnected');
    setRoom(null, false);
  }, [setConnectionState, setRoom]);

  useEffect(() => {
    if (!roomId) return;

    const handleRoomJoined = ({ hostId }: { hostId: string }) => {
      console.log("Joined room, host is:", hostId);
      
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      pc.ontrack = (event) => {
        console.log("Received track:", event.track.kind);
        setStream(event.streams[0]);
        setConnectionState('connected');
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { target: hostId, candidate: event.candidate });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setConnectionState('error');
          setError("Connection to host lost.");
        }
      };
    };

    const handleOffer = async ({ sender, offer }: { sender: string, offer: RTCSessionDescriptionInit }) => {
      const pc = pcRef.current;
      if (!pc) return;
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.emit('answer', { target: sender, answer: pc.localDescription });

        for (const candidate of iceQueueRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
        }
        iceQueueRef.current = [];
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    };

    const handleIceCandidate = async ({ candidate }: { sender: string, candidate: RTCIceCandidateInit }) => {
      const pc = pcRef.current;
      if (pc) {
        if (!pc.remoteDescription) {
          iceQueueRef.current.push(candidate);
          return;
        }
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ice candidate:", err);
        }
      }
    };

    const handleHostDisconnected = () => {
      setError("Host has stopped sharing.");
      setConnectionState('disconnected');
      setStream(null);
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };

    const handleQualityUpdated = (quality: {fps?: number, resolution?: string, mode?: string}) => {
      setHostQuality(quality);
    };

    const handleError = ({ message }: { message: string }) => {
      setError(message);
      setConnectionState('error');
    };

    socket.on('room-joined', handleRoomJoined);
    socket.on('offer', handleOffer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('host-disconnected', handleHostDisconnected);
    socket.on('quality-updated', handleQualityUpdated);
    socket.on('error', handleError);

    return () => {
      socket.off('room-joined', handleRoomJoined);
      socket.off('offer', handleOffer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('host-disconnected', handleHostDisconnected);
      socket.off('quality-updated', handleQualityUpdated);
      socket.off('error', handleError);
    };
  }, [roomId, setConnectionState, setError]);

  return { stream, connect, disconnect, hostQuality };
}
