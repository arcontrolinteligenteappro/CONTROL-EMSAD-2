
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Send, BrainCircuit, X, Loader2, Image as ImageIcon, Sparkles, Printer, Mic, MicOff, LayoutGrid } from 'lucide-react';
import { solveProblemMultimodal } from '../geminiService';
import { INSTITUTION_INFO } from '../constants';

const TutorIA: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'es-MX';
      recognitionRef.current.onresult = (event: any) => {
        setPrompt(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleMic = () => {
    if (isListening) recognitionRef.current.stop();
    else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { alert("Cámara no disponible."); setIsCameraOpen(false); }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setImage(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const handleSolve = async () => {
    setLoading(true);
    try {
      const res = await solveProblemMultimodal(prompt || "Explica este material del CECyTEN.", image || undefined);
      setResult(res);
    } catch (err) { alert("Error IA"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-white rounded-[3.5rem] border border-slate-200 p-10 shadow-sm space-y-8 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <BrainCircuit size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 uppercase italic leading-none">Tutor Visual IA</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nayarit • EMSaD 16 El Macho</p>
            </div>
          </div>
          <button onClick={toggleMic} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white'}`}>
             {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Dicta o escribe tu duda académica..."
            className="w-full h-64 bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 text-sm font-bold outline-none focus:border-blue-500 transition-all resize-none shadow-inner"
          />
          <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] overflow-hidden relative flex items-center justify-center group">
            {image ? (
              <img src={image} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={64} className="text-slate-200" />
            )}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-4 backdrop-blur-md">
               <button onClick={startCamera} className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"><Camera size={18}/> Cámara</button>
               <label className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-xl cursor-pointer hover:scale-105 transition-transform">
                  <LayoutGrid size={18}/> Galería <input type="file" hidden accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { const r = new FileReader(); r.onload = () => setImage(r.result as string); r.readAsDataURL(f); }
                  }} />
               </label>
            </div>
          </div>
        </div>

        <button onClick={handleSolve} disabled={loading || (!prompt && !image)} className={`w-full py-6 rounded-[2rem] font-black uppercase text-sm flex items-center justify-center gap-3 transition-all shadow-2xl ${loading ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
          {loading ? 'Analizando Contenido...' : 'Obtener Explicación IA'}
        </button>
      </div>

      {result && (
        <div className="bg-slate-900 text-white p-12 rounded-[4rem] border border-blue-500/20 shadow-2xl animate-in zoom-in-95">
           <div className="prose prose-invert max-w-none whitespace-pre-wrap font-medium leading-relaxed opacity-90">
              {result}
           </div>
        </div>
      )}

      {isCameraOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-3xl">
          <video ref={videoRef} autoPlay className="max-w-3xl w-full rounded-[3rem] shadow-2xl border-4 border-white/10" />
          <div className="mt-10 flex gap-6">
            <button onClick={stopCamera} className="px-10 py-5 bg-white/10 text-white rounded-[2rem] font-black uppercase text-xs">Cerrar</button>
            <button onClick={capturePhoto} className="px-16 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs shadow-2xl">Capturar Material</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorIA;
