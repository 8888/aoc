const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;

const doWork = (line) => {
  const row = line.split(' ');
  console.log(row);
  if (parseInt(row[0]) > parseInt(row[1])) {
    // decreasing, big -> small
    for (let i = 0; i < row.length-1; i++) {
      const a = parseInt(row[i]);
      const b = parseInt(row[i+1]);
      const diff = a - b;
      if (a <= b || diff < 1 || diff > 3) return;
    }
    total++;
  } else if (parseInt(row[0]) < parseInt(row[1])) {
    // increasing, small -> big
    for (let i = 0; i < row.length-1; i++) {
      const a = parseInt(row[i]);
      const b = parseInt(row[i+1]);
      const diff = b - a;
      if (a >= b || diff < 1 || diff > 3) return;
    }
    total++;
  } else {
    return;
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('02.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      doWork(line);
    });

    await once(rl, 'close');

    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
