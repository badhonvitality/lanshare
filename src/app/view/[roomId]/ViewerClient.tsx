'use client';

import { useEffect, useRef, useState } from 'react';
import { useWebRTCViewer } from '@/hooks/useWebRTCViewer';
import { Maximize, Minimize, Settings, Activity, WifiOff, RotateCcw, Lock } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import { useTranslation } from '@/lib/i18n';

export default function ViewerClient({ roomId }: { roomId: string }) {
  const { stream, connect, disconnect, hostQuality } = useWebRTCViewer(roomId);
  const { connectionState, error } = useRoomStore();
  const { t } = useTranslation();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [objectFit, setObjectFit] = useState<'contain' | 'cover'>('contain');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [pin, setPin] = useState('');
  const [hasEnteredPin, setHasEnteredPin] = useState(false);

  // Handle stream attachment
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 4) {
      setHasEnteredPin(true);
      connect(pin);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

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
        <h2 className="text-xl font-bold text-white mb-2">{t('connectionFailed')}</h2>
        <p className="text-white/60 mb-6">{error}</p>
        <button 
          onClick={() => {
            if (error === "Invalid PIN") {
              setHasEnteredPin(false);
              setPin('');
            } else {
              connect(pin);
            }
          }}
          className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-white/90"
        >
          {error === "Invalid PIN" ? t('tryAgain') : t('tryReconnecting')}
        </button>
      </div>
    );
  }

  if (!hasEnteredPin) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 touch-none">
        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('enterPin')}</h2>
          <p className="text-white/50 text-center mb-8 text-sm">
            {t('enterPinDesc')}
          </p>
          <form onSubmit={handleJoin} className="w-full flex flex-col gap-4">
            <input 
              type="text" 
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0000"
              className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-4 text-center text-3xl font-mono text-white tracking-widest outline-none focus:border-white/50 transition-colors"
              autoFocus
            />
            <button 
              type="submit"
              disabled={pin.length !== 4}
              className="w-full py-4 rounded-xl bg-white text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 transition-colors"
            >
              {t('joinRoom')}
            </button>
          </form>
        </div>
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
          <p className="text-white/60 font-medium">{t('connectingToHost')}</p>
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
              {connectionState === 'connected' ? t('live') : t('connecting')}
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
                <span className="text-[10px] font-bold tracking-wider">{objectFit === 'contain' ? t('fit') : t('fill')}</span>
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
