const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const test = { file: '22.2.test.txt' };
const goal = { file: '22.txt' };
const game = goal;

const buyers = [];
const result = [];
const globalChanges = {}; // merged set of changes from all buyers

const init = (line = '') => {
  if (line === '') return;
  buyers.push(parseInt(line));
}

const calcCost = (num) => {
  const str = num.toString();
  return parseInt(str[str.length - 1]);
}

const evolve = () => {
  buyers.forEach(buyer => {
    const changes = {};
    let num = buyer;
    const diffHistory = new Array(4);
    let currentPrice = calcCost(num);
    let prevPrice = currentPrice
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

      currentPrice = calcCost(num);
      const diff = currentPrice - prevPrice;
      diffHistory.push(diff);
      diffHistory.shift();
      const historyStr = `${diffHistory[0]},${diffHistory[1]},${diffHistory[2]},${diffHistory[3]}`
      // console.log(`${num}: ${currentPrice} (${diff}) -- ${historyStr}`)

      prevPrice = currentPrice;

      if (i >= 3) {
        // wait until history has 4 items
        if (!changes[historyStr]) changes[historyStr] = currentPrice
      }
    }
    result.push(num);

    for (let [diffSequence, bananas] of Object.entries(changes)) {
      globalChanges[diffSequence] = globalChanges[diffSequence] ? globalChanges[diffSequence] + bananas : bananas
    }
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
    // console.log(buyers)
    // console.log(result)

    const ordered = []
    for (let [key, value] of Object.entries(globalChanges)) {
      ordered.push({key, value});
    }
    ordered.sort((a, b) => b.value - a.value);
    console.log(ordered[0])
    console.log(ordered[1])
    console.log(ordered[2])

    console.log(`the highest value is ${ordered[0].value}`)

  } catch (err) {
    console.error(err);
  }
})();
