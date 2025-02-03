import BackendAdapter from '../static/BackendAdapter.js';
import TheoryHandler from './TheoryHandler.js';
import Queue from "../static/queue.js"
import SettingsUp from "./SettingsUp.js";
import SettingsDown from "./SettingsDown.js";

class GraphMaster {
    constructor() {
      this.graph = [];
      this.backendAdapter = new BackendAdapter();
      this.rootNodes = [];
    }

    async createGraph(settings){
      const theoryHandler = new TheoryHandler();
      const rawGraph = {};

      //Fetch initial statements
      let current = theoryHandler.theory1.concat(theoryHandler.theory2);
      this.rootNodes = current.map(s => s.id);
      const visited = new Set(this.rootNodes);
    
      //Create initial nodes
      function createTheory(theory, tag){
        theory.forEach(s => {
          rawGraph[s.id] = {
            theory: tag,
            type: s.type == "$a" ? "a" : "s",
            children: []
          };
        });
      }

      createTheory(theoryHandler.theory1, "1");
      createTheory(theoryHandler.theory2, "2");

      //Statements fetching function
      async function fetchStatements(backendAdapter, toFetch){
        let fetchPromises = Array.from(toFetch).map(id => backendAdapter.getStatement(id));
        let fetchedStatements = await Promise.all(fetchPromises);
        return new Map(fetchedStatements.map(s => [s.id, s]));
      }

      //Create graph to a set depth
      for (let i = 0; i < settings.depth && current.length > 0; i++){

        //Choose children based on settings and fetch
        let toFetch;
        if (settings.type == "up"){ 
          toFetch = new Set(current.map(s => s.provedFrom || []).flat()); 
        }
        else{ 
          toFetch = new Set(current.map(s => s.referencedBy || []).flat()); 
        }
        const newStatements = await fetchStatements(this.backendAdapter, toFetch);

        //Process new layer
        const newLayer = [];
        current.forEach(parent => {
          //Choose children based on settings
          let children = parent.provedFrom;
          if (settings.type == "down"){
            children = parent.referencedBy;
          }

          //Process each child
          children.forEach(childId => {
            const child = newStatements.get(childId);
            if (child){
              //Create and add to new layer if not visited
              if (!visited.has(childId)){
                newLayer.push(child);
                visited.add(childId);

                rawGraph[childId] = {
                  theory: null,
                  type: child.type == "$a" ? "a" : "s",
                  children: []
                };
              }

              //Create an edge from parent to child
              rawGraph[parent.id].children.push(childId);
            }    
          });
        });

        current = newLayer;
      }

      //Update theories
      const queue = new Queue();
      this.rootNodes.forEach(s => queue.enqueue(s));
      while (!queue.isEmpty()){
        let current = queue.dequeue();
        rawGraph[current].children.forEach(child => {
          let childTheory = rawGraph[child].theory;
          let parentTheory = rawGraph[current].theory;

          if (childTheory != ""){
            if (childTheory == null){
              rawGraph[child].theory = parentTheory;
            }
            else if (childTheory != parentTheory){
              rawGraph[child].theory = "";
            } 
            queue.enqueue(child);
          }
        });
      }

      //Update theories for root nodes
      this.rootNodes.forEach(n => {
        rawGraph[n].theory = "t" + rawGraph[n].theory;
      });

      //Convert the graph
      this.graph = [];
      for (let sid in rawGraph){
        let s = rawGraph[sid];

        this.graph.push({
          data: {
            id: sid,
            label: sid
          },
          classes: s.theory + s.type
        });

        s.children.forEach(child => {
          this.graph.push({
            data: {
              id: sid + child,
              source: sid,
              target: child
            }
          });
        });
      }

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
              'width': 80,
              'height': 80,
              'text-halign': 'center',
              'text-valign': 'center',
              "shape": "ellipse"
            }
          },
          {
            selector: '.t1s',
            style: {
              'background-color': '#0e02f2',
              'border-width': 3,
              'border-color': '#C70039',
            }
          },
      
          {
            selector: '.t1a',
            style: {
              'background-color': '#0e02f2',
              'border-width': 3,
              'border-color': '#39C700',
              "shape": "square"
            }
          },
      
          {
            selector: '.t2s',
            style: {
              'background-color': '#fc0a0e',
              'border-width': 3,
              'border-color': '#0039C7',
            }
          },
      
          {
            selector: '.t2a',
            style: {
              'background-color': '#fc0a0e',
              'border-width': 3,
              'border-color': '#C70067',
              "shape": "square"
            }
          },
      
          {
            selector: '.1s',
            style: {
              'background-color': '#00aaff',
              'border-width': 3,
              'border-color': '#C79A00',
            }
          },
      
          {
            selector: '.1a',
            style: {
              'background-color': '#00aaff',
              'border-width': 3,
              'border-color': '#00A6C7',
              "shape": "square"
            }
          },
      
          {
            selector: '.2s',
            style: {
              'background-color': '#fc586e',
              'border-width': 3,
              'border-color': '#C75F00',
            }
          },
      
          {
            selector: '.2a',
            style: {
              'background-color': '#fc586e',
              'border-width': 3,
              'border-color': '#7A00C7',
              "shape": "square"
            }
          },

          {
            selector: '.s',
            style: {
              'background-color': '#7540e6',
              'border-width': 3,
              'border-color': '#C75F00',
            }
          },
      
          {
            selector: '.a',
            style: {
              'background-color': '#7540e6',
              'border-width': 3,
              'border-color': '#7A00C7',
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
      if (settings.type == "up"){
        cy.nodes().forEach(node => {
          const position = node.position();
          node.position({
            x: position.x,
            y: -position.y
          });
        });
      }

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