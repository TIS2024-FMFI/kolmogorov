import Settings from '../static/settings.js';

class SettingsDown extends Settings {
    constructor() {
      super();
      this.type = "down";
      this.otherStartpoints = true;
    }
  }

export default SettingsDown