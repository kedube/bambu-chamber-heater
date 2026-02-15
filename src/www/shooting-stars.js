/**
 * Animated Shooting Stars Background for ESPHome Webserver v3
 * Pure JavaScript implementation with no dependencies
 */

(function() {
    'use strict';

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Configuration
    const STAR_COUNT = 10;
    const STAR_COLOR = '#7dd3fc';
    const dpr = window.devicePixelRatio || 1;
    const starHeight = Math.max(2, Math.round(2 * dpr)); // HiDPI support

    // Helper function to generate random number in range
    function randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generate CSS for individual stars with staggered delays
    function generateStarStyles() {
        let styles = '';

        for (let i = 1; i <= STAR_COUNT; i++) {
            const tailLength = randomRange(500, 750) / 100;
            const topOffset = randomRange(0, 10000) / 100;
            const fallDuration = randomRange(6000, 12000) / 1000;
            // Stagger delays evenly to ensure constant visual interest
            const fallDelay = ((i - 1) / STAR_COUNT) * 10;

            styles += `
                .star:nth-child(${i}) {
                    --star-tail-length: ${tailLength}em;
                    --top-offset: ${topOffset}vh;
                    --fall-duration: ${fallDuration}s;
                    --fall-delay: ${fallDelay}s;
                }
            `;
        }

        return styles;
    }

    // Inject CSS styles
    const style = document.createElement('style');
    style.textContent = `
        body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }

        .stars-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at bottom, #0d1d31 0%, #0c0d13 100%);
            z-index: -2;
            pointer-events: none;
        }

        .stars {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 120%;
            transform: rotate(-45deg);
            pointer-events: none;
            z-index: -1;
        }

        .star {
            --star-color: ${STAR_COLOR};
            --star-tail-length: 6em;
            --star-tail-height: ${starHeight}px;
            --star-width: calc(var(--star-tail-length) / 6);
            --fall-duration: 9s;
            --tail-fade-duration: var(--fall-duration);

            position: absolute;
            top: var(--top-offset);
            left: 0;
            width: var(--star-tail-length);
            height: var(--star-tail-height);
            color: var(--star-color);
            background: linear-gradient(45deg, currentColor, transparent);
            border-radius: 50%;
            transform: translate3d(104em, 0, 0);
            animation: fall var(--fall-duration) var(--fall-delay) linear infinite,
                       tail-fade var(--tail-fade-duration) var(--fall-delay) ease-out infinite;
        }

        /* Mobile optimization - remove drop-shadow and tail-fade for performance */
        @media screen and (min-width: 751px) {
            .star {
                filter: drop-shadow(0 0 6px currentColor);
            }
        }

        @media screen and (max-width: 750px) {
            .star {
                animation: fall var(--fall-duration) var(--fall-delay) linear infinite;
            }
        }

        /* Accessibility: Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
            .star {
                animation: none;
                opacity: 0.3;
            }

            .star::before,
            .star::after {
                animation: none;
            }
        }

        .star::before,
        .star::after {
            position: absolute;
            content: '';
            top: 0;
            left: calc(var(--star-width) / -2);
            width: var(--star-width);
            height: 100%;
            background: linear-gradient(45deg, transparent, currentColor, transparent);
            border-radius: inherit;
            animation: blink 2s linear infinite;
        }

        .star::before {
            transform: rotate(45deg);
        }

        .star::after {
            transform: rotate(-45deg);
        }

        /* Individual star variations */
        ${generateStarStyles()}

        /* Animations */
        @keyframes fall {
            to {
                transform: translate3d(-30em, 0, 0);
            }
        }

        @keyframes tail-fade {
            0%, 50% {
                width: var(--star-tail-length);
                opacity: 1;
            }
            70%, 80% {
                width: 0;
                opacity: 0.4;
            }
            100% {
                width: 0;
                opacity: 0;
            }
        }

        @keyframes blink {
            50% {
                opacity: 0.6;
            }
        }

        /* Ensure content is above stars */
        .esphome-content,
        .content,
        #content,
        main {
            position: relative;
            z-index: 10;
        }
    `;
    document.head.appendChild(style);

    // Create star container and stars
    function createShootingStars() {
        // Check if stars container already exists
        if (document.querySelector('.stars')) {
            return;
        }

        // Create background gradient element
        const background = document.createElement('div');
        background.className = 'stars-background';
        document.body.insertBefore(background, document.body.firstChild);

        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars';

        // Create individual stars
        for (let i = 0; i < STAR_COUNT; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            starsContainer.appendChild(star);
        }

        // Insert at the beginning of body (after background)
        document.body.insertBefore(starsContainer, document.body.children[1] || null);

        // Pause/resume animations based on page visibility (battery optimization)
        let animationsPaused = false;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && !animationsPaused && !prefersReducedMotion) {
                starsContainer.style.animationPlayState = 'paused';
                const stars = starsContainer.querySelectorAll('.star');
                stars.forEach(star => {
                    star.style.animationPlayState = 'paused';
                });
                animationsPaused = true;
            } else if (!document.hidden && animationsPaused && !prefersReducedMotion) {
                starsContainer.style.animationPlayState = 'running';
                const stars = starsContainer.querySelectorAll('.star');
                stars.forEach(star => {
                    star.style.animationPlayState = 'running';
                });
                animationsPaused = false;
            }
        });
    }

    // Debounced resize handler for responsive adjustments
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Re-calculate rotation if needed for orientation changes
            const starsContainer = document.querySelector('.stars');
            if (starsContainer && window.innerHeight > window.innerWidth) {
                // Portrait mode - adjust rotation for better visibility
                starsContainer.style.transform = 'rotate(-45deg)';
            }
        }, 250);
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createShootingStars);
    } else {
        createShootingStars();
    }

    // Expose configuration API
    window.shootingStarsConfig = {
        setStarColor: function(color) {
            const stars = document.querySelectorAll('.star');
            stars.forEach(star => {
                star.style.setProperty('--star-color', color);
            });
        }
    };
})();
