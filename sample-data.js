/* NightWatch sample dataset — used by Demo mode so the app works with no API key.
 * Shape mirrors the fields NightWatch reads from TMDb results.
 * Movie genre_ids use TMDb movie IDs; TV genre_ids use TMDb TV IDs.
 * Providers here are name-only samples (no logos) purely for demonstration.
 */
window.NIGHTWATCH_SAMPLE = [
  {
    id: 1001, media_type: "movie", title: "The Quiet Coast",
    poster_path: null, vote_average: 7.4, runtime: 96,
    release_date: "2022-05-12",
    overview: "A burnt-out chef retreats to a sleepy seaside town and slowly rediscovers what matters over long, warm evenings.",
    genre_ids: [18, 10749], // Drama, Romance
    providers: { flatrate: [{ provider_name: "Netflix" }, { provider_name: "Prime Video" }] },
  },
  {
    id: 1002, media_type: "movie", title: "Midnight Circuit",
    poster_path: null, vote_average: 7.9, runtime: 118,
    release_date: "2023-09-01",
    overview: "A heist crew has one night to pull off the impossible before the city's power grid reboots.",
    genre_ids: [28, 53], // Action, Thriller
    providers: { flatrate: [{ provider_name: "Max" }] },
  },
  {
    id: 1003, media_type: "movie", title: "Grandma's Time Machine",
    poster_path: null, vote_average: 7.1, runtime: 88,
    release_date: "2021-11-20",
    overview: "Two kids and their inventor grandmother bumble through history in a shed that shouldn't work.",
    genre_ids: [10751, 16], // Family, Animation
    providers: { flatrate: [{ provider_name: "Disney+" }] },
  },
  {
    id: 1004, media_type: "movie", title: "Laugh Track",
    poster_path: null, vote_average: 6.8, runtime: 92,
    release_date: "2024-02-14",
    overview: "A washed-up comedian accidentally becomes the manager of the world's worst improv troupe.",
    genre_ids: [35], // Comedy
    providers: { flatrate: [{ provider_name: "Prime Video" }, { provider_name: "Hulu" }] },
  },
  {
    id: 1005, media_type: "movie", title: "The Last Signal",
    poster_path: null, vote_average: 8.1, runtime: 134,
    release_date: "2020-07-03",
    overview: "A lone radio astronomer picks up a message that rewrites everything we thought we knew about home.",
    genre_ids: [878, 18], // Science Fiction, Drama
    providers: { flatrate: [{ provider_name: "Apple TV+" }] },
  },
  {
    id: 1006, media_type: "movie", title: "Paper Lanterns",
    poster_path: null, vote_average: 7.6, runtime: 74,
    release_date: "2023-04-08",
    overview: "A quiet, beautiful documentary following four families as they prepare for a small-town festival.",
    genre_ids: [99], // Documentary
    providers: { flatrate: [{ provider_name: "Netflix" }] },
  },
  {
    id: 1007, media_type: "movie", title: "Vault 9",
    poster_path: null, vote_average: 6.5, runtime: 105,
    release_date: "2019-10-25",
    overview: "A detective and a thief are locked in the same bank vault — and only one of them is telling the truth.",
    genre_ids: [80, 9648], // Crime, Mystery
    providers: { flatrate: [{ provider_name: "Max" }, { provider_name: "Prime Video" }] },
  },
  {
    id: 1008, media_type: "movie", title: "Sunday Slow",
    poster_path: null, vote_average: 7.0, runtime: 28,
    release_date: "2024-06-01",
    overview: "A gentle short film about a cat, a cup of tea, and the perfect lazy afternoon.",
    genre_ids: [35, 10751], // Comedy, Family
    providers: { flatrate: [{ provider_name: "Apple TV+" }] },
  },
  {
    id: 2001, media_type: "tv", name: "Harbor Lights",
    poster_path: null, vote_average: 8.3,
    first_air_date: "2021-03-15",
    overview: "Interwoven stories of a small fishing town, told across the seasons of a single unforgettable year.",
    genre_ids: [18], // Drama
    providers: { flatrate: [{ provider_name: "Netflix" }] },
  },
  {
    id: 2002, media_type: "tv", name: "Cosmic Drift",
    poster_path: null, vote_average: 8.0,
    first_air_date: "2022-08-19",
    overview: "The misfit crew of a salvage ship stumbles into a mystery that spans the edge of known space.",
    genre_ids: [10765, 10759], // Sci-Fi & Fantasy, Action & Adventure
    providers: { flatrate: [{ provider_name: "Max" }, { provider_name: "Apple TV+" }] },
  },
  {
    id: 2003, media_type: "tv", name: "Office Hours",
    poster_path: null, vote_average: 7.7,
    first_air_date: "2020-01-10",
    overview: "A mockumentary sitcom about the least productive, most lovable team in a struggling startup.",
    genre_ids: [35], // Comedy
    providers: { flatrate: [{ provider_name: "Hulu" }] },
  },
  {
    id: 2004, media_type: "tv", name: "The Willowmere Case",
    poster_path: null, vote_average: 8.5,
    first_air_date: "2023-10-06",
    overview: "A cold-case detective returns to her hometown to solve the disappearance that shaped her childhood.",
    genre_ids: [9648, 80], // Mystery, Crime
    providers: { flatrate: [{ provider_name: "Prime Video" }] },
  },
  {
    id: 2005, media_type: "tv", name: "Tiny Explorers",
    poster_path: null, vote_average: 7.2,
    first_air_date: "2021-09-02",
    overview: "A warm animated series where curious kids and a friendly robot discover how the world works.",
    genre_ids: [16, 10751], // Animation, Family
    providers: { flatrate: [{ provider_name: "Disney+" }] },
  },
  {
    id: 2006, media_type: "tv", name: "Night Kitchen",
    poster_path: null, vote_average: 7.4,
    first_air_date: "2024-01-22",
    overview: "Comfort-food chefs cook through the small hours, sharing stories with the city's night owls.",
    genre_ids: [35, 18], // Comedy, Drama
    providers: { flatrate: [{ provider_name: "Netflix" }, { provider_name: "Hulu" }] },
  },
];
