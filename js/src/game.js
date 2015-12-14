define([
  "jquery",
  "world",
  "actor",
  "gamestate",
  "menu",
  "player",
  "levelset",
  "fly"
],function(
  $,
  World,
  Actor,
  Gamestate,
  Menu,
  Player,
  Levelset,
  Fly
){

  var maps = {};

  function Game(canvas){

    this.mapurl="";
    this.world = new World.world();
    this.gameoverTimer = -1;
    this.levelname = "";

    this.p1 = new Player.player();

    this.score = 0;
    this.timer = 0;
    this.powerups = 0;
    this.kills = 0;
    this.keystrokes = 0;
    this.levelid = 0;

    this.bots = [];

    this.drawcontext=canvas.getContext("2d");
    console.log(canvas);
    console.log(this.drawcontext);
    this.drawcontext.font = "32px monospace";

    function draw(t){
      if(!this.world.map) {this.world.init(maps[this.mapurl],this.levelid);this.p1.world = this.world;this.p1.camera.ymax = this.world.map.height-1;this.p1.camera.xmax = this.world.map.width-1};
      if(!this.protagonist) for(i=0;i<this.world.characters.length;++i){
        if(this.world.characters[i].name === "Player") {this.protagonist = this.world.characters[i]; this.protagonist.actor.dt = this.world.dt;}
        else if (this.world.characters[i].type === "Fly"){
          var p = new Fly.fly();
          var q = this.world.map.layers[3].objects[this.world.characters[i].pathid];
          p.path = q;
          p.pathlength = p.path.polygon.length;
          p.npc = this.world.characters[i];
          p.npc.actor.dt = this.world.dt;
          this.bots.push(p);
        }
      }
      this.score = this.protagonist.score;
      var context = this.drawcontext;
      context.fillStyle = "#336666";
      context.fillRect(0,0,600,400);
      this.p1.camera.aim(this.protagonist.actor.x,this.protagonist.actor.y);
      this.world.draw(context,this.p1.camera);
      context.fillStyle = "#663300";
      context.fillText("HP: ",32,32);
      context.fillText("Score: ",32,64);
      context.fillText(this.score,160,64);
      context.fillStyle = "#ff0000";
      context.strokeRect(108,5,this.protagonist.maxhp * 10 + 5,33);
      context.fillRect(110,7,this.protagonist.hp * 10 + 1,29);
    }

    function init(levelname,levelid){

      this.world.map = null;
      this.protagonist = null;
      this.levelid = levelid;
      this.bots = [];
      var url = this.mapurl = "res/"+levelname+".json";
      if(!maps[this.mapurl]){
        Gamestate.active = false;
        Menu.switchScr(6);
        $.get(this.mapurl, {}, null,"json").done(function(data){
          maps[url] = data;
          Gamestate.active = true;
          Gamestate.endcondition = 0;
          Menu.switchScr(1);

        });
      } else {
        Gamestate.active = true;
        Gamestate.endcondition = 0;
        Menu.switchScr(1);

      }





      this.gameoverTimer = -1;


    }

    function end(){
      switch(Gamestate.endcondition){
        case 0:
         console.log("Huh?");
        break;
        case 1:
          Gamestate.active = 0;
          Menu.switchScr(3);
        break;
        case 2:
          Gamestate.active = 0;
          Gamestate.level += 1;
          Gamestate.score.push(this.protagonist.score);
          if(Gamestate.level < Levelset.length){
            Menu.switchScr(5);
          } else {
            document.getElementById("scorespan").innerHTML = Gamestate.score[0] + Gamestate.score[1];
            Menu.switchScr(7);
          }
        break;
      }

    }

    this.draw = draw;
    this.init = init;
    this.end = end;

  }

  this.Game = Game;

  return{
    Game: this.Game
  }

});
