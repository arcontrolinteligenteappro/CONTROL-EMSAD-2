import React, { useState, useEffect } from 'react';

const Branding: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const fullText = "Desarrollado por ChrisRey91 – www.arcontrolinteligente.com";
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) i = 0;
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col select-none">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-black dark:text-blue-400 text-red-800 tracking-tighter uppercase italic glitch-text">
          AR CONTROL DOCENTE EMSAD 16
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-emerald-500/70 overflow-hidden whitespace-nowrap border-r-2 border-emerald-500 animate-pulse pr-1">
          {displayText}
        </span>
      </div>
    </div>
  );
};

export default Branding;