const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const map = [];
let queue = new Set();

const parse = (line) => {
  console.log(line);
  const startCol = line.indexOf('S');
  if (startCol > -1) {
    queue.add(JSON.stringify([map.length, startCol]));
    line = line.replace('S', '.');
  }
  map.push(line);
}

const doWork = () => {
  const steps = 64;
  for (let i = 0; i < steps; i++) {
    const q = Array.from(queue);
    queue = new Set(); // reset for next step
    while (q.length) {
      const start = JSON.parse(q.shift());
      // up
      if (start[0] > 0 && map[start[0] - 1][start[1]] === '.') {
        const next = [start[0] - 1, start[1]];
        queue.add(JSON.stringify(next));
      }
      // down
      if (start[0] < map.length - 1 && map[start[0] + 1][start[1]] === '.') {
        const next = [start[0] + 1, start[1]];
        queue.add(JSON.stringify(next));
      }
      // left
      if (start[1] > 0 && map[start[0]][start[1] - 1] === '.') {
        const next = [start[0], start[1] - 1];
        queue.add(JSON.stringify(next));
      }
      // right
      if (start[1] < map[0].length - 1 && map[start[0]][start[1] + 1] === '.') {
        const next = [start[0], start[1] + 1];
        queue.add(JSON.stringify(next));
      }
    }
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('21.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');

    doWork();
    console.log(queue.size)

  } catch (err) {
    console.error(err);
  }
})();
