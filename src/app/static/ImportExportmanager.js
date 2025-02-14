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
          const fileContent = event.target.result;

          try {
              const theory1Match = fileContent.match(/Theory1 Data:\n([\s\S]*?)\n\nTheory2 Data:/);
              const theory2Match = fileContent.match(/Theory2 Data:\n([\s\S]*)/);

              if (theory1Match && theory2Match) {
                  this.theory1 = JSON.parse(theory1Match[1]);
                  this.theory2 = JSON.parse(theory2Match[1]);

                  console.log("Import successful!", this.theory1, this.theory2);
                  resolve(); // Zavolá sa, keď import skončí
              } else {
                  console.error("Invalid file format.");
                  reject("Invalid file format.");
              }
          } catch (error) {
              console.error("Error parsing file:", error);
              reject(error);
          }
      };

      reader.readAsText(file);
  });
}
  
    exportGraph() {
      // Konverzia údajov na textový formát
      const theory1Data = JSON.stringify(this.theory1, null, 2); // Krásne formátovaný JSON
      const theory2Data = JSON.stringify(this.theory2, null, 2);
      
      const fileContent = `Theory1 Data:\n${theory1Data}\n\nTheory2 Data:\n${theory2Data}`;
      
      // Vytvorenie Blob objektu
      const blob = new Blob([fileContent], { type: "text/plain" });
  
      // Vytvorenie odkazu na stiahnutie
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "graph_export.txt"; // Názov súboru
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      console.log("Export Graph: File generated and downloaded");
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


  exportTEXT(graph) {
    if (!graph || graph.length === 0) {
      console.error("Graph is empty or undefined.");
      return;
    }
  
    console.log("Exporting graph to text file...");
  
    let textData = "Graph Export\n\nNodes:\n";
  
    // Spracovanie uzlov
    graph.forEach(element => {
      if (element.data.source && element.data.target) {
        textData += `Edge: ${element.data.source} -> ${element.data.target}\n`;
      } else {
        textData += `Node: ${element.data.id} (Label: ${element.data.label || "N/A"})\n`;
      }
    });
  
    // Vytvorenie Blob objektu
    const blob = new Blob([textData], { type: "text/plain" });
  
    // Vytvorenie odkazu na stiahnutie
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "graph_export_text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  }

export default ImportExportManager;