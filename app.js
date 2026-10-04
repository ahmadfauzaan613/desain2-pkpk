const root = document.documentElement;
const langButtons = document.querySelectorAll('[data-lang-set]');

// Swaps the attributes CSS cannot reach (title, aria-label, alt) and remembers the choice.
function setLanguage(lang) {
  const key = lang === 'en' ? 'En' : 'Id';
  root.lang = lang;
  if (root.dataset[`title${key}`]) document.title = root.dataset[`title${key}`];
  document.querySelectorAll('[data-label-id]').forEach((el) => el.setAttribute('aria-label', el.dataset[`label${key}`]));
  document.querySelectorAll('[data-alt-id]').forEach((el) => { el.alt = el.dataset[`alt${key}`]; });
  langButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.langSet === lang)));
  try { localStorage.setItem('pkpk-lang', lang); } catch (error) { /* storage blocked: the choice lasts for this page only */ }
}

langButtons.forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.langSet)));
setLanguage(root.lang === 'en' ? 'en' : 'id');

const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');

function setMenuOpen(open) {
  menu?.classList.toggle('is-open', open);
  menuButton?.setAttribute('aria-expanded', String(open));
}

menuButton?.addEventListener('click', () => {
  setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
});

document.querySelectorAll('[data-menu-link]').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuButton.focus();
  }
});

// Tabbing out of the open mobile menu closes it, so it never covers the next focused element.
menu?.addEventListener('focusout', (event) => {
  if (menuButton?.getAttribute('aria-expanded') === 'true' && !menu.contains(event.relatedTarget) && !menuButton.contains(event.relatedTarget)) setMenuOpen(false);
});

document.addEventListener('click', (event) => {
  if (menuButton?.getAttribute('aria-expanded') === 'true' && !menu?.contains(event.target) && !menuButton.contains(event.target)) {
    setMenuOpen(false);
  }
});

const scrollUpButton = document.querySelector('[data-scroll-up]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function updateScrollUpVisibility() {
  scrollUpButton?.classList.toggle('is-visible', window.scrollY > 560);
}

scrollUpButton?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
});

window.addEventListener('scroll', updateScrollUpVisibility, { passive: true });
updateScrollUpVisibility();

// Scroll reveal: only blocks that start below the fold fade in, so nothing on screen flickers at load
// and everything stays visible when JS or motion is unavailable.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const blocks = [...document.querySelectorAll('.statement > *, .lines__head, .band__card, .perf__grid > *, .destinations, .pair > a, .cta-band__grid > *, .leg__head, .leg > :not(.leg__head)')]
    .filter((block) => block.getBoundingClientRect().top > window.innerHeight);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  blocks.forEach((block) => {
    block.setAttribute('data-reveal', '');
    observer.observe(block);
  });
}
