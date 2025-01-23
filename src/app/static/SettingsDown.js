import Settings from '../static/settings.js';

class SettingsDown extends Settings {
    constructor() {
      super();
      this.showAxioms = false; 
      this.showOnlyCommon = false; 
      this.shortestPossibleDistance = false; 
      this.type = "down";
    }
  
    toggleShowAxioms() {
      return this.showAxioms;
    }
  
    toggleShowOnlyCommon() {
      return this.showOnlyCommon;
    }
  
    toggleShortestPossibleDistance() {
      return this.shortestPossibleDistance;
    }
  }

export default SettingsDown