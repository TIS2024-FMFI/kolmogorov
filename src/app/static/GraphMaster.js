import BackendAdapter from '../static/BackendAdapter.js';

class GraphMaster {
    constructor() {
      this.graph = [];
      this.backendAdapter = new BackendAdapter();
    }
  
    async createGraph(settings) {
      //temp
      let statements1 = await Promise.all([this.backendAdapter.getStatement("ax-1")]);
      let statements2 = await Promise.all([this.backendAdapter.getStatement("df-met")]);

      const nodes = [];
      const edges = [];
      const visited1 = new Set();
      const visited2 = new Set();

      //Initialize
      let current = [];

      const Theory = Object.freeze({
        T1: 0,
        T2: 1
      });

      statements1.forEach(s => {
        if (!visited1.has(s.id)){
          const newNode = {
            data: {
              id: s.id,
              label: s.id,
              type: "theory1"
            },
            classes: s.type == "$a" ? "t1a" : "t1s"
          }

          nodes.push(newNode);
          visited1.add(s.id);
          current.push(s)
        }
      });

      statements2.forEach(s => {
        if (!visited2.has(s.id)){
          const newNode = {
            data: {
              id: s.id,
              label: s.id,
              type: "theory2"
            },
            classes: s.type == "$a" ? "t2a" : "t2s"
          }

          nodes.push(newNode);
          visited2.add(s.id);
          current.push(s);
        }
      });

      function createAddNode(stat, newLayer){
        const newNode = {
          data: {
            id: stat.id,
            label: stat.id,
            type: stat.type == "$a" ? "a" : "s"
          },
          classes: "node"
        }
        newLayer.push(stat);
        nodes.push(newNode);
      }

      //Generate graph
      for (let i = 0; i < 5 && current.length > 0; i++){
        console.log("Iteration: " + i);
        console.log("Current: ", current);
        let newLayer = [];

        //Iterate over current layer
        for (const parent of current){    

          //Iterate over each child
          for (const child of parent.referencedBy){

            //Decide which theory it belongs to
            if (visited1.has(parent.id) && !visited2.has(parent.id)){
              if (!visited1.has(child)){
                if (!visited2.has(child)){
                  const newStat = await this.backendAdapter.getStatement(child);

                  if (newStat == null) continue;

                  createAddNode(newStat, newLayer);
                }
                visited1.add(child);
              }
            }
            else if (visited2.has(parent.id) && !visited1.has(parent.id)){
              if (!visited2.has(child)){
                if (!visited1.has(child)){
                  const newStat = await this.backendAdapter.getStatement(child);
                  if (newStat == null) continue;
                  createAddNode(newStat, newLayer);
                }
                visited2.add(child);
              }
            }
            else{
              if (!visited1.has(child) && !visited2.has(child)){
                const newStat = await this.backendAdapter.getStatement(child);
                if (newStat == null) continue;
                createAddNode(newStat, newLayer);
              }
              visited1.add(child);
              visited2.add(child);
            }

            //Create edge from parent to child
            const newEdge = {
              data: {
                id: parent.id + child,
                source: parent.id,
                target: child
              }
            }
            edges.push(newEdge);
          }
        }

        current = newLayer;
      }

      //Update node styles
      for (const node of nodes){
        if (!visited1.has(node.data.id) && visited2.has(node.data.id)){
          if (node.data.type == "a")
            node.classes = "2a";
          else if (node.data.type == "s")
            node.classes = "2s";
        }
        else if (visited1.has(node.data.id) && !visited2.has(node.data.id)){
          if (node.data.type == "a")
            node.classes = "1a";
          else if (node.data.type == "s")
            node.classes = "1s";
        }
      }

      this.graph = nodes + edges;

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