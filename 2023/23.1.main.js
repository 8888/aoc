const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const map = [];
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
  end = [map.length - 1, line.length - 2];
}

const isInBounds = (row, col, grid) => {
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
}

const search = () => {
  let longestPath = 0;
  const queue = [
    {start: [0,1], pathLength: 0, seen: new Set()}
  ];
  while (queue.length) {
    let {start, pathLength, seen} = queue.shift();
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
          (
            map[next[0]][next[1]] === '.' ||
            (map[next[0]][next[1]] === '>' && dir[0] === 0 && dir[1] === 1) ||
            (map[next[0]][next[1]] === 'v' && dir[0] === 1 && dir[1] === 0)
          )
        ) {
          steps.push(next);
        }
      });
      if (steps.length === 0) {
        if (current[0] === end[0] && current[1] === end[1]) {
          longestPath = Math.max(longestPath, pathLength);
        }
        current = null;
      } else if (steps.length === 1) {
        pathLength++;
        current = steps[0];
      } else {
        // at a split
        current = null;
        pathLength++;
        steps.forEach(step => {
          queue.push({start: step, pathLength, seen: new Set([...seen])});
        });
      }
    }
  }
  return longestPath;
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
    console.log(search());

  } catch (err) {
    console.error(err);
  }
})();
