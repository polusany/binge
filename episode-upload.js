// Shared by the admin page and the upload checks.
const EpisodeUploads = {
  validate(rows) {
    if (!rows.length) throw Error('Add at least one episode.');
    const numbers = new Set();
    for (const row of rows) {
      const number = Number(row.number);
      if (!Number.isInteger(number) || number < 1 || number > 9999) throw Error('Episode numbers must be whole numbers from 1 to 9999.');
      if (numbers.has(number)) throw Error(`Episode ${number} is listed twice.`);
      numbers.add(number);
      if (row.saved) continue;
      if (!row.file) throw Error(`Choose a video for episode ${number}.`);
      if (!/\.(mp4|webm|ogg)$/i.test(row.file.name)) throw Error(`Episode ${number} needs an MP4, WebM or OGG video.`);
      if (!row.file.size || row.file.size > 1024 * 1024 * 1024) throw Error(`Episode ${number} must be between 1 byte and 1 GB.`);
    }
  },
  async publish(rows, shared, upload, save, progress) {
    this.validate(rows);
    let completed = rows.filter(row => row.saved).length;
    for (const row of rows) {
      if (row.saved) continue;
      progress(`Uploading episode ${row.number} · ${completed} of ${rows.length} published. Keep this page open.`);
      // Keep successfully uploaded files on retry if saving the record fails.
      row.uploaded = row.uploaded || await upload(row.file);
      const result = await save({...shared, id:'', kind:'video', format:'Series', episode:Number(row.number), file:row.uploaded});
      row.saved = result.id;
      completed++;
      progress(`Published episode ${row.number} · ${completed} of ${rows.length} published.`);
    }
    return completed;
  }
};
if (typeof module !== 'undefined') module.exports = EpisodeUploads;
