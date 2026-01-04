import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/arche-logo.png";
import FireworksCanvas from "../components/FireworksCanvas";
import { CheckCircle, ChartLineUp, ShieldCheck } from "phosphor-react";
import "./Ceremony.css";

const vpImg = "/assets/SATHISH.png";
const devImg = "/assets/SANTHOSH.jpg";

// PARTICLE CONFIG
const TOTAL_LOGO_PARTICLES = 40;
const LOGO_RADIUS = 70;
const STAR_COUNT = 45;

const STRATEGIC_PAIRS = [
  ["Where purpose shapes execution", "and execution shapes trust"],
  ["Where culture drives creation", "and creation fuels impact"],
  ["Where vision meets velocity", "and velocity carries legacy forward"],
  ["Where imagination becomes innovation",
    "and innovation becomes tomorrow’s standard"]
];

function CeremonyLaunchPage() {
  const [phase, setPhase] = useState(1);
  const [pairIndex, setPairIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [fadeSequence, setFadeSequence] = useState(0);
  const [starsFading, setStarsFading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Phase 1.5 Animation State
  const [serviceStep, setServiceStep] = useState(0);

  // 1. Generate Logo Particles
  const logoParticles = useMemo(() => {
    const items = [];
    for (let i = 0; i < TOTAL_LOGO_PARTICLES; i++) {
      const r = LOGO_RADIUS * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      const moveX = (Math.random() - 0.5) * 40;
      const moveY = (Math.random() - 0.5) * 40;

      const style = {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        width: Math.random() > 0.5 ? '2px' : '3px',
        height: Math.random() > 0.5 ? '2px' : '3px',
        animationDelay: `${Math.random() * 2}s`,
        "--move-x": `${moveX}px`,
        "--move-y": `${moveY}px`
      };
      items.push(<div key={`lp-${i}`} className="inner-particle" style={style} />);
    }
    return items;
  }, []);

  // 2. Generate Bright Star Field
  const starField = useMemo(() => {
    const stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const isCenter = Math.abs(top - 50) < 20 && Math.abs(left - 50) < 20;
      const size = isCenter ? (Math.random() * 1 + 1) : (Math.random() * 2 + 1);
      const duration = 2 + Math.random() * 4;
      const delay = Math.random() * 5;
      const fadeDelay = Math.random() * 2;
      const style = {
        top: `${top}%`,
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        "--duration": `${duration}s`,
        "--delay": `${delay}s`,
        opacity: starsFading ? 0 : undefined,
        transition: `opacity 1s ease-out ${fadeDelay}s`
      };
      stars.push(<div key={`s-${i}`} className="star-point" style={style} />);
    }
    return stars;
  }, [starsFading]);

  useEffect(() => {
    if (location.state?.playAudio || phase === 1.5) {
      window.playCeremonyAudio?.();
    }
  }, [location.state, phase]);

  // Phase 1.5 Sequence Logic (v1.5 Sync Fix)
  useEffect(() => {
    if (phase === 1.5) {
      // RESET
      setServiceStep(0);

      // Reveal Sequence
      const tHeading = setTimeout(() => setServiceStep(1), 400);   // Heading Micro-entry
      const tShells = setTimeout(() => setServiceStep(2), 800);    // Shell Materialize
      const tContent = setTimeout(() => setServiceStep(3), 1600);  // Content Reveal (Visible by 2.8s)

      // --- MANDATORY 3S HOLD ---
      // Cards are fully visible from 2.8s to 5.8s

      // Exit Sequence (Tiered)
      const tContentExit = setTimeout(() => setServiceStep(5), 6000); // Content Slides Away (v1.3 logic)
      const tShellExit = setTimeout(() => setServiceStep(6), 6200);   // Shells Collapse
      const tHeadingExit = setTimeout(() => setServiceStep(7), 6800); // Heading Drifts Up & Fades

      const tPhaseNext = setTimeout(() => {
        setPhase(2);
        setPairIndex(0);
      }, 8500);

      return () => {
        clearTimeout(tHeading);
        clearTimeout(tShells);
        clearTimeout(tContent);
        clearTimeout(tContentExit);
        clearTimeout(tShellExit);
        clearTimeout(tHeadingExit);
        clearTimeout(tPhaseNext);
      };
    }
  }, [phase]);

  const [excellenceStep, setExcellenceStep] = useState(0);

  // Phase 2 Logic (v1.9 Recognition & Leadership)
  useEffect(() => {
    if (phase === 2) {
      setExcellenceStep(0);

      // 1. Heading Reveal
      const tH1 = setTimeout(() => setExcellenceStep(1), 500);   // "A Milestone"
      const tH2 = setTimeout(() => setExcellenceStep(2), 1200);  // "Achieved"
      const tSub = setTimeout(() => setExcellenceStep(3), 2000); // Subheading

      // 2. Body Copy (Narrative)
      const tB1 = setTimeout(() => setExcellenceStep(4), 3200);  // Para 1
      const tB2 = setTimeout(() => setExcellenceStep(5), 5500);  // Para 2

      // 3. Leadership Cards
      const tGrid = setTimeout(() => setExcellenceStep(6), 7500); // Grid container
      const tC1 = setTimeout(() => setExcellenceStep(7), 8500);   // Satish Card
      const tC2 = setTimeout(() => setExcellenceStep(8), 9500);   // Santhosh Card

      // 4. Final Footer / CTA
      const tFinal = setTimeout(() => setExcellenceStep(10), 12000);

      return () => {
        [tH1, tH2, tSub, tB1, tB2, tGrid, tC1, tC2, tFinal].forEach(clearTimeout);
      };
    }
  }, [phase]);

  const handleLaunchMoment = () => {
    // Cinematic slow sequence for landing page exit
    setFadeSequence(1);
    setTimeout(() => setFadeSequence(2), 1000);
    setTimeout(() => setFadeSequence(3), 2000);
    setTimeout(() => setFadeSequence(4), 3000);
    setTimeout(() => setFadeSequence(5), 4000);

    setTimeout(() => {
      setPhase(1.5);
    }, 6500);
  };

  const handleEnterClick = () => {
    navigate("/ceremony/ribbon");
  };

  return (
    <>
      <div className="ceremony-fullscreen">
        {/* SHARED BACKDROP - One World Rule */}
        <div className="ceremony-service-bg">
          <div className="parallax-stars-1" />
          <div className="parallax-stars-2" />
          <div className="parallax-stars-3" />
          <div className="blue-sparkle" style={{ top: '20%', left: '10%' }} />
          <div className="blue-sparkle" style={{ top: '60%', left: '80%', animationDelay: '1s' }} />
          <div className="blue-sparkle" style={{ top: '10%', left: '70%', animationDelay: '2s' }} />
        </div>

        {/* PHASE 1: LANDING */}
        {phase === 1 && (
          <div className="intro-text-container z-10">
            <div className={`intro-logo-container ${fadeSequence >= 1 ? 'fade-out-now' : ''}`}>
              <div className="logo-circle-border" />
              <div className="logo-particle-wrap">{logoParticles}</div>
              <img src={logo} alt="ArcheRIDE" className="intro-logo-img" />
            </div>
            <h2 className={`intro-line-1 ${fadeSequence >= 2 ? 'fade-out-now' : ''}`}>Welcome to Arche Global</h2>
            <h1 className={`intro-line-2 ${fadeSequence >= 3 ? 'fade-out-now' : ''}`}>Presenting ArcheRIDE</h1>
            <p className={`intro-subtitle ${fadeSequence >= 4 ? 'fade-out-now' : ''}`}>unified service delivery platform designed to synchronize vision with execution.</p>
            <button onClick={handleLaunchMoment} className={`intro-btn ${fadeSequence >= 5 ? 'fade-out-now' : ''}`}>Launch Moment</button>
          </div>
        )}

        {/* PHASE 1.5: SERVICE DELIVERY (v1.5 Robust Reveal) */}
        {phase === 1.5 && (
          <div className="service-container">
            <h1 className={`service-title ${serviceStep >= 1 ? 'visible' : ''} ${serviceStep >= 7 ? 'service-title-exit' : ''}`}>
              Smarter Service Delivery
            </h1>

            <div className="service-cards-grid">
              {/* CARD 1 */}
              <div className={`service-card ${serviceStep >= 2 ? 'shell-visible' : ''} ${serviceStep >= 6 ? 'shell-exit' : ''}`}>
                <div className={`card-content-wrapper ${serviceStep >= 3 ? 'revealed content-l-r' : ''} ${serviceStep >= 5 ? 'content-exit-r' : ''}`}>
                  <div className="card-icon-wrapper force-visible-icon">
                    <CheckCircle weight="bold" size={32} />
                  </div>
                  <div className="card-text text-white">
                    Ticket Management
                  </div>
                </div>
              </div>

              {/* CARD 2 */}
              <div className={`service-card ${serviceStep >= 2 ? 'shell-visible' : ''} ${serviceStep >= 6 ? 'shell-exit' : ''}`}>
                <div className={`card-content-wrapper ${serviceStep >= 3 ? 'revealed content-b-t' : ''} ${serviceStep >= 5 ? 'content-exit-d' : ''}`}>
                  <div className="card-icon-wrapper force-visible-icon">
                    <ChartLineUp weight="bold" size={32} />
                  </div>
                  <div className="card-text text-white">
                    Service Issue Tracking
                  </div>
                </div>
              </div>

              {/* CARD 3 */}
              <div className={`service-card ${serviceStep >= 2 ? 'shell-visible' : ''} ${serviceStep >= 6 ? 'shell-exit' : ''}`}>
                <div className={`card-content-wrapper ${serviceStep >= 3 ? 'revealed content-r-l' : ''} ${serviceStep >= 5 ? 'content-exit-l' : ''}`}>
                  <div className="card-icon-wrapper force-visible-icon">
                    <ShieldCheck weight="bold" size={32} />
                  </div>
                  <div className="card-text text-white">
                    Risk & Escalation Handling
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: RECOGNITION (v1.9 Final Content & Design) */}
        {phase === 2 && (
          <div className="recognition-container relative z-10 flex flex-col items-center justify-center min-h-screen">
            {/* Heading Reveal Sequence */}
            <div className="mb-12">
              <h1 className="recognition-heading">
                <span className={`word-entry ${excellenceStep >= 1 ? 'visible' : ''}`}>A Milestone&nbsp;</span>
                <span className={`word-entry achieved ${excellenceStep >= 2 ? 'visible' : ''}`}>Achieved</span>
              </h1>
              <p className={`recognition-subheading word-entry ${excellenceStep >= 3 ? 'visible' : ''}`}>
                through shared vision and synergy
              </p>
            </div>

            {/* Executive Body narrative */}
            <div className="recognition-body">
              <p className={`word-entry ${excellenceStep >= 4 ? 'visible' : ''}`}>
                "This moment represents more than a platform launch. It stands as a testament to the collective intent, discipline, and belief shared by everyone who contributed to ArcheRIDE."
              </p>
              <p className={`word-entry ${excellenceStep >= 5 ? 'visible' : ''}`}>
                "From late-night problem solving to thoughtful design and uncompromising execution, this achievement belongs to every contributor who helped transform vision into reality."
              </p>
            </div>

            {/* Leadership Cards */}
            <div className={`leadership-grid ${excellenceStep >= 6 ? 'opacity-100 transition-opacity duration-1000' : 'opacity-0'}`}>
              {/* SATISH CARD */}
              <div className={`leadership-card word-entry ${excellenceStep >= 7 ? 'visible' : ''}`}>
                <div className="profile-portrait-ring">
                  <div className="profile-portrait-inner">
                    <img src={vpImg} alt="Satish Balaji" />
                  </div>
                </div>
                <h3 className="leadership-name">Satish Balaji</h3>
                <span className="leadership-role">Senior Vice President</span>
                <div className="quote-box">
                  <p className="quote-text">
                    "This platform reflects the relentless commitment of a team that believed in doing things the right way — with clarity, care, and purpose."
                  </p>
                </div>
              </div>

              {/* SANTHOSH CARD */}
              <div className={`leadership-card word-entry ${excellenceStep >= 8 ? 'visible' : ''}`}>
                <div className="profile-portrait-ring">
                  <div className="profile-portrait-inner">
                    <img src={devImg} alt="Santhosh B" />
                  </div>
                </div>
                <h3 className="leadership-name">Santhosh B</h3>
                <span className="leadership-role">Full Stack Developer</span>
                <div className="quote-box">
                  <p className="quote-text">
                    "Building ArcheRIDE was not just about writing code — it was about translating shared intent into a dependable, meaningful experience."
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle Footer */}
            <div className={`recognition-footer word-entry ${excellenceStep >= 10 ? 'visible' : ''}`}>
              ARCHE GLOBAL © 2024 — Thank you for being part of this milestone.
            </div>

            {/* Optional CTA to finalize */}
            {excellenceStep >= 10 && (
              <div className="mt-12 animate-fade-in-up">
                <button onClick={handleEnterClick} className="intro-btn">Launch Platform →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default CeremonyLaunchPage;
