const brandMeta = {
  "Rolex": {
    founded: "Founded 1905",
    country: "Switzerland",
    founders: "Hans Wilsdorf, Alfred Davis",
    headquarters: "Geneva",
    tagline: "Precision as a universal standard",
    history: "Rolex was founded in London by Hans Wilsdorf and became one of the key pioneers in modern wristwatch innovation. In 1926, the Oyster case set new standards for water resistance, and in 1945 the Datejust introduced the first automatic wristwatch with a date window.",
    icons: "Submariner, Daytona, Day-Date",
    specialty: "Precision, durability, timeless status design",
    hallmark: "Tool-watch DNA with luxury finishing",
    priceRange: "$8,000 - $60,000+",
    signatureStyle: "Oyster case, strong proportions, high legibility",
    collections: ["Submariner", "Daytona", "Datejust", "GMT-Master II", "Day-Date"],
    innovations: ["Oyster waterproof case", "Perpetual rotor", "Cerachrom bezels"],
    collectorNote: "Rolex values consistency, recognizability, and market confidence.",
    timeline: [
      "1905: Brand founded in London",
      "1926: Oyster, one of the first waterproof wristwatch cases",
      "1953: Submariner launches and defines dive-watch design"
    ]
  },
  "Patek Philippe": {
    founded: "Founded 1839",
    country: "Switzerland",
    founders: "Antoine Norbert de Patek, Adrien Philippe",
    headquarters: "Geneva",
    tagline: "Generational watchmaking excellence",
    history: "Patek Philippe is one of the most respected independent Swiss maisons. The brand is known for refined finishing and high complications, including perpetual calendars and minute repeaters, with many references becoming legendary collector pieces.",
    icons: "Nautilus, Calatrava, Grand Complications",
    specialty: "Haute horlogerie, hand-finishing, complications",
    hallmark: "Elegant cases and world-class complicated movements",
    priceRange: "$25,000 - $1,000,000+",
    signatureStyle: "Refined dials, slim profiles, classic proportions",
    collections: ["Calatrava", "Nautilus", "Aquanaut", "Complications", "Grand Complications"],
    innovations: ["Keyless winding systems", "Advanced perpetual calendars", "Silinvar technology"],
    collectorNote: "Patek is associated with long-term value and historical significance.",
    timeline: [
      "1839: Maison established in Geneva",
      "1932: Stern family acquires and preserves independence",
      "1976: Nautilus becomes a modern icon"
    ]
  },
  "Audemars Piguet": {
    founded: "Founded 1875",
    country: "Switzerland",
    founders: "Jules Louis Audemars, Edward Auguste Piguet",
    headquarters: "Le Brassus",
    tagline: "Bold identity in haute horlogerie",
    history: "Audemars Piguet was founded in Le Brassus and remains family-connected to its origins in the Vallee de Joux. The 1972 Royal Oak changed luxury watch design forever by introducing a bold steel sports watch in haute horlogerie.",
    icons: "Royal Oak, Royal Oak Offshore, Code 11.59",
    specialty: "Avant-garde design and technical craftsmanship",
    hallmark: "Architectural design language with strong identity",
    priceRange: "$22,000 - $500,000+",
    signatureStyle: "Octagonal bezels, integrated bracelets, sharp facets",
    collections: ["Royal Oak", "Royal Oak Offshore", "Code 11.59", "Complications"],
    innovations: ["Luxury steel sports watch concept", "Openworked calibers", "Advanced ceramic finishing"],
    collectorNote: "AP is prized for design impact and finishing detail on cases and bracelets.",
    timeline: [
      "1875: Founded in Le Brassus",
      "1972: Royal Oak designed by Gerald Genta",
      "1993: Royal Oak Offshore expands the sports-luxury segment"
    ]
  },
  "Omega": {
    founded: "Founded 1848",
    country: "Switzerland",
    founders: "Louis Brandt",
    headquarters: "Biel/Bienne",
    tagline: "Performance tested in extreme environments",
    history: "Omega built its reputation through precision timing and exploration milestones. The Speedmaster became the first watch worn on the moon, while the Seamaster line helped define modern professional diving watches.",
    icons: "Speedmaster, Seamaster, Constellation",
    specialty: "Chronometry, sport legacy, space heritage",
    hallmark: "Technical reliability across sport and exploration",
    priceRange: "$3,500 - $60,000+",
    signatureStyle: "Functional sporty design with strong dial readability",
    collections: ["Speedmaster", "Seamaster", "Constellation", "De Ville"],
    innovations: ["Co-Axial escapement industrialization", "Master Chronometer standard", "Antimagnetic calibers"],
    collectorNote: "Omega combines heritage storytelling with modern technical credibility.",
    timeline: [
      "1848: Workshop founded by Louis Brandt",
      "1932: Official Olympic timekeeper era begins",
      "1969: Speedmaster worn on the moon"
    ]
  },
  "Richard Mille": {
    founded: "Founded 2001",
    country: "Switzerland",
    founders: "Richard Mille",
    headquarters: "Les Breuleux",
    tagline: "Formula 1 mindset in watchmaking",
    history: "Richard Mille quickly gained fame by combining race-inspired engineering with unusual materials such as carbon composites and titanium. The brand focuses on ultra-light high-performance watches with contemporary architecture.",
    icons: "RM 011, RM 35, RM 67",
    specialty: "Materials innovation and technical performance",
    hallmark: "Extreme lightweight engineering and futuristic aesthetics",
    priceRange: "$180,000 - $2,000,000+",
    signatureStyle: "Tonneau cases, skeleton dials, technical bridges",
    collections: ["RM 011", "RM 35", "RM 07", "RM UP", "Tourbillon series"],
    innovations: ["High-tech composites", "Shock-resistant architecture", "Ultra-thin performance calibers"],
    collectorNote: "RM appeals to collectors focused on modern engineering and rarity.",
    timeline: [
      "2001: First Richard Mille references launched",
      "2010s: High-performance sports partnerships accelerate growth",
      "Today: Flagship for ultra-modern luxury watchmaking"
    ]
  },
  "Vacheron Constantin": {
    founded: "Founded 1755",
    country: "Switzerland",
    founders: "Jean-Marc Vacheron",
    headquarters: "Geneva",
    tagline: "Classical elegance with deep horological pedigree",
    history: "Vacheron Constantin is one of the oldest continuously operating watchmakers in the world. It is known for elegant aesthetics, historic craftsmanship, and extremely sophisticated complications in both classic and modern designs.",
    icons: "Overseas, Patrimony, Historiques",
    specialty: "Traditional craftsmanship and high complications",
    hallmark: "Classical Geneva style with elite finishing standards",
    priceRange: "$20,000 - $1,500,000+",
    signatureStyle: "Elegant lines, Genevan finishing, restrained luxury",
    collections: ["Overseas", "Patrimony", "Traditionnelle", "Historiques", "Metiers d'Art"],
    innovations: ["Ultra-complex grand complications", "High artisanal dial crafts", "Historic movement reconstruction"],
    collectorNote: "VC is admired for discreet prestige and deep traditional craft.",
    timeline: [
      "1755: Maison founded in Geneva",
      "1819: Partnership with Francois Constantin",
      "Modern era: Overseas line strengthens contemporary appeal"
    ]
  }
};

function renderBrandDetail(brandName) {
  const detail = document.getElementById("brandDetail");
  const data = brandMeta[brandName];
  const initials = brandName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!detail || !data) {
    return;
  }

  detail.innerHTML = `
    <button class="brand-back-btn" id="brandBackBtn" type="button">\u2190 Back to all brands</button>
    <header class="brand-detail-headline">
      <span class="brand-kicker">Maison Profile</span>
      <span class="brand-monogram" aria-hidden="true">${initials}</span>
      <div class="brand-detail-head">
        <h3>${brandName}</h3>
        <span class="brand-detail-year">${data.founded}</span>
      </div>
      <p class="brand-tagline">${data.tagline}</p>
      <p class="brand-meta-line">${data.country} | ${data.headquarters} | ${data.priceRange}</p>
    </header>

    <section class="brand-story-section">
      <h4>Brand Story</h4>
      <p>${data.history}</p>
    </section>

    <section class="brand-facts-section">
      <h4>Brand DNA</h4>
      <div class="brand-fact-row"><span>Founders</span><strong>${data.founders}</strong></div>
      <div class="brand-fact-row"><span>Signature Style</span><strong>${data.signatureStyle}</strong></div>
      <div class="brand-fact-row"><span>Speciality</span><strong>${data.specialty}</strong></div>
      <div class="brand-fact-row"><span>Hallmark</span><strong>${data.hallmark}</strong></div>
      <div class="brand-fact-row"><span>Collector Note</span><strong>${data.collectorNote}</strong></div>
    </section>

    <div class="brand-columns">
      <section class="brand-column-section">
        <h4>Iconic Collections</h4>
        <ul class="brand-inline-list">
          ${data.collections.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </section>

      <section class="brand-column-section">
        <h4>Technical Highlights</h4>
        <ul class="brand-timeline">
          ${data.innovations.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </section>
    </div>

    <div class="brand-timeline-wrap">
      <h4>Key Milestones</h4>
      <ul class="brand-timeline">
        ${data.timeline.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
  `;
}

function enterDetailMode() {
  document.body.classList.add("brand-detail-mode");
}

function exitDetailMode() {
  document.body.classList.remove("brand-detail-mode");

  const detail = document.getElementById("brandDetail");
  if (detail) {
    detail.innerHTML = '<p class="brand-detail-empty">Waehle eine Marke aus, um Geschichte, Besonderheiten und Ikonen zu sehen.</p>';
  }

  document.querySelectorAll(".brand-feature").forEach((item) => {
    item.classList.remove("is-selected");
  });
}

function selectBrandCard(card) {
  document.querySelectorAll(".brand-feature").forEach((item) => {
    item.classList.remove("is-selected");
  });

  card.classList.add("is-selected");

  const brandName = card.getAttribute("data-brand");
  renderBrandDetail(brandName);
  enterDetailMode();
}

document.querySelectorAll(".brand-feature").forEach((card) => {
  card.addEventListener("click", () => {
    selectBrandCard(card);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectBrandCard(card);
    }
  });
});

document.addEventListener("click", (event) => {
  if (event.target && event.target.id === "brandBackBtn") {
    exitDetailMode();
  }
});
