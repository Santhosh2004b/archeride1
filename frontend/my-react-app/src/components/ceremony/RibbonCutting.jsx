import React, { useState, useEffect, useRef } from 'react';

const RibbonCutting = ({ onCut }) => {
    const [isCut, setIsCut] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Use a ref to track if we've already cut, to avoid double triggers
    const cutRef = useRef(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleClick = () => {
        if (cutRef.current) return;
        cutRef.current = true;
        setIsCut(true);

        // Persist if needed, though usually for a ceremony page we might want it to reset on reload 
        // or we respect the requirement strictly:
        localStorage.setItem('ribbonCut', 'cut');

        if (onCut) {
            onCut();
        }
    };

    // Styles based on the provided CSS but adapted for React and scoped
    const styles = {
        ribbonContainer: {
            zIndex: 999,
            display: 'block',
            position: 'absolute', // Changed from fixed for better container control locally if needed, but fixed is safer for overlay
            top: '50%',
            left: 0,
            width: '100vw',
            transform: 'translateY(-50%)',
            // background: 'pink', // The requirement had 'background: pink' on #ribbon, which might block view. 
            // Usually ribbon container shouldn't have bg if it just holds the ribbon pieces.
            // But I will keep it transparent or minimal? 
            // The prompt Code says: background: pink; width: 100vw. 
            // If I make it pink, it covers the middle. Let's assume the strip itself is the bg.
            height: '10rem', // Implicit height from bow? No, prompt says #ribbon has pink bg. 
            // Wait, #ribbon .ribbon--r/l have height 1.5rem.
            // The #ribbon container seems to be a wrapper.
            // If I give it pink bg, it will look like a wide pink band.
            // I will trust the prompt code: background: pink.
            background: 'rgba(255, 192, 203, 0.01)', // Making it transparent primarily so we see the pieces, or 'pink' if intended to be a big strip
            pointerEvents: isCut ? 'none' : 'auto',
            cursor: 'pointer',
        },
        bow: {
            zIndex: 10,
            left: '50%',
            top: '50%',
            position: 'absolute',
            width: '20rem',
            height: '10rem',
            backgroundImage: 'url(https://pics.clipartpng.com/midle/Beautiful_Red_Bow_PNG_Clipart-518.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            transform: 'translate(-50%, -50%)',
            transition: 'transform 2s ease-in-out, opacity .1s ease 2s',
            ...(isCut ? {
                transform: 'translate(-50%, -2000rem) rotate(360deg)',
                opacity: 0,
            } : {})
        },
        ribbonLeft: {
            zIndex: 0,
            position: 'absolute',
            backgroundColor: '#a7002c',
            width: '50vw',
            height: '1.5rem',
            left: 0,
            top: '50%',
            marginTop: '-0.75rem', // simple vertical centering since height is 1.5rem
            transformOrigin: 'bottom left',
            transition: 'transform 5s ease-in-out',
            ...(isCut ? {
                transform: 'translateX(-1000rem) rotate(-90deg)'
            } : {})
        },
        ribbonRight: {
            zIndex: 0,
            position: 'absolute',
            backgroundColor: '#a7002c',
            width: '50vw',
            height: '1.5rem',
            right: 0,
            top: '50%',
            marginTop: '-0.75rem',
            transformOrigin: 'bottom right',
            transition: 'transform 5s ease-in-out',
            ...(isCut ? {
                transform: 'translateX(1000rem) rotate(90deg)'
            } : {})
        },
        scissors: {
            zIndex: 1000,
            position: 'fixed',
            left: mousePos.x + 30,
            top: mousePos.y - 20,
            width: '5rem',
            pointerEvents: 'none',
            display: isCut ? 'none' : 'block',
            transform: 'rotate(0deg)', // Initial rotation
        }
    };

    return (
        <>
            <div id="ribbon" style={styles.ribbonContainer} onClick={handleClick}>
                <div style={styles.ribbonLeft}></div>
                <div style={styles.ribbonRight}></div>
                <div style={styles.bow}></div>
            </div>
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/74/Scissors_icon_black.svg"
                alt="Scissors"
                style={styles.scissors}
            />
        </>
    );
};

export default RibbonCutting;
