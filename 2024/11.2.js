const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const blinks = 75;
let map = {};

const init = (line) => {
  line.split(' ').forEach(s => {
    map[s] = map[s] ? map[s] + 1 : 1;
  });

  for (let i = 0; i < blinks; i++) {
    const newMap = {};
    for (const [stone, count] of Object.entries(map)) {
      if (stone == '0') {
        newMap[1] = newMap[1] ? newMap[1] + count : count;
      } else if (stone.length % 2 == 0) {
        const mid = stone.length / 2;
        const left = stone.slice(0, mid);
        const right = parseInt(stone.slice(mid)).toString();
        newMap[left] = newMap[left] ? newMap[left] + count : count;
        newMap[right] = newMap[right] ? newMap[right] + count : count;
      } else {
        const result = parseInt(stone) * 2024;
        newMap[result] = newMap[result] ? newMap[result] + count : count;
      }
    }
    map = newMap;
  }

  for (const [stone, count] of Object.entries(map)) {
    total += count;
  }
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
