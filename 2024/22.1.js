const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const test = { file: '22.test.txt' };
const goal = { file: '22.txt' };
const game = goal;

let total = 0
const buyers = [];
const result = [];

const init = (line = '') => {
  if (line === '') return;
  buyers.push(parseInt(line));
}

const evolve = () => {
  buyers.forEach(buyer => {
    let num = buyer;
    for (let i = 0; i < 2000; i++) {
      // step 1
      let temp = num << 6; // * 64
      num = temp ^ num;
      // mod 16777216
      // 100000000 % 16777216 === 16113920
      // 100000000 & 0xFFFFFF === 16113920
      num = num & 0xFFFFFF;
      // step 2
      temp = num >> 5; // divide by 32 and round down
      num = temp ^ num;
      num = num & 0xFFFFFF;
      // step 3
      temp = num << 11; // * 2048
      num = temp ^ num;
      num = num & 0xFFFFFF;
    }
    total += num;
    result.push(num);
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

    evolve();
    console.log(buyers)
    console.log(result)
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
