document.documentElement.classList.add("js-enabled");

const menuToggle = document.querySelector("[data-menu-toggle]");
const siteNav = document.querySelector("[data-site-nav]");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      siteNav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    }
  });
}

const revealItems = [...document.querySelectorAll(".reveal")];

function revealVisibleItems(observer) {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  revealItems.forEach((item) => {
    if (item.classList.contains("is-visible")) return;

    const rect = item.getBoundingClientRect();
    if (rect.top < viewportHeight * 1.08 && rect.bottom > -80) {
      item.classList.add("is-visible");
      observer?.unobserve(item);
    }
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  revealItems.forEach((item) => observer.observe(item));
  requestAnimationFrame(() => revealVisibleItems(observer));
  window.addEventListener("load", () => revealVisibleItems(observer), { once: true });
  window.addEventListener("hashchange", () => requestAnimationFrame(() => revealVisibleItems(observer)));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
