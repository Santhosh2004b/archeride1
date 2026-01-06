import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/arche-logo.png";
import { CheckCircle, ChartLineUp, ShieldCheck, Gauge, Medal, TrendUp } from "phosphor-react";
import "./Ceremony.css";

const vpImg = "/assets/SATHISH.png";
const devImg = "/assets/SANTHOSH.jpg";

function CeremonyLaunchPage() {
  const [phase, setPhase] = useState(1);
  const [fadeOut, setFadeOut] = useState(false);
  const [serviceStep, setServiceStep] = useState(0);
  const [excellenceStep, setExcellenceStep] = useState(0);
  const navigate = useNavigate();

  // PHASE 1.5: SMARTER SERVICE DELIVERY (First 3 Cards - FASTER)
  useEffect(() => {
    if (phase === 1.5) {
      setServiceStep(0);
      const t1 = setTimeout(() => setServiceStep(1), 200);   // Title - Slide L-R
      const t2 = setTimeout(() => setServiceStep(2), 600);   // Cards Shell
      const t3 = setTimeout(() => setServiceStep(3), 1000);  // Content (FASTER)
      const t4 = setTimeout(() => setServiceStep(4), 2500);  // Exit Start
      const t5 = setTimeout(() => {
        setPhase(1.7); // Go to Driving Excellence cards
      }, 4000);

      return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
    }
  }, [phase]);

  // PHASE 1.7: DRIVING OPERATIONAL EXCELLENCE (Second 3 Cards)
  useEffect(() => {
    if (phase === 1.7) {
      setExcellenceStep(0);
      const t1 = setTimeout(() => setExcellenceStep(1), 200);   // Title words reveal one by one
      const t2 = setTimeout(() => setExcellenceStep(2), 800);
      const t3 = setTimeout(() => setExcellenceStep(3), 1400);
      const t4 = setTimeout(() => setExcellenceStep(4), 2000);  // Cards appear
      const t5 = setTimeout(() => setExcellenceStep(5), 2400);
      const t6 = setTimeout(() => setExcellenceStep(6), 2800);
      const t7 = setTimeout(() => setExcellenceStep(7), 5000);  // Hold
      const t8 = setTimeout(() => setExcellenceStep(8), 5500);  // Exit
      const t9 = setTimeout(() => {
        setPhase(2); // Go to Ribbon message
      }, 7000);

      return () => [t1, t2, t3, t4, t5, t6, t7, t8, t9].forEach(clearTimeout);
    }
  }, [phase]);

  const handleGetStarted = () => {
    setFadeOut(true);
    setTimeout(() => setPhase(1.5), 1500);
  };

  const handleRibbonClick = () => {
    navigate("/ceremony/ribbon");
  };

  return (
    <div className="ceremony-fullscreen">
      {/* Star Background */}
      <div className="ceremony-service-bg">
        <div className="parallax-stars-1" />
        <div className="parallax-stars-2" />
        <div className="parallax-stars-3" />
      </div>

      {/* PHASE 1: WELCOME PAGE */}
      {phase === 1 && (
        <div className={`welcome-container z-10 ${fadeOut ? 'fade-exit-alternate' : ''}`}>
          <div className="welcome-logo-wrap">
            <div className="logo-ring" />
            <img src={logo} alt="ArcheRIDE" className="welcome-logo" />
          </div>
          <h1 className="welcome-h1 slide-l-r">Welcome to ArcheRIDE</h1>
          <h2 className="welcome-h2 slide-r-l">Unified Service Delivery Platform</h2>
          <p className="welcome-subtitle slide-l-r">Designed to synchronize vision with execution</p>
          <button onClick={handleGetStarted} className="welcome-btn slide-r-l">
            Get Started
          </button>
        </div>
      )}

      {/* PHASE 1.5: SMARTER SERVICE DELIVERY (First 3 Cards - FASTER) */}
      {phase === 1.5 && (
        <div className="service-phase-container">
          <h1 className={`service-phase-title ${serviceStep >= 1 ? 'visible slide-l-r' : ''} ${serviceStep >= 4 ? 'exit-slide-r-l' : ''}`}>
            Smarter Service Delivery
          </h1>
          <div className="service-cards-row">
            {/* Card 1 */}
            <div className={`service-phase-card ${serviceStep >= 2 ? 'shell-in' : ''} ${serviceStep >= 4 ? 'shell-out' : ''}`}>
              <div className={`card-phase-content ${serviceStep >= 3 ? 'reveal-l-r' : ''} ${serviceStep >= 4 ? 'exit-r' : ''}`}>
                <CheckCircle size={48} weight="bold" className="card-phase-icon" />
                <p className="card-phase-text">Ticket Management</p>
              </div>
            </div>
            {/* Card 2 */}
            <div className={`service-phase-card ${serviceStep >= 2 ? 'shell-in' : ''} ${serviceStep >= 4 ? 'shell-out' : ''}`}>
              <div className={`card-phase-content ${serviceStep >= 3 ? 'reveal-b-t' : ''} ${serviceStep >= 4 ? 'exit-d' : ''}`}>
                <ChartLineUp size={48} weight="bold" className="card-phase-icon" />
                <p className="card-phase-text">Service Issue Tracking</p>
              </div>
            </div>
            {/* Card 3 */}
            <div className={`service-phase-card ${serviceStep >= 2 ? 'shell-in' : ''} ${serviceStep >= 4 ? 'shell-out' : ''}`}>
              <div className={`card-phase-content ${serviceStep >= 3 ? 'reveal-r-l' : ''} ${serviceStep >= 4 ? 'exit-l' : ''}`}>
                <ShieldCheck size={48} weight="bold" className="card-phase-icon" />
                <p className="card-phase-text">Risk & Escalation Handling</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 1.7: DRIVING OPERATIONAL EXCELLENCE (Second 3 Cards) */}
      {phase === 1.7 && (
        <div className="excellence-phase-container">
          <h1 className={`excellence-phase-title ${excellenceStep >= 8 ? 'exit-up' : ''}`}>
            <span className={`word-reveal ${excellenceStep >= 1 ? 'visible' : ''}`}>Driving</span>{' '}
            <span className={`word-reveal ${excellenceStep >= 2 ? 'visible' : ''}`}>Operational</span>{' '}
            <span className={`word-reveal ${excellenceStep >= 3 ? 'visible' : ''}`}>Excellence</span>
          </h1>
          <div className="excellence-cards-row">
            {/* Excellence Card 1 */}
            <div className={`excellence-phase-card ${excellenceStep >= 4 ? 'appear' : ''} ${excellenceStep >= 8 ? 'disappear' : ''}`}>
              <Gauge size={56} weight="bold" className="excellence-icon-lg" />
              <h3 className="excellence-card-title">Faster issue resolution</h3>
            </div>
            {/* Excellence Card 2 */}
            <div className={`excellence-phase-card ${excellenceStep >= 5 ? 'appear' : ''} ${excellenceStep >= 8 ? 'disappear' : ''}`}>
              <Medal size={56} weight="bold" className="excellence-icon-lg" />
              <h3 className="excellence-card-title">Improved service quality</h3>
            </div>
            {/* Excellence Card 3 */}
            <div className={`excellence-phase-card ${excellenceStep >= 6 ? 'appear' : ''} ${excellenceStep >= 8 ? 'disappear' : ''}`}>
              <TrendUp size={56} weight="bold" className="excellence-icon-lg" />
              <h3 className="excellence-card-title">Proactive risk management</h3>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: RIBBON CUTTING MESSAGE */}
      {phase === 2 && (
        <div className="ribbon-message-container fade-in-slow">
          <p className="ribbon-msg-line1">This moment represents more than a platform launch.</p>
          <p className="ribbon-msg-line2">It stands as a testament to our shared vision.</p>
          <button onClick={handleRibbonClick} className="ribbon-launch-btn">
            Begin Ceremony →
          </button>
        </div>
      )}
    </div>
  );
}

export default CeremonyLaunchPage;
