import { FileUploadHandler } from './FileUploadHandler.js';
import { UIStateManager } from './UIStateManager.js';
import { BackendAdapter } from './BackendAdapter.js';

class WelcomeApp {
  constructor() {
    this.initializeElements();
    this.backendAdapter = new BackendAdapter();
    this.uiManager = new UIStateManager(this.elements);
    this.setupFileUploader();
    this.setupEventListeners();
  }

  initializeElements() {
    this.elements = {
      fileInput: document.getElementById('file-input'),
      selectFileBtn: document.getElementById('select-file-btn'),
      submitFileBtn: document.getElementById('submit-file-btn'),
      selectSetMmBtn: document.getElementById('select-set-mm-btn'),
      errorMsg: document.getElementById('error-message'),
      succMsg: document.getElementById('success-message'),
      fileDetails: document.getElementById('file-details'),
      dragAndDropArea: document.getElementById('drag-and-drop-area')
    };
  }

  setupFileUploader() {
    this.fileUploader = new FileUploadHandler({
      fileInput: this.elements.fileInput,
      dragDropArea: this.elements.dragAndDropArea,
      onFileSelect: (file) => this.onFileSelect(file),  // Changed from handleFileSelect
      validateFile: (file) => file && file.name.endsWith('.mm')
    });
  }

  setupEventListeners() {
    this.elements.selectFileBtn.addEventListener('click', () => 
      this.elements.fileInput.click());
    this.elements.submitFileBtn.addEventListener('click', () => 
      this.handleFileSubmit());
    this.elements.selectSetMmBtn.addEventListener('click', () => 
      this.handleSetMmSelect());
  }

  // New method to handle file selection
  onFileSelect(file) {
    this.uiManager.updateFileDetails(file);
  }

  async handleFileSubmit() {
    const file = this.elements.fileInput.files[0];
    if (!this.uiManager.updateFileDetails(file)) return;

    try {
      await this.parseFile(file);
    } catch (error) {
      this.uiManager.showError(error.message);
    }
  }

  async parseFile(file) {
    this.uiManager.startParsingAnimation();
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await this.backendAdapter.parseFile(formData);
      
      if (response.success) {
        window.location.href = '/theory';
      } else {
        throw new Error(response.message);
      }
    } finally {
      this.uiManager.stopParsingAnimation();
    }
  }

  async handleSetMmSelect() {
    this.elements.fileDetails.textContent = 'Selected file: set.mm';
    this.uiManager.hideError();
    
    try {
      this.uiManager.startParsingAnimation();
      const response = await this.backendAdapter.parseSetMm();

      if (response.success) {
        window.location.href = '/theory';
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      this.uiManager.showError(`Error: ${error.message}`);
    } finally {
      this.uiManager.stopParsingAnimation();
    }
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new WelcomeApp();
});