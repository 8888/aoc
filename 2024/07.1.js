const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;

const doWork = (line) => {
  const input = line.split(': ');
  const value = parseInt(input[0]);
  const nums = input[1].split(' ').map(n => parseInt(n));
  console.log(value)
  console.log(nums)

  const spaces = nums.length - 1; // how many spaces for operators
  const combos = Math.pow(2, spaces); // how many combinations of operators
  console.log(`spaces: ${spaces}`);
  console.log(`combos: ${combos}`);
  for (let c = 0; c < combos; c++) {
    let result = 0;
    console.log(`combo ${c}: ${c.toString(2)}`)
    for (let s = 0; s < spaces; s++) {
      const bit = (c >> s) & 0x1;
      const left = s === 0 ? nums[s] : result;
      if (bit == 0) {
        result = left + nums[s+1];
      } else {
        result = left * nums[s+1];
      }
    }
    console.log(`result: ${result} compared to value: ${value}`);
    if (result === value) {
      total += value;
      return;
    }
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('07.txt'),
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
