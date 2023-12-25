const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const map = [];

let count = 0;
console.log('             1111111111222')
console.log('   01234567890123456789012')
const parse = (line) => {
  console.log(`${count < 10 ? ' '+count : count} ${line}`)
  count++
  map.push(line);
}

const isValid = (y, x) => {
  return (
    y >= 0 && y <= map.length - 1 &&
    x >= 0 && x <= map[0].length - 1 &&
    map[y][x] !== '#'
  );
};

const doWork = () => {
  const start = [0, 1];
  const end = [map.length - 1, map.at(-1).length - 2];
  const nodes = [start.toString(), end.toString()];
  const distance = [];

  for (let i = 0; i < nodes.length; i++) {
    distance[i] = {};
    const node = nodes[i].split(',').map(x => parseInt(x));

    const buildGraph = (step, last, y, x) => {
      if (!isValid(y, x)) return;

      let pathLength = 0;
      if (isValid(y-1, x)) pathLength++;
      if (isValid(y+1, x)) pathLength++;
      if (isValid(y, x-1)) pathLength++;
      if (isValid(y, x+1)) pathLength++;

      if (step > 0 && (pathLength > 2 || y < 1 || y >= map.length - 1)) {
        if (!nodes.includes(y+','+x)) nodes.push(y+','+x);
        distance[i][nodes.indexOf(y+','+x)] = step;
        return;
      }

      if (last != 2 && y > 0) buildGraph(step+1, 0, y-1, x);
      if (last != 0 && y < map.length-1) buildGraph(step+1, 2, y+1, x);
      if (last != 3) buildGraph(step+1, 1, y, x-1);
      if (last != 1) buildGraph(step+1, 3, y, x+1);
    }

    buildGraph(0, -1, node[0], node[1]);
  }

  let longestPath = [];
  let longestSteps = 0;
  let search = (steps, node, prev) => {
    if (node == 1) {
      if (steps > longestSteps) {
        longestPath = prev;
        longestSteps = steps;
      }
      return;
    }
    prev.push(node);

    for (let target in distance[node]) {
      if (prev.includes(parseInt(target))) continue;
      const nprev = [...prev];
      search(steps + distance[node][target], parseInt(target), nprev);
    }
  }

  search(0, 0, []);
  console.log(longestPath, longestSteps);
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('23.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');

    doWork();

  } catch (err) {
    console.error(err);
  }
})();
