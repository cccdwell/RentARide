/**
 * Parallax Effect with Spring Animation
 * Recreates the settling/spring parallax behavior from the original site
 */

class ParallaxController {
    constructor() {
        this.hero = document.querySelector('.hero');
        this.layers = document.querySelectorAll('.hero-layer[data-speed]');
        this.heroContent = document.querySelector('.hero-content');

        // Spring physics parameters
        this.spring = {
            stiffness: 0.08,
            damping: 0.85,
            mass: 1
        };

        // State for each layer
        this.layerStates = new Map();

        // Scroll state
        this.currentScroll = 0;
        this.targetScroll = 0;
        this.velocity = 0;

        // RAF ID
        this.rafId = null;

        this.init();
    }

    init() {
        // Initialize layer states
        this.layers.forEach(layer => {
            const speed = parseFloat(layer.dataset.speed) || 0.5;
            this.layerStates.set(layer, {
                currentY: 0,
                targetY: 0,
                velocity: 0,
                speed: speed
            });
        });

        // Also track hero content
        if (this.heroContent) {
            this.layerStates.set(this.heroContent, {
                currentY: 0,
                targetY: 0,
                velocity: 0,
                speed: parseFloat(this.heroContent.dataset.speed) || 0.5
            });
        }

        // Bind events
        this.bindEvents();

        // Start animation loop
        this.animate();
    }

    bindEvents() {
        // Use passive scroll listener for better performance
        window.addEventListener('scroll', () => {
            this.targetScroll = window.scrollY;
        }, { passive: true });

        // Handle resize
        window.addEventListener('resize', () => {
            this.recalculateBounds();
        }, { passive: true });
    }

    recalculateBounds() {
        // Recalculate any bounds if needed
    }

    /**
     * Spring physics calculation
     * Creates the natural settling effect when scrolling stops
     */
    calculateSpring(current, target, velocity, dt = 1/60) {
        const { stiffness, damping, mass } = this.spring;

        // Spring force: F = -k * x
        const displacement = current - target;
        const springForce = -stiffness * displacement;

        // Damping force: F = -c * v
        const dampingForce = -damping * velocity;

        // Acceleration: a = F / m
        const acceleration = (springForce + dampingForce) / mass;

        // Update velocity and position
        const newVelocity = velocity + acceleration;
        const newPosition = current + newVelocity;

        return { position: newPosition, velocity: newVelocity };
    }

    animate() {
        const heroRect = this.hero?.getBoundingClientRect();
        const heroTop = heroRect?.top || 0;
        const heroHeight = heroRect?.height || window.innerHeight;

        // Only apply parallax when hero is in view
        const isInView = heroTop < window.innerHeight && heroTop + heroHeight > 0;

        if (isInView) {
            // Calculate scroll progress through the hero section
            const scrollProgress = Math.max(0, -heroTop / heroHeight);

            this.layerStates.forEach((state, layer) => {
                // Calculate target position based on scroll and layer speed
                // Different speeds create the parallax depth effect
                const maxOffset = heroHeight * 0.3; // Maximum parallax offset
                state.targetY = scrollProgress * maxOffset * state.speed;

                // Apply spring physics for smooth settling
                const springResult = this.calculateSpring(
                    state.currentY,
                    state.targetY,
                    state.velocity
                );

                state.currentY = springResult.position;
                state.velocity = springResult.velocity;

                // Apply transform with hardware acceleration
                const translateY = -state.currentY;
                layer.style.transform = `translate3d(0, ${translateY}px, 0)`;
            });
        }

        // Continue animation loop
        this.rafId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
    }
}

// Smooth scroll for navigation links
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize parallax
    const parallax = new ParallaxController();

    // Initialize smooth scroll
    const smoothScroll = new SmoothScroll();

    // Header scroll behavior - add shadow on scroll
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    }, { passive: true });
});
