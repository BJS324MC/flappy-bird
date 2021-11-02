const assets = [
  './index.html',
  './main.js',
  './style.css',
  './scripts/faby.js',
  './scripts/game.js',
  './scripts/network.js',
  './scripts/pipe.js',
  './scripts/util.js',
  './assets/icons/192.png',
  './assets/icons/256.png',
  './assets/icons/512.png',
  './assets/sprites/background-day.png',
  './assets/sprites/background-night.png',
  './assets/sprites/base.png',
  './assets/sprites/faby.png',
  './assets/sprites/gameover.png',
  './assets/sprites/message.png',
  './assets/sprites/pipe.png',
  './assets/sprites/board.png',
  './assets/sprites/play.png',
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(e => `./assets/sprites/${e}.png`),
  './assets/audio/die.mp3',
  './assets/audio/hit.mp3',
  './assets/audio/point.mp3',
  './assets/audio/swoosh.mp3',
  './assets/audio/wing.mp3'
];
self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => res || fetch(fetchEvent.request))
  )
})
self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open("FLAPPY").then(cache => cache.addAll(assets))
  )
})