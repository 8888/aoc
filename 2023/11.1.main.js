const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const map = [];
const galaxies = [];
let galaxiesFoundInCols;

const parse = (line) => {
  if (!galaxiesFoundInCols) {
    galaxiesFoundInCols = Array(line.length).fill(false);
  }
  console.log(line)
  let row = [];
  let galaxyFoundInRow = false;
  for (let c = 0; c < line.length; c++) {
    if (line[c] === '#') {
      galaxyFoundInRow = true;
      const galaxy = {
        id: galaxies.length,
        distances: {}, // key: galaxy id, value: distance
        r: map.length,
        c,
      };
      galaxies.push(galaxy);
      row.push(galaxy);
      galaxiesFoundInCols[c] = true;
    } else {
      row.push(null);
    }
  }
  map.push(row);
  if (!galaxyFoundInRow) {
    map.push(Array(row.length).fill(null));
  }
}

const expandCols = () => {
  const expansions = [];
  for (let c = galaxiesFoundInCols.length - 1; c >= 0; c--) {
    if (!galaxiesFoundInCols[c]) {
      for (let r = 0; r < map.length; r++) {
        map[r].splice(c+1, 0, null);
      }
      expansions.push(c);
    }
  }
  // shift affected galaxies
  galaxies.forEach(galaxy => {
    expansions.forEach(expansion => {
      if (galaxy.c > expansion) {
        galaxy.c++;
      }
    });
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
      console.log(`${i}(${galaxy.r}, ${galaxy.c}) -> ${j}(${other.r}, ${other.c}): ${distance}`);
      total += distance;
    }
  }
}

const viz = () => {
  console.log(map.map(row => row.map(cell => cell ? cell.id : '.').join('')).join('\n'));
  console.log('rows:', map.length)
  console.log('cols:', map[0].length)
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
    viz();
    search();
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
