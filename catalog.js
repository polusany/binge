// Public catalog projection. Episode files remain individual records in storage.
const BingeCatalog = {
  seriesKey(item) {
    return JSON.stringify([String(item.title || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase(), item.section || 'tv-series']);
  },
  group(items) {
    const entries = [], series = new Map();
    for (const item of items) {
      if (item.format !== 'Series' || !item.file || !Number(item.season) || !Number(item.episode)) {
        entries.push({...item}); continue;
      }
      const key = this.seriesKey(item);
      let entry = series.get(key);
      if (!entry) {
        entry = {...item, episodes: [], seasons: [], seriesKey: key};
        series.set(key, entry); entries.push(entry);
      }
      entry.episodes.push(item);
      if (!entry.poster_file && item.poster_file) entry.poster_file = item.poster_file;
      if (!entry.description && item.description) entry.description = item.description;
    }
    for (const entry of series.values()) {
      entry.episodes.sort((a,b) => Number(a.season)-Number(b.season) || Number(a.episode)-Number(b.episode) || String(a.id).localeCompare(String(b.id)));
      entry.seasons = [...new Set(entry.episodes.map(item => Number(item.season)))];
    }
    return entries;
  },
  episodeMarkup(entry) {
    return entry.seasons.map((season,index) => {
      const episodes=entry.episodes.filter(item => Number(item.season) === season);
      return `<details class="season-block"${index === 0 ? ' open' : ''}><summary>Season ${season}<span>${episodes.length} ${episodes.length === 1 ? 'episode' : 'episodes'}</span></summary><div class="season-episodes">${episodes.map(item => `<div class="series-episode-row"><strong>Episode ${Number(item.episode)}</strong><div><button type="button" data-watch="${item.id}" aria-label="Watch season ${season} episode ${Number(item.episode)}">Watch ▶</button><a href="/media/${encodeURIComponent(item.file)}?download=1" download aria-label="Download season ${season} episode ${Number(item.episode)}">Download ↓</a></div></div>`).join('')}</div></details>`;
    }).join('');
  }
};
if (typeof module !== 'undefined') module.exports = BingeCatalog;
