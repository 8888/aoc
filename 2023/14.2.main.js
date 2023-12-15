const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let map = [];
let cache = {}; // key is stringified map, value is cycles

const parse = (line) => {
  map.push(line);
}

const slide = (line) => {
  const sections = line.match(/[O.]+|[#]+/g);
  let result = '';
  sections.forEach(section => {
    const stones = section.match(/O/g)?.length;
    if (stones) {
      result += 'O'.repeat(stones);
      result += '.'.repeat(section.length - stones);
    } else {
      result += section;
    }
  });
  return result;
};

const transposeRight = (matrix) => {
  const result = [];
  for (let c = 0; c < matrix[0].length; c++) {
    let row = '';
    for (let r = matrix.length - 1; r >= 0; r--) {
      row += matrix[r][c];
    }
    result.push(row);
  }
  return result;
};

const transposeLeft = (matrix) => {
  const result = [];
  for (let c = matrix[0].length - 1; c >= 0; c--) {
    let row = '';
    for (let r = 0; r < matrix.length; r++) {
      row += matrix[r][c];
    }
    result.push(row);
  }
  return result;
}

const spin = (matrix) => {
  let result = matrix;
  for (let i = 0; i < 4; i++) {
    result = result.map(row => slide(row));
    result = transposeRight(result);
  }
  return result;
};

const count = (matrix) => {
  let result = 0;
  matrix.forEach((row, i) => {
    const value = matrix.length - i;
    const stones = row.match(/O/g)?.length || 0;
    result += stones * value;
  });
  return result;
};

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('14.2.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');

    // set for normal state since slides all go left
    // orient north to the left to start
    const spins = 1000000000 +1;
    map = transposeLeft(map);
    for (let i = 0; i < spins; i++) {
      const key = JSON.stringify(map);
      if (cache.hasOwnProperty(key)) {
        console.log(`cycle detected at ${i}`);
        const cycle = i - cache[key];
        const cyclesRemaining = spins - i - 1;
        const skippedRemainder = cyclesRemaining % cycle;
        i = spins - skippedRemainder - 1;
        cache = {}
        console.log(`skipping ahead to ${i}`);
        continue;
      } else {
        cache[key] = i;
        map = spin(map);
      }
    }
    map = transposeRight(map); // normalize
    map.forEach(m => console.log(m));

    console.log(count(map));

  } catch (err) {
    console.error(err);
  }
})();
