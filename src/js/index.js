import { gsap } from "gsap";

(function () {
  "use strict";

  // Create a GSAP timeline with default easing.
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

  // Animate loader bars: scale in from the bottom.
  tl.from(".loader-bar", {
    duration: 0.8,
    scaleY: 0,
    stagger: 0.1,
    transformOrigin: "bottom",
    ease: "expo.inOut",
  })
    // Animate the loading text into view.
    .to(
      ".loading-text",
      {
        duration: 0.5,
        opacity: 1,
        y: 20,
      },
      "-=0.3"
    )
    // Animate loader bars: scale out toward the top.
    .to(
      ".loader-bar",
      {
        duration: 0.8,
        scaleY: 0,
        stagger: 0.1,
        transformOrigin: "top",
      },
      "+=0.5"
    )
    // Animate the preloader out of view.
    .to(
      "#preloader",
      {
        duration: 1,
        y: "-100%",
        onComplete: () => {
          // Remove the overflow-hidden class to allow scrolling.
          document.body.classList.remove("overflow-hidden");
          // Fade in the main content.
          gsap.to(".content", { opacity: 1, duration: 0.5 });
        },
      },
      "-=0.3"
    );

  // Safely remove the preloader element once the timeline has fully completed.
  tl.eventCallback("onComplete", () => {
    const preloaderElement = document.getElementById("preloader");
    if (preloaderElement) {
      preloaderElement.remove();
    }
  });

  // Start the timeline when the window load event fires, with a slight delay for smoother transition.
  window.addEventListener("load", () => {
    gsap.delayedCall(0.5, () => tl.play());
  });
})();
