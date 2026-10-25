/**
 * Digital Wedding Invitation - Pearl Collection Photo Carousel & Lightbox
 * Features:
 * - Touch swipe gestures & carousel scrolling
 * - Lightbox modal with full image zoom and captions
 * - Next/Previous buttons and pagination dots
 */

class WeddingGallery {
  constructor() {
    this.container = document.getElementById('gallery-track-container');
    this.track = document.getElementById('gallery-track');
    this.items = Array.from(document.querySelectorAll('.gallery-item'));
    this.prevBtn = document.getElementById('gallery-prev-btn');
    this.nextBtn = document.getElementById('gallery-next-btn');
    this.dotsContainer = document.getElementById('gallery-dots');
    this.counterEl = document.getElementById('gallery-counter');

    // Lightbox
    this.modal = document.getElementById('lightbox-modal');
    this.modalImg = document.getElementById('lightbox-img');
    this.modalCaption = document.getElementById('lightbox-caption');
    this.closeBtn = document.getElementById('lightbox-close');
    this.lbPrevBtn = document.getElementById('lightbox-prev');
    this.lbNextBtn = document.getElementById('lightbox-next');

    this.currentIndex = 0;
    this.totalSlides = this.items.length;
    this.lightboxIndex = 0;

    this.init();
  }

  init() {
    if (!this.items.length) return;

    this.setupDots();
    this.bindEvents();
    this.updateControls();
  }

  setupDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';

    this.items.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `gallery-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Photo ${idx + 1}`);
      dot.addEventListener('click', () => this.scrollToIndex(idx));
      this.dotsContainer.appendChild(dot);
    });
  }

  bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.scrollToIndex(Math.max(0, this.currentIndex - 1));
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.scrollToIndex(Math.min(this.totalSlides - 1, this.currentIndex + 1));
      });
    }

    if (this.container) {
      let scrollTimer;
      this.container.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => this.detectCurrentSlide(), 60);
      }, { passive: true });
    }

    // Lightbox item clicks
    this.items.forEach((item, index) => {
      item.addEventListener('click', () => {
        this.openLightbox(index);
      });
    });

    // Lightbox controls
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeLightbox());
    }

    if (this.lbPrevBtn) {
      this.lbPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateLightbox(-1);
      });
    }

    if (this.lbNextBtn) {
      this.lbNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateLightbox(1);
      });
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeLightbox();
      });
    }

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (!this.modal || !this.modal.classList.contains('open')) return;
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
      if (e.key === 'ArrowRight') this.navigateLightbox(1);
    });
  }

  detectCurrentSlide() {
    if (!this.container || !this.items.length) return;
    const scrollLeft = this.container.scrollLeft;
    const itemWidth = this.items[0].offsetWidth + 28; // card width + gap
    const newIdx = Math.round(scrollLeft / itemWidth);
    this.currentIndex = Math.max(0, Math.min(this.totalSlides - 1, newIdx));
    this.updateControls();
  }

  scrollToIndex(index) {
    if (!this.container || !this.items[index]) return;
    this.currentIndex = index;
    const targetEl = this.items[index];
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    this.updateControls();
  }

  updateControls() {
    if (this.counterEl) {
      this.counterEl.textContent = `${this.currentIndex + 1} / ${this.totalSlides}`;
    }

    if (this.dotsContainer) {
      const dots = this.dotsContainer.querySelectorAll('.gallery-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === this.currentIndex);
      });
    }
  }

  openLightbox(index) {
    if (!this.modal || !this.items[index]) return;
    this.lightboxIndex = index;
    const item = this.items[index];
    const src = item.getAttribute('data-src') || item.querySelector('img').src;
    const caption = item.getAttribute('data-caption') || '';

    if (this.modalImg) this.modalImg.src = src;
    if (this.modalCaption) this.modalCaption.textContent = caption;

    this.modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    if (!this.modal) return;
    this.modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  navigateLightbox(direction) {
    let newIndex = this.lightboxIndex + direction;
    if (newIndex < 0) newIndex = this.totalSlides - 1;
    if (newIndex >= this.totalSlides) newIndex = 0;
    this.openLightbox(newIndex);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.weddingGallery = new WeddingGallery();
});
