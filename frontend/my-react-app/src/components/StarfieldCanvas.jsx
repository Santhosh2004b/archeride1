import React, { useEffect, useRef } from 'react';

const StarfieldCanvas = ({ density = 1.0, centerHole = false }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let vw = window.innerWidth;
        let vh = window.innerHeight;

        const resizeCanvas = () => {
            vw = window.innerWidth;
            vh = window.innerHeight;
            canvas.width = vw;
            canvas.height = vh;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const Star = (size, speed) => {
            return {
                x: Math.random() * vw,
                y: Math.random() * vh,
                size,
                speed,
                draw() {
                    this.x += 0.05 * this.speed;
                    this.y -= 0.3 * this.speed;

                    if (this.x > vw) this.x = 0;
                    if (this.y < 0) this.y = vh;

                    
                    if (centerHole) {
                        const dx = this.x - vw / 2;
                        const dy = this.y - vh / 2;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist < 300) return;
                    }

                    ctx.fillStyle = 'white';
                    ctx.fillRect(this.x, this.y, this.size, this.size);
                }
            };
        };

        
        const baseCount = 1200;
        const count = Math.floor(baseCount * density);
        const stars = Array.from({ length: count }).map(() => Star(1, 1));
        const closerStars = Array.from({ length: count }).map(() => Star(2, 1.5));
        const closestStars = Array.from({ length: Math.floor(300 * density) }).map(() => Star(3, 2.25));

        const animate = () => {
            
            const gradient = ctx.createRadialGradient(vw / 2, vh / 2, 0, vw / 2, vh / 2, vw);
            gradient.addColorStop(0, '#09102a'); 
            gradient.addColorStop(1, '#020205'); 
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, vw, vh);

            stars.forEach(star => star.draw());
            closerStars.forEach(star => star.draw());
            closestStars.forEach(star => star.draw());

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [density, centerHole]); 

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none'
            }}
        />
    );
};

export default StarfieldCanvas;
