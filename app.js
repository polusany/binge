const categories = [
  { id: "k-drama", label: "K-Dramas", file: "k-dramas.html", kicker: "KOREAN STORIES", title: "K-Dramas for every <em>mood.</em>", copy: "Find heartfelt romances, clever thrillers, and the characters you will think about long after the final scene." },
  { id: "chinese-drama", label: "Chinese Dramas", file: "chinese-dramas.html", kicker: "CHINESE STORIES", title: "A world of <em>Chinese drama.</em>", copy: "Step into sweeping romances, family stories, and richly imagined worlds from Chinese-language television." },
  { id: "hollywood-movies", label: "Hollywood Movies", file: "hollywood-movies.html", kicker: "HOLLYWOOD COLLECTION", title: "Big stories. <em>Bright lights.</em>", copy: "Explore cinematic adventures, thoughtful dramas, and crowd-pleasing stories from Hollywood." },
  { id: "anime-series", label: "Anime Series", file: "anime-series.html", kicker: "ANIME WORLDS", title: "Worlds beyond the <em>ordinary.</em>", copy: "Meet unforgettable heroes and explore imaginative worlds in this anime series collection." },
  { id: "bollywood-movies", label: "Bollywood Movies", file: "bollywood-movies.html", kicker: "BOLLYWOOD COLLECTION", title: "Colour, music, <em>and feeling.</em>", copy: "Discover lively romances, family favourites, and big-screen stories inspired by Bollywood." },
  { id: "nollywood-movies", label: "Nollywood Movies", file: "nollywood-movies.html", kicker: "NOLLYWOOD COLLECTION", title: "Stories with <em>home at heart.</em>", copy: "Explore contemporary stories, family journeys, and memorable characters from Nollywood." },
  { id: "movies", label: "Movies", file: "movies.html", kicker: "FEATURE FILMS", title: "Make tonight a <em>movie night.</em>", copy: "Browse films across genres and find the right story for the moment." },
  { id: "genres", label: "Genres", file: "genres.html", kicker: "BROWSE BY GENRE", title: "Find the right story <em>for your mood.</em>", copy: "Explore every genre in one place, then open a collection to find your next film or series." },
  { id: "tv-series", label: "TV Series", file: "tv-series.html", kicker: "SERIES COLLECTION", title: "One episode becomes <em>another.</em>", copy: "Settle into layered characters and stories made to unfold over time." },
  { id: "philippine-drama", label: "Philippine Dramas", file: "philippine-dramas.html", kicker: "FILIPINO STORIES", title: "Stories full of <em>heart.</em>", copy: "Discover relationships, family, and everyday life in this Filipino drama collection." },
  { id: "thai-movies", label: "Thai Movies", file: "thai-movies.html", kicker: "THAI CINEMA", title: "A fresh view of <em>Thai cinema.</em>", copy: "Browse memorable films and new perspectives from Thai storytellers." },
  { id: "japanese-drama", label: "Japanese Dramas", file: "japanese-dramas.html", kicker: "JAPANESE STORIES", title: "Small moments. <em>Lasting stories.</em>", copy: "Find character-led Japanese dramas about connection, change, and the moments in between." },
];

const movies = [
  { id: "seoul-in-spring", title: "Seoul in Spring", year: 2025, section: "k-drama", format: "Series", genre: "Romance", description: "Two neighbours with very different ideas about life find common ground in a small flower shop on a quiet Seoul street.", poster: "linear-gradient(145deg,#9b7957,#375c4a 55%,#182d26)", tag: "SLOW-BURN ROMANCE" },
  { id: "the-last-letter", title: "The Last Letter", year: 2024, section: "k-drama", format: "Series", genre: "Drama", description: "A misplaced letter brings two estranged families together to uncover a story that was never meant to be forgotten.", poster: "linear-gradient(145deg,#78907a,#536d65 50%,#1d3230)", tag: "FAMILY DRAMA" },
  { id: "jade-moon", title: "Jade Moon", year: 2025, section: "chinese-drama", format: "Series", genre: "Fantasy", description: "A mapmaker discovers that the constellations above her city are changing—and that she may be the only one who can read them.", poster: "linear-gradient(145deg,#a58a4d,#465e4c 55%,#172b25)", tag: "FANTASY SERIES" },
  { id: "palace-of-fire", title: "Palace of Fire", year: 2024, section: "chinese-drama", format: "Series", genre: "Historical", description: "A new court musician must balance loyalty, ambition, and a secret that could reshape the royal household.", poster: "linear-gradient(145deg,#9e5542,#784e39 55%,#2a3125)", tag: "HISTORICAL DRAMA" },
  { id: "quiet-frontier", title: "The Quiet Frontier", year: 2025, section: "hollywood-movies", format: "Movie", genre: "Adventure", description: "A park ranger follows a trail of strange lights into the mountains and finds a community protecting a remarkable secret.", poster: "linear-gradient(145deg,#9e7548,#446c52 53%,#1a3029)", tag: "FEATURE FILM" },
  { id: "gold-at-midnight", title: "Gold at Midnight", year: 2024, section: "hollywood-movies", format: "Movie", genre: "Thriller", description: "A museum conservator has one night to discover who replaced a priceless painting—and why the copy is beginning to change.", poster: "linear-gradient(145deg,#b59655,#475448 55%,#202a25)", tag: "MYSTERY THRILLER" },
  { id: "skyline-academy", title: "Skyline Academy", year: 2025, section: "anime-series", format: "Series", genre: "Fantasy", description: "Students at a school above the clouds learn that their new campus is drifting toward a world no one remembers.", poster: "linear-gradient(145deg,#6a8b79,#678c85 52%,#263d39)", tag: "ANIME SERIES" },
  { id: "paper-dragons", title: "Paper Dragons", year: 2024, section: "anime-series", format: "Series", genre: "Adventure", description: "A young illustrator discovers that the creatures in her sketchbook can guide her through a hidden city.", poster: "linear-gradient(145deg,#bb8f54,#557465 54%,#23352c)", tag: "ANIME ADVENTURE" },
  { id: "monsoon-melody", title: "Monsoon Melody", year: 2025, section: "bollywood-movies", format: "Movie", genre: "Romance", description: "A travelling musician returns home for a festival and finds that the song she left unfinished still has an audience.", poster: "linear-gradient(145deg,#c58d47,#526d43 55%,#263728)", tag: "MUSIC & ROMANCE" },
  { id: "wedding-season", title: "The Wedding Season", year: 2024, section: "bollywood-movies", format: "Movie", genre: "Comedy", description: "As three celebrations fill one busy summer, a practical event planner learns to make room for a little surprise.", poster: "linear-gradient(145deg,#b45e4c,#98713c 55%,#27392e)", tag: "FEEL-GOOD FILM" },
  { id: "lagos-at-sunrise", title: "Lagos at Sunrise", year: 2025, section: "nollywood-movies", format: "Movie", genre: "Drama", description: "A young architect returns to Lagos to restore her grandmother's house and reconnect with the neighbours who remember it.", poster: "linear-gradient(145deg,#bd8b50,#566e4b 54%,#21372d)", tag: "NOLLYWOOD STORY" },
  { id: "homecoming-season", title: "Homecoming Season", year: 2024, section: "nollywood-movies", format: "Movie", genre: "Family", description: "A family reunion at a country guesthouse brings old misunderstandings—and unexpected new plans—to the surface.", poster: "linear-gradient(145deg,#9a6b4d,#53684a 55%,#23312a)", tag: "FAMILY FILM" },
  { id: "place-to-begin", title: "A Place to Begin", year: 2025, section: "movies", format: "Movie", genre: "Drama", description: "After an unexpected move, a ceramic artist finds a new community and a different way to think about home.", poster: "linear-gradient(145deg,#aa855a,#587561 54%,#20352c)", tag: "FEATURE FILM" },
  { id: "long-weekend", title: "The Long Weekend", year: 2024, section: "movies", format: "Movie", genre: "Comedy", description: "Four friends plan one peaceful weekend away. The old inn, it turns out, has plans of its own.", poster: "linear-gradient(145deg,#a2a16c,#607c5a 53%,#25372c)", tag: "COMEDY" },
  { id: "small-town-secrets", title: "Small Town Secrets", year: 2025, section: "tv-series", format: "Series", genre: "Mystery", description: "A new librarian cataloguing donated books finds a note that connects three generations of residents.", poster: "linear-gradient(145deg,#827d5b,#495f4e 56%,#1c3027)", tag: "MYSTERY SERIES" },
  { id: "across-the-water", title: "Across the Water", year: 2024, section: "tv-series", format: "Series", genre: "Drama", description: "Two coastal towns share a ferry route, a long history, and a group of young people ready to change both.", poster: "linear-gradient(145deg,#698a7f,#416c68 54%,#1e3230)", tag: "NEW SERIES" },
  { id: "by-the-coast", title: "By the Coast", year: 2025, section: "philippine-drama", format: "Series", genre: "Romance", description: "A marine biologist returns to her island home and reunites with the childhood friend who stayed behind.", poster: "linear-gradient(145deg,#a5a66b,#467766 54%,#203b34)", tag: "FILIPINO DRAMA" },
  { id: "second-chances", title: "Second Chances", year: 2024, section: "philippine-drama", format: "Series", genre: "Family", description: "Three cousins take over their aunt's neighbourhood café and discover that each has a different idea of success.", poster: "linear-gradient(145deg,#b18c5d,#688064 54%,#26382e)", tag: "FAMILY SERIES" },
  { id: "summer-promise", title: "Summer Promise", year: 2025, section: "thai-movies", format: "Movie", genre: "Romance", description: "Two travel writers compete to find the perfect island escape, then realise the best story may be the one they share.", poster: "linear-gradient(145deg,#c09660,#4f7c67 54%,#1e3c37)", tag: "THAI CINEMA" },
  { id: "other-side", title: "The Other Side", year: 2024, section: "thai-movies", format: "Movie", genre: "Thriller", description: "A sound designer working late in a Bangkok hotel begins hearing a voice in recordings made before the building opened.", poster: "linear-gradient(145deg,#897553,#3f6255 55%,#1b2f2a)", tag: "THAI THRILLER" },
  { id: "blue-station", title: "Blue Station", year: 2025, section: "japanese-drama", format: "Series", genre: "Drama", description: "The regulars at a small station café leave notes for strangers—and slowly begin to change one another's lives.", poster: "linear-gradient(145deg,#6e9292,#52766b 54%,#203b37)", tag: "JAPANESE DRAMA" },
  { id: "garden-lanterns", title: "Garden of Lanterns", year: 2024, section: "japanese-drama", format: "Series", genre: "Romance", description: "A landscape designer inherits a neglected garden and finds old letters tucked beneath its stone path.", poster: "linear-gradient(145deg,#b08e62,#65764c 54%,#27392c)", tag: "QUIET ROMANCE" },
];

const root = document.body.dataset.root || "";
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function licenseMarkup(item){const id=item.license||'all-rights-reserved',labels={'all-rights-reserved':'All rights reserved','cc0':'CC0 1.0','cc-by-4.0':'CC BY 4.0','cc-by-sa-4.0':'CC BY-SA 4.0','cc-by-nd-4.0':'CC BY-ND 4.0','cc-by-nc-4.0':'CC BY-NC 4.0','cc-by-nc-sa-4.0':'CC BY-NC-SA 4.0','cc-by-nc-nd-4.0':'CC BY-NC-ND 4.0'},urls={cc0:'https://creativecommons.org/publicdomain/zero/1.0/','cc-by-4.0':'https://creativecommons.org/licenses/by/4.0/','cc-by-sa-4.0':'https://creativecommons.org/licenses/by-sa/4.0/','cc-by-nd-4.0':'https://creativecommons.org/licenses/by-nd/4.0/','cc-by-nc-4.0':'https://creativecommons.org/licenses/by-nc/4.0/','cc-by-nc-sa-4.0':'https://creativecommons.org/licenses/by-nc-sa/4.0/','cc-by-nc-nd-4.0':'https://creativecommons.org/licenses/by-nc-nd/4.0/'};const label=labels[id]||labels['all-rights-reserved'],license=urls[id]?`<a href="${urls[id]}" target="_blank" rel="noopener">${label} ↗</a>`:label,attribution=item.attribution?`<span>Credit: ${escapeHTML(item.attribution)}</span>`:'',source=item.source_url?`<a href="${escapeHTML(item.source_url)}" target="_blank" rel="noopener">Original source ↗</a>`:'';return `<section class="license-details"><strong>Rights &amp; license</strong><span>${license}</span>${attribution}${source}</section>`;}
const currentCategory = document.body.dataset.category || "all";
const header = document.querySelector("#site-header");
const content = document.querySelector("#page-content");
const footer = document.querySelector("#site-footer");
const dialog = document.querySelector("#movie-dialog");
let selectedGenre = "All";

function categoryHref(category) { return `${root}pages/${category.file}`; }
function linkMarkup(category, className = "") {
  const active = category.id === currentCategory ? ' aria-current="page"' : "";
  return `<a class="${className}" href="${categoryHref(category)}"${active}>${category.label}</a>`;
}

function renderShell() {
  header.innerHTML = `
    <header class="topbar">
      <div class="topbar-main">
        <a class="brand" href="${root}index.html" aria-label="Binge home"><span class="brand-mark">B</span><span>BINGE</span></a>
        <div class="topbar-tools">
          <form class="search-form" id="search-form" role="search">
            <span class="search-icon" aria-hidden="true">⌕</span>
            <label class="sr-only" for="search-input">Search this collection</label>
            <input id="search-input" type="search" placeholder="Search this collection" autocomplete="off" />
          </form>
          <button class="menu-toggle" id="menu-toggle" type="button" aria-label="Open category menu" aria-expanded="false" aria-controls="menu-panel"><span></span><span></span><span></span></button>
        </div>
      </div>
      <nav class="category-nav" aria-label="Browse categories"><a class="category-link" href="${root}index.html#community-comments">Comments</a><a class="category-link" href="${root}books.html">Books & Stories</a>${categories.map((item) => linkMarkup(item, "category-link")).join("")}</nav>
    </header>
    <div class="menu-backdrop" id="menu-backdrop"></div>
    <aside class="menu-panel" id="menu-panel" aria-label="All Binge categories" aria-hidden="true">
      <div class="menu-panel-head"><p>EXPLORE BINGE</p><button class="menu-close" id="menu-close" type="button" aria-label="Close category menu">×</button></div>
      <nav class="menu-links" aria-label="All categories"><a href="${root}index.html#community-comments">Community Comments</a><a href="${root}books.html">Books & Stories</a>${categories.map((item) => linkMarkup(item)).join("")}</nav>
    </aside>`;

  footer.innerHTML = `<footer class="site-footer"><div class="footer-inner"><a class="brand" href="${root}index.html"><span class="brand-mark">B</span><span>BINGE</span></a><p>Stories from everywhere. A good night starts here.</p><span>© 2026 BINGE · <a href="${root}books.html">Books & Stories</a></span><p>Visitor activity is recorded for site administration. <a href="${root}privacy.html">Privacy details</a>.</p></div></footer>`;
}

function getPageCategory() {
  if (currentCategory === "all") return null;
  return categories.find((item) => item.id === currentCategory) || null;
}

function getPageMovies() {
  const catalog = BingeCatalog.group(movies);
  if (currentCategory === "all" || currentCategory === "genres") return catalog;
  if (currentCategory === "movies") return catalog.filter(movie => movie.format === "Movie");
  if (currentCategory === "tv-series") return catalog.filter(movie => movie.format === "Series");
  return catalog.filter(movie => movie.section === currentCategory);
}

function renderPage() {
  const category = getPageCategory();
  const isGenresPage = currentCategory === "genres";
  const title = category ? category.title : "Stories from <em>everywhere.</em>";
  const kicker = category ? category.kicker : "THE BINGE COLLECTION";
  const copy = category ? category.copy : "Find a new favourite from Korea, China, Hollywood, Nollywood, and more. Explore films and series picked for every kind of night.";
  content.innerHTML = `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-content">
        <p class="hero-kicker">${kicker}</p>
        <h1 id="hero-title">${title}</h1>
        <p class="hero-copy">${copy}</p>
        <div class="hero-actions"><a class="gold-button" href="#collection">Explore collection <span aria-hidden="true">↘</span></a><a class="quiet-link" href="${root}index.html">Browse all stories</a></div>
      </div>
      <span class="hero-index">BINGE · ${String(categories.findIndex((item) => item.id === currentCategory) + 1 || 1).padStart(2, "0")} / 12</span>
    </section>
    ${isGenresPage ? `<section class="genre-directory" aria-labelledby="genre-directory-title"><div class="genre-directory-heading"><p class="section-kicker">THE FULL COLLECTION</p><h2 id="genre-directory-title">Choose a <em>genre.</em></h2><p>Pick a mood to see matching films and series.</p></div><div class="genre-directory-grid" id="genre-directory-grid"></div></section>` : ""}
    <section class="catalog" id="collection" aria-labelledby="catalog-title">
      <div class="catalog-heading"><div><p class="section-kicker">${category ? category.label : "EDITOR'S STARTING POINT"}</p><h2 id="catalog-title">Choose a story for <em>tonight.</em></h2></div><span class="catalog-count" id="catalog-count" aria-live="polite"></span></div>
      <div class="catalog-tools"><div class="genre-filters" id="genre-filters" aria-label="Filter by genre"></div><label class="sort-wrap">SORT BY <select id="sort-select" aria-label="Sort titles"><option value="featured">Featured</option><option value="title">Title A–Z</option><option value="year">Newest</option></select></label></div>
      <div class="movie-grid" id="movie-grid"></div>
      <div class="empty-state" id="empty-state" hidden><h3>No stories found</h3><p>Try another search or genre.</p><button class="clear-button" id="clear-filters" type="button">Clear filters</button></div>
    </section>`;
  document.title = `${category ? category.label : "Discover"} — Binge`;
}

function renderGenres() {
  const baseMovies = getPageMovies();
  const availableGenres = ["All", ...new Set(baseMovies.map((movie) => movie.genre))];
  if (!availableGenres.includes(selectedGenre)) selectedGenre = "All";
  document.querySelector("#genre-filters").innerHTML = availableGenres.map((genre) => `<button class="filter-chip${genre === selectedGenre ? " active" : ""}" type="button" data-genre="${genre}" aria-pressed="${genre === selectedGenre}">${genre}</button>`).join("");
}

function renderGenreDirectory() {
  const directory = document.querySelector("#genre-directory-grid");
  if (!directory) return;
  const totals = new Map();
  BingeCatalog.group(movies).forEach((movie) => totals.set(movie.genre, (totals.get(movie.genre) || 0) + 1));
  directory.innerHTML = [...totals.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([genre, total], index) => `
    <button class="genre-card" type="button" data-genre="${genre}">
      <span class="genre-card-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="genre-card-copy"><strong>${genre}</strong><small>${total} ${total === 1 ? "title" : "titles"}</small></span>
      <span class="genre-card-arrow" aria-hidden="true">↗</span>
    </button>`).join("");
}

function getVisibleMovies() {
  const query = document.querySelector("#search-input").value.trim().toLowerCase();
  const sort = document.querySelector("#sort-select").value;
  const filtered = getPageMovies().filter((movie) => {
    const genreMatches = selectedGenre === "All" || movie.genre === selectedGenre;
    const searchMatches = !query || `${movie.title} ${movie.genre} ${movie.format} ${movie.year} ${movie.description}`.toLowerCase().includes(query);
    return genreMatches && searchMatches;
  });
  if (sort === "title") filtered.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "year") filtered.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  return filtered;
}

function renderMovies() {
  const visible = getVisibleMovies();
  const grid = document.querySelector("#movie-grid");
  const empty = document.querySelector("#empty-state");
  document.querySelector("#catalog-count").textContent = `${visible.length} ${visible.length === 1 ? "title" : "titles"}`;
  grid.hidden = visible.length === 0;
  empty.hidden = visible.length > 0;
  grid.innerHTML = visible.map((movie) => `
    <button class="movie-card" type="button" data-movie="${movie.id}" aria-label="View details for ${movie.title}">
      <span class="poster" style="--poster:${movie.poster}">${movie.poster_file ? `<img class="uploaded-poster" src="/media/${encodeURIComponent(movie.poster_file)}" alt="" loading="lazy">` : ""}<span class="poster-label">${movie.tag}</span><span class="poster-art" aria-hidden="true"></span><span class="poster-title">${movie.title}</span></span>
      <span class="movie-card-info"><span class="movie-title">${movie.title}</span><span class="movie-year">${movie.year}</span></span>
      <span class="movie-meta">${movie.genre} · ${movie.format}${movie.episodes ? ` · ${movie.seasons.length} ${movie.seasons.length === 1 ? "season" : "seasons"} · ${movie.episodes.length} ${movie.episodes.length === 1 ? "episode" : "episodes"}` : ""}</span>
    </button>`).join("");
}

function openMovie(movieId) {
  const movie = BingeCatalog.group(movies).find(item => item.id === movieId || item.episodes?.some(episode => episode.id === movieId));
  if (!movie) return;
  const grouped = Boolean(movie.episodes?.length);
  const first = grouped ? movie.episodes[0] : movie;
  dialog.querySelector('video')?.pause();
  dialog.classList.toggle('series-dialog', grouped);
  dialog.innerHTML = `
    <button class="dialog-close" type="button" aria-label="Close title details">×</button>
    <div class="dialog-poster" style="--poster:${movie.poster}">${movie.poster_file ? `<img class="uploaded-poster" src="/media/${encodeURIComponent(movie.poster_file)}" alt="">` : ""}<span class="dialog-poster-title">${movie.title}</span></div>
    <div class="dialog-content"><p class="dialog-kicker">${categories.find(item => item.id === movie.section)?.label.toUpperCase() || 'BINGE COLLECTION'}</p>
      <h2 id="dialog-title">${movie.title}</h2><p class="dialog-meta">${movie.year} · ${movie.genre} · ${movie.format}${grouped ? ` · ${movie.seasons.length} ${movie.seasons.length === 1 ? 'season' : 'seasons'} · ${movie.episodes.length} episodes` : ''}</p>
      <p class="dialog-description">${movie.description}</p>
      ${licenseMarkup(movie)}
      ${first.file ? `<section class="episode-player" aria-labelledby="playing-label"><h3 id="playing-label">${grouped ? `Season ${first.season} · Episode ${first.episode}` : movie.title}</h3><video id="title-player" ${movie.poster_file ? `poster="/media/${encodeURIComponent(movie.poster_file)}"` : ''} controls preload="metadata" src="/media/${encodeURIComponent(first.file)}" aria-label="${grouped ? `Season ${first.season} episode ${first.episode}` : movie.title}"></video><a id="active-download" class="gold-button" href="/media/${encodeURIComponent(first.file)}?download=1" download>${grouped ? `Download S${first.season} E${first.episode}` : 'Download video'} ↓</a></section>` : `<div class="player-placeholder"><span class="play-icon">▶</span><span>Video source not added yet</span></div>`}
      ${grouped ? `<section class="series-browser" aria-label="Seasons and episodes"><h3>Seasons & episodes</h3><p class="dialog-note">Choose a season, then watch or download an episode.</p>${BingeCatalog.episodeMarkup(movie)}</section>` : ''}
      <p class="dialog-note">${first.file ? 'Downloads save to the location configured in your browser.' : 'This is a fictional demo title. No video is attached.'}</p>
    </div>`;
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  if (grouped) {
    function highlight(id) {
      dialog.querySelectorAll('[data-watch]').forEach(button => {
        const active = button.dataset.watch === id;
        button.setAttribute('aria-pressed', String(active));
        button.closest('.series-episode-row').classList.toggle('playing', active);
      });
    }
    highlight(first.id);
    dialog.querySelector('.series-browser').addEventListener('click', event => {
      const button = event.target.closest('[data-watch]');
      if (!button) return;
      const episode = movie.episodes.find(item => item.id === button.dataset.watch);
      if (!episode) return;
      const video = dialog.querySelector('#title-player');
      video.pause(); video.src = '/media/' + encodeURIComponent(episode.file); video.load();
      video.setAttribute('aria-label', `Season ${episode.season} episode ${episode.episode}`);
      dialog.querySelector('#playing-label').textContent = `Season ${episode.season} · Episode ${episode.episode}`;
      const download = dialog.querySelector('#active-download');
      download.href = '/media/' + encodeURIComponent(episode.file) + '?download=1';
      download.textContent = `Download S${episode.season} E${episode.episode} ↓`;
      highlight(episode.id);
      video.scrollIntoView({behavior:'smooth', block:'nearest'});
      video.play()?.catch(() => {});
    });
  }
  if (!dialog.open) dialog.showModal();
}

function setupComments(container,contentId) {
  const list = container.querySelector('.comment-list');
  const count = container.querySelector('.comments-count');
  const form = container.querySelector('.comment-form');
  const status = container.querySelector('.comment-status');
  if (!list || !count || !form || !status) return;
  const refresh = async () => {
    try {
      const response = await fetch(`/api/comments/${encodeURIComponent(contentId)}`, {cache:'no-store'});
      if (!response.ok) throw new Error('Comments could not be loaded.');
      const comments = await response.json();
      list.replaceChildren();
      count.textContent = `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}`;
      if (!comments.length) {
        const empty = document.createElement('li'); empty.className = 'comment-empty'; empty.textContent = 'No comments yet. Start the conversation.'; list.append(empty);
      }
      for (const comment of comments) {
        const item = document.createElement('li'); item.className = 'comment-item';
        const meta = document.createElement('div'); meta.className = 'comment-meta';
        const author = document.createElement('strong'); author.textContent = comment.name;
        const time = document.createElement('time'); time.dateTime = new Date(comment.created_at * 1000).toISOString();
        time.textContent = new Intl.DateTimeFormat(undefined, {dateStyle:'medium',timeStyle:'short'}).format(new Date(comment.created_at * 1000));
        const message = document.createElement('p'); message.textContent = comment.body;
        meta.append(author,time); item.append(meta,message); list.append(item);
      }
    } catch { count.textContent = 'Comments unavailable'; }
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button[type=submit]'); button.disabled = true; status.textContent = 'Posting…';
    try {
      const response = await fetch(`/api/comments/${encodeURIComponent(contentId)}`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:form.elements.name.value,body:form.elements.body.value})});
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.description || result.error || 'Your comment could not be posted.');
      form.elements.body.value = ''; status.textContent = 'Your comment has been posted.'; await refresh();
    } catch (error) { status.textContent = error.message || 'Your comment could not be posted.'; }
    finally { button.disabled = false; }
  });
  refresh();
}

function setMenuOpen(open) {
  const button = document.querySelector("#menu-toggle");
  const panel = document.querySelector("#menu-panel");
  const backdrop = document.querySelector("#menu-backdrop");
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute("aria-label", open ? "Close category menu" : "Open category menu");
  panel.inert = !open;
  panel.classList.toggle("open", open);
  panel.setAttribute("aria-hidden", String(!open));
  backdrop.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "";
  if (open) document.querySelector("#menu-close").focus();
  else button.focus();
}

const demoMovies = [...movies];
movies.length = 0;
renderShell();
document.querySelector("#menu-panel").inert = true;
renderPage();
renderGenres();
renderGenreDirectory();
renderMovies();
const communityComments = document.querySelector('#community-comments');
if (communityComments) setupComments(communityComments,'community');

document.querySelector("#search-form").addEventListener("submit", (event) => event.preventDefault());
document.querySelector("#search-input").addEventListener("input", renderMovies);
document.querySelector("#sort-select").addEventListener("change", renderMovies);
document.querySelector("#genre-filters").addEventListener("click", (event) => {
  const chip = event.target.closest("[data-genre]");
  if (!chip) return;
  selectedGenre = chip.dataset.genre;
  renderGenres();
  renderMovies();
});
document.querySelector("#genre-directory-grid")?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-genre]");
  if (!card) return;
  selectedGenre = card.dataset.genre;
  renderGenres();
  renderMovies();
  document.querySelector("#collection").scrollIntoView({ behavior: "smooth" });
});
document.querySelector("#movie-grid").addEventListener("click", (event) => {
  const card = event.target.closest("[data-movie]");
  if (card) openMovie(card.dataset.movie);
});
document.querySelector("#clear-filters").addEventListener("click", () => {
  selectedGenre = "All";
  document.querySelector("#search-input").value = "";
  renderGenres();
  renderMovies();
});
document.querySelector("#menu-toggle").addEventListener("click", () => setMenuOpen(true));
document.querySelector("#menu-close").addEventListener("click", () => setMenuOpen(false));
document.querySelector("#menu-backdrop").addEventListener("click", () => setMenuOpen(false));
document.querySelector("#menu-panel").addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});
dialog.addEventListener("close", () => dialog.querySelector("video")?.pause());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.querySelector("#menu-panel").classList.contains("open")) setMenuOpen(false);
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.querySelector("#search-input").focus();
  }
});

// Keep public collections synchronized with the published upload catalog.
const starterMovies = demoMovies;
let catalogRequest = null;
async function syncPublishedVideos() {
  if (catalogRequest) return catalogRequest;
  catalogRequest = (async () => {
    try {
      const [response, settingsResponse] = await Promise.all([fetch('/api/content', {cache: 'no-store'}), fetch('/api/config', {cache:'no-store'})]);
      const settings = settingsResponse.ok ? await settingsResponse.json() : {show_demo:false};
      if (!response.ok) throw Error('Catalog unavailable');
      const items = await response.json();
      const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const published = items.filter(x => x.kind === 'video').map(item => {
        const safe = Object.fromEntries(Object.entries(item).map(([k,v]) => [k, typeof v === 'string' ? escapeHTML(v) : v]));
        return {...safe, poster:'linear-gradient(145deg,#9b7957,#375c4a 55%,#182d26)', tag:'BINGERET · NOW PLAYING'};
      });
      // Replace the previous server snapshot so updates and deletions are reflected too.
      movies.splice(0, movies.length, ...published, ...(settings.show_demo ? starterMovies : []));
      document.querySelector('#catalog-sync-note')?.remove();
      renderGenres(); renderGenreDirectory(); renderMovies();
    } catch {
      if (!document.querySelector('#catalog-sync-note')) {
        const note = document.createElement('p'); note.id = 'catalog-sync-note';
        note.setAttribute('role', 'status');
        note.textContent = 'Uploaded videos could not be refreshed. Check that the Binge server is running.';
        note.style.cssText = 'padding:16px;color:#eed991'; content.append(note);
      }
    }
  })().finally(() => {catalogRequest = null;});
  return catalogRequest;
}
syncPublishedVideos();
window.addEventListener('focus', syncPublishedVideos);
window.addEventListener('pageshow', syncPublishedVideos);
document.addEventListener('visibilitychange', () => {if (!document.hidden) syncPublishedVideos();});
window.addEventListener('storage', event => {if (event.key === 'binge-content-updated') syncPublishedVideos();});
setInterval(() => {if (!document.hidden) syncPublishedVideos();}, 15000);

// Close the phone menu when switching back to desktop navigation.
window.matchMedia('(max-width: 767px)').addEventListener('change', event => {
  if (!event.matches && document.querySelector('#menu-panel').classList.contains('open')) {
    setMenuOpen(false);
    document.querySelector('.brand').focus();
  }
});
