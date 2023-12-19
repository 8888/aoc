const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let map = [];
const seen = new Set();
const totals = {};
const directions = [ // order is important, opposites are spaced
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];
const maxSteps = 3;

const parse = (line) => {
  console.log(line);
  map.push(line.split('').map(c => parseInt(c)));
}

const sortQueue = (queue) => {
  // this could be a performance issue
  // if needed, replace with a min heap maybe
  queue.sort((a, b) => {
    return a.total - b.total;
  });
}

const doWork = () => {
  const queue = [ {r: 0, c: 0, total: 0, dir: -1} ]; // dir must not be a valid index for start
  while (queue.length) {
    const {r, c, total, dir} = queue.shift();
    // check if we are at the end
    if (r === map.length-1 && c === map[0].length-1) return total;
    // check if we've seen this cell before
    const key = JSON.stringify({r, c, dir});
    if (seen.has(key)) continue;
    seen.add(key);
    for (let i = 0; i < directions.length; i++) {
      let heatIncrease = 0;
      // can't go in the same direction or the opposite direction
      if (i === dir || i === (dir + 2) % directions.length) continue;
      // take steps
      for (let s = 1; s <= maxSteps; s++) {
        const newR = r + directions[i][0] * s;
        const newC = c + directions[i][1] * s;
        // if the new cell is in bounds
        if (
          newR >= 0 && newR < map.length &&
          newC >= 0 && newC < map[0].length
        ) {
          heatIncrease += map[newR][newC];
          const newTotal = total + heatIncrease;
          const newKey = JSON.stringify({r: newR, c: newC, dir: i});
          if (newTotal > totals[newKey]) continue;
          totals[newKey] = newTotal;
          queue.push({r: newR, c: newC, total: newTotal, dir: i});
          sortQueue(queue);
        }
      }
    }
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('17.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');

    const min = doWork();
    console.log(min)
  } catch (err) {
    console.error(err);
  }
})();
