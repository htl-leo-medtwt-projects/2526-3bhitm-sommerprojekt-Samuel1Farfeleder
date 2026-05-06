const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const searchBtn = document.querySelector("#searchBtn");
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    window.location.href = "watches.html";
  });
}

document.querySelectorAll(".hero-actions a[href^='#']").forEach((button) => {
  button.addEventListener("click", (event) => {
    const targetSelector = button.getAttribute("href");
    const targetSection = targetSelector ? document.querySelector(targetSelector) : null;

    if (!targetSection) {
      return;
    }

    event.preventDefault();
    targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll(".heart-btn").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("is-active");
  });
});
