const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;

const doWork = (line) => {
  // two pointers to find first ints
  let l = 0;
  let r = line.length - 1;
  let n, m;

  while (!n && l < line.length) {
    if (!isNaN(parseInt(line[l]))) {
      n = line[l];
      break;
    }
    l++;
  }

  while (!m && r >= 0) {
    if (!isNaN(parseInt(line[r]))) {
      m = line[r];
      break;
    }
    r--;
  }

  total += parseInt(n + m);
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('1.1.input.txt'),
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
