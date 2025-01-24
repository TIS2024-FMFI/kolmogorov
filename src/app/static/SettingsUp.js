import Settings from '../static/settings.js';

class SettingsUp extends Settings {
    constructor() {
      super(); 
      this.axiomsMustBeSpecified = false;
      this.showOnlyCommon = false; 
      this.otherStartpoints = false;
      this.type = "up";
    }

    toggleAxiomsMustBeSpecified() {
      return this.axiomsMustBeSpecified;
    }

    toggleShowOnlyCommon() {
      return this.showOnlyCommon;
    }
  
    toggleOtherStartpoints() {
      return this.otherStartpoints;
    }
  }

export default SettingsUp