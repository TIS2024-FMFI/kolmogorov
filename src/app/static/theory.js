import { BackendAdapter } from './BackendAdapter.js';
import Statement from './Statement.js';
import TheoryHandler from './TheoryHandler.js';
import ImportExportManager from './ImportExportmanager.js';

class TheoryApp {
    constructor() {
        this.backendAdapter = new BackendAdapter();
        this.theoryHandler = new TheoryHandler();
        this.selectedTheory = 'theory-1';
        this.searchTimeout = null;
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

        const searchInput = document.getElementById('statement-input');
        const suggestionsContainer = document.getElementById('search-suggestions');

        // Search input handler
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            const query = e.target.value.trim();

            // Hide suggestions if input is too short
            if (query.length < 2) {
                suggestionsContainer.style.display = 'none';
                return;
            }

            // Debounce search requests
            this.searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });

        // Import hendler ...................................................................................................
        
            const importBtn = document.getElementById("import-btn");
            const fileInput = document.getElementById("import-file");
          
            importBtn.addEventListener("click", () => {
              // Aktivuje input na výber súboru
              fileInput.click();
            });
          
            fileInput.addEventListener("change", async () => {  // Pridaj async
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    console.log("Selected file:", file);
            
                    const manager = new ImportExportManager(this.theoryHandler.theory1, this.theoryHandler.theory2);
            
                    try {
                        await manager.importTheory(file);  // Počká, kým sa import dokončí
            
                        this.theoryHandler.clearTheories();
                        this.theoryHandler.theory1 = manager.theory1;
                        this.theoryHandler.theory2 = manager.theory2;
                        this.theoryHandler.saveTheories();
            
                        console.log("manager.theory1:", manager.theory1);
                        console.log("manager.theory2:", manager.theory2);
            
                        // Presmerovanie až po dokončení importu
                         window.location.href = '/graph';
                    } catch (error) {
                        console.error("Import failed:", error);
                    }
                } else {
                    console.log("No file selected.");
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

    async performSearch(query) {
        const loadingSpinner = document.getElementById('search-loading');
        try {
            loadingSpinner.style.display = 'block';
            const response = await fetch(`/search/${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.success) {
                this.displaySuggestions(data.results);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    displaySuggestions(results) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        
        if (results.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        suggestionsContainer.innerHTML = results.map(result => `
            <div class="suggestion-item" data-label="${result.label}">
                <div class="suggestion-label">${result.label}</div>
                <div class="suggestion-description">
                    ${result.description ? result.description.substring(3) : 'No description available'}
                </div>
            </div>
        `).join('');

        suggestionsContainer.style.display = 'block';

        // Add click handlers for suggestions
        const suggestionItems = suggestionsContainer.getElementsByClassName('suggestion-item');
        Array.from(suggestionItems).forEach(item => {
            item.addEventListener('click', async () => {
                const label = item.dataset.label;
                document.getElementById('statement-input').value = label;
                suggestionsContainer.style.display = 'none';
                
                // Automatically add the statement
                try {
                    const statement = await this.backendAdapter.getStatement(label);
                    this.addStatementToTheory(statement);
                    this.elements.statementInput.value = '';
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            });
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new TheoryApp();
}); 