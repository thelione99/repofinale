import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from "./logo.png"; // Assicurati che il file esista!

export const GlassCard: React.FC = () => {
  const navigate = useNavigate(); // Hook per cambiare pagina
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line1Completed, setLine1Completed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const staticText = "01.00 - 06.00 AM";
  const randomPhrases = [
    "Non fartelo raccontare.", "L'evento dell'anno.", "Not for all.",
    "Il caos ti attende.", "Red Passion.", "Chiudi gli occhi."
  ];

  // Effetto Macchina da scrivere (Line 1)
  useEffect(() => {
    let index1 = 0;
    const timer1 = setInterval(() => {
      if (index1 <= staticText.length) {
        setLine1(staticText.slice(0, index1));
        index1++;
      } else {
        clearInterval(timer1);
        setLine1Completed(true);
      }
    }, 50);
    return () => clearInterval(timer1);
  }, []);

  // Effetto Macchina da scrivere (Line 2 - Loop)
  useEffect(() => {
    if (!line1Completed) return;
    const handleType = () => {
      const i = loopNum % randomPhrases.length;
      const fullText = randomPhrases[i];
      setLine2(isDeleting ? fullText.substring(0, line2.length - 1) : fullText.substring(0, line2.length + 1));
      setTypingSpeed(isDeleting ? 40 : 100);

      if (!isDeleting && line2 === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && line2 === '') {
        setIsDeleting(false);
        setLoopNum(Math.floor(Math.random() * randomPhrases.length));
      }
    };
    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [line2, isDeleting, line1Completed, loopNum, typingSpeed]);

  const handleEnter = () => {
    // Naviga alla pagina di registrazione del vecchio sito
    navigate('/register');
  };

  return (
    <div className="relative flex flex-col items-center text-center z-10 animate-in fade-in zoom-in duration-1000">
      
      {/* Logo */}
      <div className="mb-12 relative group cursor-default">
        <div className="absolute inset-0 bg-red-600 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full"></div>
        <div className="relative">
          <div className="absolute inset-0 bg-red-600 blur-[80px] opacity-20 z-0"></div>
          <img src={logo} alt="Logo" className="w-32 h-32 object-cover rounded-xl block relative z-20" />
        </div>
      </div>

      <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight drop-shadow-xl text-center">
        <span className="block">RUSSOLOCO</span>
        <span className="block text-3xl md:text-4xl font-light italic">"XMAS EVE"</span>
      </h1>

      <div className="flex flex-col items-center gap-2 mb-16 h-20">
        <p className="text-neutral-400 text-lg md:text-xl font-light tracking-wide min-h-[1.5rem]">
          {line1}<span className={`${!line1Completed ? 'opacity-100' : 'opacity-0'} animate-pulse ml-1`}>|</span>
        </p>
        <p className="text-neutral-500 text-lg md:text-xl font-light italic tracking-wider min-h-[1.5rem] transition-colors duration-300">
          {line2}<span className={`${line1Completed ? 'opacity-100' : 'opacity-0'} animate-pulse ml-1 text-red-800`}>|</span>
        </p>
      </div>

      <button onClick={handleEnter} className="group relative px-10 py-4 bg-transparent overflow-hidden rounded-full transition-all duration-500 hover:scale-105 cursor-pointer">
        <div className="absolute inset-0 border border-neutral-800 group-hover:border-red-600/50 rounded-full transition-colors duration-500"></div>
        <div className="absolute inset-0 bg-red-900/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative flex items-center gap-4 text-neutral-300 group-hover:text-white transition-colors duration-300 font-light tracking-[0.2em] uppercase text-sm">
          <span>Entra</span>
          <ArrowRight className="w-4 h-4 text-red-600 -ml-1 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </button>

    </div>
  );
};