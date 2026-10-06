'use client';

import { useEffect, useRef, useState } from 'react';
import { useWebRTCViewer } from '@/hooks/useWebRTCViewer';
import { Maximize, Minimize, Settings, Activity, WifiOff, RotateCcw } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';

export default function ViewerClient({ roomId }: { roomId: string }) {
  const { stream, connect, disconnect, hostQuality } = useWebRTCViewer(roomId);
  const { connectionState, error } = useRoomStore();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [objectFit, setObjectFit] = useState<'contain' | 'cover'>('contain');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize connection
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Handle stream attachment
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Handle fullscreen
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(console.error);
    } else {
      await document.exitFullscreen().catch(console.error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle controls auto-hide
  const showControls = () => {
    setControlsVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (connectionState === 'error') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 text-center">
        <WifiOff className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Connection Failed</h2>
        <p className="text-white/60 mb-6">{error}</p>
        <button 
          onClick={connect}
          className="px-6 py-3 bg-white text-black font-semibold rounded-full"
        >
          Try Reconnecting
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black touch-none"
      onClick={showControls}
      onMouseMove={showControls}
      onTouchStart={showControls}
    >
      {/* Video Layer */}
      {stream ? (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`transition-all duration-300 origin-center ${isRotated ? 'w-[100vh] h-[100vw] -rotate-90' : 'w-full h-full'}`}
            style={{ objectFit }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
          <p className="text-white/60 font-medium">Connecting to host...</p>
        </div>
      )}

      {/* UI Overlay Layer */}
      <div 
        className={`absolute inset-0 flex flex-col justify-between pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] transition-opacity duration-500 pointer-events-none ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connectionState === 'connected' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
            <span className="text-white font-medium text-sm drop-shadow-md">
              {connectionState === 'connected' ? 'LIVE' : 'Connecting'}
            </span>
          </div>
          
          <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-xs font-mono border border-white/10">
            {roomId}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-auto">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            
            {/* Stream Info */}
            <div className="flex items-center gap-3">
              {hostQuality.fps && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-white/80 bg-white/10 px-2 py-1 rounded">
                  <Activity className="w-3 h-3" />
                  {hostQuality.fps} FPS
                </div>
              )}
              {hostQuality.resolution && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-white/80 bg-white/10 px-2 py-1 rounded">
                  <Settings className="w-3 h-3" />
                  {hostQuality.resolution === 'source' ? 'SRC' : hostQuality.resolution}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsRotated(!isRotated); }}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isRotated ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20 active:bg-white/30'}`}
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button 
                onClick={(e) => { e.stopPropagation(); setObjectFit(f => f === 'contain' ? 'cover' : 'contain'); }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:bg-white/30 transition-colors"
              >
                <span className="text-[10px] font-bold tracking-wider">{objectFit === 'contain' ? 'FIT' : 'FILL'}</span>
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:bg-white/90 active:scale-95 transition-all"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
