export class FileUploadHandler {
  constructor(options) {
    this.fileInput = options.fileInput;
    this.dragDropArea = options.dragDropArea;
    this.onFileSelect = options.onFileSelect;
    this.validateFile = options.validateFile;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.dragDropArea.addEventListener('dragover', this.handleDragOver.bind(this));
    this.dragDropArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.dragDropArea.addEventListener('drop', this.handleDrop.bind(this));
    this.fileInput.addEventListener('change', this.handleFileChange.bind(this));
  }

  handleDragOver(e) {
    e.preventDefault();
    this.dragDropArea.classList.add('dragging');
  }

  handleDragLeave() {
    this.dragDropArea.classList.remove('dragging');
  }

  handleDrop(e) {
    e.preventDefault();
    this.dragDropArea.classList.remove('dragging');
    const file = e.dataTransfer.files[0];
    this.fileInput.files = e.dataTransfer.files;
    this.onFileSelect(file);
  }

  handleFileChange() {
    const file = this.fileInput.files[0];
    this.onFileSelect(file);
  }
} 