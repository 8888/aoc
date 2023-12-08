const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let directions = '';
const steps = {};
let locations = [];
let results = [];

const parse = (line) => {
  if (!line) return;
  if (!directions) {
    directions = line;
    return;
  }
  const inputs = line.match(/([0-9]+[A-Z])|([A-Z]+)/g);
  steps[inputs[0]] = {L: inputs[1], R: inputs[2]};
  if (inputs[0][2] === 'A') {
    locations.push(inputs[0]);
  }
}

const findPath = (location) => {
  let total = 0;
  while (true) {
    for (let i = 0; i < directions.length; i++) {
      total++;
      location = steps[location][directions[i]];
      if (location[2] === 'Z') return total;
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

    console.log(locations)
    locations.forEach(location => {
      results.push(findPath(location));
    });

    console.log(results)

    // find least common multiple for all results
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const lcm = (a, b) => a / gcd(a, b) * b;
    console.log(results.reduce(lcm, 1));

  } catch (err) {
    console.error(err);
  }
})();
