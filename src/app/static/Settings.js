class Settings {
    constructor() {
      this.depth = 0; 
      this.showAllEdges = false; 
      this.showEquivalentTheorems = false; 
    }
  
    getDepth() {
      return this.depth;
    }
  
    setDepth(newDepth) {
    }
  
    toggleShowAllEdges() {
      return this.showAllEdges;
    }
  
    toggleShowEquivalentTheorems() {
      return this.showEquivalentTheorems;
    }
  }