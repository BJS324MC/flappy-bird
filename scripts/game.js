class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onload = () => 0;
    this.baseTime = 0;
    this.score = 0;
    this.best = localStorage.getItem('best') || 0;
    this.interval = 0;
    this.gameover = false;
    this.started = false;
    this.show = false;
    this.noclip = false;
    this.isDay = true;
    this.loops = [];
    this.pipes = [];
    this.kills = [];
    this.playButton = false;
    
    this.audioCtx = new AudioContext();

    loadImages(
      './assets/sprites/background-day.png',
      './assets/sprites/background-night.png',
      './assets/sprites/base.png',
      './assets/sprites/faby.png',
      './assets/sprites/gameover.png',
      './assets/sprites/message.png',
      './assets/sprites/pipe.png',
      './assets/sprites/board.png',
      './assets/sprites/play.png',
      ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(e => `./assets/sprites/${e}.png`)
    ).then(sprites => loadSounds(this.audioCtx,
      './assets/audio/die.mp3',
      './assets/audio/hit.mp3',
      './assets/audio/point.mp3',
      './assets/audio/swoosh.mp3',
      './assets/audio/wing.mp3').then(sounds => {
      canvas.addEventListener('click', e => {
        this.flap();
        if(this.playButton)this.playCollide(e);
      });
      addEventListener('resize', () => this.scaleToFit());
      addEventListener('keydown',e => {
        if(e.ctrlKey && e.altKey && e.key === 'n') {
          if(this.noclip){
            this.noclip = false;
            alert('No-clip turned off.')
          } else{
            this.noclip = true;
            alert('No-clip turned on.');
          }
        }
      });
      const [day, night, base, faby, gameover, message, pipe, board, play] = sprites;
      const [die, hit, point, swoosh, wing] = sounds;
      this.sprites = {
        day,
        night,
        base,
        gameover,
        message,
        pipe,
        board,
        play
      };
      this.sounds = {
        die,
        hit,
        point,
        swoosh,
        wing
      };
      sprites.slice(9).forEach((a, i) => this.sprites[i] = a);
      this.scaleToFit();
      this.faby = new Faby({
        x: 90,
        y: day.height / 2 + 47,
        sprite: faby
      });
      this.onload();
    }));
  }
  flap() {
    if (this.gameover || !this.show) return false;
    else if (!this.started) this.start();
    this.faby.flap();
    this.playSound('wing');
  }
  playCollide(e){
    const {play,day} = this.sprites,
          x = day.width/2 - play.width/2*0.7,
          y = day.height*0.6,
          w = play.width*0.7,
          h = play.height*0.7,
          ex = (e.pageX - canvas.offsetLeft)/this.scale,
          ey = e.pageY/this.scale;
    if(ex > x && ey > y && ex < x + w && ey < y + h) this.reset();
    else console.log(ex,ey,canvas.offsetLeft)
  }
  reset() {
    this.createLoop({
      start: 0,
      end: 1,
      time: 200,
      func: val => {
        this.ctx.fillStyle = `rgba(0,0,0,${val})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      },
      stop: () => {
        this.loops = [];
        this.score = 0;
        this.interval = 0;
        this.gameover = false;
        this.started = false;
        this.day = false;
        this.show = false;
        this.faby.y = this.sprites.day.height / 2 + 47;
        this.faby.link = true;
        this.faby.velocity = 0;
        this.faby.angle = 0;
        this.pipes = [];
        this.playButton = false;
        this.onload(true);
      }
    });
  }
  generatePipes() {
    const space = 120;
    if (this.interval === 75) {
      this.interval = 0;
      const pos = 50 + Math.random()*(this.sprites.day.height - this.sprites.base.height  - space - 100);
      this.pipes.push(new Pipe({
        x: game.sprites.day.width,
        y1: pos,
        y2: pos + space,
        sprite: game.sprites.pipe
      }));
    }
    else this.interval++;
  }
  playSound(type) {
    const { audioCtx, sounds } = this;
    if (sounds === undefined) return false;
    const source = audioCtx.createBufferSource();
    source.buffer = sounds[type];
    source.connect(audioCtx.destination);
    source.start();
    return true;
  }
  scaleToFit() {
    const { width, height } = this.sprites.day;
    this.scale = Math.min(innerHeight / height, innerWidth / width);
    this.canvas.width = width * this.scale;
    this.canvas.height = height * this.scale;
  }
  update() {
    const { faby, sprites, scale, gameover } = this, { day, base } = sprites;
    if (faby.y > day.height - base.height) this.deathEffect(false);
    if (game.started) {
      faby.update();
      faby.y = Math.min(day.height - base.height + 1, faby.y);
    };
    if (!gameover) this.baseTime = (this.baseTime + 0.05) % 1;
    this.faby.flipped = ~~(this.score / 30) % 2 === 1;
  }
  deathEffect(fall = true) {
    const {gameover,faby,score,sprites,ctx} = this;
    if (gameover) return;
    this.gameover = true;
    faby.link = false;
    faby.velocity = 0;
    this.best = Math.max(this.best,score);
    localStorage.setItem('best',this.best);
    let stime = 700;
    if (fall) {
      setTimeout(e => this.playSound('die'), 400);
      this.createLoop({
        start: faby.angle,
        end: -90,
        time: 500,
        func: val => {
          if (faby.y !== sprites.day.height - sprites.base.height + 1) faby.angle = val;
        }
      });
      stime = 1100;
    }
    setTimeout(() => {
      this.playSound('swoosh');
      let p = 0;
      this.createLoop({
        start: 0,
        end: 1,
        time: 400,
        func: (val,kill) => {
          if(p === 0){this.kills.push(kill);p++};
          ctx.globalAlpha = val*3/2;
          ctx.drawImage(sprites.gameover,sprites.day.width/2 - sprites.gameover.width/2,100 - val*20);
          ctx.globalAlpha = 1;
        },
        stop: () => {
          this.playSound('swoosh');
          this.createLoop({
            start: 0,
            end: 1,
            time: 400,
            func: (val, kill) => {
              if(p === 1){this.kills.push(kill);p++};
              ctx.globalAlpha = val * 3 / 2;
              ctx.drawImage(sprites.board, sprites.day.width / 2 - sprites.board.width / 2 * 0.6, 180 - val * 20,sprites.board.width * 0.6,sprites.board.height * 0.6);
              this.showScore(this.score,sprites.day.width / 2 - 45,220 - val * 20);
              this.showScore(this.best,sprites.day.width / 2 + 45,220 - val * 20);
              ctx.globalAlpha = 1;
            },
            stop: () => this.playButton = true,
            preserve: true
          });
        },
        preserve:true
      });
    },stime)
    this.createLoop({
      start: 1,
      end: 0,
      time: 500,
      func: val => {
        ctx.fillStyle = `rgba(255,255,255,${val})`;
        ctx.fillRect(0, 0, innerWidth, innerHeight);
      }
    });
    this.playSound('hit');
  }
  start() {
    this.started = true;
    game.createLoop({
      start: 1,
      end: 0,
      time: 500,
      func: val => {
        const { ctx, sprites } = game, { message, day } = sprites;
        ctx.globalAlpha = val;
        ctx.drawImage(message, day.width / 2 - message.width / 2, day.height / 2 - message.height / 2);
        ctx.globalAlpha = 1;
      }
    });
  }
  showScore(score,x,y){
    const scoreText = score.toString().split('').map(a => this.sprites[a]);
    
    scoreText.forEach((txt, i) => this.ctx.drawImage(txt,x - (txt.width / 2 * scoreText.length) + (txt.width * i),y));
  }
  point() {
    if (this.gameover) return false;
    this.score++;
    this.playSound('point');
  }
  createLoop({ start, end, time, func, stop = () => 0, preserve = false }) {
    this.loops.unshift({
      startValue: start,
      endValue: end,
      start: Date.now(),
      time,
      func,
      stop,
      preserve,
      ended: false
    })
  }
  render() {
    const { ctx, faby, scale, canvas, sprites, baseTime, score, gameover, loops, show, started, pipes, isDay, playButton } = this, { width, height } = canvas, { day, night, base, message, pipe, play } = sprites;
    ctx.save();
    ctx.scale(scale, scale);
    ctx.drawImage(isDay ? day:night, 0, 0);
    if (started) this.generatePipes();
    pipes.forEach(p => {
      if (!gameover) {
        p.update();
        if (p.pass()) game.point();
        if (!this.noclip && p.collide(faby)) this.deathEffect();
      };
      p.draw(ctx);
    });
    ctx.drawImage(base, -baseTime * 48, day.height - base.height);
    faby.draw(ctx);
    if(!gameover) this.showScore(score,day.width / 2,day.height / 8);
    if(playButton) ctx.drawImage(play,day.width/2 - play.width/2*0.7,day.height*0.6,play.width*0.7,play.height*0.7);
    for (let i = loops.length - 1; i >= 0; i--) {
      const loop = loops[i]
      const now = Date.now();
      const time = (now - loop.start) / loop.time;
      const kill = () => loops.splice(i, 1);
      if (time >= 1) {
        loop.func(loop.endValue,kill);
        if(loop.ended === false) loop.stop();
        loop.ended = true;
        if(!loop.preserve) kill();
        continue;
      }
      const value = (1 - time) * loop.startValue + time * loop.endValue;
      loop.func(value,kill);
    }
    if (show && !started) ctx.drawImage(message, day.width / 2 - message.width / 2, day.height / 2 - message.height / 2);
    ctx.restore();
  }
}