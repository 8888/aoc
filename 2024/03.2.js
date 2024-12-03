const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
let on = true;

const doWork = (line) => {
  // console.log(line);
  const re = /(mul\([0-9]{1,3},[0-9]{1,3}\))|(do\(\))|(don't\(\))/g;
  const results = [...line.matchAll(re)];

  results.forEach(r => {
    const str = r[0];
    if (str.includes('mul')) {
      // run mult
      if (on) {
        console.log(str);
        const re2 = /[0-9]{1,3}/g;
        const digits = [...r[0].matchAll(re2)];
        // console.log('digits')
        // console.log(digits)
        total += (parseInt(digits[0][0]) * parseInt(digits[1][0]));
      }
    } else if (str.includes('don')) {
      // turn off
      console.log(str);
      on = false;
    } else {
      // turn on
      console.log(str);
      on = true;
    }
  });
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('03.txt'),
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
