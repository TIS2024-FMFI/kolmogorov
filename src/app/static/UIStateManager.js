export class UIStateManager {
  constructor(elements) {
    this.elements = elements;
    this.dotCount = 0;
    this.maxDots = 3;
    this.dotAnimationInterval = null;
  }

  updateFileDetails(file) {
    if (!file) {
      this.showNoFileSelected();
      return false;
    }

    if (!file.name.endsWith('.mm')) {
      this.showError('Wrong file format. Please upload a .mm file!');
      return false;
    }

    this.elements.fileDetails.textContent = 
      `Selected file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
    this.hideError();
    return true;
  }

  startParsingAnimation() {
    this.elements.errorMsg.classList.remove('active');
    this.elements.succMsg.classList.add('active');
    this.dotAnimationInterval = setInterval(() => {
      this.dotCount = (this.dotCount + 1) % (this.maxDots + 1);
      const dots = '.'.repeat(this.dotCount);
      this.elements.succMsg.textContent = `Parsing database, please wait${dots}`;
    }, 500);
  }

  stopParsingAnimation() {
    if (this.dotAnimationInterval) {
      clearInterval(this.dotAnimationInterval);
      this.dotAnimationInterval = null;
    }
    this.elements.succMsg.classList.remove('active');
  }

  showError(message) {
    this.elements.errorMsg.textContent = message;
    this.elements.errorMsg.classList.add('active');
  }

  hideError() {
    this.elements.errorMsg.classList.remove('active');
  }

  showNoFileSelected() {
    this.elements.fileDetails.textContent = 'No file selected.';
    this.showError('No file selected. Please upload a file first!');
  }
}