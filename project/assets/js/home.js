const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// Search button navigation
const searchBtn = document.querySelector("#searchBtn");
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    window.location.href = "watches.html";
  });
}

document.querySelectorAll(".heart-btn").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("is-active");
  });
});
