import GraphMaster from './GraphMaster.js';

class ImportExportManager {
  constructor(theory1, theory2) {
    this.theory1 = theory1;
    this.theory2 = theory2;
}

importTheory(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
          try {
              const fileContent = event.target.result;
              const data = JSON.parse(fileContent); // Parsovanie JSON-u

              if (data.theory1 && data.theory2) {
                  this.theory1 = data.theory1;
                  this.theory2 = data.theory2;

                  console.log("Import successful!", this.theory1, this.theory2);
                  resolve(); // Zavolá sa, keď import skončí
              } else {
                  console.error("Invalid file format.");
                  reject("Invalid file format.");
              }
          } catch (error) {
              console.error("Error parsing JSON file:", error);
              reject(error);
          }
      };

      reader.readAsText(file);
  });
}
  
exportStatements() {
  // Konverzia údajov na JSON formát
  const data = {
      theory1: this.theory1,
      theory2: this.theory2
  };

  // Vytvorenie Blob objektu s JSON obsahom
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

  // Vytvorenie odkazu na stiahnutie
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "statements_export.json"; // Uloží sa ako .json
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  console.log("Export Statements: JSON file generated and downloaded");
}

  
  exportJPG(cy) {
    if (!cy) {
      console.error("Graph is not initialized.");
      return;
    }
    // Exportuje JPG s bielym pozadím
    const jpgData = cy.jpg({ output: 'blob', bg: 'white', full: 'true', quality: '1'});
  
    // Vytvorenie odkazu na stiahnutie
    const a = document.createElement('a');
    a.href = URL.createObjectURL(jpgData);
    a.download = 'graph.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }


  exportGraph(graph) {
    if (!graph || graph.length === 0) {
      console.error("Graph is empty or undefined.");
      return;
    }
  
    console.log("Exporting graph to text file...");
  
    let textData = "Graph Export\n\nNodes:\n";
  
    // Spracovanie uzlov
    let edges = [];
    graph.forEach(element => {
      if (element.data.source && element.data.target) {
        edges.push(element);
      } else {
        textData += `Node: ${element.data.id}\n`;
      }
    });
    edges.forEach(element => {
      textData += `Edge: ${element.data.source} -> ${element.data.target}\n`;
    });
  
    // Vytvorenie Blob objektu
    const blob = new Blob([textData], { type: "text/plain" });
  
    // Vytvorenie odkazu na stiahnutie
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "graph_export.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  }

export default ImportExportManager;