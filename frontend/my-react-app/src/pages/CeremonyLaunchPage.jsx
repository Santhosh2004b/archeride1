import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CanvasFireworks from '../components/ceremony/CanvasFireworks';
import ParticleCracker from '../components/ceremony/ParticleCracker';
import RibbonCutting from '../components/ceremony/RibbonCutting';
import styles from './Ceremony.module.css';
import arcLogo from '../assets/arche-logo.png'; // Importing directly from src/assets

const CeremonyLaunchPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('LANDING');
  // Phases: 'LANDING', 'INTRO', 'RIBBON', 'POST_RIBBON_WELCOME', 'POST_RIBBON_CONTENT', 'FINAL_CTA', 'VIDEO'

  // Audio
  const audioRef = useRef(new Audio('/assets/Awards_Ceremony_Grand_Opening.mp3'));

  // State for sequencing
  const [showWelcome, setShowWelcome] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);
  const [profileStep, setProfileStep] = useState(0);

  // Handle initial mount audio cleanup
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // 1. LANDING -> INTRO
  const handleGetStarted = () => {
    // Play Audio
    audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
    setPhase('INTRO');
  };

  // 2. INTRO -> RIBBON
  const handleLaunchClick = () => {
    // Transit to Ribbon
    // "remove background music here"
    audioRef.current.pause();
    setPhase('RIBBON');
  };

  // 3. RIBBON -> POST_RIBBON
  const handleRibbonCut = () => {
    // Fireworks burst for 3s
    // We can use a temp state or just timeout
    // Show fireworks/confetti (handled by Ribbon component or overlay)

    // After 3s, move to welcome
    setTimeout(() => {
      setPhase('POST_RIBBON_WELCOME');
    }, 3000);
  };

  // 4. POST_RIBBON_WELCOME (Welcome to ArcWrite)
  useEffect(() => {
    if (phase === 'POST_RIBBON_WELCOME') {
      setShowWelcome(true);
      // Fade out fully after animation (e.g. 4s)
      setTimeout(() => {
        setShowWelcome(false);
        setPhase('POST_RIBBON_CONTENT');
      }, 4000);
    }
  }, [phase]);

  // 5. POST_RIBBON_CONTENT (Story -> Bullets -> Paragraph -> Profiles)
  useEffect(() => {
    if (phase === 'POST_RIBBON_CONTENT') {
      setShowContent(true);

      // Sequence:
      // Text Anims happen via CSS delays.
      // Bullets take ~2s. Paragraph takes ~1s.
      // Let's give it 4s before showing profiles

      setTimeout(() => {
        setShowProfiles(true);
        // Profile Sequence
        // 1. Satish Fade In
        setProfileStep(1);

        // 2. Santhosh Fade In (after 2s)
        setTimeout(() => {
          setProfileStep(2);
        }, 2000);

        // 3. Final CTA (after another 2s)
        setTimeout(() => {
          setPhase('FINAL_CTA');
        }, 4000);

      }, 5000); // Wait for text content
    }
  }, [phase]);


  const handleFinalLaunch = () => {
    setPhase('VIDEO');
    // Video plays inline, then redirect
    const video = document.getElementById('launch-video');
    if (video) {
      video.play();
      video.onended = () => {
        navigate('/login');
      };
      // Fallback if video doesn't play or errors
      setTimeout(() => navigate('/login'), 8000);
    } else {
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <div className={styles.container}>

      {/* BACKGROUND ANIMATION - Always On */}
      <div className={styles.globalCrackers}>
        <ParticleCracker />
        <CanvasFireworks />
      </div>

      {/* PHASE 0: LANDING */}
      {phase === 'LANDING' && (
        <div className={styles.landingContainer}>
          <button className={styles.getStartedBtn} onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
      )}

      {/* PHASE 1: INTRO (Logo Right, Button Bottom Right) */}
      {phase === 'INTRO' && (
        <div className={styles.introContainer}>
          {/* Left: Headers? User didn't specify text here, usually it's "ArcWrite..." */}
          {/* Assuming we keep the intro text or just the logo? 
                        User: "keep the layout you already made... Green circle on the right"
                    */}
          <div className={styles.leftContent}>
            <h1 className={styles.introTitleMain}>ArcWrite</h1>
            <h2 className={styles.introTitleSub}>Powered by Engineering Vision</h2>
          </div>

          <div className={styles.rightContent}>
            <div className={styles.logoCircle}>
              <img src={arcLogo} alt="ArcWrite Logo" className={styles.logoImage} />
            </div>

            <div className={styles.buzzerButtonContainer}>
              <button className={styles.launchCircleBtn} onClick={handleLaunchClick}>
                <div>Launch ➜</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: RIBBON */}
      {phase === 'RIBBON' && (
        <div className={styles.ribbonLayer}>
          <RibbonCutting onCut={handleRibbonCut} />
          <div className={styles.cautionText}>
            Place your mouse at the center of the ribbon and click to cut.
          </div>
        </div>
      )}

      {/* PHASE 3: WELCOME (Text Only) */}
      {phase === 'POST_RIBBON_WELCOME' && showWelcome && (
        <div className={styles.welcomeContainer}>
          <div className={styles.welcomeRegular}>Welcome to</div>
          <div className={styles.welcomeBold}>ArcWrite</div>
        </div>
      )}

      {/* PHASE 4: CONTENT + PROFILES */}
      {(phase === 'POST_RIBBON_CONTENT' || phase === 'FINAL_CTA') && (
        <div className={styles.mainContentContainer}>
          {/* LEFT: PROFILES */}
          <div className={styles.profilesLeftSection}>
            {showProfiles && (
              <>
                {/* Profile 1: Satish */}
                <div className={styles.profileRow} style={{ opacity: profileStep >= 1 ? 1 : 0 }}>
                  <div className={styles.profileImgWrap}>
                    <img src="/assets/satish.jpg" alt="Satish Balaji" className={styles.profileImg} />
                  </div>
                  <div className={styles.profileInfo}>
                    <div className={styles.profileName}>Satish Balaji</div>
                    <div className={styles.profileRole}>Senior Vice President</div>
                  </div>
                </div>

                {/* Profile 2: Santhosh */}
                <div className={styles.profileRow} style={{ opacity: profileStep >= 2 ? 1 : 0, transitionDelay: '0.5s' }}>
                  <div className={styles.profileImgWrap}>
                    <img src="/assets/santhosh.png" alt="Santhosh B" className={styles.profileImg} />
                  </div>
                  <div className={styles.profileInfo}>
                    <div className={styles.profileName}>Santhosh B</div>
                    <div className={styles.profileRole}>Full Stack Developer</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT: TEXT CONTENT */}
          <div className={styles.contentRightSection} style={{ opacity: showContent ? 1 : 0 }}>
            <h1 className={styles.storyHeader}>Our Success Story Begins</h1>
            <ul className={styles.bulletList}>
              <li style={{ animationDelay: '0.5s' }}>Seamless Integration</li>
              <li style={{ animationDelay: '1.0s' }}>Precision-First Automation</li>
              <li style={{ animationDelay: '1.5s' }}>Human-Centered Design</li>
              <li style={{ animationDelay: '2.0s' }}>Future-Ready Scalability</li>
            </ul>
            <p className={styles.storyPara} style={{ animationDelay: '2.5s' }}>
              We are redefining how engineering teams document, collaborate, and deliver.<br />
              ArcWrite isn’t just a platform — it's a commitment to clarity, speed, and scale.<br />
              Together, we move smarter, faster, and further.
            </p>
          </div>
        </div>
      )}

      {/* PHASE 5: FINAL CTA */}
      {phase === 'FINAL_CTA' && (
        <div className={styles.finalCtaOverlay}>
          <button className={styles.launchPlatformBtn} onClick={handleFinalLaunch}>
            Launch Platform
          </button>
        </div>
      )}

      {/* VIDEO */}
      {phase === 'VIDEO' && (
        <div className={styles.videoContainer}>
          {/* Placeholder for video, assuming simple video tag or embed */}
          <video id="launch-video" width="100%" height="100%" controls autoPlay style={{ objectFit: 'cover' }}>
            <source src="/assets/login-hero.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

    </div>
  );
};

export default CeremonyLaunchPage;
