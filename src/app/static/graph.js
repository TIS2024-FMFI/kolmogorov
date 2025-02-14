import GraphMaster from './GraphMaster.js';
import ImportExportManager from './ImportExportmanager.js';
import TheoryHandler from './TheoryHandler.js';
import SettingsUp from '../static/settingsUp.js';
import SettingsDown from '../static/settingsDown.js';
class GraphApp {
    constructor() {
        this.theoryHandler = new TheoryHandler();
        this.loadAndLogTheories();
        this.setupEventListeners();
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

    setupEventListeners() {
        let graphMaster = new GraphMaster();
    
    let isModeUp = false;
    const modeText = document.getElementById('modeText');
    const modeSpecificSettings = document.getElementById('modeSpecificSettings');

    function updateModeSpecificSettingsUI() {
      modeSpecificSettings.innerHTML = '';

      if (isModeUp) {
        const checkbox = document.createElement('div');
        checkbox.className = 'form-check';
        checkbox.innerHTML = `
          <input type="checkbox" id="showAxioms" class="form-check-input">
          <label for="showAxioms" class="form-check-label">Show axioms</label>
        `;
        modeSpecificSettings.appendChild(checkbox);
      } else {
        const checkbox = document.createElement('div');
        checkbox.className = 'form-check';
        checkbox.innerHTML = `
          <input type="checkbox" id="otherStartpoints" class="form-check-input">
          <label for="otherStartpoints" class="form-check-label">Other startpoints</label>
        `;
        modeSpecificSettings.appendChild(checkbox);
      }
    }

    updateModeSpecificSettingsUI();

    document.getElementById('switchTypeButton').addEventListener('click', () => {
      isModeUp = !isModeUp;
      modeText.textContent = isModeUp
        ? "Statements supporting theory statements"
        : "Statements supported by theory statements";
      updateModeSpecificSettingsUI();
    });

    function createGraphWithSettings(){
      let setts;
      if (isModeUp) {
        setts = new SettingsUp();
        setts.showAxioms = document.getElementById('showAxioms').checked;
      } else {
        setts = new SettingsDown();
        setts.otherStartpoints = document.getElementById('otherStartpoints').checked;
      }
      setts.depth = Math.max(1, parseInt(document.getElementById('graphDepth').value) || 1);
      setts.showAllEdges = document.querySelector('input[name="edgeDisplay"]:checked').value === "all";
      setts.showOnlyCommon = document.getElementById('showOnlyCommon').checked;
      return setts;
    }

    document.getElementById('submitSettingsButton').addEventListener('click', async () => {
      let setts = createGraphWithSettings();
      await graphMaster.createGraph(setts);
      graphMaster.drawGraph(setts);
    });
    
        //importExport 
            const exportStatementsBtn = document.getElementById('export-statements-btn');
            const exportJpgBtn = document.getElementById('export-jpg-btn');
            const exportGraphBtn = document.getElementById('export-graph-btn');
            const manager = new ImportExportManager(this.theoryHandler.theory1, this.theoryHandler.theory2)
            // Funkcia, ktorá sa vykoná po kliknutí na tlačidlo
            async function handleExportClick(event) {
              const clickedButton = event.target.id;
              if (clickedButton === 'export-statements-btn') {
                manager.exportStatements();
              } else if (clickedButton === 'export-jpg-btn') {
                if(!graphMaster.cy){
                  let setts = createGraphWithSettings();
                  await graphMaster.createGraph(setts);
                  graphMaster.drawGraph(setts);
                }
                manager.exportJPG(graphMaster.cy);
              } else if (clickedButton === 'export-graph-btn') {
                let setts = createGraphWithSettings();
                await graphMaster.createGraph(setts);
                manager.exportGraph(graphMaster.graph);
              }
            }
            exportStatementsBtn.addEventListener('click', handleExportClick);
            exportJpgBtn.addEventListener('click', handleExportClick);
            exportGraphBtn.addEventListener('click', handleExportClick);
    }


}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new GraphApp();
});
