const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
let rows = [];
let cols = [];
let rMap = {};
let cMap = {};

const parse = (line) => {
  if (!line || line === 'end') {
    let result = doWork();
    console.log(result)
    total += result;
    // total += doWork();
    rows = [];
    cols = [];
    rMap = {};
    cMap = {};
    return;
  }

  // console.log(line)

  rMap[line] ? rMap[line].push(rows.length) : rMap[line] = [rows.length];

  rows.push(line);
  for (let c = 0; c < line.length; c++) {
    if (!cols[c]) cols[c] = '';
    cols[c] += line[c];
  }
}

const doWork = () => {
  cols.forEach((col, i) => {
    cMap[col] ? cMap[col].push(i) : cMap[col] = [i];
  });

  // console.log(rMap)
  // console.log(cMap)

  // check rows
  for (let i = 0; i < rows.length - 1; i++) { // don't need to check last item alone
    const row = rows[i];
    const rowIdxs = rMap[row];
    for (let j = 0; j < rowIdxs.length - 1; j++) { // don't need to check last item alone
      const idx = rowIdxs[j];
      if (idx + 1 === rowIdxs[j+1]) {
        // found a possible mirror line
        const value = rowIdxs[j+1];
        // check if it reflects to the end
        // left index is idx
        // right index is idx+1
        let mirror = true;
        for (let k = 0; idx + 1 + k < rows.length; k++) { // start one after the possible mirror line
          const left = rows[idx - k];
          const right = rows[idx + 1 + k];
          if (!left || !right) break; // reached an end
          if (left !== right) {
            mirror = false;
            break;
          }
        }
        if (mirror) {
          return value * 100;
        }
      }
    }
  }

  // check cols
  for (let i = 0; i < cols.length - 1; i++) { // don't need to check last item alone
    const col = cols[i];
    const colIdxs = cMap[col];
    for (let j = 0; j < colIdxs.length - 1; j++) { // don't need to check last item alone
      const idx = colIdxs[j];
      if (idx + 1 === colIdxs[j+1]) {
        // found a possible mirror line
        const value = colIdxs[j+1];
        // check if it reflects to the end
        // top index is idx
        // bottom index is idx+1
        let mirror = true;
        for (let k = 0; idx + 1 + k < cols.length; k++) { // start one after the possible mirror line
          const top = cols[idx - k];
          const bottom = cols[idx + 1 + k];
          if (!top || !bottom) break; // reached an end
          if (top !== bottom) {
            mirror = false;
            break;
          }
        }
        if (mirror) {
          return value;
        }
      }
    }
  }

  console.log('no mirror found')
}

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

    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
