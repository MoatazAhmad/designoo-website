import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "splitting/dist/splitting.css";
import "splitting/dist/splitting-cells.css";
import Splitting from "splitting";
document.addEventListener("DOMContentLoaded", () => {
  // Your animation code here
  if (document.documentElement.dir !== "rtl") {
    Splitting();
  }
});

gsap.registerPlugin(ScrollTrigger);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      try {
        gsap.to(entry.target, {
          x: 0,
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1.5,
          delay: parseFloat(entry.target.dataset.delay) || 0,
          ease: "power4.out",
          onComplete: () => observer.unobserve(entry.target),
        });
      } catch (error) {
        console.error("Animation error on element:", entry.target, error);
      }
    }
  });
});

const slideElements = document.querySelectorAll(".slideScaleRotateFade");
slideElements.forEach((el, index) => {
  el.style.transform = "translateX(-70%) scale(0.8) rotate(-10deg)";
  el.style.opacity = "0";
  el.dataset.delay = `${index * 0.1}`;
  observer.observe(el);
});

const chars = document.querySelectorAll(".reveal .char");
const charAnimationOptions = {
  opacity: 0,
  y: 20,
  duration: 0.5,
  ease: "power2.out",
  stagger: 0.05,
};

//   }
gsap.from(chars, charAnimationOptions);
if (window.location.pathname === "/index.html") {
  charAnimationOptions.delay = 2.8;
}

gsap.to(".progress-bar", {
  width: "100%",
  ease: "none",
  scrollTrigger: {
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  },
});

/**
 * Handles mousemove events to create ripple effects.
 * @param {MouseEvent} e - The mouse event.
 */
function handleMouseMove(e) {
  const target = e.currentTarget;
  const rect = target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  target.style.setProperty("--x", `${x}px`);
  target.style.setProperty("--y", `${y}px`);
}

document.querySelectorAll(".btn-animation, .link-animation").forEach((el) => {
  el.addEventListener("mousemove", handleMouseMove);
});

if (window.location.pathname !== "/src/pages/contact.html") {
  gsap.to(".text", {
    textShadow: "2px 2px 10px rgba(0,0,0,0.5), 4px 4px 20px rgba(0,0,0,0.3)",
    scale: 1,
    rotation: 1,
    duration: 1.5,
    ease: "bounce.out",
    repeat: -1,
    yoyo: true,
  });
}
