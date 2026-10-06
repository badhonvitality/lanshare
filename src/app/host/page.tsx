'use client';

import { useEffect, useState, useRef } from 'react';
import { useWebRTCHost } from '@/hooks/useWebRTCHost';
import { useRoomStore } from '@/store/useRoomStore';
import { QRCodeSVG } from 'qrcode.react';
import { MonitorUp, StopCircle, Users, Copy, Settings2, Activity, Link as LinkIcon, Monitor, Film, Lock, Globe } from 'lucide-react';
import { socket } from '@/lib/socket';
import { useTranslation, useI18nStore } from '@/lib/i18n';

export default function HostPage() {
  const { stream, startScreenShare, stopScreenShare } = useWebRTCHost();
  const { roomId, roomPin, viewersCount, connectionState, quality, fps, streamMode, setQuality, setFps, setStreamMode, error } = useRoomStore();
  const { t, language } = useTranslation();
  const { setLanguage } = useI18nStore();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lanIp, setLanIp] = useState<string>('');
  const [port, setPort] = useState<number>(3000);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    socket.on('room-created', ({ lanIp, port }) => {
      setLanIp(lanIp);
      setPort(port);
    });
    return () => {
      socket.off('room-created');
    };
  }, []);

  const shareUrl = roomId && lanIp ? `https://${lanIp}${port === 443 ? '' : `:${port}`}/view/${roomId}` : '';

  const copyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8 flex flex-col max-w-7xl mx-auto">
      <header className="flex items-center justify-between pb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
            <Monitor className="w-4 h-4" />
          </div>
          {t('hostDashboard')}
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'বাংলা' : 'English'}
          </button>
          {connectionState === 'connected' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t('live')}
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Preview & Main Controls */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="relative aspect-video bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden flex flex-col items-center justify-center">
            {stream ? (
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-white/40">
                <MonitorUp className="w-12 h-12 opacity-50" />
                <p className="font-medium">{t('readyToShare')}</p>
              </div>
            )}
            
            {/* Overlay controls when hovering */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
              {stream && (
                <div className="flex items-center gap-3 text-sm font-medium text-white/80">
                  <span className="flex items-center gap-1.5"><Activity className="w-4 h-4"/> {fps} FPS</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">{quality === 'source' ? 'Source Quality' : quality}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">{streamMode === 'source' ? 'Source Mode' : 'Smooth Mode'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!stream ? (
              <button 
                onClick={startScreenShare}
                className="flex-1 h-14 bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors active:scale-[0.98]"
              >
                <MonitorUp className="w-5 h-5" />
                {t('startSharing')}
              </button>
            ) : (
              <button 
                onClick={stopScreenShare}
                className="flex-1 h-14 bg-red-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors active:scale-[0.98]"
              >
                <StopCircle className="w-5 h-5" />
                {t('stopSharing')}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Settings & Info */}
        <div className="flex flex-col gap-6">
          {stream && shareUrl ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">{t('viewers')}</h3>
                <div className="flex items-center gap-3 text-2xl font-semibold text-white">
                  <Users className="w-6 h-6 text-white/40" />
                  {viewersCount} {t('connected')}
                </div>
              </div>

              <div className="h-px w-full bg-white/10" />

              <div>
                <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">{t('share')}</h3>
                <div className="bg-white p-4 rounded-xl flex items-center justify-center mb-4">
                  <QRCodeSVG value={shareUrl} size={160} level="M" />
                </div>
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 p-2 rounded-lg">
                  <span className="text-sm text-white/70 truncate flex-1 font-mono">{shareUrl}</span>
                  <button 
                    onClick={copyLink}
                    className="p-2 bg-white/10 rounded-md hover:bg-white/20 transition-colors text-white"
                  >
                    {copied ? <span className="text-xs font-medium px-1">{t('copied')}</span> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {roomPin && (
                  <div className="mt-4 flex items-center justify-between bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-red-400">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('roomPin')}:</span>
                    </div>
                    <span className="text-xl font-mono font-bold tracking-widest text-white">{roomPin}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px] text-white/30">
              <LinkIcon className="w-8 h-8 mb-3 opacity-50" />
              <p className="text-sm max-w-[200px]">{t('sharePlaceholder')}</p>
            </div>
          )}

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> {t('controls')}
            </h3>
            
            {/* Mode Selection */}
            <div className="space-y-3">
              <label className="text-sm text-white/70">{t('streamMode')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStreamMode('source')}
                  className={`p-3 rounded-xl border flex flex-col gap-1 items-start text-left transition-colors ${streamMode === 'source' ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:bg-white/5'}`}
                >
                  <span className="font-medium text-sm text-white flex items-center gap-1.5"><Monitor className="w-3 h-3"/> {t('source')}</span>
                  <span className="text-xs text-white/40">{t('sourceDesc')}</span>
                </button>
                <button
                  onClick={() => setStreamMode('smooth')}
                  className={`p-3 rounded-xl border flex flex-col gap-1 items-start text-left transition-colors ${streamMode === 'smooth' ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:bg-white/5'}`}
                >
                  <span className="font-medium text-sm text-white flex items-center gap-1.5"><Film className="w-3 h-3"/> {t('smooth')}</span>
                  <span className="text-xs text-white/40">{t('smoothDesc')}</span>
                </button>
              </div>
            </div>

            {/* Resolution */}
            <div className="space-y-3">
              <label className="text-sm text-white/70">{t('resolution')}</label>
              <select 
                value={quality}
                onChange={(e) => setQuality(e.target.value as "source" | "1080p" | "720p" | "480p")}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              >
                <option value="source">Source (Best for text)</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
              </select>
            </div>

            {/* FPS */}
            <div className="space-y-3">
              <label className="text-sm text-white/70">{t('framerate')}</label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 60].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFps(f as 15 | 30 | 60)}
                    className={`py-2 rounded-lg border text-sm font-medium transition-colors ${fps === f ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-white/50 hover:bg-white/5 hover:text-white/80'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
