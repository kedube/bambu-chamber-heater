/**
 * Animated Starfield Background for ESPHome Webserver v3
 * Pure JavaScript implementation with no dependencies
 */

(function() {
    'use strict';

    // Constants
    const STAR_FIELD_WIDTH = 2500;
    const STAR_FIELD_HEIGHT = 2000;
    const SMALL_STAR_COUNT = 175;
    const MEDIUM_STAR_COUNT = 50;
    const LARGE_STAR_COUNT = 25;
    const MOBILE_BREAKPOINT = 768;

    // Check for reduced motion preference and mobile
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    // Adjust star counts for mobile performance
    const smallStarCount = isMobile ? Math.floor(SMALL_STAR_COUNT * 0.5) : SMALL_STAR_COUNT;
    const mediumStarCount = isMobile ? Math.floor(MEDIUM_STAR_COUNT * 0.5) : MEDIUM_STAR_COUNT;
    const largeStarCount = isMobile ? Math.floor(LARGE_STAR_COUNT * 0.5) : LARGE_STAR_COUNT;

    // Generate multiple box shadows for stars
    function generateStarShadows(count) {
        const shadows = new Array(count);
        for (let i = 0; i < count; i++) {
            const x = Math.floor(Math.random() * STAR_FIELD_WIDTH);
            const y = Math.floor(Math.random() * STAR_FIELD_HEIGHT);
            shadows[i] = `${x}px ${y}px #FFF`;
        }
        return shadows.join(', ');
    }

    // Generate star shadows
    const shadowsSmall = generateStarShadows(smallStarCount);
    const shadowsMedium = generateStarShadows(mediumStarCount);
    const shadowsBig = generateStarShadows(largeStarCount);

    // Inject CSS styles
    const style = document.createElement('style');
    style.textContent = `
        html {
            height: 100%;
            overflow: auto;
        }

        body {
            margin: 0;
            padding: 0;
            min-height: 100%;
            position: relative;
        }

        #stars {
            position: fixed;
            width: 1px;
            height: 1px;
            background: transparent;
            box-shadow: ${shadowsSmall};
            animation: animStar 50s linear infinite${prefersReducedMotion ? ' paused' : ''};
            will-change: transform;
            z-index: -1;
            pointer-events: none;
        }

        #stars:after {
            content: " ";
            position: absolute;
            top: ${STAR_FIELD_HEIGHT}px;
            width: 1px;
            height: 1px;
            background: transparent;
            box-shadow: ${shadowsSmall};
        }

        #stars2 {
            position: fixed;
            width: 2px;
            height: 2px;
            background: transparent;
            box-shadow: ${shadowsMedium};
            animation: animStar 100s linear infinite${prefersReducedMotion ? ' paused' : ''};
            will-change: transform;
            z-index: -1;
            pointer-events: none;
        }

        #stars2:after {
            content: " ";
            position: absolute;
            top: ${STAR_FIELD_HEIGHT}px;
            width: 2px;
            height: 2px;
            background: transparent;
            box-shadow: ${shadowsMedium};
        }

        #stars3 {
            position: fixed;
            width: 3px;
            height: 3px;
            background: transparent;
            box-shadow: ${shadowsBig};
            animation: animStar 150s linear infinite${prefersReducedMotion ? ' paused' : ''};
            will-change: transform;
            z-index: -1;
            pointer-events: none;
        }

        #stars3:after {
            content: " ";
            position: absolute;
            top: ${STAR_FIELD_HEIGHT}px;
            width: 3px;
            height: 3px;
            background: transparent;
            box-shadow: ${shadowsBig};
        }

        @keyframes animStar {
            from {
                transform: translateY(0px);
            }
            to {
                transform: translateY(-${STAR_FIELD_HEIGHT}px);
            }
        }

        /* Optional: Style for ESPHome content */
        .esphome-content {
            position: relative;
            z-index: 10;
            color: #FFF;
            font-family: 'lato', sans-serif;
        }
    `;
    document.head.appendChild(style);

    // Create star layers
    function createStarfield() {
        const fragment = document.createDocumentFragment();

        const stars1 = document.createElement('div');
        stars1.id = 'stars';

        const stars2 = document.createElement('div');
        stars2.id = 'stars2';

        const stars3 = document.createElement('div');
        stars3.id = 'stars3';

        // Build fragment (reverse order for correct z-index)
        fragment.appendChild(stars1);
        fragment.appendChild(stars2);
        fragment.appendChild(stars3);

        // Insert at the beginning of body (single reflow)
        document.body.insertBefore(fragment, document.body.firstChild);

        // Pause animation when tab is hidden (battery optimization)
        const starElements = [stars1, stars2, stars3];
        document.addEventListener('visibilitychange', () => {
            const playState = document.hidden ? 'paused' : 'running';
            starElements.forEach(star => {
                star.style.animationPlayState = playState;
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createStarfield);
    } else {
        createStarfield();
    }
})();