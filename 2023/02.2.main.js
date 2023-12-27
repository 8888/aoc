const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;

const doWork = (line) => {
  let r = 0;
  let g = 0;
  let b = 0;

  const inputs = line.split(/[:;] /);
  const game = parseInt(inputs.splice(0, 1)[0].match(/[0-9]+/)[0]);

  for (let i = 0; i < inputs.length; i++) {
    set = inputs[i];
    const counts = {
      r: parseInt(set.match(/[0-9]+(?= red)/)) || 0,
      b: parseInt(set.match(/[0-9]+(?= blue)/)) || 0,
      g: parseInt(set.match(/[0-9]+(?= green)/)) || 0,
    };

    r = counts.r > r ? counts.r : r;
    g = counts.g > g ? counts.g : g;
    b = counts.b > b ? counts.b : b;

  }

  const power = r * g * b;
  total += power;
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('2.2.input.txt'),
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
