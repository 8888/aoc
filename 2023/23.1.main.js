const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const map = [];
const start = [0,1];
let end;
seen = new Set();
const directions = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

const parse = (line) => {
  console.log(line);
  map.push(line);
  end = [map.length - 1, line.length - 1];
}

const isInBounds = (row, col, grid) => {
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
}

const search = () => {
  // does the path split?
  let pathLength = 0;
  let current = start;
  while (current) {
    let steps = [];
    seen.add(current.toString());
    let [row, col] = current;
    directions.forEach(dir => {
      const next = [row+dir[0], col+dir[1]];
      if (
        isInBounds(next[0], next[1], map) &&
        !seen.has(next.toString()) &&
        map[next[0]][next[1]] !== '#'
      ) {
        steps.push(next);
      }
    });
    if (steps.length > 1) {
      // at a split
      current = null;
    } else {
      pathLength++;
      current = steps[0];
    }
  }
  console.log(pathLength);
}

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
    search();

  } catch (err) {
    console.error(err);
  }
})();
