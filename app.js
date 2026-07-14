/* NightWatch — nighttime watch suggester
 * Zero-build vanilla JS. Data from TMDb. Persistence via localStorage.
 */

(() => {
  "use strict";

  // ---------- Config ----------
  const API_BASE = "https://api.themoviedb.org/3";
  const IMG_BASE = "https://image.tmdb.org/t/p/w500";
  const LOGO_BASE = "https://image.tmdb.org/t/p/w92";
  const RESULTS_PER_BATCH = 6;

  const STORAGE = {
    apiKey: "nightwatch_apikey",
    region: "nightwatch_region",
    favorites: "nightwatch_favorites",
    dismissed: "nightwatch_dismissed",
  };

  // Common regions for streaming availability (ISO 3166-1).
  const REGIONS = [
    ["US", "United States"], ["GB", "United Kingdom"], ["CA", "Canada"],
    ["AU", "Australia"], ["IE", "Ireland"], ["NL", "Netherlands"],
    ["DE", "Germany"], ["FR", "France"], ["ES", "Spain"], ["IT", "Italy"],
    ["SE", "Sweden"], ["NO", "Norway"], ["DK", "Denmark"], ["FI", "Finland"],
    ["PT", "Portugal"], ["BR", "Brazil"], ["MX", "Mexico"], ["IN", "India"],
    ["JP", "Japan"], ["KR", "South Korea"],
  ];

  // Shared genre names -> TMDb genre IDs for movie / tv (null = no direct match).
  const GENRES = [
    ["Action", 28, 10759], ["Adventure", 12, 10759], ["Animation", 16, 16],
    ["Comedy", 35, 35], ["Crime", 80, 80], ["Documentary", 99, 99],
    ["Drama", 18, 18], ["Family", 10751, 10751], ["Fantasy", 14, 10765],
    ["History", 36, null], ["Horror", 27, null], ["Mystery", 9648, 9648],
    ["Romance", 10749, null], ["Science Fiction", 878, 10765],
    ["Thriller", 53, 9648], ["War", 10752, 10768], ["Western", 37, 37],
  ];

  // Mood -> genre IDs for movie / tv.
  const MOODS = {
    relaxing: { movie: [35, 10749, 10751], tv: [35, 10751] },
    exciting: { movie: [28, 12, 53], tv: [10759] },
    funny: { movie: [35], tv: [35] },
    thoughtful: { movie: [18, 99, 9648], tv: [18, 99, 9648] },
    family: { movie: [10751, 16], tv: [10751, 16, 10762] },
  };

  // ---------- State ----------
  let state = {
    apiKey: localStorage.getItem(STORAGE.apiKey) || "",
    region: localStorage.getItem(STORAGE.region) || "US",
    favorites: readJSON(STORAGE.favorites, []),
    dismissed: readJSON(STORAGE.dismissed, []),
    lastQuery: null, // remembers inputs for "Show me more"
    seenPages: {}, // avoid repeating pages during a session
    demo: false, // demo mode uses bundled sample data, no API key
  };

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const el = {
    setupPanel: $("setup-panel"),
    findPanel: $("find-panel"),
    favoritesPanel: $("favorites-panel"),
    apiKeyInput: $("api-key-input"),
    regionSelect: $("region-select"),
    saveSetup: $("save-setup"),
    closeSetup: $("close-setup"),
    demoSetup: $("demo-setup"),
    setupError: $("setup-error"),
    demoBanner: $("demo-banner"),
    exitDemo: $("exit-demo"),
    findForm: $("find-form"),
    moodSelect: $("mood-select"),
    timeSelect: $("time-select"),
    genreSelect: $("genre-select"),
    typeSelect: $("type-select"),
    findBtn: $("find-btn"),
    surpriseBtn: $("surprise-btn"),
    status: $("status"),
    results: $("results"),
    moreArea: $("more-area"),
    moreBtn: $("more-btn"),
    favoritesGrid: $("favorites-grid"),
    favoritesEmpty: $("favorites-empty"),
    favCount: $("fav-count"),
    navFind: $("nav-find"),
    navFavorites: $("nav-favorites"),
    navSettings: $("nav-settings"),
    resetDismissed: $("reset-dismissed"),
  };

  // ---------- Storage helpers ----------
  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }
  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ---------- Init ----------
  function init() {
    populateRegions();
    populateGenres();
    bindEvents();
    updateFavCount();

    if (!state.apiKey) {
      showSetup(false);
    }
  }

  function populateRegions() {
    el.regionSelect.innerHTML = REGIONS.map(
      ([code, name]) => `<option value="${code}">${name}</option>`
    ).join("");
    el.regionSelect.value = state.region;
  }

  function populateGenres() {
    el.genreSelect.innerHTML =
      `<option value="">Any genre</option>` +
      GENRES.map(([name]) => `<option value="${name}">${name}</option>`).join("");
  }

  function bindEvents() {
    el.saveSetup.addEventListener("click", saveSetup);
    el.closeSetup.addEventListener("click", () => showPanel("find"));
    el.demoSetup.addEventListener("click", startDemo);
    el.exitDemo.addEventListener("click", exitDemo);
    el.findForm.addEventListener("submit", (e) => {
      e.preventDefault();
      runSearch(false);
    });
    el.surpriseBtn.addEventListener("click", () => runSearch(true));
    el.moreBtn.addEventListener("click", () => runSearch(state.lastQuery?.surprise, true));
    el.navFind.addEventListener("click", () => showPanel("find"));
    el.navFavorites.addEventListener("click", () => showPanel("favorites"));
    el.navSettings.addEventListener("click", () => showSetup(true));
    el.resetDismissed.addEventListener("click", resetDismissed);
  }

  // ---------- Setup ----------
  function showSetup(cancelable) {
    el.apiKeyInput.value = state.apiKey;
    el.regionSelect.value = state.region;
    el.closeSetup.classList.toggle("hidden", !cancelable);
    hideError();
    showPanel("setup");
  }

  async function saveSetup() {
    const key = el.apiKeyInput.value.trim();
    const region = el.regionSelect.value;
    if (!key) {
      showError("Please paste your TMDb API key.");
      return;
    }
    el.saveSetup.disabled = true;
    el.saveSetup.textContent = "Checking…";
    const ok = await validateKey(key);
    el.saveSetup.disabled = false;
    el.saveSetup.textContent = "Save & start";
    if (!ok) {
      showError("That key didn't work. Double-check your TMDb API key (v3 auth).");
      return;
    }
    state.apiKey = key;
    state.region = region;
    localStorage.setItem(STORAGE.apiKey, key);
    localStorage.setItem(STORAGE.region, region);
    showPanel("find");
  }

  async function validateKey(key) {
    try {
      const res = await fetch(`${API_BASE}/configuration?api_key=${encodeURIComponent(key)}`);
      return res.ok;
    } catch {
      return false;
    }
  }

  // ---------- Demo mode ----------
  function startDemo() {
    state.demo = true;
    el.demoBanner.classList.remove("hidden");
    showPanel("find");
  }

  function exitDemo() {
    state.demo = false;
    el.demoBanner.classList.add("hidden");
    el.results.innerHTML = "";
    el.moreArea.classList.add("hidden");
    showSetup(!!state.apiKey);
  }

  function showError(msg) {
    el.setupError.textContent = msg;
    el.setupError.classList.remove("hidden");
  }
  function hideError() {
    el.setupError.classList.add("hidden");
  }

  // ---------- Panels / nav ----------
  function showPanel(name) {
    el.setupPanel.classList.toggle("hidden", name !== "setup");
    el.findPanel.classList.toggle("hidden", name === "setup");
    el.favoritesPanel.classList.toggle("hidden", name !== "favorites");

    // Results area only relevant on the find view.
    const findView = name === "find";
    el.results.classList.toggle("hidden", !findView);
    if (!findView) el.moreArea.classList.add("hidden");

    el.navFind.classList.toggle("active", name === "find");
    el.navFavorites.classList.toggle("active", name === "favorites");

    if (name === "favorites") renderFavorites();
  }

  // ---------- Search ----------
  async function runSearch(surprise, more = false) {
    if (!state.demo && !state.apiKey) {
      showSetup(false);
      return;
    }
    showPanel("find");

    let query;
    if (more && state.lastQuery) {
      query = state.lastQuery;
    } else if (surprise) {
      query = buildSurpriseQuery();
      state.lastQuery = query;
    } else {
      query = buildQueryFromInputs();
      state.lastQuery = query;
    }

    setStatus(true, "Finding something worth your night…");
    el.moreArea.classList.add("hidden");
    if (!more) el.results.innerHTML = "";

    try {
      const items = await fetchSuggestions(query);
      if (items.length === 0) {
        setStatus(true, "No matches left for those filters. Try loosening them or hit 🎲 Surprise me.", true);
        return;
      }
      setStatus(false);
      renderResults(items, !more);
      el.moreArea.classList.remove("hidden");
    } catch (err) {
      console.error(err);
      setStatus(true, "Something went wrong reaching TMDb. Check your connection or API key.", true);
    }
  }

  function buildQueryFromInputs() {
    const mood = el.moodSelect.value;
    const maxTime = el.timeSelect.value ? parseInt(el.timeSelect.value, 10) : null;
    const genreName = el.genreSelect.value;
    const type = el.typeSelect.value; // movie | tv | either
    return { mood, maxTime, genreName, type, surprise: false };
  }

  function buildSurpriseQuery() {
    const moodKeys = Object.keys(MOODS);
    const mood = moodKeys[Math.floor(Math.random() * moodKeys.length)];
    const type = Math.random() < 0.5 ? "movie" : "tv";
    return { mood, maxTime: null, genreName: "", type, surprise: true };
  }

  // Resolve genre IDs for a given media type from the query.
  function genreIdsFor(query, mediaType) {
    if (query.genreName) {
      const row = GENRES.find((g) => g[0] === query.genreName);
      if (row) {
        const id = mediaType === "movie" ? row[1] : row[2];
        return id ? [id] : [];
      }
    }
    if (query.mood && MOODS[query.mood]) {
      return MOODS[query.mood][mediaType] || [];
    }
    return [];
  }

  function buildDiscoverUrl(mediaType, query, page) {
    const params = new URLSearchParams({
      api_key: state.apiKey,
      include_adult: "false",
      sort_by: "popularity.desc",
      "vote_count.gte": "50",
      page: String(page),
      watch_region: state.region,
    });
    const genreIds = genreIdsFor(query, mediaType);
    if (genreIds.length) params.set("with_genres", genreIds.join("|"));
    // Runtime filter is only meaningful for movies.
    if (mediaType === "movie" && query.maxTime) {
      params.set("with_runtime.lte", String(query.maxTime));
    }
    return `${API_BASE}/discover/${mediaType}?${params.toString()}`;
  }

  function randomPage(key) {
    // Pick from the first 8 popular pages, avoiding repeats within a session.
    const seen = state.seenPages[key] || [];
    const pool = [];
    for (let p = 1; p <= 8; p++) if (!seen.includes(p)) pool.push(p);
    const pages = pool.length ? pool : [1, 2, 3, 4, 5, 6, 7, 8];
    const page = pages[Math.floor(Math.random() * pages.length)];
    state.seenPages[key] = [...(state.seenPages[key] || []), page].slice(-8);
    return page;
  }

  async function fetchDiscover(mediaType, query) {
    const key = `${mediaType}:${query.mood}:${query.genreName}:${query.maxTime}`;
    const page = randomPage(key);
    const res = await fetch(buildDiscoverUrl(mediaType, query, page));
    if (!res.ok) throw new Error(`TMDb ${mediaType} discover failed: ${res.status}`);
    const data = await res.json();
    return (data.results || []).map((r) => ({ ...r, media_type: mediaType }));
  }

  async function fetchSuggestions(query) {
    if (state.demo) return fetchSuggestionsDemo(query);
    let pool = [];
    if (query.type === "either") {
      const [movies, tv] = await Promise.all([
        fetchDiscover("movie", query),
        fetchDiscover("tv", query),
      ]);
      pool = interleave(movies, tv);
    } else {
      pool = await fetchDiscover(query.type, query);
    }

    // Exclude dismissed titles.
    const dismissedKeys = new Set(state.dismissed.map((d) => `${d.media_type}:${d.id}`));
    pool = pool.filter((item) => !dismissedKeys.has(`${item.media_type}:${item.id}`));

    // De-duplicate and shuffle a little for variety, then take a batch.
    pool = dedupe(pool);
    shuffle(pool);
    const chosen = pool.slice(0, RESULTS_PER_BATCH);

    // Fetch streaming providers for the chosen items in parallel.
    await Promise.all(chosen.map(attachProviders));
    return chosen;
  }

  // Filter the bundled sample dataset by the same query rules (no network).
  function fetchSuggestionsDemo(query) {
    const all = (window.NIGHTWATCH_SAMPLE || []).map((it) => ({ ...it }));
    const dismissedKeys = new Set(state.dismissed.map((d) => `${d.media_type}:${d.id}`));

    let pool = all.filter((item) => {
      if (dismissedKeys.has(`${item.media_type}:${item.id}`)) return false;
      if (query.type !== "either" && item.media_type !== query.type) return false;

      const wantedGenres = genreIdsFor(query, item.media_type);
      if (wantedGenres.length) {
        const hit = (item.genre_ids || []).some((g) => wantedGenres.includes(g));
        if (!hit) return false;
      }
      if (item.media_type === "movie" && query.maxTime && item.runtime) {
        if (item.runtime > query.maxTime) return false;
      }
      return true;
    });

    pool = dedupe(pool);
    shuffle(pool);
    return Promise.resolve(pool.slice(0, RESULTS_PER_BATCH));
  }

  async function attachProviders(item) {
    try {
      const url = `${API_BASE}/${item.media_type}/${item.id}/watch/providers?api_key=${encodeURIComponent(state.apiKey)}`;
      const res = await fetch(url);
      if (!res.ok) {
        item.providers = null;
        return;
      }
      const data = await res.json();
      const regionData = (data.results || {})[state.region];
      item.providers = regionData || null;
      item.tmdbWatchLink = regionData?.link || null;
    } catch {
      item.providers = null;
    }
  }

  // ---------- Rendering ----------
  function renderResults(items, replace) {
    if (replace) el.results.innerHTML = "";
    for (const item of items) {
      el.results.appendChild(buildCard(item));
    }
  }

  function buildCard(item) {
    const isMovie = item.media_type === "movie";
    const title = isMovie ? item.title : item.name;
    const date = isMovie ? item.release_date : item.first_air_date;
    const year = date ? date.slice(0, 4) : "";
    const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
    const genreNames = mapGenreIdsToNames(item.genre_ids || [], item.media_type);
    const favKey = `${item.media_type}:${item.id}`;
    const isFav = state.favorites.some((f) => `${f.media_type}:${f.id}` === favKey);

    const card = document.createElement("article");
    card.className = "card";
    card.dataset.key = favKey;

    const poster = item.poster_path
      ? `<img src="${IMG_BASE}${item.poster_path}" alt="${escapeHtml(title)} poster" loading="lazy" />`
      : `<div class="no-poster">🎬</div>`;

    card.innerHTML = `
      <div class="card-poster">
        <span class="type-badge">${isMovie ? "Movie" : "TV"}</span>
        ${poster}
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(title)}</h3>
        <div class="card-meta">
          ${year ? `<span>${year}</span>` : ""}
          ${rating ? `<span>★ ${rating}</span>` : ""}
          ${genreNames ? `<span>${escapeHtml(genreNames)}</span>` : ""}
        </div>
        <p class="card-overview">${escapeHtml(item.overview || "No description available.")}</p>
        ${buildProvidersHtml(item)}
      </div>
      <div class="card-actions">
        <button class="icon-btn fav ${isFav ? "active" : ""}" type="button" title="Save to favorites">
          ${isFav ? "♥ Saved" : "♡ Save"}
        </button>
        <button class="icon-btn dismiss" type="button" title="Not interested">✕ Dismiss</button>
      </div>
      ${item.tmdbWatchLink ? `<a class="card-link" href="${item.tmdbWatchLink}" target="_blank" rel="noopener">Where to watch ↗</a>` : ""}
    `;

    card.querySelector(".fav").addEventListener("click", () => toggleFavorite(item, card));
    card.querySelector(".dismiss").addEventListener("click", () => dismissItem(item, card));
    return card;
  }

  function buildProvidersHtml(item) {
    const p = item.providers;
    const flatrate = p?.flatrate || [];
    if (!flatrate.length) {
      return `
        <div class="providers">
          <span class="providers-label">Where to stream</span>
          <span class="provider-none">No subscription streaming found for your region.</span>
        </div>`;
    }
    const logos = flatrate
      .slice(0, 6)
      .map((prov) =>
        prov.logo_path
          ? `<img src="${LOGO_BASE}${prov.logo_path}" alt="${escapeHtml(prov.provider_name)}" title="${escapeHtml(prov.provider_name)}" />`
          : `<span class="provider-chip">${escapeHtml(prov.provider_name)}</span>`
      )
      .join("");
    return `
      <div class="providers">
        <span class="providers-label">Stream on</span>
        <div class="provider-logos">${logos}</div>
      </div>`;
  }

  function mapGenreIdsToNames(ids, mediaType) {
    const idx = mediaType === "movie" ? 1 : 2;
    const names = [];
    for (const id of ids) {
      const row = GENRES.find((g) => g[idx] === id);
      if (row && !names.includes(row[0])) names.push(row[0]);
      if (names.length === 2) break;
    }
    return names.join(" · ");
  }

  // ---------- Favorites / dismiss ----------
  function toggleFavorite(item, card) {
    const key = `${item.media_type}:${item.id}`;
    const idx = state.favorites.findIndex((f) => `${f.media_type}:${f.id}` === key);
    const btn = card.querySelector(".fav");
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
      btn.classList.remove("active");
      btn.innerHTML = "♡ Save";
    } else {
      state.favorites.push(slimItem(item));
      btn.classList.add("active");
      btn.innerHTML = "♥ Saved";
    }
    writeJSON(STORAGE.favorites, state.favorites);
    updateFavCount();
  }

  function dismissItem(item, card) {
    const key = `${item.media_type}:${item.id}`;
    if (!state.dismissed.some((d) => `${d.media_type}:${d.id}` === key)) {
      state.dismissed.push({ id: item.id, media_type: item.media_type });
      writeJSON(STORAGE.dismissed, state.dismissed);
    }
    card.style.opacity = "0";
    setTimeout(() => card.remove(), 200);
  }

  function slimItem(item) {
    return {
      id: item.id,
      media_type: item.media_type,
      title: item.title,
      name: item.name,
      poster_path: item.poster_path,
      overview: item.overview,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      vote_average: item.vote_average,
      genre_ids: item.genre_ids,
      providers: item.providers,
      tmdbWatchLink: item.tmdbWatchLink,
    };
  }

  function renderFavorites() {
    el.favoritesGrid.innerHTML = "";
    if (state.favorites.length === 0) {
      el.favoritesEmpty.classList.remove("hidden");
      return;
    }
    el.favoritesEmpty.classList.add("hidden");
    for (const item of state.favorites) {
      el.favoritesGrid.appendChild(buildCard(item));
    }
  }

  function updateFavCount() {
    el.favCount.textContent = String(state.favorites.length);
  }

  function resetDismissed() {
    state.dismissed = [];
    writeJSON(STORAGE.dismissed, state.dismissed);
    state.seenPages = {};
    setStatus(true, "Dismissed list cleared. Everything can show up again.", false);
    setTimeout(() => setStatus(false), 1800);
  }

  // ---------- Utilities ----------
  function setStatus(show, message = "", isError = false) {
    if (!show) {
      el.status.classList.add("hidden");
      return;
    }
    el.status.classList.remove("hidden");
    el.status.classList.toggle("error", isError);
    el.status.innerHTML = isError
      ? escapeHtml(message)
      : `<span class="spinner"></span>${escapeHtml(message)}`;
  }

  function interleave(a, b) {
    const out = [];
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
      if (a[i]) out.push(a[i]);
      if (b[i]) out.push(b[i]);
    }
    return out;
  }

  function dedupe(items) {
    const seen = new Set();
    return items.filter((it) => {
      const key = `${it.media_type}:${it.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  // ---------- Go ----------
  init();
})();
