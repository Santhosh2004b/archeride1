import React, { useRef, useEffect } from 'react';

const FireworksCanvas = ({ isActive }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const requestRef = useRef();

    useEffect(() => {
        if (!isActive) {
            particlesRef.current = [];
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w, h;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor(x, y, color) {
                this.w = this.h = Math.random() * 3 + 1; // Smaller particles
                this.x = x - this.w / 2;
                this.y = y - this.h / 2;
                this.vx = (Math.random() - 0.5) * 8; // Slightly slower
                this.vy = (Math.random() - 0.5) * 8;
                this.alpha = Math.random() * 0.4 + 0.3; // Softer alpha
                this.color = color;
            }

            gravity = 0.04;

            move() {
                this.x += this.vx;
                this.vy += this.gravity;
                this.y += this.vy;
                this.alpha -= 0.008; // Slower fade
                if (this.x <= -this.w || this.x >= window.innerWidth || this.y >= window.innerHeight || this.alpha <= 0) {
                    return false;
                }
                return true;
            }

            draw(c) {
                c.save();
                c.beginPath();
                c.translate(this.x + this.w / 2, this.y + this.h / 2);
                c.arc(0, 0, this.w, 0, Math.PI * 2);
                c.fillStyle = this.color;
                c.globalAlpha = this.alpha;
                c.closePath();
                c.fill();
                c.restore();
            }
        }

        const createFirework = () => {
            const xPoint = Math.random() * (w - 200) + 100;
            const yPoint = Math.random() * (h - 200) + 100;
            const nFire = Math.random() * 30 + 50; // Fewer particles for subtlety
            // Softer, ceremonial colors (Gold, Blue, White)
            const colors = [
                'rgba(255, 215, 0, 0.8)', // Gold
                'rgba(56, 189, 248, 0.8)', // Arche Blue
                'rgba(255, 255, 255, 0.8)'  // White
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];

            for (let i = 0; i < nFire; i++) {
                const p = new Particle(xPoint, yPoint, color);
                const vy = Math.sqrt(25 - p.vx * p.vx);
                if (Math.abs(p.vy) > vy) {
                    p.vy = p.vy > 0 ? vy : -vy;
                }
                particlesRef.current.push(p);
            }
        };

        const update = () => {
            // Frequency of fireworks - made more sparse
            if (particlesRef.current.length < 300 && Math.random() < 0.03) {
                createFirework();
            }
            particlesRef.current = particlesRef.current.filter((p) => p.move());
        };

        const paint = () => {
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, w, h); // Clear frame
            ctx.globalCompositeOperation = 'lighter';
            particlesRef.current.forEach((p) => p.draw(ctx));
        };

        const loop = () => {
            update();
            paint();
            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(requestRef.current);
        };
    }, [isActive]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1, // Final Fix 4.3: Never cover text
                backgroundColor: 'transparent'
            }}
        />
    );
};

export default FireworksCanvas;
