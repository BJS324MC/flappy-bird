const canvas = document.querySelector('canvas');

const game = new Game(canvas);

const loop = () => {
  game.update();
  game.render();
  requestAnimationFrame(loop);
}

game.onload = lp => {
  game.playSound('swoosh');
  game.createLoop({
    start: 1,
    end: 0,
    time: 400,
    func: val => {
      game.ctx.fillStyle = `rgba(0,0,0,${val})`;
      game.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  })
  setTimeout(() => game.createLoop({
    start: 0,
    end: 1,
    time: 500,
    func: val => {
      if (game.started) return false;
      const { ctx, sprites } = game, { message, day } = sprites;
      ctx.globalAlpha = val;
      ctx.drawImage(message, day.width / 2 - message.width / 2, day.height / 2 - message.height / 2);
      ctx.globalAlpha = 1;
    },
    stop: () => game.show = true
  }), 200);
  if (!lp) loop();
};