import BackendAdapter from '../static/BackendAdapter.js';
import TheoryHandler from './TheoryHandler.js';
import SettingsUp from "./SettingsUp.js";
import SettingsDown from "./SettingsDown.js";

class GraphMaster {
    constructor() {
      this.graph = [];
      this.backendAdapter = new BackendAdapter();
      this.rootNodes = [];
    }
  
    async createGraph(settings) {
      // Get initial statements
      const theoryHandler = new TheoryHandler();

      const nodes = [];
      const edges = [];
      const visited1 = new Set();
      const visited2 = new Set();

      //Initialize
      let current = [];

      function createAddNode(stat, newLayer) {
        const newNode = {
          data: {
            id: stat.id,
            label: stat.id,
            type: stat.type == "$a" ? "a" : "s"
          },
          classes: stat.type == "$a" ? "a" : "s"
        };
        newLayer.push(stat);
        nodes.push(newNode);
      }

      // Add initial statements to visited sets
      theoryHandler.theory1.forEach(s => {
        if (!visited1.has(s.id)){
          visited1.add(s.id);
          current.push(s);
        }
      });

      theoryHandler.theory2.forEach(s => {
        if (!visited2.has(s.id)){
          visited2.add(s.id);
          current.push(s);
        }
      });

      const theories = new Set(current.map(c => c.id));

      // Create initial nodes
      current.forEach(s => {
        const newNode = {
          data: {
            id: s.id,
            label: s.id,
            type: visited1.has(s.id) ? "theory1" : "theory2"
          },
          classes: visited1.has(s.id) ? (s.type == "$a" ? "t1a" : "t1s") : (s.type == "$a" ? "t2a" : "t2s")
        };
        nodes.push(newNode);
        this.rootNodes.push(newNode);
      });

      let toFetch = null;
      let fetchPromises = null;
      let fetchedStatements = null;
      let statementMap = null;

      async function fetchStatements(backendAdapter){
        fetchPromises = Array.from(toFetch).map(id => backendAdapter.getStatement(id));
        fetchedStatements = await Promise.all(fetchPromises);
        statementMap = new Map(fetchedStatements.map(s => [s.id, s]));
      }

      function createEdge(parentId, childId){
        if (!theories.has(childId)){
          const newEdge = {
            data: {
              id: parentId + childId,
              source: parentId,
              target: childId
            }
          };
          edges.push(newEdge);
        }
      }
      
      // Create graph
      for (let i = 0; i < settings.depth && current.length > 0; i++) {

        //Decide children based on settings and fetch
        if (settings.type == "up"){
          toFetch = new Set(current.map(s => s.referencedBy).flat());
        }
        else{
          toFetch = new Set(current.map(s => s.provedFrom).flat());
        }

        await fetchStatements(this.backendAdapter);

        //Create nodes
        let newLayer = [];

        for (const parent of current) {

          //Decide children based on settings
          let children = parent.provedFrom;
          if (settings.type == "up"){
            children = parent.referencedBy;
          }

          for (const childId of children) {
            const child = statementMap.get(childId);
            if (!child) continue;

            //Parent exclusively from theory1
            if (visited1.has(parent.id) && !visited2.has(parent.id)) {

              //Child not visited from theory1
              if (!visited1.has(childId)) {
                if (!visited2.has(childId)) {
                  createAddNode(child, newLayer);
                }
                visited1.add(childId);
                createEdge(parent.id, childId);
              }
            }
            //Parent exclusively from theory2
            else if (visited2.has(parent.id) && !visited1.has(parent.id)) {

              //Child not visited from theory2
              if (!visited2.has(childId)) {
                if (!visited1.has(childId)) {
                  createAddNode(child, newLayer);
                }
                visited2.add(childId);
                createEdge(parent.id, childId);
              }
            }
            //Parent from both theories
            else {

              //Child not visited at all
              if (!visited1.has(childId) && !visited2.has(childId)) {
                createAddNode(child, newLayer);
              }
              visited1.add(childId);
              visited2.add(childId);
              createEdge(parent.id, childId);
            }
          }
        }

        current = newLayer;
      }

      // Update node styles
      for (const node of nodes) {
        if (!visited1.has(node.data.id) && visited2.has(node.data.id)) {
          if (node.data.type == "a")
            node.classes = "2a";
          else if (node.data.type == "s")
            node.classes = "2s";
        }
        else if (visited1.has(node.data.id) && !visited2.has(node.data.id)) {
          if (node.data.type == "a")
            node.classes = "1a";
          else if (node.data.type == "s")
            node.classes = "1s";
        }
      }

      console.log("Node count", nodes.length);
      this.graph = nodes.concat(edges);
      return this.graph;
    }

    drawGraph(settings){
      if (!this.graph) {
        console.error('No graph to draw.');
        return;
      }
  
      const cy = cytoscape({
        container: document.getElementById('cy'),
  
        elements: this.graph,
  
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#0074D9',
              'label': 'data(label)',
              'width': 100,
              'height': 100,
              'text-halign': 'center',
              'text-valign': 'center',
              "shape": "ellipse",
              "color": "#ffffff",
              "text-outline-color": "#000000",
              "text-outline-width": 2
            }
          },
          {
            selector: '.t1s',
            style: {
              'background-color': '#0e02f2',
            }
          },
      
          {
            selector: '.t1a',
            style: {
              'background-color': '#0e02f2',
              "shape": "square"
            }
          },
      
          {
            selector: '.t2s',
            style: {
              'background-color': '#fc0a0e',
            }
          },
      
          {
            selector: '.t2a',
            style: {
              'background-color': '#fc0a0e',
              "shape": "square"
            }
          },
      
          {
            selector: '.1s',
            style: {
              'background-color': '#00aaff',
            }
          },
      
          {
            selector: '.1a',
            style: {
              'background-color': '#00aaff',
              "shape": "square"
            }
          },
      
          {
            selector: '.2s',
            style: {
              'background-color': '#fc586e',
            }
          },
      
          {
            selector: '.2a',
            style: {
              'background-color': '#fc586e',
              "shape": "square"
            }
          },

          {
            selector: '.s',
            style: {
              'background-color': '#7540e6',
            }
          },
      
          {
            selector: '.a',
            style: {
              'background-color': '#7540e6',
              "shape": "square"
            }
          },

          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
            }
          }
        ],
  
        layout: {
          name: 'breadthfirst',
          animate: false,
          directed: true,
          padding: 10,
          circle: false,
          spacingFactor: 1.5,
          maxParallelEdgeSmoothing: 20
        }
      });

      //Invert the graph according to settings
      if (settings.type == "down"){
        cy.nodes().forEach(node => {
          const position = node.position();
          node.position({
            x: position.x,
            y: -position.y
          });
        });
      }

      console.log("settings ", settings);

      //Center and zoom
      if (this.rootNodes.length > 0){
        cy.fit(this.rootNodes, 50);
        cy.zoom(1);
      }
      else{
        console.warn("No root nodes to fit in the viewport!");
      }
    }
  
    getInfo(id) {
      return {};
    }
  
    calculateIntersection(theory1, theory2) {
      return [];
    }
  }

export default GraphMaster