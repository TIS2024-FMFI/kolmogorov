const fileInput = document.getElementById('file-input');
const selectFileBtn = document.getElementById('select-file-btn');
const submitFileBtn = document.getElementById('submit-file-btn');
const selectSetMmBtn = document.getElementById('select-set-mm-btn');
const selectPartAbMmBtn = document.getElementById('select-part-ab-mm-btn');
const errorMsg = document.getElementById('error-message');
const succMsg = document.getElementById('success-message');
const fileDetails = document.getElementById('file-details');
const dragAndDropArea = document.getElementById('drag-and-drop-area');


let loadingInterval;


// Handle "Select File" button click
selectFileBtn.addEventListener('click', () => {
  fileInput.click();
});

// Display uploaded file details
const updateFileDetails = (file) => {
  if (file) {
    if (file.name.endsWith('.mm')) {
      fileDetails.textContent = `Selected file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
      errorMsg.classList.remove('active');
    } else {
      fileDetails.textContent = 'No file selected.';
      errorMsg.textContent = 'Wrong file format. Please upload a .mm file!';
      errorMsg.classList.add('active');
    }
  } else {
    fileDetails.textContent = 'No file selected.';
  }
};

// File input change event
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  updateFileDetails(file);
});

// Drag-and-drop functionality
dragAndDropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dragAndDropArea.classList.add('dragging');
});

dragAndDropArea.addEventListener('dragleave', () => {
  dragAndDropArea.classList.remove('dragging');
});

dragAndDropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dragAndDropArea.classList.remove('dragging');
  const file = e.dataTransfer.files[0];
  fileInput.files = e.dataTransfer.files; // Sync file input with dropped file
  updateFileDetails(file);
});


let dotCount = 0;
const maxDots = 3;

function animateDots() {
  dotCount = (dotCount + 1) % (maxDots + 1);
  const dots = '.'.repeat(dotCount);
  succMsg.textContent = `Parsing database, please wait${dots}`;
}

// Submit button click event
submitFileBtn.addEventListener('click', () => {
  const file = fileInput.files[0];

  if (!file) {
    errorMsg.textContent = 'No file selected. Please upload a file first!';
    errorMsg.classList.add('active');
    return;
  }

  if (!file.name.endsWith('.mm')) {
    errorMsg.textContent = 'Wrong file format. Please upload a .mm file!';
    errorMsg.classList.add('active');
    return;
  }

  errorMsg.classList.remove('active');
  succMsg.classList.add('active');
  const dotAnimationInterval = setInterval(animateDots, 500);

  const formData = new FormData();
  formData.append('file', file);

  fetch('/upload', {
    method: 'POST',
    body: formData,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('File uploaded successfully:', data);
      if (data.message === 'File uploaded successfully') {
        succMsg.classList.remove('active');
        clearInterval(dotAnimationInterval);
        // Redirect to the theory page
        window.location.href = '/upload';
      } else {
        alert('Unexpected response from server.');
      }
    })
    .catch(error => {
      console.error('There was a problem with the file upload:', error);
      clearInterval(dotAnimationInterval);
      alert('Failed to upload file. Please try again.');
    });
});

// Handle "Select set.mm" button click
selectSetMmBtn.addEventListener('click', () => {
  fetch('static/set.mm')
    .then(response => response.blob())
    .then(blob => {
      const file = new File([blob], 'set.mm', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      updateFileDetails(file);
    });
});

// Handle "Select part_ab.mm" button click
selectPartAbMmBtn.addEventListener('click', () => {
  fetch('static/part_ab.mm')
    .then(response => response.blob())
    .then(blob => {
      const file = new File([blob], 'part_ab.mm', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      updateFileDetails(file);
    });
});