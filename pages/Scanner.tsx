import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { useNavigate } from 'react-router-dom';
import { scanQRCode } from '../services/storage';
import { ScanResult } from '../types';
import GlassPanel from '../components/GlassPanel';
import { XCircle, CheckCircle, AlertTriangle, RefreshCcw, X, Camera } from 'lucide-react';
import Button from '../components/Button';

const Scanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Funzione attivata dal bottone (risolve il blocco autoplay)
  const startCamera = async () => {
    setErrorMsg("");
    try {
      // 1. Chiedi permesso (prova posteriore, fallback su qualsiasi)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" },
        audio: false 
      }).catch(() => {
         return navigator.mediaDevices.getUserMedia({ video: true });
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // Fondamentale per iOS
        videoRef.current.muted = true;
        
        // 2. Avvia riproduzione
        await videoRef.current.play();
        setIsCameraActive(true);
        requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Errore: ${err.name}. Assicurati di usare HTTPS e dare i permessi.`);
    }
  };

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          if (imageData.data.length > 0) {
             const code = jsQR(imageData.data, imageData.width, imageData.height, {
               inversionAttempts: "dontInvert",
             });
             if (code && code.data) {
                handleScan(code.data);
                return; // Stop loop
             }
          }
        }
      }
    }
    if (!scanResult) {
      requestAnimationFrame(tick);
    }
  };

  const handleScan = async (data: string) => {
    // Ferma il video per risparmiare risorse
    if (videoRef.current && videoRef.current.srcObject) {
       const stream = videoRef.current.srcObject as MediaStream;
       stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);

    // Chiamata API
    const result = await scanQRCode(data);
    setScanResult(result);
  };

  const resetScan = () => {
    setScanResult(null);
    startCamera(); // Riavvia la camera
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Tasto Chiudi */}
      <div className="absolute top-4 right-4 z-50">
          <button onClick={() => navigate('/')} className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white">
              <X size={24} />
          </button>
      </div>

      {/* STATO 1: Camera non attiva (Schermata Iniziale) */}
      {!isCameraActive && !scanResult && (
        <div className="z-20 text-center p-8">
            <h2 className="text-2xl font-bold text-white mb-6">SCANNER INGRESSO</h2>
            <Button onClick={startCamera} className="w-full py-4 text-lg">
                <Camera className="mr-2" /> AVVIA FOTOCAMERA
            </Button>
            {errorMsg && (
                <p className="mt-4 text-red-500 text-sm bg-red-900/20 p-2 rounded border border-red-500/30">
                    {errorMsg}
                </p>
            )}
        </div>
      )}

      {/* STATO 2: Camera Attiva */}
      <div className={`absolute inset-0 z-0 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}>
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Mirino */}
        {isCameraActive && (
            <div className="absolute inset-0 border-[50px] border-black/60 pointer-events-none z-10 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-red-500/50 relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-red-500"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-red-500"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-red-500"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-red-500"></div>
                </div>
            </div>
        )}
      </div>

      {/* STATO 3: Risultato Scansione */}
      {scanResult && (
        <div className="relative z-30 p-4 w-full max-w-md">
           <GlassPanel intensity="high" className={`p-8 text-center border-2 ${scanResult.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex flex-col items-center gap-4">
                {scanResult.type === 'success' && <CheckCircle className="w-20 h-20 text-green-500" />}
                {scanResult.type === 'error' && <XCircle className="w-20 h-20 text-red-500" />}
                {scanResult.type === 'warning' && <AlertTriangle className="w-20 h-20 text-yellow-500" />}
                
                <h2 className="text-2xl font-bold text-white uppercase mt-2">{scanResult.message}</h2>
                
                {scanResult.guest && (
                  <div className="bg-white/10 p-4 rounded-xl w-full">
                    <p className="text-xl font-bold">{scanResult.guest.firstName} {scanResult.guest.lastName}</p>
                    <p className="text-gray-400">@{scanResult.guest.instagram}</p>
                  </div>
                )}

                <Button onClick={resetScan} className="w-full mt-6" variant="secondary">
                  <RefreshCcw className="w-4 h-4 mr-2" /> Scansiona Prossimo
                </Button>
              </div>
           </GlassPanel>
        </div>
      )}
    </div>
  );
};

export default Scanner;
