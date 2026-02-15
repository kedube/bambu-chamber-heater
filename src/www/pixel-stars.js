/**
 * Animated Starfield Background for ESPHome Webserver v3
 * Pure JavaScript implementation with no dependencies
 */

(function() {
    'use strict';

    // Generate multiple box shadows for stars
    function generateStarShadows(count) {
        const shadows = [];
        for (let i = 0; i < count; i++) {
            const x = Math.floor(Math.random() * 2500);
            const y = Math.floor(Math.random() * 2000);
            shadows.push(`${x}px ${y}px #FFF`);
        }
        return shadows.join(', ');
    }

    // Generate star shadows
    const shadowsSmall = generateStarShadows(175);
    const shadowsMedium = generateStarShadows(50);
    const shadowsBig = generateStarShadows(25);

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
            animation: animStar 50s linear infinite;
            z-index: -1;
            pointer-events: none;
        }

        #stars:after {
            content: " ";
            position: absolute;
            top: 2000px;
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
            animation: animStar 100s linear infinite;
            z-index: -1;
            pointer-events: none;
        }

        #stars2:after {
            content: " ";
            position: absolute;
            top: 2000px;
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
            animation: animStar 150s linear infinite;
            z-index: -1;
            pointer-events: none;
        }

        #stars3:after {
            content: " ";
            position: absolute;
            top: 2000px;
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
                transform: translateY(-2000px);
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
        const stars1 = document.createElement('div');
        stars1.id = 'stars';
        
        const stars2 = document.createElement('div');
        stars2.id = 'stars2';
        
        const stars3 = document.createElement('div');
        stars3.id = 'stars3';

        // Insert at the beginning of body
        document.body.insertBefore(stars3, document.body.firstChild);
        document.body.insertBefore(stars2, document.body.firstChild);
        document.body.insertBefore(stars1, document.body.firstChild);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createStarfield);
    } else {
        createStarfield();
    }
})();
