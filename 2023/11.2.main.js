const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const galaxies = [];
let galaxiesFoundInCols;
let rowCount = 0;
const expansionAmount = 1000000 - 1;

const parse = (line) => {
  if (!galaxiesFoundInCols) {
    galaxiesFoundInCols = Array(line.length).fill(false);
  }

  let galaxyFoundInRow = false;
  for (let c = 0; c < line.length; c++) {
    if (line[c] === '#') {
      galaxyFoundInRow = true;
      const galaxy = {
        id: galaxies.length,
        distances: {}, // key: galaxy id, value: distance
        r: rowCount,
        c,
      };
      galaxies.push(galaxy);
      galaxiesFoundInCols[c] = true;
    }
  }

  if (!galaxyFoundInRow) rowCount += expansionAmount;
  rowCount++;
}

const expandCols = () => {
  const expansions = []; // index = row, value = exapansion value
  let currentExpansion = 0;
  galaxiesFoundInCols.forEach((found, c) => {
    if (!found) currentExpansion += expansionAmount;
    expansions.push(currentExpansion);
  });

  // shift affected galaxies
  galaxies.forEach(galaxy => {
    galaxy.c += expansions[galaxy.c];
  });
};

const search = () => {
  for (let i = 0; i < galaxies.length; i++) {
    const galaxy = galaxies[i];
    for (let j = i+1; j < galaxies.length; j++) {
      if (i === j) continue;
      const other = galaxies[j];
      const distance = Math.abs(galaxy.r - other.r) + Math.abs(galaxy.c - other.c);
      galaxy.distances[other.id] = distance;
      total += distance;
    }
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('11.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');

    expandCols();
    search();
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
