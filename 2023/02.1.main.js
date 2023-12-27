const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;

const doWork = (line) => {
  const r = 12;
  const g = 13;
  const b = 14;

  const inputs = line.split(/[:;] /);
  const game = parseInt(inputs.splice(0, 1)[0].match(/[0-9]+/)[0]);

  let possible = true;
  for (let i = 0; i < inputs.length; i++) {
    set = inputs[i];
    const counts = {
      r: parseInt(set.match(/[0-9]+(?= red)/)) || 0,
      b: parseInt(set.match(/[0-9]+(?= blue)/)) || 0,
      g: parseInt(set.match(/[0-9]+(?= green)/)) || 0,
    };

    possible = (
      counts.r <= r &&
      counts.g <= g &&
      counts.b <= b
    );

    if (!possible) return;
  }

  if (possible) total += game;
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('2.1.input.txt'),
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
