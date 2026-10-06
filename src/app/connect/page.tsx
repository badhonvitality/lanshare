'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ConnectPage() {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let html5QrCode: Html5Qrcode;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("qr-reader");
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (html5QrCode.isScanning) {
              setScanning(false);
              html5QrCode.stop().then(() => {
                try {
                  const url = new URL(decodedText);
                  if (url.pathname.startsWith('/view/')) {
                    router.push(url.pathname);
                  } else {
                    window.location.href = decodedText;
                  }
                } catch {
                  // Not a URL, try treating as raw room ID
                  router.push(`/view/${decodedText}`);
                }
              }).catch(console.error);
            }
          },
          () => {
            // Ignore normal read errors
          }
        );
      } catch (err) {
        console.error("Camera error:", err);
        setError("Camera permission denied or not available. Please ensure you're using HTTPS or localhost and allow camera access.");
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [router]);

  return (
    <main className="flex flex-col items-center min-h-screen bg-black p-6">
      <div className="w-full max-w-md pt-[env(safe-area-inset-top)] pb-12 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-12 relative pt-6">
          <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold text-white absolute left-1/2 -translate-x-1/2">
            Scan to Connect
          </h1>
        </div>

        {/* Scanner */}
        <div className="w-full aspect-square relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
          {error ? (
            <div className="flex flex-col items-center p-6 text-center text-red-400">
              <ShieldAlert className="w-12 h-12 mb-4 opacity-80" />
              <p className="font-medium text-sm leading-relaxed">{error}</p>
            </div>
          ) : (
            <>
              <div id="qr-reader" className="w-full h-full object-cover" />
              {/* Overlay styling for the scanner */}
              {scanning && (
                <div className="absolute inset-0 pointer-events-none border-[40px] border-black/50 transition-all">
                  <div className="w-full h-full border-2 border-white/30 rounded-xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white -translate-x-1 -translate-y-1 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white translate-x-1 -translate-y-1 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white -translate-x-1 translate-y-1 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white translate-x-1 translate-y-1 rounded-br-lg" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <p className="mt-8 text-center text-white/50 text-sm font-medium">
          Point your camera at the QR code displayed on the host screen.
        </p>
      </div>
    </main>
  );
}
