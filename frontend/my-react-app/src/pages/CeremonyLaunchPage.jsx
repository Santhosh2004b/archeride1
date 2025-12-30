// src/pages/CeremonyLaunchPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisi consectetur nisi, euismod euismod nisi nisi euismod nisi.`;

export default function CeremonyLaunchPage() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [ribbonCut, setRibbonCut] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLaunch, setShowLaunch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t1 = setTimeout(() => setShowPrompt(true), 3000);
    return () => clearTimeout(t1);
  }, []);

  const handleRibbonCut = () => {
    setRibbonCut(true);
    setTimeout(() => setShowWelcome(true), 1200);
    setTimeout(() => {
      setShowWelcome(false);
      setShowAbout(true);
      setTimeout(() => setShowLaunch(true), 3000);
    }, 3200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brandBg relative overflow-hidden p-3 sm:p-5">
      {/* Animated Header */}
      <h1 className="font-marcellus font-bold text-3xl sm:text-4xl text-brandDark text-center mb-4 animate-fade-in-up tracking-tight">Arche RI-DE Ceremony Launch</h1>
      <p className="max-w-xl text-center font-urbanist text-brandMuted mb-6 animate-fade-in-up delay-200">{lorem.repeat(2)}</p>
      {/* Ribbon Animation */}
      <div className="my-8 flex flex-col items-center">
        <div className={`ribbon ${ribbonCut ? "ribbon-cut" : ""}`}></div>
        {showPrompt && !ribbonCut && (
          <button onClick={handleRibbonCut} className="mt-6 px-6 py-2 bg-pink-500 text-white rounded-full shadow-lg text-lg font-bold animate-bounce">Click to cut the ribbon 🎀</button>
        )}
      </div>
      {/* Ceremony Effects */}
      {ribbonCut && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <div className="text-4xl animate-pop">🎉 🍫 🎆</div>
        </div>
      )}
      {/* Welcome Overlay */}
      {showWelcome && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-30 animate-fade-in">
          <span className="text-2xl sm:text-3xl font-bold font-marcellus text-pink-600">🎉 Welcome to Arche RI-DE Tracker</span>
        </div>
      )}
      {/* About Section */}
      {showAbout && (
        <div className="mt-10 text-center animate-fade-in">
          <p className="font-urbanist font-semibold text-brandDark">Created by Santhosh — Full Stack Developer</p>
          <p className="font-urbanist text-brandMuted">Organised by Sathish Balaji — Senior Vice President &amp; Head of Delivery</p>
        </div>
      )}
      {/* Launch Button */}
      {showLaunch && (
        <button
          className="mt-10 px-8 py-3 bg-brandDark text-white rounded-full text-lg font-bold font-urbanist shadow-lg animate-fade-in-up hover:bg-black transition"
          onClick={() => navigate("/login")}
        >
          Launch → Continue to Platform
        </button>
      )}
      {/* Optional: Add tasteful background/ribbon/firework animations with CSS */}
      <style>{`
        .ribbon {
          width: 320px;
          height: 18px;
          background: repeating-linear-gradient(90deg, #e11d48 0 20px, #fbbf24 20px 40px);
          border-radius: 9px;
          position: relative;
          transition: all 0.7s cubic-bezier(.4,2,.6,1);
        }
        .ribbon-cut {
          width: 0;
          opacity: 0.2;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s both;
        }
        .animate-fade-in {
          animation: fadeIn 1s both;
        }
        .animate-pop {
          animation: pop 1s both;
        }
        .animate-bounce {
          animation: bounce 1.2s infinite;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
