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

    // Ribbon animation: slide in from sides
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

        // Start crackers at 100%
        setCrackersIntensity(100);

        // After 2 seconds, reduce to 75%
        setTimeout(() => setCrackersIntensity(75), 2000);

        // After 3 seconds, show "Welcome to ArcheRIDE"
        setTimeout(() => setShowWelcome(true), 3000);

        // After 6 seconds, fade out welcome
        setTimeout(() => setShowWelcome(false), 6000);

        // After 7 seconds, reduce crackers to 50% and show testimonials
        setTimeout(() => {
            setCrackersIntensity(50);
            setShowTestimonials(true);
        }, 7000);

        // After 18 seconds, navigate to final page or login
        setTimeout(() => {
            navigate("/login");
        }, 18000);
    };

    return (
        <div className="ceremony-fullscreen ribbon-page-bg">
            {/* Fireworks Canvas */}
            <FireworksCanvas isActive={crackersIntensity > 0} intensity={crackersIntensity} />

            {/* Caution Text */}
            {ribbonReady && !ribbonCut && (
                <div className="ribbon-caution-text fade-in-slow">
                    The moment of trajectory... click to cut the ribbon.
                </div>
            )}

            {/* Ribbon Structure */}
            {ribbonReady && (
                <div className="ribbon-container" onClick={handleRibbonClick}>
                    {/* Left Ribbon */}
                    <div className={`ribbon-strip ribbon-left ${ribbonCut ? 'ribbon-left-exit' : 'ribbon-left-enter'}`}></div>

                    {/* Right Ribbon */}
                    <div className={`ribbon-strip ribbon-right ${ribbonCut ? 'ribbon-right-exit' : 'ribbon-right-enter'}`}></div>

                    {/* Center Bow */}
                    <div className={`ribbon-bow ${ribbonCut ? 'ribbon-bow-exit' : 'ribbon-bow-enter'}`}></div>
                </div>
            )}

            {/* Scissors Cursor Follow */}
            {ribbonReady && !ribbonCut && (
                <img
                    src={scissorsIcon}
                    alt="Scissors"
                    className="scissors-follow"
                    style={{ left: mousePos.x, top: mousePos.y }}
                />
            )}

            {/* Welcome Message (after cut) */}
            {showWelcome && (
                <div className="welcome-archeride fade-in-out">
                    <h1>Welcome to ArcheRIDE</h1>
                </div>
            )}

            {/* Testimonials (after welcome fades) */}
            {showTestimonials && (
                <div className="testimonials-container fade-in-slow-up">
                    <div className="testimonial-quote fade-in-sequence-1">
                        <p className="testimonial-text">
                            "This moment represents more than a platform launch. It stands as a testament to the collective intent, discipline, and belief shared by everyone who contributed to ArcheRIDE."
                        </p>
                    </div>

                    <div className="testimonial-quote fade-in-sequence-2">
                        <p className="testimonial-text">
                            "From late-night problem solving to thoughtful design and uncompromising execution, this achievement belongs to every contributor who helped transform vision into reality."
                        </p>
                    </div>

                    <div className="leadership-profiles fade-in-sequence-3">
                        <div className="profile-card">
                            <div className="profile-img-ring">
                                <img src="/assets/SATHISH.png" alt="Satish Balaji" />
                            </div>
                            <h3 className="profile-name">Satish Balaji</h3>
                            <p className="profile-role">Senior Vice President</p>
                            <div className="profile-statement">
                                "This platform reflects the relentless commitment of a team that believed in doing things the right way — with clarity, care, and purpose."
                            </div>
                        </div>

                        <div className="profile-card">
                            <div className="profile-img-ring">
                                <img src="/assets/SANTHOSH.jpg" alt="Santhosh B" />
                            </div>
                            <h3 className="profile-name">Santhosh B</h3>
                            <p className="profile-role">Full Stack Developer</p>
                            <div className="profile-statement">
                                "Building ArcheRIDE was about translating shared intent into a dependable, meaningful experience that drives operational excellence."
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CeremonyRibbonPage;
