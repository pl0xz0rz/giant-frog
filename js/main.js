require.config({
  paths: {
    "jquery": "//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min",
    "game": "src/game",
    "actor": "src/actor",
    "world": "src/world",
    "menu": "src/menu",
    "gameloop": "src/gameloop",
    "gamestate": "src/gamestate",
    "player": "src/player",
    "levelset": "src/levelset",
    "npcs": "src/npcs",
    "fly": "src/fly"
  }
});

require([
  "jquery",
  "game",
  "menu",
  "gameloop",
  "gamestate",
  "levelset"
], function (
  $,
  Game,
  Menu,
  Gameloop,
  Gamestate,
  Levelset
){

  var kbMap = new Array(256);
  var mouseUpMap = new Array(5);

  Menu.menuList[0] = introMenu;
  Menu.menuList[1] = hra;
  Menu.menuList[2] = instructions;
  Menu.menuList[3] = loseScreen;
  Menu.menuList[5] = winScreen;
  Menu.menuList[6] = loadingScreen;
  Menu.menuList[7] = endCredits;

  $(document).ready(function(){
  	$(window).keydown(function(event){
  		kbMap[event.which] = true; Gameloop.kbMap[event.which] = true;
  	}).keyup(function(event){
      kbMap[event.which] = false;  		Gameloop.kbMap[event.which] = false;
  	}).mousemove(function(event){
  		xmouse = event.clientX - maincanvas.offsetLeft;
  		ymouse = event.clientY - maincanvas.offsetTop;
  	}).mouseup(function(event){
  		mouseUpMap[event.button] = true; Gameloop.mouseUpMap[event.button] = true;
  	});
    $(".button0").click(function(){
      Menu.switchScr(0);
      return false;
    });
    $(".button1").click(function(){
      Menu.switchScr(1);
      return false;
    });
    $(".button2").click(function(){
      Menu.switchScr(2);
      return false;
    });
    $(".muteButton").click(function(){
      Sounds.mute();
      return false;
    });
    $(".buttonback").click(function(){
      Menu.moveBack();
      return false;
    });
    $(".newgame").click(function(){
      Gamestate.level = 0;
      Gamestate.score = [];
      gg.init(Levelset.levels[Gamestate.level].name);
      return false;
    });
    $(".buttoncontinue").click(function(){
      gg.init(Levelset.levels[Gamestate.level].name);
      return false;
    });
    var maincanvas = document.getElementById("maincanvas");;
    var gg = new Game.Game(maincanvas)
    Menu.switchScr(0);
    var playtime = 0;
  	Gameloop.loop(gg);
  	cinterval = setInterval(function(){if(!Gamestate.paused){++ playtime;/*playtimespan.innerHTML = playtime*/}},1000);
  });
});
