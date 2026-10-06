import Link from 'next/link';
import { MonitorPlay, Zap, Shield, Wifi, ScanLine } from 'lucide-react';


export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      
      <div className="z-10 w-full max-w-3xl flex flex-col items-center text-center space-y-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Local Network Only
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-tight">
            Share your screen. <br />
            <span className="text-white/40">Instantly. Locally.</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto font-medium">
            High-performance WebRTC screen sharing over your local network. No cloud, no internet required.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-6">
          <Link 
            href="/host" 
            className="group relative flex w-full sm:w-auto items-center justify-center px-8 py-4 bg-white text-black font-semibold rounded-2xl overflow-hidden transition-transform active:scale-95 shadow-lg shadow-white/10"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative flex items-center gap-2">
              <MonitorPlay className="w-5 h-5" />
              Start Sharing
            </span>
          </Link>

          <Link 
            href="/connect" 
            className="group relative flex w-full sm:w-auto items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-2xl overflow-hidden transition-all active:scale-95 border border-white/20 hover:bg-white/10"
          >
            <span className="relative flex items-center gap-2">
              <ScanLine className="w-5 h-5" />
              Scan to Connect
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-white/10 w-full text-left">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Zap className="w-5 h-5 text-white/70" />
            </div>
            <h3 className="font-semibold text-white">Ultra Low Latency</h3>
            <p className="text-sm text-white/50 leading-relaxed">Direct peer-to-peer WebRTC connections bypassing the public internet.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Shield className="w-5 h-5 text-white/70" />
            </div>
            <h3 className="font-semibold text-white">Secure by Default</h3>
            <p className="text-sm text-white/50 leading-relaxed">Streams never leave your LAN. No cloud recording, no accounts.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Wifi className="w-5 h-5 text-white/70" />
            </div>
            <h3 className="font-semibold text-white">Mobile Optimized</h3>
            <p className="text-sm text-white/50 leading-relaxed">Built from the ground up for viewing on iOS and Android devices.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
