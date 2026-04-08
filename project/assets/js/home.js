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
