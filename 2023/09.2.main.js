const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;

const doWork = (line) => {
  const inputs = line.split(' ');
  let sequence = inputs.map(num => parseInt(num));
  let differences = [];
  const ends = [];
  let zeroes = false;

  while (!zeroes) {
    zeroes = true;
    for (let i = sequence.length - 2; i >= 0; i--) {
      differences.unshift(sequence[i + 1] - sequence[i]);
      zeroes = zeroes && sequence[i] === 0;
    }
    ends.push(sequence[0]);
    sequence = differences;
    differences = [];
  }

  console.log(sequence)
  console.log(differences)
  console.log(ends)
  let next = 0;
  for (let i = ends.length - 1; i >= 0; i--) {
    next = ends[i] - next;
  }

  total += next;
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
