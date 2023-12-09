const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
let result;

const doWork = (line) => {
  const inputs = line.split(' ');
  let sequence = inputs.map(num => parseInt(num));
  let differences = [];
  const ends = [];
  let zeroes = false;

  while (!zeroes) {
    zeroes = true;
    for (let i = 1; i < sequence.length; i++) {
      differences.push(sequence[i] - sequence[i - 1]);
      if (i === sequence.length - 1) {
        ends.push(sequence[i]);
      }
      zeroes = zeroes && sequence[i] === 0;
    }
    sequence = differences;
    differences = [];
  }

  console.log(sequence)
  console.log(differences)
  console.log(ends)
  total += ends.reduce((a, b) => a + b, 0);
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('9.1.input.txt'),
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
