const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
let rows = [];
let cols = [];

const parse = (line) => {
  if (!line || line === 'end') {
    total += findReflection();
    rows = [];
    cols = [];
  } else {
    let row = 0b0;
    for (let c = 0; c < line.length; c++) {
      if (!cols[c]) cols[c] = 0b0;
      row = row << 1;
      cols[c] = cols[c] << 1;
      if (line[c] === '#') {
        row += 0b1;
        cols[c] += 0b1;
      }
    }
    // console.log(row.toString(2));
    rows.push(row);
  }
}

const findReflection = () => {
  // a reflection is two lines that are identical or off by one
  // bitwise xor two identical rows should be 0
  // bitwise xor two rows that are off by one should leave only one bit on

  // start with rows
  for (let r = 0; r < rows.length - 1; r++) { // don't need to check last item alone
    const xor = rows[r] ^ rows[r+1];
    if (xor === 0 || (xor & (xor - 1)) === 0) {
      // reflection found
      let smudge = xor != 0; // if xor isn't 0 then a smudge was used to create the reflection
      for (let i = 1; r-i >= 0 && r+1+i < rows.length; i++) { // don't step out of the array
        if (rows[r-i] != rows[r+1+i]) {
          const xor2 = rows[r-i] ^ rows[r+1+i];
          if ((xor2 & (xor2 - 1)) === 0 && !smudge) {
            smudge = true;
          } else {
            smudge = false; // cheating a bit and storing extra state here. this means no reflection as well
            break;
          }
        }
      }
      if (smudge) return (r + 1) * 100;
    }
  }

  // moved to cols
  for (let c = 0; c < cols.length - 1; c++) { // don't need to check last item alone
    const xor = cols[c] ^ cols[c+1];
    if (xor === 0 || (xor & (xor - 1)) === 0) {
      // reflection found
      let smudge = xor != 0; // if xor isn't 0 then a smudge was used to create the reflection
      for (let i = 1; c-i >= 0 && c+1+i < cols.length; i++) { // don't step out of the array
        if (cols[c-i] != cols[c+1+i]) {
          const xor2 = cols[c-i] ^ cols[c+1+i];
          if ((xor2 & (xor2 - 1)) === 0 && !smudge) {
            smudge = true;
          } else {
            smudge = false; // cheating a bit and storing extra state here. this means no reflection as well
            break;
          }
        }
      }
      if (smudge) return c + 1;
    }
  }
};

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('13.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');

    console.log('total', total);

  } catch (err) {
    console.error(err);
  }
})();
