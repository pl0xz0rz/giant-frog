define([
  "jquery",
  "actor",
  "npcs"
], function(
  $,
  Actor,
  Npcs
){
  function world(){
    this.map = null;
    this.actors = [];
    this.props = [];
    this.ca = [];

    this.damagemap = [];
    this.impactmap = [];

    this.powerups = [];
    this.characters = [];

    this.projectiles = [];

    this.gravity = 9.8;
    this.drag = .001;
    this.dt = .018;  //magic numbers


    this.init = init;


    function init(map){
      this.actors = [];
      this.props = [];

      this.damagemap = [];
      this.impactmap = [];

      this.powerups = [];
      this.characters = [];
      this.projectiles = [];

      this.map = map;

      this.ca = this.map.layers[0].data.slice(0);

      for(var i=map.layers[1].objects.length-1;i>=0;--i){
        var p = new Actor.Character();
        var a = map.layers[1].objects[i];

        p.init(a);

        if(Npcs[p.type]){
          p.maxlevel = Npcs[p.type].maxlevel;
          var k=Npcs[p.type].levels[0];
          for(var i in k){
            p[i] = k[i];
          }
        }

        p.active = true;

        p.actor.sprite.visible = a.visible;
        p.actor.added = true;
        p.actor.world = this;

        this.characters.push(p);
        this.actors.push(p.actor);
        this.props.push(p.actor.sprite);
      }

    }

    this.hitblock = hitblock;
    function hitblock(m,v,id,lid){
      if(lid !== 0) return false;
      switch (this.ca[id]) {
        case 34:
          if(m*v*v > 100) this.ca[id] = 35;
        break;
      }
    }

    this.draw = draw;
    function draw(context,camera){
      this.drawmap(context,camera);
      this.drawprops(context,camera);
    }

    this.tick = tick;
    function tick(){
        for(var i=this.actors.length-1; i>=0;--i){
          this.actors[i].tick(this.dt);
          if(this.actors[i].gravity) this.actors[i].vy += this.gravity * this.dt;
          if(this.actors[i].drag) {
            this.actors[i].vx -= this.actors[i].vx * this.drag;
            this.actors[i].vx -= this.actors[i].vy * this.drag;
          }
        }
        for(var i=this.props.length-1; i>=0;--i){
          this.props[i].tick(this.dt);
        }
        for(var i=this.characters.length-1; i>=0;--i){
          this.characters[i].tick(this.dt);
          if(this.characters[i].actor.y > this.map.height) this.characters[i].hp = 0;
        }
        for(var i=this.projectiles.length-1; i>=0;--i){
          this.projectiles[i].tick(this.dt);
        }
        this.mapcollisions();
        this.unitcollisions();

    }

    this.drawmap = drawmap;
    function drawmap(context,camera){
      var m = this.map;
      $.each(m.layers,function(ln,layer){
        if(ln !== 0 && layer.type === "tilelayer"){
        for(var i=0;i<camera.sw;++i){
          for(var j=0;j<camera.sh;++j){
              var c = layer.data[i + camera.x + (j + camera.y) * layer.width];
              if(c != 0){
              c -= 1;
              var t=0;
              if(c >= 1024){c -= 1024; t = 1};
              var tx = c % (m.tilesets[t].imagewidth / 32);
              var ty = Math.floor(c / (m.tilesets[t].imagewidth / 32));
              var ts = document.getElementById(m.tilesets[t].name);
              context.drawImage(ts,tx*32,ty*32,m.tilesets[t].tilewidth,m.tilesets[t].tileheight,
                                          Math.floor(i * camera.tw - camera.xoff),
                                          Math.floor(j * camera.th - camera.yoff),
                                          camera.tw,
                                          camera.th);
                                        }
            }
          }
        }
      });
      for(var i=0;i<camera.sw;++i){
        for(var j=0;j<camera.sh;++j){
            var c = this.ca[i + camera.x + (j + camera.y) * this.map.width];
            if(c != 0){
            c -= 1;
            var t=0;
            if(c >= 1024){c -= 1024; t = 1};
            var tx = c % (m.tilesets[t].imagewidth / 32);
            var ty = Math.floor(c / (m.tilesets[t].imagewidth / 32));
            var ts = document.getElementById(m.tilesets[t].name);
            context.drawImage(ts,tx*32,ty*32,m.tilesets[t].tilewidth,m.tilesets[t].tileheight,
                                        Math.floor(i * camera.tw - camera.xoff),
                                        Math.floor(j * camera.th - camera.yoff),
                                        camera.tw,
                                        camera.th);
                                      }
          }
        }

    }

    this.drawprops = drawprops;
    function drawprops(context,camera){
      for(var i=this.props.length-1; i>=0;--i){
        this.props[i].draw(context,camera);
      }
    }

    this.mapcollisions = mapcollisions;
    function mapcollisions(){
      for(var i=this.actors.length-1; i>=0;--i){
        this.actors[i].mapcollision(this.ca,this.map.width,0);
        this.actors[i].mapcollision(this.map.layers[2].data,this.map.width,2);
      }
    }

    this.unitcollisions = unitcollisions;
    function unitcollisions(){
      for(var i=this.characters.length-1; i>=0;--i){
          if(!this.characters[i].active) continue;
          if(this.characters[i].touchdamage){
            for(var j=this.characters.length-1; j>i;--j){
              if(!this.characters[j].active) continue;
              var a = this.characters[i];
              var b = this.characters[j];
              var dx = a.actor.x - b.actor.x;
              var dy = a.actor.y - b.actor.y;
              var d = a.actor.r * 1 + b.actor.r * 1;
              if(dx * dx + dy * dy < d * d) {
                b.hurt(a.touchdps * this.dt,a);
                if(b.touchdamage) a.hurt(b.touchdps * this.dt,b);
              }
            }
          }
      }
    }


 }
 this.world = world;
 return {
   world: this.world
 }
});
