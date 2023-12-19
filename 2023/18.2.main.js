const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let perimeter = 0;
const points = [[0,0]];
const directions = ['R', 'D', 'L', 'U'];

const parse = (line) => {
  console.log(line)
  const tokens = line.split(' ');
  const hex = parseInt(tokens[2].slice(2, 7), 16);
  const dir = directions[tokens[2].slice(7, 8)];
  const prevPoint = points[points.length - 1];
  let x = 0;
  let y = 0;
  switch (dir) {
    case 'U':
      y = -1;
      break;
    case 'D':
      y = 1;
      break;
    case 'L':
      x = -1;
      break;
    case 'R':
      x = 1;
      break;
  }
  points.push([ prevPoint[0] + (x * hex), prevPoint[1] + (y * hex) ]);
  perimeter += hex;
}

const findArea = () => {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += points[i][0] * points[i+1][1] - points[i][1] * points[i+1][0];
  }
  // include last point
  total += points[points.length - 1][0] * points[0][1] - points[points.length - 1][1] * points[0][0];
  const inside = Math.abs(total) / 2;
  const area = inside + (perimeter / 2) + 1;
  return area;
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('18.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');

    const total = findArea();
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
