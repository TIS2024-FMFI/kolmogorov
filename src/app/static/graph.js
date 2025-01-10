import TheoryHandler from './TheoryHandler.js';

class GraphApp {
    constructor() {
        this.theoryHandler = new TheoryHandler();
        this.loadAndLogTheories();
    }

    loadAndLogTheories() {
        // Log raw localStorage data
        console.log('Raw localStorage data:');
        console.log('Theory 1:', localStorage.getItem('theory1'));
        console.log('Theory 2:', localStorage.getItem('theory2'));

        // Log parsed theories from TheoryHandler with full statement details
        const theories = this.theoryHandler.getTheories();
        console.log('Full Theory 1 statements:', theories.theory1);
        console.log('Full Theory 2 statements:', theories.theory2);
        
        // Log just IDs for quick reference
        console.log('Theory 1 IDs:', theories.theory1.map(s => s.id));
        console.log('Theory 2 IDs:', theories.theory2.map(s => s.id));

        // Log example of complete statement structure if theories aren't empty
        if (theories.theory1.length > 0) {
            console.log('Example statement structure:', {
                id: theories.theory1[0].id,
                description: theories.theory1[0].description,
                proof: theories.theory1[0].proof,
                type: theories.theory1[0].type,
                referencedBy: theories.theory1[0].referencedBy,
                provedFrom: theories.theory1[0].provedFrom
            });
        }
    }

    // Method to clear theories if needed
    clearTheories() {
        this.theoryHandler.clearTheories();
        console.log('Theories cleared from localStorage');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new GraphApp();
});
