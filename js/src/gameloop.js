define([
  "gamestate",
  "world",
  "actor"
],function(
  Gamestate,
  World,
  Actor
){
  this.kbMap = new Array(256);
  this.xmouse = 0;
  this.ymouse = 0;
  this.mouseUpMap = new Array(5);
  function aiLoop(game){
  	if(game.protagonist.hp > 0 && Gamestate.endcondition === 0){

      game.protagonist.stopwalk();
  	  if(this.kbMap['D'.charCodeAt(0)] || this.kbMap[39]) {game.protagonist.walkeast();game.protagonist.right()}
  	  if(this.kbMap['A'.charCodeAt(0)] || this.kbMap[37]) {game.protagonist.walkwest();game.protagonist.left()}
      if(this.kbMap['W'.charCodeAt(0)] || this.kbMap[38]) {game.protagonist.jump(); game.protagonist.up()} else {game.protagonist.resetjump()}
      if(this.kbMap['S'.charCodeAt(0)] || this.kbMap[40]) {game.protagonist.down(); }

      if(this.kbMap['R'.charCodeAt(0)]) {game.protagonist.hp = 0; }

      if(game.protagonist.actor.finishlevel) Gamestate.endcondition = 2;

    }

    for(i in game.bots){
      game.bots[i].act();
    }

  }

  function loop(game){
   if(Gamestate.active && !Gamestate.paused){

      game.draw();

      aiLoop(game);
      game.world.tick();

      if(game.protagonist.hp <= 0) Gamestate.endcondition = 1;

      if(game.gameoverTimer > 0) game.gameoverTimer--;
      if((Gamestate.endcondition !== 0) && (game.gameoverTimer < 0)) {game.gameoverTimer = 100;console.log(Gamestate)};
      if(game.gameoverTimer == 0) game.end();

     }
     t=setTimeout(function(){this.loop(game)},18);
    }
    this.loop = loop;
  return{
    loop: this.loop,
    kbMap: this.kbMap,
    xmouse: this.xmouse,
    ymouse: this.ymouse,
    mouseUpMap: this.mouseUpMap
  }
});
