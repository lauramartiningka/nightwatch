# 🌙 NightWatch

Stop scrolling. Find something to watch tonight in seconds.

NightWatch is a tiny, single-page web app that suggests movies and TV shows based on
your **mood**, how much **time** you have, and an optional **genre** — or just hit
**🎲 Surprise me**. It shows where each title is streaming in your region, and lets you
save favorites and dismiss things you're not interested in.

No accounts, no database, no build step. Everything runs in your browser and your
preferences are saved locally on your device.

## What it does

- Pick a mood (relaxing, exciting, funny, thoughtful, family-friendly), a max runtime,
  and/or a genre — then get a short list of suggestions.
- "Surprise me" gives you a suggestion with zero input.
- Each result shows poster, year, rating, genres, a synopsis, and **which streaming
  services** carry it in your region.
- ♥ Save favorites — they live in a dedicated Favorites tab.
- ✕ Dismiss titles you don't want — they stop showing up (until you reset).
- "Show me more" re-rolls a fresh batch without re-entering your inputs.

## One-time setup: get a free TMDb API key

NightWatch uses the free public [TMDb](https://www.themoviedb.org/) API.

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/signup).
2. Go to **Settings → API** and request an API key (choose "Developer").
3. Copy the **API Key (v3 auth)** value.
4. Open NightWatch — it will ask you to paste the key and pick your region. That's it.

Your key is stored only in your browser's local storage and is never sent anywhere
except directly to TMDb.

## Run it

It's just static files — no install needed. Any of these work:

**Option A — open the file directly**

Double-click `index.html`, or open it in your browser.

**Option B — serve locally (recommended, avoids any browser file restrictions)**

```bash
cd nightwatch
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Files

- `index.html` — markup and layout
- `styles.css` — dark, night-friendly styling
- `app.js` — all logic (inputs, TMDb calls, providers, favorites/dismiss)

## Notes & limitations

- Streaming availability is best-effort and comes from TMDb; it may not be perfectly
  complete or up to date, and depends on the region you pick.
- Runtime filtering applies to movies (TV episode lengths aren't reliably filterable).
- Favorites and dismissed titles are shared by anyone using the same browser on this
  device (by design — no separate profiles).

---

This product uses the TMDb API but is not endorsed or certified by TMDb.
