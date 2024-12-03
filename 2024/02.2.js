const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;

const doWork = (line) => {
  const row = line.split(' ');
  console.log(row);

  let damped = false;
  let direction; // 'asc' || 'desc'

  // if we start with dupes, rip out the first and go
  if (parseInt(row[0]) === parseInt(row[1])) {
    row.splice(0, 1);
    damped = true;
  }

  for (let i = 0; i < row.length-1; i++) {
    const a = parseInt(row[i]);
    const b = parseInt(row[i+1]);

    // start with dupes
    if (a === b) {
      if (damped) return;
      damped = true;
    } else if (a < b) {
      // ascending, small -> big
      if (direction === 'desc') {
        if (damped) return;
        damped = true;
        row[i+1] = a;
      } else {
        const diff = b - a;
        if (diff < 1 || diff > 3) {
          if (damped) return;
          damped = true;
          row[i+1] = a;
        } else {
          direction = 'asc';
        }
      }
    } else { // a > b
      // descending, big -> small
      if (direction === 'asc') {
        if (damped) return;
        damped = true;
        row[i+1] = a;
      } else {
        const diff = a - b;
        if (diff < 1 || diff > 3) {
          if (damped) return;
          damped = true;
          row[i+1] = a;
        } else {
          direction = 'desc';
        }
      }
    }
  }
  total++;
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
