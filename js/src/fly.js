define(function(){

  function fly(){

    this.eps = .1;

    this.path = null;
    this.currentnode = 0;
    this.pathlength = 0;

    this.act = act;
    function act(world){
      this.patrol();
    }

    this.patrol = patrol;
    function patrol(){
      var n = this.path.polygon[this.currentnode];
      var a = this.npc.actor;
      var x = (this.path.x + n.x) / 32;
      var y = (this.path.y + n.y) / 32;
      this.npc.seek(x,y);
      var dx = a.x - x;
      var dy = a.y - y;
      if(dx * dx + dy * dy < this.eps){
        this.currentnode += 1;
        if(this.currentnode >= this.pathlength) this.currentnode -= this.pathlength;
      }
    }

  };
  this.fly = fly;
  return {
    fly: this.fly
  }

})
