import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function setupHeroAnimations(largeNameElement, taglineElement) {
  gsap.registerPlugin(ScrollTrigger);
  const largeName = "CHASE";
  const taglineText = "A front-end developer crafting experiences through code and design";

  // Split large name into characters (no curve)
  largeNameElement.innerHTML = largeName
    .split('')
    .map(char => `<span class="char">${char}</span>`)
    .join('');

  // Keep tagline as plain text
  taglineElement.textContent = taglineText;

  // Typewriter animation for large name
  const largeNameChars = largeNameElement.querySelectorAll('.char');
  gsap.from(largeNameChars, {
    opacity: 0,
    duration: 0.1,
    stagger: 0.1,
    ease: 'none',
    delay: 0.3
  });

  gsap.to(largeNameElement, {
    scale: 1.80,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    }
  });

  // Tagline fades in as one block
  gsap.from(taglineElement, {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: 'power2.out',
    delay: 1.0
  });

  // Fade in Earth and scroll hint after text
  gsap.from('.hero__planet', {
    opacity: 0,
    scale: 0.95,
    duration: 1,
    ease: 'power2.out',
    delay: 1.8
  });

  gsap.from('.hero__scroll-hint', {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: 'power2.out',
    delay: 2.5
  });

  // Parallax effect - only globe scales on scroll
  gsap.to('.hero__planet', {
    scale: 1.80,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    }
  });
}
