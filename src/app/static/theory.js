// State to track selected theory
let selectedTheory = 'theory-1';

// Elements
const statementInput = document.getElementById('statement-input');
const addStatementBtn = document.getElementById('add-statement-btn');
const theory1 = document.getElementById('theory-1');
const theory2 = document.getElementById('theory-2');
const content1 = document.getElementById('content-1');
const content2 = document.getElementById('content-2');

// Utility function to set the selected theory
function selectTheory(theoryId) {
  selectedTheory = theoryId;

  // Update UI
  theory1.classList.remove('selected');
  theory2.classList.remove('selected');

  if (theoryId === 'theory-1') {
    theory1.classList.add('selected');
  } else if (theoryId === 'theory-2') {
    theory2.classList.add('selected');
  }
}

// Event listeners for selecting theory
theory1.addEventListener('click', () => selectTheory('theory-1'));
theory2.addEventListener('click', () => selectTheory('theory-2'));

// Event listener for adding a statement
addStatementBtn.addEventListener('click', () => {
  const input = statementInput.value.trim();

  if (input === '') {
    alert('Please enter a statement.');
    return;
  }
  fetch('/get_statement', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ label: input })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      alert(data.error);
    } else {
      // Create a new element to display the statement
      const statementEl = document.createElement('div');
      statementEl.innerHTML = `<p>Statement: ${data.statement}</p>`;
      statementEl.style.borderBottom = '1px solid #dee2e6';
      statementEl.style.padding = '5px';

      // Append to the selected theory content
      if (selectedTheory === 'theory-1') {
        content1.appendChild(statementEl);
      } else if (selectedTheory === 'theory-2') {
        content2.appendChild(statementEl);
      }
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Failed to fetch statement.');
  });

  statementInput.value = '';
  
  // // Create a new statement element
  // const statementEl = document.createElement('div');
  // statementEl.innerHTML = `<p>${input}</p>`;
  // statementEl.style.borderBottom = '1px solid #dee2e6';
  // statementEl.style.padding = '5px';

  // // Append to the selected theory content
  // if (selectedTheory === 'theory-1') {
  //   content1.appendChild(statementEl);
  // } else if (selectedTheory === 'theory-2') {
  //   content2.appendChild(statementEl);
  // }

  // // Clear input field
  // statementInput.value = '';
});

// Default to Theory 1 being selected
selectTheory('theory-1');
