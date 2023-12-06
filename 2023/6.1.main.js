const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 1;
let times, distances;

const parseLines = (line) => {
  if (!times) {
    times = line.match(/[0-9]+/g);
    return;
  } else if (!distances) {
    distances = line.match(/[0-9]+/g);
    return;
  }
}

const doWork = () => {
  times.forEach((time, i) => {
    let wins = 0;
    const low = Math.floor(parseInt(time) / 2);
    let high = Math.ceil(parseInt(time) / 2);
    high = low === high ? high + 1 : high;
    const stack = [
      { x: low, step: -1 },
      { x: high, step: 1 },
    ];
    const distance = parseInt(distances[i]);
    while (stack.length) {
      const { x, step } = stack.pop();
      const y = time - x;
      if (x * y > distance) {
        wins++;
        stack.push({ x: x + step, step})
      }
    }
    console.log("wins", wins)
    total *= wins;
  });
};

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('6.2.sample.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parseLines(line);
    });

    await once(rl, 'close');

    doWork();
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
