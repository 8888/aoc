const { once } = require('node:events');
const { createReadStream, stat } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const map = [];
const state = [];

const doWork = (line) => {
  console.log(line)
  const currentRowNumber = map.length;
  let count = false;
  if (line != '' && line != 'end') {
    map.push(line.split(''));
  } else {
    count = true;
    line = '#'.repeat(100); // adjust for line size
  }

  for (let col = 0; col < line.length; col++) {
    // state is a list w/ an object per column
    // state[column number]
    if (currentRowNumber === 0) state.push({open: [], stones: []}); // only for first row

    if (line[col] === '.') {
      state[col].open.push(currentRowNumber); // need id of row
    } else if (line[col] === 'O') {
      state[col].stones.push(currentRowNumber);
    } else { //  must be a #
      // roll the stones you can
      while (state[col].open.length && state[col].stones.length) {
        const openRow = state[col].open.shift();
        const stoneRow = state[col].stones.shift();
        if (openRow > stoneRow) {
          state[col].open.unshift(openRow);
          continue;
        };
        map[openRow][col] = 'O';
        map[stoneRow][col] = '.';
        state[col].open.push(stoneRow);
        state[col].open = state[col].open.sort((a,b) => a - b);
      }
      state[col] = {open: [], stones: []};
    }
  }

  if (count) {
    map.forEach((row, i) => {
      console.log('row:', row)
      const value = map.length - i;
      row.forEach(col => {
        if (col === 'O') total += value;
      });
    });
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('14.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      doWork(line);
    });

    await once(rl, 'close');

    console.log('\n')
    map.forEach(m => console.log(m.join('')));
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
