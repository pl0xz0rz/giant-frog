define(function(){
function player(){
  this.camera = new camera();

  this.world = null;

}

function camera(){
  this.x = 0;
  this.y = 0;
  this.sw = 20;
  this.sh = 17;
  this.tw = 32;
  this.th = 32;
  this.xoff = 0;
  this.yoff = 0;
  this.xmin = 0;
  this.ymin = 0;
  this.xmax = 100;
  this.ymax = 29;

  this.pxwidth = 600;
  this.pxheight = 400;

  this.aim = aim;
  function aim(x,y){
  this.x = Math.floor(x - this.pxwidth / 2 / this.tw);
  this.y = Math.floor(y - this.pxheight / 2 / this.th);
  this.xoff = (x - this.x) * this.tw - this.pxwidth / 2;
  this.yoff = (y - this.y) * this.th - this.pxheight / 2;
  if(this.x < this.xmin){this.x = this.xmin; this.xoff = 0};
  if(this.y < this.ymin){this.y = this.ymin; this.yoff = 0};
  if(this.x + this.pxwidth / this.tw > this.xmax){this.x = Math.ceil(this.xmax - this.pxwidth / this.tw); this.xoff = 0};
  if(this.y + this.pxheight / this.th> this.ymax){this.y = Math.ceil(this.ymax - this.pxheight/ this.th); this.yoff = 0};
  }
}

this.player = player;
return {
  player: this.player
}
});
