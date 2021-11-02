class Faby {
  constructor({ x, y, sprite }) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.velocity = 0;
    this.link = true;
    this.sprite = sprite;
    this.flipped = false;
    this.wave = false;
  }
  flap() {
    this.velocity = this.velocity > 0 && this.wave ? -6 : 6;
  }
  update() {
    this.y -= this.velocity * (this.flipped ? -1:1);
    if(!this.wave) this.velocity -= 0.3;
    if (this.link) this.angle = Math.min(90, Math.max(-90, this.velocity / 2 * 9));
  }
  draw(ctx) {
    const { x, y, sprite } = this;
    ctx.save();
    ctx.translate(x, y);
    if(this.flipped) ctx.scale(1,-1);
    ctx.rotate(Math.PI / 180 * -this.angle);
    ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
    ctx.restore();
  }
}