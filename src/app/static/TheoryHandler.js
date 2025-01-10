class TheoryHandler {
    constructor() {
      this.theory1 = [];
      this.theory2 = []; 
    }

    addStatementToTheory(statement, theoryNumber) {
        if (theoryNumber !== 1 && theoryNumber !== 2) {
            throw new Error('Invalid theory number');
        }

        const theory = theoryNumber === 1 ? this.theory1 : this.theory2;
        
        // Check if statement already exists in the theory
        if (theory.some(s => s.id === statement.id)) {
            throw new Error('Statement already exists in this theory');
        }

        theory.push(statement);
        return true;
    }
}

export { TheoryHandler };