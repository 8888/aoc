const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const test = { file: '23.test.txt' };
const goal = { file: '23.txt' };
const game = goal;

class Graph {
  adjList = new Map();

  hasVertex(v) {
    return this.adjList.has(v);
  }

  addVertex(v) {
    this.adjList.set(v, []);
  }

  addEdge(v, w) {
    this.adjList.get(v).push(w);
    this.adjList.get(w).push(v);
  }

  isSingleGraph() {
    // checks if there is a path connecting all nodes
    // if there is not there are two distinct graphs without an edge connecting them
    // BFS from any node and see if you can visit all nodes
    const startingNode = [...this.adjList.keys()][0];
    const visited = new Map();
    visited.set(startingNode, true);
    const queue = [startingNode];
    while (queue.length) {
      const cur = queue.shift();
      this.adjList.get(cur).forEach(edge => {
        if (!visited.has(edge)) {
          visited.set(edge, true);
          queue.push(edge)
        }
      })
    }
    return visited.size === this.adjList.size;
  }

  findCycles(depth = 3) {
    // DFS from each node to find cycle where n (depth) steps you back to start
    // Need to track a seen list of starting points so we don't duplicate cycles
    // a-b-c-a is the same as b-c-a-b etc
    const uniqueCycles = new Set();
    const nodesStartedFrom = new Map();
    this.adjList.forEach((edges, vertex, map) => {
      const visited = new Map();
      const stack = [{v: vertex, path: [vertex]}];
      while (stack.length) {
        const cur = stack.pop();

        this.adjList.get(cur.v).forEach(edge => {
          if (cur.path.length === depth) {
            // must connect back to start now
            if (edge === cur.path[0]) {
              const sorted = [...cur.path].sort((a, b) => a.localeCompare(b));
              uniqueCycles.add(`${sorted[0]},${sorted[1]},${sorted[2]}`);
            }
          } else {
            if (!visited.has(edge) && !nodesStartedFrom.has(edge)) {
              const path = [...cur.path, edge];
              stack.push({v: edge, path})
            }
          }
        });
      }
      nodesStartedFrom.set(vertex, true);
    });

    const filtered = [...uniqueCycles].filter(cycle => {
      return cycle[0] == 't' || cycle[3] == 't' || cycle[6] == 't';
    });

    return filtered.length;
  }

  print() {
    for (let vertex of this.adjList.keys()) {
      let str = '';
      this.adjList.get(vertex).forEach(edge => {
        str = `${str}${edge} `;
      })
      console.log(`${vertex} -> ${str}`);
    }
  }
}

const graph = new Graph();

const init = (line = '') => {
  if (line === '') return;
  const [compA, compB] = line.split('-');
  if (!graph.hasVertex(compA)) graph.addVertex(compA);
  if (!graph.hasVertex(compB)) graph.addVertex(compB);
  graph.addEdge(compA, compB);
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream(game.file),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    graph.print()
    console.log(`Is this a single graph will all nodes connected? ${graph.isSingleGraph()}`)
    console.log(`Total cycles found ${graph.findCycles()}`)


  } catch (err) {
    console.error(err);
  }
})();
