class TheoryHandler {
    constructor() {
        this.theory1 = [];
        this.theory2 = [];
        //IN CASE OF GETTING ERROR FROM BAD MANIPULATION WITH IMPORT BUTTON UNCOMMENT THIS CODE
        //this.clearTheories();
        //this.saveTheories();
        this.loadTheories(); // Load theories when instantiated
    }

    addStatementToTheory(statement, theoryNumber) {
        if (theoryNumber !== 1 && theoryNumber !== 2) {
            throw new Error('Invalid theory number');
        }

        const theory = theoryNumber === 1 ? this.theory1 : this.theory2;
        const otherTheory = theoryNumber === 1 ? this.theory2 : this.theory1;
        
        // Check both theories for duplicates
        if (theory.some(s => s.id === statement.id)) {
            throw new Error('Statement already exists in this theory');
        }
        if (otherTheory.some(s => s.id === statement.id)) {
            throw new Error('Statement already exists in the other theory');
        }

        theory.push(statement);
        this.saveTheories();
        return true;
    }

    saveTheories() {
        localStorage.setItem('theory1', JSON.stringify(this.theory1));
        localStorage.setItem('theory2', JSON.stringify(this.theory2));
    }

    loadTheories() {
        try {
            const theory1Data = localStorage.getItem('theory1');
            const theory2Data = localStorage.getItem('theory2');
            if(theory1Data != null || theory2Data != null){
                this.theory1 = theory1Data ? JSON.parse(theory1Data) : [];
                this.theory2 = theory2Data ? JSON.parse(theory2Data) : [];
            }
        } catch (error) {
            console.error('Error loading theories:', error);
            this.theory1 = [];
            this.theory2 = [];
        }
    }

    clearTheories() {
        this.theory1 = [];
        this.theory2 = [];
        localStorage.removeItem('theory1');
        localStorage.removeItem('theory2');
    }

    getTheories() {
        return {
            theory1: this.theory1,
            theory2: this.theory2
        };
    }
}

export default TheoryHandler;