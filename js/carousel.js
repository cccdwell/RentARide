/**
 * BTS Carousel Controller
 * Handles the behind-the-scenes image carousel
 */

class Carousel {
    constructor(container) {
        this.container = container;
        this.track = container.querySelector('.carousel-track');
        this.slides = container.querySelectorAll('.carousel-slide');
        this.prevBtn = container.querySelector('.carousel-prev');
        this.nextBtn = container.querySelector('.carousel-next');
        this.dotsContainer = container.querySelector('.carousel-dots');

        this.currentIndex = 0;
        this.slidesPerView = this.calculateSlidesPerView();
        this.totalSlides = this.slides.length;
        this.maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);

        this.autoplayInterval = null;
        this.autoplayDelay = 5000;

        this.init();
    }

    init() {
        this.createDots();
        this.bindEvents();
        this.updateUI();
        this.startAutoplay();
    }

    calculateSlidesPerView() {
        const viewportWidth = window.innerWidth;
        if (viewportWidth < 480) return 1;
        if (viewportWidth < 768) return 2;
        return 3;
    }

    createDots() {
        if (!this.dotsContainer) return;

        const dotsCount = this.maxIndex + 1;
        this.dotsContainer.innerHTML = '';

        for (let i = 0; i <= this.maxIndex; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
    }

    bindEvents() {
        // Button clicks
        this.prevBtn?.addEventListener('click', () => {
            this.prev();
            this.resetAutoplay();
        });

        this.nextBtn?.addEventListener('click', () => {
            this.next();
            this.resetAutoplay();
        });

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        this.track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });

        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
                this.resetAutoplay();
            } else if (e.key === 'ArrowRight') {
                this.next();
                this.resetAutoplay();
            }
        });

        // Pause autoplay on hover
        this.container.addEventListener('mouseenter', () => {
            this.pauseAutoplay();
        });

        this.container.addEventListener('mouseleave', () => {
            this.startAutoplay();
        });

        // Handle resize
        window.addEventListener('resize', () => {
            this.slidesPerView = this.calculateSlidesPerView();
            this.maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);
            this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
            this.createDots();
            this.updateUI();
        });

        // Scroll snap detection
        let scrollTimeout;
        this.track.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.syncIndexFromScroll();
            }, 100);
        }, { passive: true });
    }

    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
            this.resetAutoplay();
        }
    }

    syncIndexFromScroll() {
        if (!this.track || this.slides.length === 0) return;

        const slideWidth = this.slides[0].offsetWidth + 20; // Include gap
        const scrollPosition = this.track.scrollLeft;
        const newIndex = Math.round(scrollPosition / slideWidth);

        if (newIndex !== this.currentIndex) {
            this.currentIndex = Math.min(newIndex, this.maxIndex);
            this.updateDots();
        }
    }

    goToSlide(index) {
        this.currentIndex = Math.max(0, Math.min(index, this.maxIndex));
        this.scrollToCurrentSlide();
        this.updateUI();
    }

    next() {
        if (this.currentIndex < this.maxIndex) {
            this.currentIndex++;
        } else {
            this.currentIndex = 0; // Loop back
        }
        this.scrollToCurrentSlide();
        this.updateUI();
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else {
            this.currentIndex = this.maxIndex; // Loop to end
        }
        this.scrollToCurrentSlide();
        this.updateUI();
    }

    scrollToCurrentSlide() {
        const slide = this.slides[this.currentIndex];
        if (!slide) return;

        const slideLeft = slide.offsetLeft;
        this.track.scrollTo({
            left: slideLeft - 20, // Account for padding
            behavior: 'smooth'
        });
    }

    updateUI() {
        this.updateDots();
        this.updateButtons();
    }

    updateDots() {
        if (!this.dotsContainer) return;

        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    updateButtons() {
        // Visual feedback for buttons (optional - always enabled for looping)
        if (this.prevBtn) {
            this.prevBtn.style.opacity = '1';
        }
        if (this.nextBtn) {
            this.nextBtn.style.opacity = '1';
        }
    }

    startAutoplay() {
        this.pauseAutoplay(); // Clear any existing interval
        this.autoplayInterval = setInterval(() => {
            this.next();
        }, this.autoplayDelay);
    }

    pauseAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    resetAutoplay() {
        this.pauseAutoplay();
        this.startAutoplay();
    }

    destroy() {
        this.pauseAutoplay();
    }
}

// Initialize carousels on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const carouselContainers = document.querySelectorAll('.bts-carousel');

    carouselContainers.forEach(container => {
        new Carousel(container);
    });
});
