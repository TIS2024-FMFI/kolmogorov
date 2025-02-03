import Settings from '../static/settings.js';

class SettingsUp extends Settings {
    constructor() {
      super(); 
      this.type = "up";
      this.showAxioms = true;
    }
  }

export default SettingsUp