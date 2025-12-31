import React, { useEffect, useRef } from 'react';

const CanvasFireworks = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        let particles = [];
        const probability = 0.04;
        let animationFrameId;

        const resizeCanvas = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resizeCanvas);

        class Particle {
            constructor() {
                this.w = this.h = Math.random() * 4 + 1;
                // Random start roughly in the center area to match expected visual
                // Or strictly follow the original code's logic
                const xPoint = Math.random() * (w - 200) + 100;
                const yPoint = Math.random() * (h - 200) + 100;

                this.x = xPoint - this.w / 2;
                this.y = yPoint - this.h / 2;

                this.vx = (Math.random() - 0.5) * 10;
                this.vy = (Math.random() - 0.5) * 10;

                this.alpha = Math.random() * 0.5 + 0.5;
                this.gravity = 0.05;
            }

            move() {
                this.x += this.vx;
                this.vy += this.gravity;
                this.y += this.vy;
                this.alpha -= 0.01;

                if (this.x <= -this.w || this.x >= window.innerWidth ||
                    this.y >= window.innerHeight ||
                    this.alpha <= 0) {
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
            const nFire = Math.random() * 50 + 100;
            const c = "rgb(" + (~~(Math.random() * 200)) + ","
                + (~~(Math.random() * 200)) + "," + (~~(Math.random() * 200)) + ")";

            for (let i = 0; i < nFire; i++) {
                const particle = new Particle();
                // Override particle position to be consistent with the firework center
                particle.x = xPoint - particle.w / 2;
                particle.y = yPoint - particle.h / 2;
                particle.color = c;

                const vy = Math.sqrt(25 - particle.vx * particle.vx);
                if (Math.abs(particle.vy) > vy) {
                    particle.vy = particle.vy > 0 ? vy : -vy;
                }
                particles.push(particle);
            }
        };

        const update = () => {
            if (particles.length < 500 && Math.random() < probability) {
                createFirework();
            }
            const alive = [];
            for (let i = 0; i < particles.length; i++) {
                if (particles[i].move()) {
                    alive.push(particles[i]);
                }
            }
            particles = alive;
        };

        const paint = () => {
            ctx.globalCompositeOperation = 'source-over';
            // Transparent background so it overlays efficiently or use the slight fade effect
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < particles.length; i++) {
                particles[i].draw(ctx);
            }
        };

        const updateWorld = () => {
            update();
            paint();
            animationFrameId = requestAnimationFrame(updateWorld);
        };

        updateWorld();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

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
                backgroundColor: 'transparent',
                zIndex: 5
            }}
        />
    );
};

export default CanvasFireworks;
