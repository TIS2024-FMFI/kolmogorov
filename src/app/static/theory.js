import { BackendAdapter } from './BackendAdapter.js';
import Statement from './Statement.js';
import TheoryHandler from './TheoryHandler.js';

class TheoryApp {
    constructor() {
        this.backendAdapter = new BackendAdapter();
        this.theoryHandler = new TheoryHandler();
        this.selectedTheory = 'theory-1';
        this.initializeElements();
        this.setupEventListeners();
        this.loadExistingTheories();
    }

    initializeElements() {
        this.elements = {
            statementInput: document.getElementById('statement-input'),
            addStatementBtn: document.getElementById('add-statement-btn'),
            theory1: document.getElementById('theory-1'),  // Get existing elements
            theory2: document.getElementById('theory-2'),  // instead of creating new ones
            content1: document.getElementById('content-1'),
            content2: document.getElementById('content-2'),
            visualizeBtn: document.getElementById('visualize-btn')
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
        this.elements.visualizeBtn.addEventListener('click', () => {
            window.location.href = '/graph';
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
        const theoryNumber = this.selectedTheory === 'theory-1' ? 1 : 2;
        const theories = this.theoryHandler.getTheories();
        const theory = theoryNumber === 1 ? theories.theory1 : theories.theory2;
        const otherTheory = theoryNumber === 1 ? theories.theory2 : theories.theory1;
        
        // Check for duplicates in both theories
        if (theory.some(s => s.id === statement.id)) {
            alert('This statement is already in this theory!');
            return;
        }
        if (otherTheory.some(s => s.id === statement.id)) {
            alert('This statement is already in the other theory!');
            return;
        }

        try {
            // Use TheoryHandler to add and save the statement
            this.theoryHandler.addStatementToTheory(statement, theoryNumber);

            // Log statements from both theories
            const updatedTheories = this.theoryHandler.getTheories();
            console.log('Theory 1 statements:', updatedTheories.theory1.map(s => s.id));
            console.log('Theory 2 statements:', updatedTheories.theory2.map(s => s.id));

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

        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    removeStatementFromTheory(statementId, element) {
        const theoryNumber = element.closest('#content-1') ? 1 : 2;
        const theories = this.theoryHandler.getTheories();
        const theory = theoryNumber === 1 ? theories.theory1 : theories.theory2;
        
        // Remove from TheoryHandler
        const index = theory.findIndex(s => s.id === statementId);
        if (index > -1) {
            theory.splice(index, 1);
            this.theoryHandler.saveTheories();
            
            // Remove element from DOM
            element.remove();

            // Log updated theories
            const updatedTheories = this.theoryHandler.getTheories();
            console.log('Theory 1 statements:', updatedTheories.theory1.map(s => s.id));
            console.log('Theory 2 statements:', updatedTheories.theory2.map(s => s.id));

            // Add placeholder if theory is empty
            const contentElement = element.closest('#content-1') ? this.elements.content1 : this.elements.content2;
            if (!contentElement.children.length) {
                contentElement.innerHTML = '<div class="placeholder-text">No statements added yet</div>';
            }
        }
    }

    loadExistingTheories() {
        const theories = this.theoryHandler.getTheories();
        
        // Load Theory 1
        if (theories.theory1.length > 0) {
            this.elements.content1.innerHTML = ''; // Clear placeholder
            theories.theory1.forEach(statement => {
                this.createStatementElement(statement, this.elements.content1);
            });
        }

        // Load Theory 2
        if (theories.theory2.length > 0) {
            this.elements.content2.innerHTML = ''; // Clear placeholder
            theories.theory2.forEach(statement => {
                this.createStatementElement(statement, this.elements.content2);
            });
        }
    }

    createStatementElement(statement, container) {
        const statementEl = document.createElement('div');
        statementEl.className = 'statement-item p-3 border-bottom';
        statementEl.innerHTML = `
            <strong>${statement.id}</strong>
            <p class="mb-0 text-muted">${statement.description}</p>
        `;

        statementEl.addEventListener('dblclick', () => {
            this.removeStatementFromTheory(statement.id, statementEl);
        });

        statementEl.style.cursor = 'pointer';
        statementEl.title = 'Double-click to remove';

        container.appendChild(statementEl);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new TheoryApp();
}); 