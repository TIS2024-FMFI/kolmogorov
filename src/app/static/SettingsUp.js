import Settings from '../static/settings.js';

class SettingsUp extends Settings {
    constructor() {
      super(); 
      this.type = "up";
      this.canBeProven = true;
    }

    getCanBeProven(){
      return this.canBeProven;
    }
  }

export default SettingsUp