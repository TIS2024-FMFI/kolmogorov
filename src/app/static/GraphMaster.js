import BackendAdapter from '../static/BackendAdapter.js';

class GraphMaster {
    constructor() {
      this.graph = [];
      this.backendAdapter = new BackendAdapter();
    }
  
    async createGraph(settings) {
      // Get initial statements
      let statements1 = await Promise.all([this.backendAdapter.getStatement("ax-1")]);
      let statements2 = await Promise.all([this.backendAdapter.getStatement("df-met")]);

      const nodes = [];
      const edges = [];
      const visited1 = new Set();
      const visited2 = new Set();
      const toFetch = new Set(); // Track all statements we need to fetch

      //Initialize
      let current = [];

      const Theory = Object.freeze({
        T1: 0,
        T2: 1
      });

      function createAddNode(stat, newLayer) {
        const newNode = {
          data: {
            id: stat.id,
            label: stat.id,
            type: stat.type == "$a" ? "a" : "s"
          },
          classes: "node"
        };
        newLayer.push(stat);
        nodes.push(newNode);
      }

      // Add initial statements to visited sets
      statements1.forEach(s => {
        if (!visited1.has(s.id)){
          visited1.add(s.id);
          current.push(s);
          // Add referenced statements to fetch queue
          s.referencedBy.forEach(child => {
            if (!visited1.has(child) && !visited2.has(child)) {
              toFetch.add(child);
            }
          });
        }
      });

      statements2.forEach(s => {
        if (!visited2.has(s.id)){
          visited2.add(s.id);
          current.push(s);
          // Add referenced statements to fetch queue
          s.referencedBy.forEach(child => {
            if (!visited1.has(child) && !visited2.has(child)) {
              toFetch.add(child);
            }
          });
        }
      });

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
      });

      // Fetch all needed statements in parallel
      const fetchPromises = Array.from(toFetch).map(id => this.backendAdapter.getStatement(id));
      const fetchedStatements = await Promise.all(fetchPromises);
      const statementMap = new Map(fetchedStatements.map(s => [s.id, s]));

      // Process fetched statements
      for (let i = 0; i < 5 && current.length > 0; i++) {
        let newLayer = [];

        for (const parent of current) {
          for (const childId of parent.referencedBy) {
            const child = statementMap.get(childId);
            if (!child) continue;

            // Determine theory membership and create nodes/edges
            if (visited1.has(parent.id) && !visited2.has(parent.id)) {
              if (!visited1.has(childId)) {
                if (!visited2.has(childId)) {
                  createAddNode(child, newLayer);
                }
                visited1.add(childId);
              }
            }
            else if (visited2.has(parent.id) && !visited1.has(parent.id)) {
              if (!visited2.has(childId)) {
                if (!visited1.has(childId)) {
                  createAddNode(child, newLayer);
                }
                visited2.add(childId);
              }
            }
            else {
              if (!visited1.has(childId) && !visited2.has(childId)) {
                createAddNode(child, newLayer);
              }
              visited1.add(childId);
              visited2.add(childId);
            }

            // Create edge
            const newEdge = {
              data: {
                id: parent.id + childId,
                source: parent.id,
                target: childId
              }
            };
            edges.push(newEdge);
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

      this.graph = nodes.concat(edges);
      return this.graph;
    }

    drawGraph(){
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
              'width': 50,
              'height': 50,
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
              'width': '40px',
              'height': '40px'
            }
          },
      
          {
            selector: '.t1a',
            style: {
              'background-color': '#0e02f2',
              'border-width': 3,
              'border-color': '#39C700',
              'width': '40px',
              'height': '40px',
              "shape": "square"
            }
          },
      
          {
            selector: '.t2s',
            style: {
              'background-color': '#fc0a0e',
              'border-width': 3,
              'border-color': '#0039C7',
              'width': '40px',
              'height': '40px'
            }
          },
      
          {
            selector: '.t2a',
            style: {
              'background-color': '#fc0a0e',
              'border-width': 3,
              'border-color': '#C70067',
              'width': '40px',
              'height': '40px',
              "shape": "square"
            }
          },
      
          {
            selector: '.1s',
            style: {
              'background-color': '#00aaff',
              'border-width': 3,
              'border-color': '#C79A00',
              'width': '40px',
              'height': '40px'
            }
          },
      
          {
            selector: '.1a',
            style: {
              'background-color': '#00aaff',
              'border-width': 3,
              'border-color': '#00A6C7',
              'width': '40px',
              'height': '40px',
              "shape": "square"
            }
          },
      
          {
            selector: '.2s',
            style: {
              'background-color': '#fc586e',
              'border-width': 3,
              'border-color': '#C75F00',
              'width': '40px',
              'height': '40px'
            }
          },
      
          {
            selector: '.2a',
            style: {
              'background-color': '#fc586e',
              'border-width': 3,
              'border-color': '#7A00C7',
              'width': '40px',
              'height': '40px',
              "shape": "square"
            }
          },

          {
            selector: '.s',
            style: {
              'background-color': '#7540e6',
              'border-width': 3,
              'border-color': '#C75F00',
              'width': '40px',
              'height': '40px'
            }
          },
      
          {
            selector: '.a',
            style: {
              'background-color': '#7540e6',
              'border-width': 3,
              'border-color': '#7A00C7',
              'width': '40px',
              'height': '40px',
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
    }
  
    getInfo(id) {
      return {};
    }
  
    calculateIntersection(theory1, theory2) {
      return [];
    }
  }

export default GraphMaster