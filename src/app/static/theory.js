import { BackendAdapter } from './BackendAdapter.js';
import Statement from './Statement.js';

class TheoryApp {
    constructor() {
        this.backendAdapter = new BackendAdapter();
        this.selectedTheory = 'theory-1';
        this.theory1 = [];
        this.theory2 = [];
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.elements = {
            statementInput: document.getElementById('statement-input'),
            addStatementBtn: document.getElementById('add-statement-btn'),
            theory1: document.getElementById('theory-1'),  // Get existing elements
            theory2: document.getElementById('theory-2'),  // instead of creating new ones
            content1: document.getElementById('content-1'),
            content2: document.getElementById('content-2')
        };

        // Add placeholder text if not already present
        if (!this.elements.content1.innerHTML.trim()) {
            this.elements.content1.innerHTML = '<div class="placeholder-text">No statements added yet</div>';
        }
        if (!this.elements.content2.innerHTML.trim()) {
            this.elements.content2.innerHTML = '<div class="placeholder-text">No statements added yet</div>';
        }

        // Select Theory 1 by default
        this.selectTheory('theory-1');
    }

    setupEventListeners() {
        this.elements.theory1.addEventListener('click', () => this.selectTheory('theory-1'));
        this.elements.theory2.addEventListener('click', () => this.selectTheory('theory-2'));
        this.elements.addStatementBtn.addEventListener('click', () => this.handleAddStatement());
        this.elements.statementInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddStatement();
            }
        });
    }

    selectTheory(theoryId) {
        this.selectedTheory = theoryId;
        this.elements.theory1.classList.remove('selected');
        this.elements.theory2.classList.remove('selected');
        this.elements[theoryId.replace('-', '')].classList.add('selected');
    }

    async handleAddStatement() {
        const input = this.elements.statementInput.value.trim();
        if (!input) {
            alert('Please enter a statement ID.');
            return;
        }

        try {
            const statement = await this.backendAdapter.getStatement(input);
            this.addStatementToTheory(statement);
            this.elements.statementInput.value = '';
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    addStatementToTheory(statement) {
        const theory = this.selectedTheory === 'theory-1' ? this.theory1 : this.theory2;
        const otherTheory = this.selectedTheory === 'theory-1' ? this.theory2 : this.theory1;
        
        // Check for duplicates in both theories
        if (theory.some(s => s.id === statement.id)) {
            alert('This statement is already in this theory!');
            return;
        }
        if (otherTheory.some(s => s.id === statement.id)) {
            alert('This statement is already in the other theory!');
            return;
        }

        // Add to theory array
        theory.push(statement);

        // Log statements from both theories
        console.log('Theory 1 statements:', this.theory1.map(s => s.id));
        console.log('Theory 2 statements:', this.theory2.map(s => s.id));

        // Create and add UI element
        const statementEl = document.createElement('div');
        statementEl.className = 'statement-item p-3 border-bottom';
        statementEl.innerHTML = `
            <strong>${statement.id}</strong>
            <p class="mb-0 text-muted">${statement.description}</p>
        `;

        // Add double-click handler for removal
        statementEl.addEventListener('dblclick', () => {
            this.removeStatementFromTheory(statement.id, statementEl);
        });

        // Add hover effect style
        statementEl.style.cursor = 'pointer';
        statementEl.title = 'Double-click to remove';

        // Add to correct theory content
        const contentElement = this.selectedTheory === 'theory-1' 
            ? this.elements.content1 
            : this.elements.content2;

        // Remove placeholder text if it exists
        const placeholder = contentElement.querySelector('.placeholder-text');
        if (placeholder) {
            contentElement.innerHTML = '';
        }

        contentElement.appendChild(statementEl);
    }

    removeStatementFromTheory(statementId, element) {
        const theory = element.closest('#content-1') ? this.theory1 : this.theory2;
        const theoryName = element.closest('#content-1') ? 'Theory 1' : 'Theory 2';
        
        // Remove from array
        const index = theory.findIndex(s => s.id === statementId);
        if (index > -1) {
            theory.splice(index, 1);
            
            // Remove element from DOM
            element.remove();

            // Log updated theories
            console.log('Theory 1 statements:', this.theory1.map(s => s.id));
            console.log('Theory 2 statements:', this.theory2.map(s => s.id));

            // Add placeholder if theory is empty
            const contentElement = element.closest('#content-1') ? this.elements.content1 : this.elements.content2;
            if (!contentElement.children.length) {
                contentElement.innerHTML = '<div class="placeholder-text">No statements added yet</div>';
            }

            // Optional: Show confirmation
            console.log(`Removed statement ${statementId} from ${theoryName}`);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new TheoryApp();
}); 