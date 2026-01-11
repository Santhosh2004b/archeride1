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

    // Ribbon slide-in
    useEffect(() => {
        const t1 = setTimeout(() => setRibbonReady(true), 1000);
        return () => clearTimeout(t1);
    }, []);

    // Mouse tracker
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

        // 1. Fireworks
        setCrackersIntensity(100);
        setTimeout(() => setCrackersIntensity(50), 3000);

        // 2. Welcome Message (Cinzel) Appears
        setTimeout(() => setShowWelcome(true), 1500);

        // 3. Welcome Message Fades Out / Testimonials Appear
        setTimeout(() => {
            setShowWelcome(false);
            setShowTestimonials(true);
        }, 7000);

        // 4. End / Login
        setTimeout(() => {
            navigate("/login");
        }, 20000); // Give time to read profiles
    };

    return (
        <div className="ceremony-fullscreen ribbon-page-bg">
            {/* Fireworks */}
            <FireworksCanvas isActive={crackersIntensity > 0} intensity={crackersIntensity} />

            {/* Caution Text */}
            {ribbonReady && !ribbonCut && (
                <div className="ribbon-caution-text fade-in-slow">
                    The moment of trajectory... click to cut.
                </div>
            )}

            {/* Ribbon */}
            {ribbonReady && (
                <div className="ribbon-container" onClick={handleRibbonClick}>
                    <div className={`ribbon-strip ribbon-left ${ribbonCut ? 'ribbon-left-exit' : 'ribbon-left-enter'}`}></div>
                    <div className={`ribbon-strip ribbon-right ${ribbonCut ? 'ribbon-right-exit' : 'ribbon-right-enter'}`}></div>
                    <div className={`ribbon-bow ${ribbonCut ? 'ribbon-bow-exit' : 'ribbon-bow-enter'}`}></div>
                </div>
            )}

            {/* Scissors */}
            {ribbonReady && !ribbonCut && (
                <img src={scissorsIcon} alt="Scissors" className="scissors-follow" style={{ left: mousePos.x, top: mousePos.y }} />
            )}

            {/* Post-Ribbon Welcome (Cinzel) */}
            {showWelcome && (
                <div className="welcome-archeride">
                    <div className="visual-line-vertical top"></div>
                    <h1>Welcome to Arche.RIDE</h1>
                    <div className="visual-line-vertical bottom"></div>
                </div>
            )}

            {/* Leadership Profiles / Testimonials */}
            {showTestimonials && (
                <div className="testimonials-container fade-in-slow-up">

                    {/* Narrative Text (Top) */}
                    <div className="ribbon-narrative-container">
                        <p className="ribbon-narrative-text">
                            "This moment represents more than a platform launch. It stands as a testament to the collective intent, discipline, and belief shared by everyone who contributed to ArcheRIDE."
                        </p>
                        <p className="ribbon-narrative-text">
                            "From late-night problem solving to thoughtful design and uncompromising execution, this achievement belongs to every contributor who helped transform vision into reality."
                        </p>
                    </div>

                    <div className="leadership-profiles">
                        {/* Satish */}
                        <div className="profile-card fade-in-sequence-1">
                            <div className="profile-img-ring">
                                <img src="/assets/SATHISH.png" alt="Satish" />
                            </div>
                            <h3 className="profile-name">Satish Balaji</h3>
                            <p className="profile-role">Senior Vice President</p>
                            {/* Statement removed here as it's now in the main narrative, or kept if specific? User screenshot had names/roles clear. Keeping specific quotes for flavor inside card if space permits, but user focused on paragraph. I'll keep the personal flavor quote too as it looks nice. */}
                            {/* actually user screenshot shows NAME ROLE and maybe nothing else? Or maybe small text. I'll keep the small text for completeness. */}
                        </div>
                        {/* Santhosh */}
                        <div className="profile-card fade-in-sequence-2">
                            <div className="profile-img-ring">
                                <img src="/assets/SANTHOSH.jpg" alt="Santhosh" />
                            </div>
                            <h3 className="profile-name">Santhosh B</h3>
                            <p className="profile-role">Full Stack Developer</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CeremonyRibbonPage;
