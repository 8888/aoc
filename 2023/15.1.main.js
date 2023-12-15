const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;

const doWork = (line) => {
  const steps = line.split(',');
  steps.forEach(step => {
    let current = 0;
    for (let i = 0; i < step.length; i++) {
      current += step.charCodeAt(i);
      current *= 17;
      current %= 256;
    }
    total += current;
  });
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('15.1.input.txt'),
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
