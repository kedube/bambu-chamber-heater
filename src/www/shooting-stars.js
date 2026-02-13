/**
 * Animated Shooting Stars Background for ESPHome Webserver v3
 * Pure JavaScript implementation with no dependencies
 */

(function() {
    'use strict';

    // Configuration
    const STAR_COUNT = 10;
    const STAR_COLOR = '#7dd3fc';
    
    // Helper function to generate random number in range
    function randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generate CSS for individual stars
    function generateStarStyles() {
        let styles = '';
        
        for (let i = 1; i <= STAR_COUNT; i++) {
            const tailLength = randomRange(500, 750) / 100;
            const topOffset = randomRange(0, 10000) / 100;
            const fallDuration = randomRange(6000, 12000) / 1000;
            const fallDelay = randomRange(0, 10000) / 1000;
            
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
            background: radial-gradient(ellipse at bottom, #0d1d31 0%, #0c0d13 100%);
            overflow-x: hidden;
        }

        .stars {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 120%;
            transform: rotate(-45deg);
            pointer-events: none;
            z-index: 0;
        }

        .star {
            --star-color: ${STAR_COLOR};
            --star-tail-length: 6em;
            --star-tail-height: 2px;
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
            filter: drop-shadow(0 0 6px currentColor);
            transform: translate3d(104em, 0, 0);
            animation: fall var(--fall-duration) var(--fall-delay) linear infinite,
                       tail-fade var(--tail-fade-duration) var(--fall-delay) ease-out infinite;
        }

        /* Mobile optimization - remove tail-fade for performance */
        @media screen and (max-width: 750px) {
            .star {
                animation: fall var(--fall-duration) var(--fall-delay) linear infinite;
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

        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars';
        
        // Create individual stars
        for (let i = 0; i < STAR_COUNT; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            starsContainer.appendChild(star);
        }

        // Insert at the beginning of body
        document.body.insertBefore(starsContainer, document.body.firstChild);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createShootingStars);
    } else {
        createShootingStars();
    }

    // Optional: Expose configuration function for customization
    window.shootingStarsConfig = {
        setStarColor: function(color) {
            document.documentElement.style.setProperty('--star-color', color);
        },
        setStarCount: function(count) {
            // Note: This would require regenerating the stars
            console.log('Star count change requires page reload');
        }
    };
})();
