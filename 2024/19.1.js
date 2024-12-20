const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const test = { file: '19.test.txt' };
const goal = { file: '19.txt' };
const game = goal;

let towels = [];
const designs = [];
let total = 0;
const memo = {};

let parsedTowels = false;
const init = (line = '') => {
  if (line == '') {
    parsedTowels = true;
  } else if (parsedTowels) {
    designs.push(line);
  } else {
    towels = line.split(', ')
  }
}

const search = (design = '') => {
  if (design == '') return 1;

  if (memo[design]) return memo[design];

  let found = 0;
  towels.forEach(towel => {
    if (design.substring(0, towel.length) == towel) {
      found += search(design.substring(towel.length));
    }
  })

  memo[design] = found;
  return found;
}

const doWork = () => {
  designs.forEach(d => {
    console.log(d)
    const arrangements = search(d);
    if (arrangements) total++
  })
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream(game.file),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    doWork()
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
