const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let perimeter = 0;
const points = [[0,0]];

const parse = (line) => {
  console.log(line)
  const tokens = line.split(' ');
  const prevPoint = points[points.length - 1];
  let x = 0;
  let y = 0;
  switch (tokens[0]) {
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
  points.push([ prevPoint[0] + (x * tokens[1]), prevPoint[1] + (y * tokens[1]) ]);
  perimeter += parseInt(tokens[1]);
}

const findArea = () => {
  let left = 0;
  let right = 0;
  for (let i = 0; i < points.length - 1; i++) {
    left += points[i][0] * points[i+1][1];
    right += points[i][1] * points[i+1][0];
  }
  // include last point
  left += points[points.length - 1][0] * points[0][1];
  right += points[points.length - 1][1] * points[0][0];
  const inside = Math.abs(left - right) / 2;
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
