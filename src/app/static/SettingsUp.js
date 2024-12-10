class SettingsUp extends Settings {
    constructor() {
      super(); 
      this.axiomsMustBeSpecified = false;
      this.showOnlyCommon = false; 
      this.otherStartpoints = false; 
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