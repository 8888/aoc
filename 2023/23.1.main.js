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

const search = () => {
  // does the path split?
  let [row, col] = start;
  seen.add(start.toString());
  let steps = [];
  directions.forEach(dir => {
    const next = [row+dir[0], col+dir[1]];
    if (!seen.has(next.toString()) && map[next[0]][next[1]] !== '#') {
      steps.push(next);
    }
  });
  if (steps.length > 1) {

  } else {

  }
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
    console.log(start)

  } catch (err) {
    console.error(err);
  }
})();
