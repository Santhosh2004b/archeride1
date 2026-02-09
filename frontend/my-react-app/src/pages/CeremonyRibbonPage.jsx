import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FireworksCanvas from "../components/FireworksCanvas";
import "./Ceremony.css";

const scissorsIcon = "https://upload.wikimedia.org/wikipedia/commons/7/74/Scissors_icon_black.svg";

function CeremonyRibbonPage() {
    const [ribbonReady, setRibbonReady] = useState(false);
    const [ribbonCut, setRibbonCut] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [crackersIntensity, setCrackersIntensity] = useState(0);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showTestimonials, setShowTestimonials] = useState(false);
    const navigate = useNavigate();

    
    useEffect(() => {
        const t1 = setTimeout(() => setRibbonReady(true), 1000);
        return () => clearTimeout(t1);
    }, []);

    
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX + 30, y: e.clientY - 20 });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleRibbonClick = () => {
        if (ribbonCut) return;
        setRibbonCut(true);

        
        setCrackersIntensity(100);
        setTimeout(() => setCrackersIntensity(50), 3000);

        
        setTimeout(() => setShowWelcome(true), 1500);

        
        setTimeout(() => {
            setShowWelcome(false);
            setShowTestimonials(true);
        }, 7000);

        
        
        
        
    };

    const handleManualExit = () => {
        navigate("/login");
    };

    return (
        <div className="ceremony-fullscreen ribbon-page-bg">
            {}
            <FireworksCanvas isActive={crackersIntensity > 0} intensity={crackersIntensity} />

            {ribbonReady && !ribbonCut && (
                <div className="ribbon-caution-text fade-in-slow">
                    <h2 className="caution-header">THE MOMENT OF TRAJECTORY</h2>
                    <p className="caution-sub">Click to initiate the launch sequence.</p>
                </div>
            )}

            {}
            {ribbonReady && (
                <div className="ribbon-container" onClick={handleRibbonClick}>
                    <div className={`ribbon-strip ribbon-left ${ribbonCut ? 'ribbon-left-exit' : 'ribbon-left-enter'}`}></div>
                    <div className={`ribbon-strip ribbon-right ${ribbonCut ? 'ribbon-right-exit' : 'ribbon-right-enter'}`}></div>
                    <div className={`ribbon-bow ${ribbonCut ? 'ribbon-bow-exit' : 'ribbon-bow-enter'}`}></div>
                </div>
            )}

            {}
            {ribbonReady && !ribbonCut && (
                <img src={scissorsIcon} alt="Scissors" className="scissors-follow" style={{ left: mousePos.x, top: mousePos.y }} />
            )}

            {}
            {showWelcome && (
                <div className="welcome-archeride">
                    <div className="visual-line-vertical top"></div>
                    <h1>
                        {"WELCOME TO RIDE.ARCHE.GLOBAL".split("").map((char, i) => (
                            <span
                                key={i}
                                className="welcome-letter"
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                {char === " " ? "\u00A0" : char}
                            </span>
                        ))}
                    </h1>
                    <div className="visual-line-vertical bottom"></div>
                </div>
            )}

            {}
            {showTestimonials && (
                <div className="testimonials-container fade-in-slow-up">

                    {}
                    <div className="ribbon-narrative-container">
                        <div className="governance-team-badge">Governance Delivery Team</div>
                        <p className="ribbon-narrative-text highlight">
                            "This moment represents more than a platform launch. It stands as a testament to the collective intent, discipline, and belief shared by every expert behind RIDE."
                        </p>
                        <p className="ribbon-narrative-text">
                            "This achievement is the result of unwavering dedication to engineering excellence, designed to transform vision into reality."
                        </p>
                    </div>

                    <h2 className="team-reveal-header fade-in-slow">A Legacy in the Making</h2>
                    <div className="leadership-profiles visible">
                        {}
                        <div className="profile-card premium-card fade-in-sequence-1">
                            <div className="profile-img-ring">
                                <img src="/assets/SATHISH.png" alt="Satish Balaji" />
                            </div>
                            <div className="profile-info">
                                <h3 className="profile-name">Satish Balaji</h3>
                                <p className="profile-role">Senior Vice President</p>
                                <div className="profile-divider"></div>
                                <p className="profile-tagline">Architect of Strategic Vision</p>
                            </div>
                        </div>
                        {}
                        <div className="profile-card premium-card fade-in-sequence-2">
                            <div className="profile-img-ring">
                                <img src="/assets/SANTHOSH.jpg" alt="Santhosh B" />
                            </div>
                            <div className="profile-info">
                                <h3 className="profile-name">Santhosh B</h3>
                                <p className="profile-role">Full Stack Developer</p>
                                <div className="profile-divider"></div>
                                <p className="profile-tagline">Engineering Technical Excellence</p>
                            </div>
                        </div>
                    </div>
                    {}
                    <div className="fade-in-sequence-3" style={{ marginTop: '3rem', paddingBottom: '2rem' }}>
                        <button
                            onClick={handleManualExit}
                            className="ribbon-launch-btn smaller-btn"
                        >
                            Proceed to Login →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CeremonyRibbonPage;
