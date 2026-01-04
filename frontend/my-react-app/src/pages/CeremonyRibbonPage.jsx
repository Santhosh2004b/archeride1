import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Ceremony.css";
import FireworksCanvas from "../components/FireworksCanvas";

const scissorsIcon = "https://upload.wikimedia.org/wikipedia/commons/7/74/Scissors_icon_black.svg";

function CeremonyRibbonPage() {
    const [ribbonCut, setRibbonCut] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [showScissors, setShowScissors] = useState(true);
    const [isReady, setIsReady] = useState(false); // 500ms Black Reset
    const [showText, setShowText] = useState(false); // 600ms Delayed Text

    const navigate = useNavigate();

    // v1.4: Cinematic Sequence Control
    useEffect(() => {
        // Step 1: Hard Black Reset (Silence)
        const tReset = setTimeout(() => setIsReady(true), 500);
        // Step 2: Delay intro text reveal post-reset
        const tText = setTimeout(() => setShowText(true), 1100);

        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX + 30, y: e.clientY - 20 });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            clearTimeout(tReset);
            clearTimeout(tText);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    const handleRibbonClick = () => {
        if (ribbonCut) return;
        setRibbonCut(true);
        setShowScissors(false);

        // Final Fix 6: Strict Music OFF after ribbon
        window.stopCeremonyAudio?.();

        // v1.3: Wait for ribbon animation to finish, then transition
        setTimeout(() => {
            navigate("/ceremony/final");
        }, 7000); // 1s longer for v1.4 ceremonial weight
    };

    return (
        <div className="ceremony-fullscreen overflow-hidden relative" style={{ background: 'black' }}>
            {/* v1.3: ISOLATION MODE - Pure Black */}

            {/* Crackers trigger ONLY on cut */}
            <FireworksCanvas isActive={ribbonCut} />

            {/* v1.4: Staged Reveal Sequence */}
            {isReady && (
                <>
                    {/* Intro Text - Delayed Reveal */}
                    <div className={`ribbon-caution-v3 text-center ${!showText ? 'invisible-fade' : ''} ${ribbonCut ? 'exit' : ''}`}>
                        The moment of trajectory... click to cut.
                    </div>

                    {/* Ribbon - Visible but calm, scaled 1.05 */}
                    <div id="ribbon" onClick={handleRibbonClick} style={{ transform: 'translateY(-50%) scale(1.05)', filter: 'contrast(1.1) brightness(1.1)' }}>
                        <div className={`ribbon bow ${ribbonCut ? 'hide' : ''}`}></div>
                        <div className={`ribbon ribbon--l ${ribbonCut ? 'hide' : ''}`}></div>
                        <div className={`ribbon ribbon--r ${ribbonCut ? 'hide' : ''}`}></div>
                    </div>
                </>
            )}

            {/* Scissors Cursor Cursor Follow */}
            {isReady && showScissors && (
                <img
                    id="imgFollow"
                    src={scissorsIcon}
                    alt="Scissors"
                    className="scissors-cursor-follow"
                    style={{ left: mousePos.x, top: mousePos.y }}
                />
            )}
        </div>
    );
}

export default CeremonyRibbonPage;
