define({
  menuList: [],
  menuhistory: [],
  l:0,

  switchScr: function(to){
    if(this.l>0) this.menuList[this.menuhistory[this.l-1]].style.display = "none";
    this.menuhistory.push(to);
    this.menuList[to].style.display = "block";
    this.l++;
  },
  moveBack: function(){
    if(this.l <= 1) return true;
    if(this.menuhistory[this.l-1] === 1) return true;
    this.menuList[this.menuhistory.pop()].style.display = "none";
    this.menuList[this.menuhistory[this.l-2]].style.display = "block";
    this.l--;
    return false;
  }
})
