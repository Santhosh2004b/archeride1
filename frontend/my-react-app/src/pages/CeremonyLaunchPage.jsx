import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/arche-logo2.png";
import { Ticket, Lifebuoy, ShieldWarning, ChartLineUp, CheckCircle, ShieldCheck } from "phosphor-react";
import StarfieldCanvas from "../components/StarfieldCanvas";
import "./Ceremony.css";

function CeremonyLaunchPage() {
  const [phase, setPhase] = useState(1);
  const [fadeOut, setFadeOut] = useState(false);
  const [serviceStep, setServiceStep] = useState(0);
  const [excellenceStep, setExcellenceStep] = useState(0);
  const [starDensity, setStarDensity] = useState(1.0);
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();

  /* New State for smooth fade */
  const [starsFading, setStarsFading] = useState(false);

  // Initial Load: Density 100 -> 78, Text Sequence
  useEffect(() => {
    // Immediate drop to 78% as requested
    const t0 = setTimeout(() => setStarDensity(0.78), 500);
    // Button delay after text settles (approx 3.5s)
    const t1 = setTimeout(() => setShowButton(true), 3500);
    return () => { clearTimeout(t0); clearTimeout(t1); };
  }, []);

  // PHASE 1.5: TICKET MANAGEMENT (First 3 Cards)
  useEffect(() => {
    if (phase === 1.5) {
      setServiceStep(0);
      const t1 = setTimeout(() => setServiceStep(1), 200);   // Title
      const t2 = setTimeout(() => setServiceStep(2), 600);   // Cards Shell
      const t3 = setTimeout(() => setServiceStep(3), 1000);  // Content Reveal
      const t4 = setTimeout(() => setServiceStep(4), 3500);  // Exit Start
      const t5 = setTimeout(() => {
        setPhase(1.7);
      }, 4500);

      return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
    }
  }, [phase]);

  // PHASE 1.7: EXCELLENCE (Second 3 Cards)
  useEffect(() => {
    if (phase === 1.7) {
      setExcellenceStep(0);
      const t1 = setTimeout(() => setExcellenceStep(1), 200);   // Title
      const t2 = setTimeout(() => setExcellenceStep(2), 800);
      const t3 = setTimeout(() => setExcellenceStep(3), 1400);  // Cards
      const t4 = setTimeout(() => setExcellenceStep(4), 4500);  // Hold
      const t5 = setTimeout(() => setExcellenceStep(5), 5000);  // Exit
      const t6 = setTimeout(() => {
        setPhase(2); // Go to Narrative
      }, 6000);

      return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
    }
  }, [phase]);

  const handleGetStarted = () => {
    setFadeOut(true);
    setTimeout(() => setPhase(1.5), 1500);
  };

  const handleBeginCeremony = () => {
    // Smoother Fade: Use CSS Opacity instead of Density Steps
    setStarsFading(true);

    // Navigate after fade completes (3s)
    setTimeout(() => {
      navigate("/ceremony/ribbon");
    }, 3000);
  };

  return (
    <div className="ceremony-fullscreen">
      {/* Star Background - Canvas with Smooth Fade */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 0,
          opacity: starsFading ? 0 : 1,
          transition: 'opacity 3s ease-out'
        }}
      >
        <StarfieldCanvas density={starDensity} centerHole={phase === 1} />
      </div>

      {/* PHASE 1: WELCOME PAGE */}
      {phase === 1 && (
        <div className={`welcome-container z-10 ${fadeOut ? 'fade-exit-alternate' : ''}`}>
          <div className="welcome-logo-wrap">
            <div className="logo-ring" />
            <img src={logo} alt="ArcheRIDE" className="welcome-logo" />
          </div>

          <h1 className="welcome-h1 slide-enter-left">Welcome to ride.arche.global</h1>
          <h2 className="welcome-h2 slide-enter-right">Unified Service Delivery Platform</h2>
          <p className="welcome-subtitle fade-enter-up">Designed to synchronize vision with execution</p>

          <div className={`welcome-btn-wrapper ${showButton ? 'visible' : ''}`}>
            <button onClick={handleGetStarted} className="welcome-btn">
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* PHASE 1.5: TICKET MANAGEMENT (Cards) */}
      {phase === 1.5 && (
        <div className="service-phase-container">
          <h1 className={`service-phase-title ${serviceStep >= 1 ? 'visible' : ''} ${serviceStep >= 4 ? 'exit-slide-up' : ''}`}>
            Unified Capabilities
          </h1>
          <div className="service-cards-row">
            {/* Card 1 */}
            <div className={`service-phase-card ${serviceStep >= 2 ? 'shell-in' : ''} ${serviceStep >= 4 ? 'shell-out' : ''}`}>
              <div className={`card-phase-content ${serviceStep >= 3 ? 'reveal-l-r' : ''} ${serviceStep >= 4 ? 'exit-r' : ''}`}>
                <Ticket size={48} weight="light" className="card-phase-icon" />
                <h2 className="card-h2">Ticket Management</h2>
                <h3 className="card-h3">Streamlined Support</h3>
              </div>
            </div>
            {/* Card 2 */}
            <div className={`service-phase-card ${serviceStep >= 2 ? 'shell-in' : ''} ${serviceStep >= 4 ? 'shell-out' : ''}`}>
              <div className={`card-phase-content ${serviceStep >= 3 ? 'reveal-b-t' : ''} ${serviceStep >= 4 ? 'exit-d' : ''}`}>
                <Lifebuoy size={48} weight="light" className="card-phase-icon" />
                <h2 className="card-h2">Issue Tracking</h2>
                <h3 className="card-h3">Real-time Visibility</h3>
              </div>
            </div>
            {/* Card 3 */}
            <div className={`service-phase-card ${serviceStep >= 2 ? 'shell-in' : ''} ${serviceStep >= 4 ? 'shell-out' : ''}`}>
              <div className={`card-phase-content ${serviceStep >= 3 ? 'reveal-r-l' : ''} ${serviceStep >= 4 ? 'exit-l' : ''}`}>
                <ShieldWarning size={48} weight="light" className="card-phase-icon" />
                <h2 className="card-h2">Risk Handling</h2>
                <h3 className="card-h3">Escalation Control</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 1.7: EXCELLENCE (Outcomes) */}
      {phase === 1.7 && (
        <div className="excellence-phase-container">
          <h1 className={`excellence-phase-title ${excellenceStep >= 4 ? 'exit-up' : ''}`}>
            <span className={`word-reveal ${excellenceStep >= 1 ? 'visible' : ''}`}>Driving</span>{' '}
            <span className={`word-reveal ${excellenceStep >= 2 ? 'visible' : ''}`}>Operational</span>{' '}
            <span className={`word-reveal ${excellenceStep >= 3 ? 'visible' : ''}`}>Excellence</span>
          </h1>
          <div className="excellence-cards-row">
            {/* Card 1 */}
            <div className={`excellence-phase-card ${excellenceStep >= 3 ? 'appear' : ''} ${excellenceStep >= 5 ? 'disappear' : ''}`}>
              <CheckCircle size={56} weight="light" className="excellence-icon-lg" />
              <h2 className="card-h2">Rapid Resolution</h2>
              <h3 className="card-h3">Faster issue turnaround</h3>
            </div>
            {/* Card 2 */}
            <div className={`excellence-phase-card ${excellenceStep >= 3 ? 'appear' : ''} ${excellenceStep >= 5 ? 'disappear' : ''}`}>
              <ChartLineUp size={56} weight="light" className="excellence-icon-lg" />
              <h2 className="card-h2">Service Quality</h2>
              <h3 className="card-h3">Improved delivery standards</h3>
            </div>
            {/* Card 3 */}
            <div className={`excellence-phase-card ${excellenceStep >= 3 ? 'appear' : ''} ${excellenceStep >= 5 ? 'disappear' : ''}`}>
              <ShieldCheck size={56} weight="light" className="excellence-icon-lg" />
              <h2 className="card-h2">Risk Management</h2>
              <h3 className="card-h3">Proactive mitigation monitoring</h3>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: NARRATIVE & FADE OUT */}
      {phase === 2 && (
        <div className="ribbon-message-container fade-in-slow">
          <p className="ribbon-msg-line1">This moment represents more than a platform launch.</p>
          <p className="ribbon-msg-line2">It stands as a testament to our shared vision.</p>
          <button onClick={handleBeginCeremony} className="ribbon-launch-btn">
            Begin Ceremony →
          </button>
        </div>
      )}
    </div>
  );
}

export default CeremonyLaunchPage;
