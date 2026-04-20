const watchesData = [];

function renderWatches(data) {
  const grid = document.getElementById("watchesGrid");
  const resultCount = document.getElementById("resultCount");

  if (!grid || !resultCount) {
    return;
  }

  if (data.length === 0) {
    grid.innerHTML = '<div class="empty-message">No watches found matching your filters.</div>';
    resultCount.textContent = "0 watches found";
    return;
  }

  grid.innerHTML = data
    .map((watch) => {
      const query = new URLSearchParams({
        id: String(watch.id),
        brand: watch.brand,
        model: watch.model,
        year: String(watch.year),
        rating: String(watch.rating),
      }).toString();

      return `
        <article class="watch-card">
          <a class="watch-link" href="watch-detail.html?${query}" aria-label="${watch.brand} ${watch.model} ansehen">
            <div class="watch-media"></div>
            <div class="watch-info">
              <small>${watch.brand}</small>
              <h3>${watch.model}</h3>
              <div class="watch-meta">
                <span>${watch.year}</span>
                <span class="stars">${"★".repeat(watch.rating)}</span>
              </div>
            </div>
          </a>
        </article>
      `;
    })
    .join("");

  resultCount.textContent = `${data.length} watches found`;
}

function filterWatches() {
  const selectedBrands = Array.from(document.querySelectorAll(".brand-check:checked")).map((item) => item.value);
  const yearFrom = parseInt(document.getElementById("yearFrom")?.value || "", 10) || 0;
  const yearTo = parseInt(document.getElementById("yearTo")?.value || "", 10) || 9999;

  const filtered = watchesData.filter((watch) => {
    const brandMatches = selectedBrands.length === 0 || selectedBrands.includes(watch.brand);
    const yearMatches = watch.year >= yearFrom && watch.year <= yearTo;
    return brandMatches && yearMatches;
  });

  renderWatches(filtered);
}

function resetFilters() {
  document.querySelectorAll(".brand-check").forEach((item) => {
    item.checked = false;
  });
  const yearFrom = document.getElementById("yearFrom");
  const yearTo = document.getElementById("yearTo");
  if (yearFrom) {
    yearFrom.value = "";
  }
  if (yearTo) {
    yearTo.value = "";
  }
  filterWatches();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".brand-check").forEach((checkbox) => {
    checkbox.addEventListener("change", filterWatches);
  });

  const yearFrom = document.getElementById("yearFrom");
  const yearTo = document.getElementById("yearTo");
  const resetBtn = document.getElementById("resetBtn");

  if (yearFrom) {
    yearFrom.addEventListener("change", filterWatches);
  }
  if (yearTo) {
    yearTo.addEventListener("change", filterWatches);
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", resetFilters);
  }

  filterWatches();
});
