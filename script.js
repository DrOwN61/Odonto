const statNumbers = document.querySelectorAll(".stat-number");

const numberFormatter = new Intl.NumberFormat("pt-BR");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatStatValue(element, value) {
  const prefix = element.dataset.prefix || "";
  const suffix = element.dataset.suffix || "";

  return `${prefix}${numberFormatter.format(value)}${suffix}`;
}

function animateStat(element) {
  const target = Number(element.dataset.target || 0);
  const duration = 1600;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(target * easedProgress);

    element.textContent = formatStatValue(element, currentValue);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

statNumbers.forEach((element) => {
  element.textContent = formatStatValue(element, 0);
});

if (prefersReducedMotion) {
  statNumbers.forEach((element) => {
    element.textContent = formatStatValue(element, Number(element.dataset.target || 0));
  });
} else {
  const statsObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateStat(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.55,
    }
  );

  statNumbers.forEach((element) => {
    statsObserver.observe(element);
  });
}

const revealElements = [];

function registerReveal(selector, animation = "up", delayStep = 80) {
  document.querySelectorAll(selector).forEach((element, index) => {
    if (element.classList.contains("reveal")) {
      return;
    }

    element.classList.add("reveal");
    element.dataset.animate = animation;
    element.style.setProperty("--reveal-delay", `${Math.min(index * delayStep, 420)}ms`);
    revealElements.push(element);
  });
}

registerReveal(".section-heading", "up", 70);
registerReveal(".intro img", "left");
registerReveal(".intro > div", "right");
registerReveal(".specialty-grid article", "scale", 70);
registerReveal(".why-media", "left");
registerReveal(".why-content > .eyebrow, .why-content > h2", "right", 80);
registerReveal(".why-grid article", "up", 80);
registerReveal(".stats article", "up", 90);
registerReveal(".gallery img", "scale", 90);
registerReveal(".results-carousel", "scale", 90);
registerReveal(".badge-grid article", "up", 80);
registerReveal(".cta-band > div", "left");
registerReveal(".cta-band > .btn", "right");
registerReveal(".location > div", "up", 120);
registerReveal(".faq details", "up", 80);

if (prefersReducedMotion) {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.16,
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}

const reviewSlides = document.querySelectorAll(".review-slide");
let activeReviewIndex = 0;

if (reviewSlides.length > 1 && !prefersReducedMotion) {
  setInterval(() => {
    reviewSlides[activeReviewIndex].classList.remove("is-active");
    activeReviewIndex = (activeReviewIndex + 1) % reviewSlides.length;
    reviewSlides[activeReviewIndex].classList.add("is-active");
  }, 3600);
}

const resultSlides = document.querySelectorAll(".result-slide");
const previousResultButton = document.querySelector(".carousel-button-prev");
const nextResultButton = document.querySelector(".carousel-button-next");
let activeResultIndex = 0;
let resultCarouselTimer;
let resultCarouselTransitionTimer;

function showResultSlide(nextIndex, direction = "next") {
  if (!resultSlides.length) {
    return;
  }

  const normalizedIndex = (nextIndex + resultSlides.length) % resultSlides.length;

  if (normalizedIndex === activeResultIndex) {
    return;
  }

  const currentSlide = resultSlides[activeResultIndex];
  const nextSlide = resultSlides[normalizedIndex];
  const enteringClass = direction === "previous" ? "from-left" : "from-right";
  const exitingClass = direction === "previous" ? "is-exiting-right" : "is-exiting-left";

  clearTimeout(resultCarouselTransitionTimer);
  resultSlides.forEach((slide) => {
    slide.classList.remove("from-left", "from-right", "is-exiting-left", "is-exiting-right");
  });

  nextSlide.classList.add(enteringClass);
  nextSlide.offsetHeight;

  currentSlide.classList.remove("is-active");
  currentSlide.classList.add(exitingClass);
  nextSlide.classList.remove(enteringClass);
  nextSlide.classList.add("is-active");
  activeResultIndex = normalizedIndex;

  resultCarouselTransitionTimer = setTimeout(() => {
    currentSlide.classList.remove("is-exiting-left", "is-exiting-right");
  }, 560);
}

function startResultCarousel() {
  if (prefersReducedMotion || resultSlides.length < 2) {
    return;
  }

  resultCarouselTimer = setInterval(() => {
    showResultSlide(activeResultIndex + 1, "next");
  }, 4200);
}

function resetResultCarousel() {
  clearInterval(resultCarouselTimer);
  startResultCarousel();
}

previousResultButton?.addEventListener("click", () => {
  showResultSlide(activeResultIndex - 1, "previous");
  resetResultCarousel();
});

nextResultButton?.addEventListener("click", () => {
  showResultSlide(activeResultIndex + 1, "next");
  resetResultCarousel();
});

startResultCarousel();
