const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;

const isSafe = (row) => {
  if (parseInt(row[0]) > parseInt(row[1])) {
    for (let i = 0; i < row.length-1; i++) {
      const a = parseInt(row[i]);
      const b = parseInt(row[i+1]);
      const diff = a - b;
      if (a <= b || diff < 1 || diff > 3) return i;
    }
    return true;
  } else if (parseInt(row[0]) < parseInt(row[1])) {
    // increasing, small -> big
    for (let i = 0; i < row.length-1; i++) {
      const a = parseInt(row[i]);
      const b = parseInt(row[i+1]);
      const diff = b - a;
      if (a >= b || diff < 1 || diff > 3) return i;
    }
    return true;
  } else {
    return 0;
  }
}

const doWork = (line) => {
  const row = line.split(' ');
  console.log(row);

  const safe = isSafe(row);

  if (safe === true) {
    console.log('safe');
    total++;
  } else if (safe === false) {
    console.log('*** unsafe first try? ***');
    return; // ever possible?
  } else {
    console.log(`UNSAFE! at ${safe}`);
    const row0 = [...row];
    row0.splice(safe, 1);
    const row1 = [...row]
    row1.splice(safe + 1, 1);
    const rowX = [...row];
    rowX.splice(0, 1);
    console.log(`trying spliced row: ${row0}`);
    console.log(`trying spliced row: ${row1}`);
    if (
      isSafe(row0) === true ||
      isSafe(row1) === true ||
      isSafe(rowX) === true
    ) total++;
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('02.txt'),
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
