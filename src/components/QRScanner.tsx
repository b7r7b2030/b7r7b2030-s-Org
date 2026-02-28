import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, QrCode, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, title }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Camera error:", err);
        setHasPermission(false);
      }
    }

    setupCamera();

    const scan = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            onScan(code.data);
            setScanning(false);
            return;
          }
        }
      }
      if (scanning) {
        animationFrameId = requestAnimationFrame(scan);
      }
    };

    if (hasPermission) {
      animationFrameId = requestAnimationFrame(scan);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasPermission, onScan, scanning]);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      <div className="p-6 flex items-center justify-between text-white relative z-10">
        <h3 className="font-display font-bold text-lg">{title}</h3>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="hidden" />
        {hasPermission === false ? (
          <div className="text-center p-8 space-y-4">
            <div className="w-20 h-20 bg-red/20 text-red rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert size={40} />
            </div>
            <h4 className="text-white font-bold">تعذر الوصول للكاميرا</h4>
            <p className="text-text3 text-sm">يرجى السماح بالوصول للكاميرا من إعدادات المتصفح</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-accent text-white rounded-xl font-bold"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            
            {/* Scanner Overlay */}
            <div className="relative w-64 h-64 border-2 border-accent rounded-3xl overflow-hidden shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-linear-to-b from-accent/20 to-transparent animate-scan"></div>
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-lg"></div>
            </div>

            <div className="absolute bottom-20 left-0 right-0 text-center px-8">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 inline-flex items-center gap-3">
                <RefreshCw size={18} className="text-accent animate-spin" />
                <span className="text-white text-sm font-medium">جاري البحث عن رمز QR...</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
