class Statement {
    constructor(data) {
      this.id = data.id || null; 
      this.name = data.name || ""; 
      this.description = data.description || ""; 
      this.type = data.type || ""; 

      this.additionalProperties = { ...data }; 
    }
  }
  
  