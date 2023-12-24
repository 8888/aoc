const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const graph = {};
const map = [];
const entry = [0,1];
let end;
const directions = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

let count = 0;
console.log('             1111111111222')
console.log('   01234567890123456789012')
const parse = (line) => {
  console.log(`${count < 10 ? ' '+count : count} ${line}`)
  count++
  map.push(line);
  end = [map.length - 1, line.length - 2];
}

const isInBounds = (row, col, grid) => {
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
}

const buildGraph = () => {
  /*
  graph = { id: {id, distance}[] }
  BFS to make a graph just off of the intersections
  */
  const seen = new Set();
  graph[entry.toString()] = [];
  const queue = [{current: entry, pathLength: 0, startId: entry.toString()}];
  while (queue.length) {
    let {current, pathLength, startId} = queue.shift();
    let stepping = true;

    while (stepping) {
      let steps = [];
      seen.add(current.toString());
      let [row, col] = current;

      directions.forEach(dir => {
        const next = [row+dir[0], col+dir[1]];
        if (
          isInBounds(next[0], next[1], map) &&
          (
            !seen.has(next.toString()) ||
            (graph[next.toString()] && next[0] !== current[0] && next[1] !== current[1])
          ) &&
          map[next[0]][next[1]] !== '#'
        ) {
          steps.push(next);
        }
      });

      pathLength++;
      if (steps.length === 0) {
        if (current[0] === end[0] && current[1] === end[1]) {
          graph[startId].push({id: end.toString(), distance: pathLength});
          graph[end.toString()] = [{id: startId, distance: pathLength}];
        }
        stepping = false;
      } else if (steps.length === 1) {
        current = steps[0];
      } else {
        // at a split
        console.log(current)
        stepping = false;
        graph[startId].push({id: current.toString(), distance: pathLength});
        graph[current.toString()] = [{id: startId, distance: pathLength}];
        steps.forEach(step => {
          queue.push({current: step, pathLength: 0, startId: current.toString()});
        });
      }
    }
  }
}

const bfs = () => {
  let longestPath = 0;
  const queue = [{current: entry.toString(), length: 0, seen: new Set()}];
  while (queue.length) {
    let {current, length, seen} = queue.shift();
    console.log(current)
    seen.add(current.toString());
    graph[current].forEach(next => {
      if (next.id === end.toString()) {
        longestPath = Math.max(longestPath, length + next.distance);
      } else if (!seen.has(next.id)) {
        queue.push({current: next.id, length: length + next.distance, seen: new Set([...seen])});
      }
    });
  }
  return longestPath;
};

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('23.1.sample.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');
    buildGraph();
    console.log(bfs());

  } catch (err) {
    console.error(err);
  }
})();
