const body = document.body;
const header = document.querySelector('.site-header');
const loadingScreen = document.querySelector('.loading-screen');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = Array.from(document.querySelectorAll('.nav-menu a'));
const scrollTopButton = document.querySelector('.scroll-top');
const animatedElements = Array.from(document.querySelectorAll('[data-animate]'));
const statCards = Array.from(document.querySelectorAll('.stat-card[data-count]'));
const testimonialCards = Array.from(document.querySelectorAll('[data-slide]'));
const testimonialDots = Array.from(document.querySelectorAll('.slider-dot'));
const prevButton = document.querySelector('[data-slider-prev]');
const nextButton = document.querySelector('[data-slider-next]');
const contactForm = document.getElementById('consultation-form');
const formStatus = document.querySelector('.form-status');

let activeSlide = 0;
let testimonialTimer;

const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function hideLoadingScreen() {
  body.classList.remove('is-loading');
  loadingScreen.classList.add('is-hidden');
}

function animateCounter(element) {
  const target = Number(element.dataset.count || 0);
  const suffix = element.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(target * eased);
    element.querySelector('.stat-card__value').textContent = `${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.querySelector('.stat-card__value').textContent = `${target}${suffix}`;
    }
  }

  requestAnimationFrame(tick);
}

function setActiveSlide(index) {
  activeSlide = (index + testimonialCards.length) % testimonialCards.length;

  testimonialCards.forEach((card, cardIndex) => {
    card.classList.toggle('is-active', cardIndex === activeSlide);
  });

  testimonialDots.forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === activeSlide);
    dot.setAttribute('aria-current', dotIndex === activeSlide ? 'true' : 'false');
  });
}

function startTestimonialAutoplay() {
  stopTestimonialAutoplay();
  testimonialTimer = window.setInterval(() => {
    setActiveSlide(activeSlide + 1);
  }, 5500);
}

function stopTestimonialAutoplay() {
  if (testimonialTimer) {
    window.clearInterval(testimonialTimer);
  }
}

function toggleMenu(force) {
  const isOpen = typeof force === 'boolean' ? force : !navMenu.classList.contains('is-open');
  navMenu.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
}

function updateActiveNav() {
  const offset = 140;
  const scrollPosition = window.scrollY + offset;
  let currentId = sections[0]?.id || '';

  sections.forEach((section) => {
    if (scrollPosition >= section.offsetTop) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${currentId}`;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function updateScrollState() {
  const scrolled = window.scrollY > 20;
  header.classList.toggle('is-scrolled', scrolled);
  scrollTopButton.classList.toggle('is-visible', window.scrollY > 600);
}

const intersectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    entry.target.classList.add('is-visible');

    if (entry.target.classList.contains('stat-card')) {
      animateCounter(entry.target);
    }

    intersectionObserver.unobserve(entry.target);
  });
}, {
  threshold: 0.18,
  rootMargin: '0px 0px -80px 0px'
});

animatedElements.forEach((element) => intersectionObserver.observe(element));

navToggle?.addEventListener('click', () => toggleMenu());

navLinks.forEach((link) => {
  link.addEventListener('click', () => toggleMenu(false));
});

prevButton?.addEventListener('click', () => {
  setActiveSlide(activeSlide - 1);
  startTestimonialAutoplay();
});

nextButton?.addEventListener('click', () => {
  setActiveSlide(activeSlide + 1);
  startTestimonialAutoplay();
});

testimonialDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    setActiveSlide(index);
    startTestimonialAutoplay();
  });
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const organization = String(formData.get('organization') || '').trim();
  const subject = String(formData.get('subject') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!name || !email || !subject || !message) {
    formStatus.textContent = 'Please complete all required fields before submitting.';
    formStatus.classList.remove('is-success');
    return;
  }

  formStatus.textContent = 'Thank you. Your message has been sent. Dr. Nagesh will respond shortly.';
  formStatus.classList.add('is-success');
  contactForm.reset();
});

scrollTopButton?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
  updateScrollState();
  updateActiveNav();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1100) {
    toggleMenu(false);
  }
});

window.addEventListener('load', () => {
  hideLoadingScreen();
  updateScrollState();
  updateActiveNav();
  setActiveSlide(0);
  startTestimonialAutoplay();
});

window.addEventListener('beforeunload', stopTestimonialAutoplay);
