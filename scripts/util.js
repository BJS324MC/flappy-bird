/*
 * Loads images from a list of urls
 * @param {string} urls A list of urls to load as images
 * @returns {Promise} A promise that resolves when all images are loaded,ordered by the urls passed into this function
 */
const loadImages = async (...urls) => await Promise.all(urls.map(url => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = url;
})));

const loadSounds = (audioCtx, ...urls) => Promise.all(urls.map(url => fetch(url).then(a => a.arrayBuffer()).then(b => audioCtx.decodeAudioData(b))));