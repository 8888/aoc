const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const blinks = 25;

const init = (line) => {
  let stones = line.split(' ');
  console.log(stones)
  for (let i = 0; i < blinks; i++) {
    stones = doWork(stones);
    console.log(stones)
  }
  total = stones.length;
}

const doWork = (stones) => {
  let newStones = [];
  stones.forEach(stone => {
    if (stone == '0') {
      newStones.push('1');
    } else if (stone.length % 2 == 0) {
      const mid = stone.length / 2;
      newStones.push(stone.slice(0, mid));
      newStones.push(parseInt(stone.slice(mid)).toString());
    } else {
      const result = parseInt(stone) * 2024;
      newStones.push(result.toString());
    }
  });
  return newStones;
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('11.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    console.log(total);

  } catch (err) {
    console.error(err);
  }
})();
