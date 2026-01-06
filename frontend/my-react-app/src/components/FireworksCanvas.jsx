import React, { useEffect, useRef } from 'react';

const FireworksCanvas = ({ isActive, intensity = 100 }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]);
    const fireworksRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor(x, y, hue) {
                this.x = x;
                this.y = y;
                this.hue = hue;
                this.angle = Math.random() * Math.PI * 2;
                this.speed = Math.random() * 5 + 2;
                this.friction = 0.95;
                this.gravity = 0.5;
                this.opacity = 1;
                this.decay = Math.random() * 0.03 + 0.015;
            }

            update() {
                this.speed *= this.friction;
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed + this.gravity;
                this.opacity -= this.decay;
                return this.opacity > 0;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
                ctx.fill();
                ctx.restore();
            }
        }

        class Firework {
            constructor(x, targetY) {
                this.x = x;
                this.y = canvas.height;
                this.targetY = targetY;
                this.speed = 5;
                this.hue = Math.random() * 360;
                this.brightness = 50 + Math.random() * 50;
            }

            update() {
                this.y -= this.speed;
                if (this.y <= this.targetY) {
                    this.explode();
                    return false;
                }
                return true;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
                ctx.fill();
            }

            explode() {
                const particleCount = 50 + Math.random() * 50;
                for (let i = 0; i < particleCount; i++) {
                    particlesRef.current.push(new Particle(this.x, this.y, this.hue));
                }
            }
        }

        let lastFireworkTime = 0;

        function loop(timestamp) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Launch fireworks based on intensity
            if (isActive && intensity > 0) {
                const delay = intensity >= 100 ? 200 :
                    intensity >= 75 ? 400 :
                        intensity >= 50 ? 600 : 1000;

                if (timestamp - lastFireworkTime > delay) {
                    fireworksRef.current.push(
                        new Firework(
                            Math.random() * canvas.width,
                            Math.random() * canvas.height * 0.5
                        )
                    );
                    lastFireworkTime = timestamp;
                }
            }

            // Update and draw fireworks
            fireworksRef.current = fireworksRef.current.filter(fw => {
                fw.draw();
                return fw.update();
            });

            // Update and draw particles
            particlesRef.current = particlesRef.current.filter(p => {
                p.draw();
                return p.update();
            });

            animationRef.current = requestAnimationFrame(loop);
        }

        animationRef.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isActive, intensity]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: isActive ? 1 : 0,
                opacity: isActive ? 1 : 0,
                transition: 'opacity 1s ease'
            }}
        />
    );
};

export default FireworksCanvas;
