define([
  "jquery",
  "npcs"
], function(
  $,
  Npcs
){

  var SQRT2 = Math.sqrt(2);

  function Sprite(){
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.img = null;
    this.name = "";

    this.xoff = 0;
    this.yoff = 0;

    this.action = 0;
    this.frame = 0;

    this.actions = 0;
    this.frames = 0;

    this.visible = false;
    this.active = false;

    this.dt = .5;
    this.acc = 0;

    this.init = init;
    function init(img,xoff,yoff,width,height,actions,frames){
      this.img = img;
      this.xoff = xoff;
      this.yoff = yoff;
      this.width = width;
      this.height = height;
      this.actions = actions;
      this.frames = frames;
    }

    this.draw = draw;
    function draw(context,camera){
        if(this.visible){
          this.context = context;
          context.drawImage(this.img,this.frame*this.width + this.xoff,this.action*this.height + this.yoff,this.width,this.height,
                                      (this.x - camera.x) * camera.tw - camera.xoff ,
                                      (this.y - camera.y) * camera.th - camera.yoff,
                                      this.width,
                                      this.height);
        }
    }

    this.hittest = hittest;
    function hittest(x,y,width,height){

    }

    this.tick = tick;
    function tick(dt){
      this.acc += dt;
      if(this.acc >= this.dt){
        this.frame += 1;
        if(this.frame >= this.frames) this.frame = 0;
        this.acc -= this.dt;
      }
    }
 }

 function Actor(){
   this.sprite = new Sprite();
   this.gravity = true;
   this.drag = true;
   this.mapcollisions = false;
   this.platformcollision = false;
   this.collectspowerups = false;
   this.collisionlayer = 0;
   this.dynamic = false;
   this.active = false;
   this.id = -1;
   this.added = false;

   this.mass = 1;

   this.world = null;

   this.finishlevel = false;

   this.vx = 0;
   this.vy = 0;

   this.x = 0;
   this.y = 0;

   this.r = 0;

   this.spin = 0;
   this.spinreduction = 0;

   this.xnormal = 0;
   this.ynormal = 0;

   this.tick = tick;
   function tick(dt){
     if(this.active && this.dynamic)
{     this.x += this.vx * dt;
     this.y += this.vy * dt;
     this.sprite.x += this.vx * dt;
     this.sprite.y += this.vy * dt;
     this.xnormal = 0;
     this.ynormal = 0;
     this.dt = dt;
     this.spin *= (1-this.spinreduction)}
   }

   this.initfromsprite = initfromsprite;
   function initfromsprite(){
     this.xnormal = 0;
     this.ynormal = 0;
     this.x = this.sprite.x;
     this.y = this.sprite.y;
     this.r = this.sprite.width / 64;
   }

   this.hitwall = hitwall;
   function hitwall(xn,yn,f,g){
     this.xnormal = xn;
     this.ynormal = yn;
     var vn = this.vx * xn + this.vy * yn;
     if(vn > 0){
       var vtb = -this.vx * yn + this.vy * xn;
       var vt = vtb + this.spin;
       var q = Math.abs(vt) - vn * f ;
       if(q <= 0){
         vtb = (vtb - this.spin) / 2;
         this.spin = -vtb;
       } else if(vt > 0){
         vtb -= vn * f / 2;
         this.spin -= vn * f / 2;
       } else {
         vtb += vn * f / 2;
         this.spin += vn * f / 2;
       }
       vn *= -1;
       vn *= g;
       this.vx = vn * xn - vtb * yn;
       this.vy = vn * yn + vtb * xn;
     }
   }

   this.mapcollision = mapcollision;
   function mapcollision(tilelayer,width,lid){
     if(!this.mapcollisions) return false;
     var x;
     var y;
     var dx;
     var dy;
     var tile;
     var tc;
     var o = (this.width > this.height);
     var tx = Math.floor(this.x-this.r);
     var ty = Math.floor(this.y-this.r);
      for(var i=0;i<=this.r*2+1;++i){
        for(var j=0;j<=this.r*2+1;++j){
          var rp = 0;
          x = tx + i;
          y = ty + j;
          if(this.x < x) rp |= 1;
          if(this.y < y) rp |= 2;
          if(this.x > x + 1) rp |= 4;
          if(this.y > y + 1) rp |= 8;
          tile = x + width * y;
          tc = (tilelayer[tile]-1);
          if(tc === 11 || tc === 43) this.finishlevel = true;
          if(iswall(tc)){
            var f = friction(tc);
            var g = elasticity(tc);
            switch(rp){
              case 0:
              break;
              case 1:
              if(this.x > x - this.r) {
                var dx = this.x - x + this.r;
                this.world.hitblock(this.mass,this.vx,tile,lid);
                this.hitwall(1,0,f,g);
                this.x -= dx;
                this.sprite.x -= dx;
              }
              break;
              case 2:
              if(this.y > y - this.r) {
                var dy = this.y - y + this.r;
                this.world.hitblock(this.mass,this.vy,tile,lid);
                this.hitwall(0,1,f,g);
                this.y -= dy;
                this.sprite.y -= dy;
              }
              break;
              case 4:
              if(this.x < x + 1 + this.r) {
                var dx = -x-1-this.r + this.x;
                this.world.hitblock(this.mass,-this.vx,tile,lid);
                this.hitwall(-1,0,f,g);
                this.x -= dx;
                this.sprite.x -= dx;
              }
              break;
              case 8:
              if(this.y < y + 1 + this.r) {
                var dy = -y-1-this.r + this.y;
                this.world.hitblock(this.mass,-this.vy,tile,lid);
                this.hitwall(0,-1,f,g);
                this.y -= dy;
                this.sprite.y -= dy;
              }
              break;
              case 3:
              if((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y) < this.r * this.r ) {
                var dx = x - this.x;
                var dy = y - this.y;
                var l = Math.sqrt(dx * dx + dy * dy);
                if(l!=0){
                dx /= l;
                dy /= l;
                this.world.hitblock(this.mass,this.vx * dx, this.vy * dy,tile,lid);
                this.hitwall(dx,dy,f,g);
                dx *= this.r;
                dy *= this.r;
                dx -= x - this.x;
                dy -= y - this.y;
                this.x -= dx;
                this.y -= dy;
                this.sprite.x -= dx;
                this.sprite.y -= dy;
                }
               }
               break;
               case 9:
               if((this.x - x) * (this.x - x) + (this.y - y - 1) * (this.y - y - 1) < this.r * this.r ) {
                 var dx = x - this.x;
                 var dy = y + 1 - this.y;
                 var l = Math.sqrt(dx * dx + dy * dy);
                 if(l!=0){
                 dx /= l;
                 dy /= l;
                 this.world.hitblock(this.mass,this.vx * dx, this.vy * dy,tile,lid);
                 this.hitwall(dx,dy,f,g);
                 dx *= this.r;
                 dy *= this.r;
                 dx -= x - this.x;
                 dy -= y + 1 - this.y;
                 this.x -= dx;
                 this.y -= dy;
                 this.sprite.x -= dx;
                 this.sprite.y -= dy;
                 }
                }
                break;
                case 6:
                if((this.x - x - 1) * (this.x - x - 1) + (this.y - y) * (this.y - y) < this.r * this.r ) {
                  var dx = x + 1 - this.x;
                  var dy = y - this.y;
                  var l = Math.sqrt(dx * dx + dy * dy);
                  if(l!=0){
                  dx /= l;
                  dy /= l;
                  this.world.hitblock(this.mass,this.vx * dx, this.vy * dy,tile,lid);
                  this.hitwall(dx,dy,f,g);
                  dx *= this.r;
                  dy *= this.r;
                  dx -= x + 1 - this.x;
                  dy -= y - this.y;
                  this.x -= dx;
                  this.y -= dy;
                  this.sprite.x -= dx;
                  this.sprite.y -= dy;
                  }
                 }
                 break;
                 case 12:
                 if((this.x - x - 1) * (this.x - x - 1) + (this.y - y - 1) * (this.y - y - 1) < this.r * this.r ) {
                   var dx = x + 1 - this.x;
                   var dy = y + 1 - this.y;
                   var l = Math.sqrt(dx * dx + dy * dy);
                   if(l!=0){
                   dx /= l;
                   dy /= l;
                   this.world.hitblock(this.mass,this.vx * dx, this.vy * dy,tile,lid);
                   this.hitwall(dx,dy,f,g);
                   dx *= this.r;
                   dy *= this.r;
                   dx -= x + 1 - this.x;
                   dy -= y + 1 - this.y;
                   this.x -= dx;
                   this.y -= dy;
                   this.sprite.x -= dx;
                   this.sprite.y -= dy;
                   }
                  }
                  break;

            }
          }

        }
      }
   }


 }

 function iswall(id){
   return( id > -1 && id % 32 === 1);
 }

 function friction(id){
   if(id < 32) return 15;
   if(id < 64) return .1;
   if(id < 96) return 2;
   return 1;
 }

 function elasticity(id){
   if(id < 32) return .1;
   if(id < 64) return .1;
   if(id < 96) return .01;
   return .6;
 }

 function hittest(a,b){
   return (a.x + a.width > b.x && a.x < b.x + b.width && a.y + a.height >  b.y && a.y < b.y + b.height);
 }

this.Character = Character;
 function Character(){
   this.actor = new Actor();
   this.facingleft = false;
   this.walkspeed = 1;
   this.flyacc = 10;
   this.score = 0;
   this.collect = false;

   this.init = init;

   this.mapdata = null;

   this.canwalk = true;
   this.canfly = true;

   this.killbounty = 100;

   this.xp = 0;
   this.level = 0;

   function init(objdata){
     this.name = objdata.name;
     this.type = objdata.type;
     this.walkspeed = objdata.properties.walkspeed;
     this.jumpspeed = objdata.properties.jumpspeed;
     this.flyacc = objdata.properties.flyacc;

     this.xpbounty = 100;

     for(var i in objdata.properties){
       this[i] = objdata.properties[i];
     }

     this.actor.sprite.init(document.getElementById(objdata.properties.spritename),1*objdata.properties.spritexoff,1*objdata.properties.spriteyoff,1*objdata.properties.spritewidth,1*objdata.properties.spriteheight,2,4);
     this.actor.sprite.x = objdata.x / 32;
     this.actor.sprite.y = objdata.y / 32;
     this.actor.initfromsprite();
     this.actor.sprite.x = this.actor.x - objdata.properties.xoff / 32;
     this.actor.sprite.y = this.actor.y - objdata.properties.yoff / 32;
     this.actor.r = .4;
//     this.actor.gravity = true;
     this.actor.vy = 1;
     this.actor.dynamic = true;
     this.actor.active = true;

     this.maxhp = objdata.properties.maxhp;
     this.hp = objdata.properties.startinghp;
     this.collect = objdata.properties.collect;

     this.mapdata = objdata;
     this.actor.mapcollisions = true;

     this.hasjumped = false;



     this.touchdamage = true;
     this.touchdps = 3;

     if(this.gravity == "false") this.actor.gravity = false;
   }

   this.tick = tick;
   function tick(dt){
      if(this.canattack && this.attackaccumulator < this.attacktime) this.attackaccumulator += this.attackspeed * dt;
   }

   this.walkeast = walkeast;
   function walkeast(){
     this.actor.spin = this.walkspeed;
     this.actor.sprite.action &= -4;
     this.actor.sprite.action |= 2;
   }

   this.walkwest = walkwest;
   function walkwest(){
     this.actor.spin = - this.walkspeed;
     this.actor.sprite.action &= -4;
     this.actor.sprite.action |= 3;
   }

   this.right = right;
   function right(){
     if(this.canfly){
       this.actor.vx += this.actor.dt * this.flyacc;
     }
   }

   this.left = left;
   function left(){
     if(this.canfly){
       this.actor.vx -=  this.actor.dt * this.flyacc;
     }
   }

   this.up = up;
   function up(){
     this.actor.vy -=  this.actor.dt * this.flyacc;
   }

   this.down = down;
   function down(){
     this.actor.vy +=  this.actor.dt * this.flyacc;
   }

   this.gainexp = gainexp;
   function gainexp(xp){
     this.xp += xp;
     this.expbounty += xp;
     if(this.level < this.maxlevel && this.xp >= this.xptonext) this.levelup();
   }

   this.levelup = levelup;
   function levelup(){
     this.xp -= this.xptonext;
     this.level += 1;
     var k = Npcs[this.type].levels[this.level];
     for(var i in k){
       this[i] = k[i];
     }
     if(this.r !== undefined) this.actor.r = this.r;
     if(this.mass !== undefined) this.actor.mass = this.mass;
     if(this.spritexoff !== undefined) this.actor.sprite.xoff = this.spritexoff*1;
     if(this.spriteyoff !== undefined) this.actor.sprite.yoff = this.spriteyoff*1;
     if(this.xoff !== undefined) this.actor.sprite.x -= this.xoff / 64;
     if(this.yoff !== undefined) this.actor.sprite.y += this.yoff / 64;
   }

   this.stopwalk = stopwalk;
   function stopwalk(){
     this.actor.spin = 0;
     this.actor.sprite.action &= -3;
   }

   this.seek = seek;
   function seek(x,y){
     dx = x - this.actor.x;
     dy = y - this.actor.y;
     this.actor.vx *= .9;
     this.actor.vy *= .9;
     l = dx*dx + dy * dy;
     if(l != 0){
       l = Math.sqrt(l);
       dx /= l;
       dy /= l;
       this.actor.vx += dx * this.flyacc * this.actor.dt;
       this.actor.vy += dy * this.flyacc * this.actor.dt;
     }
   }

   this.jump = jump;
   function jump(){
     if(!this.hasjumped && (this.actor.ynormal != 0 || this.actor.xnormal != 0)){
     this.actor.vx -= this.actor.xnormal * (this.jumpspeed);
     this.actor.vy -= this.actor.ynormal * (this.jumpspeed);
     this.hasjumped = true;
     }
   }

   this.resetjump = resetjump;
   function resetjump(){
     this.hasjumped = false;
   }

   this.heal = heal;
   function heal(amount){
     this.hp += amount;
     if(this.hp > this.maxhp) this.hp = this.maxhp;
   }

   this.hurt = hurt;
   function hurt(amount,origin){
     this.hp -= amount;
     if(this.hp < 0) this.die(origin);
   }

   this.die = die;
   function die(killer){
     killer.score += this.killbounty*1;
     killer.killbounty *= 1;
     killer.killbounty += this.killbounty*1.5;
     killer.gainexp(this.xpbounty*1);
     this.active = false;
     this.actor.active = false;
     this.actor.sprite.active = false;
     this.actor.sprite.visible = false;
   }

   this.getmana = getmana;
   function getmana(amount){
     this.mana += amount;
   }

 }

 this.Actor = Actor;
 this.Sprite = Sprite;
 this.Character = Character;
 return {
   Actor: this.Actor,
   Sprite: this.Sprite,
   Character: this.Character
 }
});
