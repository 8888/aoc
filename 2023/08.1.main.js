const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
let directions = '';
const steps = {};
let location = 'AAA';
let destination = 'ZZZ';

const parse = (line) => {
  console.log(line)
  if (!line) return;
  if (!directions) {
    directions = line;
    return;
  }
  const inputs = line.match(/[A-Z]+/g);
  steps[inputs[0]] = {L: inputs[1], R: inputs[2]};
}

const findPath = () => {
  while (true) {
    for (let i = 0; i < directions.length; i++) {
      total++;
      location = steps[location][directions[i]];
      if (location === destination) return;
    }
  }
};

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('8.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');

    findPath();
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
