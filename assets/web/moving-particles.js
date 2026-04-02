(function() {
    'use strict';

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Create and inject canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'particleCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';

    // Wait for DOM to be ready
    if (document.body) {
        document.body.insertBefore(canvas, document.body.firstChild);
        initParticles();
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            document.body.insertBefore(canvas, document.body.firstChild);
            initParticles();
        });
    }

    function initParticles() {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        let animationId;

        // Cache window dimensions for better performance
        let canvasWidth = window.innerWidth;
        let canvasHeight = window.innerHeight;

        function resizeCanvas() {
            canvasWidth = window.innerWidth;
            canvasHeight = window.innerHeight;
            canvas.width = canvasWidth * dpr;
            canvas.height = canvasHeight * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to prevent accumulation
            ctx.scale(dpr, dpr);
            canvas.style.width = canvasWidth + 'px';
            canvas.style.height = canvasHeight + 'px';
        }

        resizeCanvas();

        // Pre-calculated constants
        const PARTICLE_COLOR = 'rgba(255, 255, 255, 0.8)';

        let particlesArray = [];
        let numberOfParticles = canvasWidth < 768 ? 50 : 80;
        let connectionDistanceSq = 0;

        function updateConnectionDistance() {
            const baseDistance = Math.min(canvasWidth, canvasHeight) * 0.18;
            const connectionDistance = Math.max(90, Math.min(160, baseDistance));
            connectionDistanceSq = connectionDistance * connectionDistance;
        }

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                if (this.x + this.size > canvasWidth || this.x - this.size < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y + this.size > canvasHeight || this.y - this.size < 0) {
                    this.directionY = -this.directionY;
                }
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        function init() {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) {
                let size = Math.random() * 5 + 1;
                let x = Math.random() * (canvasWidth - size * 2) + size;
                let y = Math.random() * (canvasHeight - size * 2) + size;
                let directionX = (Math.random() * 0.5) - 0.25;
                let directionY = (Math.random() * 0.5) - 0.25;
                particlesArray.push(new Particle(x, y, directionX, directionY, size, PARTICLE_COLOR));
            }
        }

        function connect() {
            ctx.lineWidth = 1;
            const len = particlesArray.length;
            const maxDistance = Math.sqrt(connectionDistanceSq);

            for (let a = 0; a < len; a++) {
                const particleA = particlesArray[a];

                for (let b = a + 1; b < len; b++) {
                    const particleB = particlesArray[b];
                    const dx = particleA.x - particleB.x;
                    const dy = particleA.y - particleB.y;

                    // Early exit if distance in single axis exceeds max connection distance
                    if (Math.abs(dx) > maxDistance || Math.abs(dy) > maxDistance) continue;

                    const distanceSq = dx * dx + dy * dy;

                    if (distanceSq < connectionDistanceSq) {
                        const opacityValue = Math.max(0.05, 1 - (distanceSq / connectionDistanceSq));
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue})`;
                        ctx.beginPath();
                        ctx.moveTo(particleA.x, particleA.y);
                        ctx.lineTo(particleB.x, particleB.y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            // Respect reduced motion preference
            if (prefersReducedMotion) return;

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connect();
            animationId = requestAnimationFrame(animate);
        }

        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resizeCanvas();
                numberOfParticles = canvasWidth < 768 ? 50 : 80;
                updateConnectionDistance();
                init();
            }, 250);
        });

        // Pause animation when tab is hidden (battery optimization)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
            } else {
                if (!prefersReducedMotion) {
                    animate();
                }
            }
        });

        updateConnectionDistance();
        init();

        // Only start animation if motion is allowed
        if (!prefersReducedMotion) {
            animate();
        }
    }
})();