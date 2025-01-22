class Statement {
  constructor(jsonData = {}) {
    if (typeof jsonData !== "object" || jsonData === null) {
      throw new Error("Invalid input: jsonData must be an object.");
    }

    this.id = jsonData.id || null;
    this.description = typeof jsonData.description === 'string' && jsonData.description.length >= 2
      ? jsonData.description.substring(2).trim()
      : "No description available.";
    this.proof = Array.isArray(jsonData.proof) ? jsonData.proof : [];
    this.type = jsonData.type || "unknown";
    this.referencedBy = Array.isArray(jsonData.referencedBy) ? jsonData.referencedBy : [];
    this.provedFrom = Array.isArray(jsonData.provedFrom) ? jsonData.provedFrom : [];
  }

  toJSON() {
    return {
      id: this.id,
      description: this.description,
      proof: this.proof,
      type: this.type,
      referencedBy: this.referencedBy,
      provedFrom: this.provedFrom
    };
  }
}

export default Statement;