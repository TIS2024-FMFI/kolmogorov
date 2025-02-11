import BackendAdapter from '../static/BackendAdapter.js';
import TheoryHandler from './TheoryHandler.js';
import Queue from "../static/queue.js"


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
            children: new Set()
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
                  children: new Set()
                };

                //If not use other startpoints, add proved from
                rawGraph[childId].provedFrom = child.provedFrom;
              }

              //Create an edge from parent to child
              rawGraph[parent.id].children.add(childId);
            }    
          });
        });

        current = newLayer;
      }

      const removed = new Set();
      const roots = new Set(this.rootNodes);

      //Check if other startpoints, if not -> remove unsuitable nodes and their children
      if (settings.type == "down" && !settings.otherStartpoints){
        let hasRemoved = true;
        while (hasRemoved){
          hasRemoved = false;
          let unsuitable = [];
          const nodes = new Set(Object.keys(rawGraph));

          //Find unsuitable
          for (let sid in rawGraph){
            //Continue if in theory
            if (roots.has(sid))
              continue;

            if (!rawGraph[sid].provedFrom.every(s => nodes.has(s) && rawGraph[s].children.has(sid))){
              unsuitable.push(sid);
              hasRemoved = true;
            }
          }

          //Delete unsuitable
          unsuitable.forEach(s => {
            if (!removed.has(s)){
              removed.add(s);
              delete rawGraph[s];
            }
          });
        }
      }

      //Update theories
      const queue = new Queue();
      this.rootNodes.forEach(s => queue.enqueue(s));
      while (!queue.isEmpty()){
        let current = queue.dequeue();

        if (removed.has(current))
          continue;

        rawGraph[current].children.forEach(child => {
          if (!removed.has(child)){
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
          }
        });
      }

      //Update theories for root nodes
      theoryHandler.theory1.forEach(t => {
        rawGraph[t.id].theory = "t1";
      });
      theoryHandler.theory2.forEach(t => {
        rawGraph[t.id].theory = "t2";
      });

      //Check if show only common and process
      if (settings.showOnlyCommon){
        let hasChanged = true;
        while (hasChanged){
          hasChanged = false;

          this.rootNodes.forEach(parent => {
            let unsuitable = new Set();
            rawGraph[parent].children.forEach(child => {
              if (!roots.has(child) && !removed.has(child) && rawGraph[child].theory != ""){
                hasChanged = true;
                rawGraph[child].children.forEach(c => {
                  if (!removed.has(c)){
                    rawGraph[parent].children.add(c);
                  }
                });
                unsuitable.add(child)
              }
            });

            //Remove children
            unsuitable.forEach(u => {
              rawGraph[parent].children.delete(u);

              if (!removed.has(u)){
                removed.add(u);
                delete rawGraph[u];
              }
            });
          });
        }
      }

      //Check if show all edges and process
      if (!settings.showAllEdges){
        const used = new Set();
        let layer = this.rootNodes.slice();

        while (layer.length > 0){
          let newLayer = [];

          //Add new layer to used
          layer.forEach(sid => used.add(sid));

          //Remove all connections to used nodes
          layer.forEach(sid => {
            if (!removed.has(sid)){
              let stat = rawGraph[sid];
              stat.children = new Set([...stat.children].filter(id => !used.has(id)));
              newLayer = newLayer.concat([...stat.children]);
            }
          });

          layer = newLayer;
        }
      }

      //Convert the graph
      this.graph = [];
      let edges = [];
      for (let sid in rawGraph){
        let s = rawGraph[sid];

        //Exclude axiom if set in settings
        if (settings.type == "up" && settings.showAxioms == false && s.type == "a" && !roots.has(sid))
          continue;

        this.graph.push({
          data: {
            id: sid,
            label: sid
          },
          classes: s.theory + s.type
        });

        s.children.forEach(child => {
          //Exclude axiom if set in settings
          if (settings.type == "down" || settings.showAxioms == true || rawGraph[child].type == "s" || roots.has(child)){
            if (!removed.has(child)){
              edges.push({
                data: {
                  id: sid + child,
                  source: sid,
                  target: child
                }
              });
            }
          }
        });
      }

      this.graph = this.graph.concat(edges);
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