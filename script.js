// Header background on scroll
const header = document.getElementById('siteHeader');
const onScroll = () => {
  if (window.scrollY > 40) header.classList.add('is-scrolled');
  else header.classList.remove('is-scrolled');
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  navToggle.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Portfolio carousels
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.hcarousel').forEach(carousel => {
  const track = carousel.querySelector('.hcarousel-track');
  const prev = carousel.querySelector('.hcarousel-arrow.prev');
  const next = carousel.querySelector('.hcarousel-arrow.next');
  const scrollByCard = (dir) => {
    const card = track.querySelector('.hcarousel-item');
    const step = card ? card.getBoundingClientRect().width + 18 : 280;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };
  prev.addEventListener('click', () => scrollByCard(-1));
  next.addEventListener('click', () => scrollByCard(1));

  // Gentle autoplay: nudge forward every few seconds, loop, pause on interaction
  if (!prefersReducedMotion) {
    let autoTimer = null;
    let resumeTimer = null;
    const stopAuto = () => { clearInterval(autoTimer); autoTimer = null; };
    const startAuto = () => {
      stopAuto();
      autoTimer = setInterval(() => {
        const maxScroll = track.scrollWidth - track.clientWidth - 4;
        if (maxScroll <= 0) return;
        if (track.scrollLeft >= maxScroll) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollByCard(1);
        }
      }, 4200);
    };
    const pauseThenResume = () => {
      stopAuto();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAuto, 6000);
    };
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('touchstart', pauseThenResume, { passive: true });
    carousel.addEventListener('pointerdown', pauseThenResume);
    startAuto();
  }
});

// Lightbox for story carousels (each group cycles independently)
const lightboxGroups = document.querySelectorAll('[data-lightbox-group]');
if (lightboxGroups.length) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  let currentGallery = [];
  let lbIndex = 0;

  const showLightbox = (i) => {
    lbIndex = (i + currentGallery.length) % currentGallery.length;
    lightboxImg.src = currentGallery[lbIndex].src;
    lightboxImg.alt = currentGallery[lbIndex].alt;
  };
  const openLightbox = (gallery, i) => {
    currentGallery = gallery;
    showLightbox(i);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  lightboxGroups.forEach((group) => {
    const imgs = [...group.querySelectorAll('img')];
    imgs.forEach((img, i) => {
      img.addEventListener('click', () => openLightbox(imgs, i));
    });
  });

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => showLightbox(lbIndex - 1));
  document.getElementById('lightboxNext').addEventListener('click', () => showLightbox(lbIndex + 1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightbox(lbIndex - 1);
    if (e.key === 'ArrowRight') showLightbox(lbIndex + 1);
  });

  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) showLightbox(lbIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
revealEls.forEach(el => observer.observe(el));
