import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/arche-logo2.png";
import { Ticket, Lifebuoy, ShieldWarning, ChartLineUp, CheckCircle, ShieldCheck } from "phosphor-react";
import StarfieldCanvas from "../components/StarfieldCanvas";
import "./Ceremony.css";

function CeremonyLaunchPage() {
  const [phase, setPhase] = useState(1);
  const [serviceStep, setServiceStep] = useState(0);
  const [excellenceStep, setExcellenceStep] = useState(0);
  const [starDensity, setStarDensity] = useState(1.0);
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();

  
  const [starsFading, setStarsFading] = useState(false);

  
  useEffect(() => {
    
    const t0 = setTimeout(() => setStarDensity(0.78), 500);
    
    const t1 = setTimeout(() => setShowButton(true), 3500);
    return () => { clearTimeout(t0); clearTimeout(t1); };
  }, []);

  
  useEffect(() => {
    if (phase === 1.5) {
      setServiceStep(0);
      const t1 = setTimeout(() => setServiceStep(1), 200);   
      const t2 = setTimeout(() => setServiceStep(2), 800);   
      const t3 = setTimeout(() => setServiceStep(3), 1400);  
      const t4 = setTimeout(() => setServiceStep(4), 9400);  
      const t5 = setTimeout(() => {
        setPhase(1.7);
      }, 10400); 

      return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
    }
  }, [phase]);

  
  useEffect(() => {
    if (phase === 1.7) {
      setExcellenceStep(0);
      const t1 = setTimeout(() => setExcellenceStep(1), 200);   
      const t2 = setTimeout(() => setExcellenceStep(2), 600);   
      const t3 = setTimeout(() => setExcellenceStep(3), 1500);  
      const t4 = setTimeout(() => setExcellenceStep(4), 9500);  
      const t5 = setTimeout(() => setExcellenceStep(5), 10000); 
      const t6 = setTimeout(() => {
        setPhase(2); 
      }, 11000);

      return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
    }
  }, [phase]);

  const [isExiting, setIsExiting] = useState(false);

  const handleGetStarted = () => {
    setIsExiting(true);
    setTimeout(() => setPhase(1.5), 2500); 
  };

  const handleBeginCeremony = () => {
    
    setStarsFading(true);

    
    setTimeout(() => {
      navigate("/ceremony/ribbon");
    }, 3000);
  };

  return (
    <div className="ceremony-fullscreen">
      {}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 0,
          opacity: starsFading ? 0 : 1,
          transition: 'opacity 3s ease-out'
        }}
      >
        <StarfieldCanvas density={starDensity} centerHole={false} />
      </div>

      {}
      {phase === 1 && (
        <div className={`welcome-container z-10 ${isExiting ? 'sequence-exit' : ''}`}>
          <div className="welcome-logo-wrap staggered-exit-1">
            <div className="logo-ring" />
            <img src={logo} alt="ArcheRIDE" className="welcome-logo" />
          </div>

          <h1 className="welcome-h1 slide-enter-left staggered-exit-2">Welcome to RIDE.arche.global</h1>
          <h2 className="welcome-h2 slide-enter-right staggered-exit-3">Unified Service Delivery Platform</h2>
          <p className="welcome-subtitle cinematic-focus-in staggered-exit-4">Designed to synchronize vision with execution</p>

          <div className={`welcome-btn-wrapper ${showButton ? 'visible' : ''} staggered-exit-5`}>
            <button onClick={handleGetStarted} className="welcome-btn">
              Get Started
            </button>
          </div>
        </div>
      )}

      {}
      {phase === 1.5 && (
        <div className="service-phase-container">
          <h1 className={`service-phase-title ${serviceStep >= 1 ? 'visible' : ''} ${serviceStep >= 4 ? 'exit-slide-up' : ''}`}>
            Unified Capabilities
          </h1>
          <div className="service-cards-row">
            {}
            <div className={`service-phase-card ${serviceStep >= 2 ? 'shell-in' : ''} ${serviceStep >= 4 ? 'shell-out' : ''}`}>
              <div className={`card-phase-content ${serviceStep >= 3 ? 'reveal-l-r' : ''} ${serviceStep >= 4 ? 'exit-r' : ''}`}>
                <Ticket size={48} weight="light" className="card-phase-icon" />
                <h2 className="card-h2">Ticket Management</h2>
                <h3 className="card-h3">A centralized intake and resolution engine designed to streamline service requests. RIDE ensures every ticket is categorized, prioritized, and tracked with surgical precision from submission to completion.</h3>
              </div>
            </div>
            {}
            <div className={`service-phase-card ${serviceStep >= 2 ? 'shell-in' : ''} ${serviceStep >= 4 ? 'shell-out' : ''}`}>
              <div className={`card-phase-content ${serviceStep >= 3 ? 'reveal-b-t' : ''} ${serviceStep >= 4 ? 'exit-d' : ''}`}>
                <Lifebuoy size={48} weight="light" className="card-phase-icon" />
                <h2 className="card-h2">Issue Tracking</h2>
                <h3 className="card-h3">Maintain total visibility over dependencies and blockers. Our end-to-end lifecycle monitoring system provides real-time status synchronization, ensuring that no bottleneck goes unnoticed or unresolved.</h3>
              </div>
            </div>
            {}
            <div className={`service-phase-card ${serviceStep >= 2 ? 'shell-in' : ''} ${serviceStep >= 4 ? 'shell-out' : ''}`}>
              <div className={`card-phase-content ${serviceStep >= 3 ? 'reveal-r-l' : ''} ${serviceStep >= 4 ? 'exit-l' : ''}`}>
                <ShieldWarning size={48} weight="light" className="card-phase-icon" />
                <h2 className="card-h2">Risk Handling</h2>
                <h3 className="card-h3">Proactive security and risk mitigation at your fingertips. Identify, assess, and neutralize potential risks before they ever impact your delivery milestones, ensuring a secure and predictable path to success.</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {phase === 1.7 && (
        <div className="excellence-phase-container">
          <h1 className={`excellence-phase-title ${excellenceStep >= 4 ? 'exit-up' : ''}`}>
            <span className={`word-reveal ${excellenceStep >= 1 ? 'visible' : ''}`}>Driving</span>{' '}
            <span className={`word-reveal ${excellenceStep >= 2 ? 'visible' : ''}`}>Operational</span>{' '}
            <span className={`word-reveal ${excellenceStep >= 3 ? 'visible' : ''}`}>Excellence</span>
          </h1>
          <div className="excellence-cards-row">
            {}
            <div className={`excellence-phase-card ${excellenceStep >= 3 ? 'appear' : ''} ${excellenceStep >= 5 ? 'disappear' : ''}`}>
              <CheckCircle size={56} weight="light" className="excellence-icon-lg" />
              <h2 className="card-h2">Rapid Resolution</h2>
              <h3 className="card-h3">Optimized for velocity. RIDE utilizes automated workflows to drastically accelerate issue turnaround, ensuring that mission-critical resolutions are delivered with unprecedented speed.</h3>
            </div>
            {}
            <div className={`excellence-phase-card ${excellenceStep >= 3 ? 'appear' : ''} ${excellenceStep >= 5 ? 'disappear' : ''}`}>
              <ChartLineUp size={56} weight="light" className="excellence-icon-lg" />
              <h2 className="card-h2">Service Quality</h2>
              <h3 className="card-h3">Uncompromising standards of excellence. Leveraging deep data-driven insights to continuously maintain and elevate delivery standards across the global enterprise.</h3>
            </div>
            {}
            <div className={`excellence-phase-card ${excellenceStep >= 3 ? 'appear' : ''} ${excellenceStep >= 5 ? 'disappear' : ''}`}>
              <ShieldCheck size={56} weight="light" className="excellence-icon-lg" />
              <h2 className="card-h2">Risk Management</h2>
              <h3 className="card-h3">Perpetual vigilance. Our proactive monitoring systems provide continuous risk mitigation and strategic oversight, securing every phase of the operational lifecycle.</h3>
            </div>
          </div>
        </div>
      )}

      {}
      {phase === 2 && (
        <div className={`ribbon-message-container ${starsFading ? 'sequence-exit-phase2' : 'fade-in-slow'}`}>
          <div className="staggered-narrative-1">
            <p className="ribbon-msg-premium highlight">Engineering Excellence. One Unified Goal.</p>
          </div>
          <div className="staggered-narrative-2">
            <p className="ribbon-msg-line1">This moment represents more than a platform launch.</p>
          </div>
          <div className="staggered-narrative-3">
            <p className="ribbon-msg-line2">A testament to our shared vision and the uncompromising pursuit of excellence.</p>
          </div>
          <div className="staggered-narrative-final">
            <p className="ribbon-msg-extra luxury-narrative">Innovation meets execution. We step into a new era of transformation.</p>
          </div>
          <div className="staggered-narrative-4">
            <button
              onClick={handleBeginCeremony}
              className={`ribbon-launch-btn smaller-btn ${starsFading ? 'btn-fade-out' : ''}`}
            >
              Launch Portal →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CeremonyLaunchPage;
