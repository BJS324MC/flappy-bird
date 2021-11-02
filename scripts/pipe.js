class Pipe {
  constructor({ x, y1, y2, sprite }) {
    this.x = x;
    this.y1 = y1;
    this.y2 = y2;
    this.sprite = sprite;
    this.passed = false;
    this.dir = this.y1 < 200 ? 1:-1
  }
  draw(ctx) {
    const { sprite, x, y1, y2 } = this;
    ctx.drawImage(sprite, x, y2);
    ctx.save();
    ctx.translate(x + sprite.width/2,sprite.height/2);
    ctx.rotate(Math.PI);
    ctx.drawImage(sprite, -sprite.width/2, sprite.height/2 - y1);
    ctx.restore();
  }
  collide(faby) {
    return (this.x < 105 && this.x > 105 - this.sprite.width - faby.sprite.width && 
           (faby.y - faby.sprite.height/2 < this.y1 || faby.y > this.y2 - faby.sprite.height/2))
  }
  update(){
    this.x -= 2.4;
    //this.y1+=this.dir*0.3;
    //this.y2+=this.dir*0.3;
  }
  pass() {
    return !this.passed && this.x <= 60 ? this.passed = true : false;
  }
}