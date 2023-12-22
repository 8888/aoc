const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let map = [];
let queue = new Set();
let seen = {};
let gardens = 0;
let rocks = 0;
let up = -1;
let down = -1;
let left = -1;
let right = -1;
const expansion = {up: {r: -1, c: -1}, down: {r: -1, c: -1}, left: {r: -1, c: -1}, right: {r: -1, c: -1}};
let startCenter = [];

const parse = (line) => {
  // console.log(line);
  const startCol = line.indexOf('S');
  if (startCol > -1) {
    startCenter = [map.length, startCol];
    line = line.replace('S', '.');
  }
  map.push(line);
  gardens += (line.match(/\./g) || []).length;
  rocks += (line.match(/#/g) || []).length;
}

const expandMap = (size) => {
  // size new length of the side of the square
  // size is number of input maps
  map = map.map(row => row.repeat(size));
  const mapLength = map.length;
  for (let i = 0; i < size - 1; i++) {
    for (let i = 0; i < mapLength; i++) {
      map.push(map[i]);
    }
  }
  startCenter = [Math.floor(map.length/2), Math.floor(map.length/2)];
}

const doWork = (steps, start) => {
  queue.add(JSON.stringify(start));
  for (let i = 0; i < steps; i++) {
    const q = Array.from(queue);
    queue = new Set(); // reset for next step
    while (q.length) {
      const [row, col] = JSON.parse(q.shift());
      // check if we can step out of the map
      if (up === -1 && row - 1 < 0 && map[map.length - 1][col] === '.') {
        up = i;
        expansion.up.r = map.length - 1;
        expansion.up.c = col;
      } else if (down === -1 && row + 1 > map.length - 1 && map[0][col] === '.') {
        down = i;
        expansion.down.r = 0;
        expansion.down.c = col;
      } else if (left === -1 && col - 1 < 0 && map[row][map[0].length - 1] === '.') {
        left = i;
        expansion.left.r = row;
        expansion.left.c = map[0].length - 1;
      } else if (right === -1 && col + 1 > map[0].length - 1 && map[row][0] === '.') {
        right = i;
        expansion.right.r = row;
        expansion.right.c = 0;
      }

      // normal steps
      // up
      if (row > 0 && map[row - 1][col] === '.') {
        const next = [row - 1, col];
        queue.add(JSON.stringify(next));
      }
      // down
      if (row < map.length - 1 && map[row + 1][col] === '.') {
        const next = [row + 1, col];
        queue.add(JSON.stringify(next));
      }
      // left
      if (col > 0 && map[row][col - 1] === '.') {
        const next = [row, col - 1];
        queue.add(JSON.stringify(next));
      }
      // right
      if (col < map[0].length - 1 && map[row][col + 1] === '.') {
        const next = [row, col + 1];
        queue.add(JSON.stringify(next));
      }
    }
    const seed = JSON.stringify(Array.from(queue));
    if (seen[seed]) {
      console.log(`loop detected at step ${i} with ${queue.size} items in queue`);
      seen[seed].push(i);
    } else {
      seen[seed] = [i];
    }
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('21.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');

    expandMap(5);
    doWork(65 + (131*2), startCenter);
    console.log(`Spaces reachable: ${queue.size}`)
    console.log(`gardens: ${gardens}`)
    console.log(`rocks: ${rocks}`)
    console.log(`total: ${gardens + rocks}`)
    console.log(`left: ${left}, right: ${right}, up: ${up}, down: ${down}`);
    console.log(expansion)

  } catch (err) {
    console.error(err);
  }
})();

/*
Input
7570
gardens: 15072
rocks: 2089
total: 17161

first hit max at 260
first left at: 65
first right at: 65
first up at: 65
first down at: 65

It takes 260 steps to max the queue
Then every step it cycles between 7570 and 7496
after 65 steps the map expands in each direction
It enters the next maps at
{
  up: { r: 130, c: 65 },
  down: { r: 0, c: 65 },
  left: { r: 65, c: 130 },
  right: { r: 65, c: 0 }
}
It's a straight line from the centers of the maps with no rocks

After 65 steps: map expands from 1 -> 5 (+4)
Grid is 131 x 131
26501365 / 131 = 202300
131 * 202300 = 26501300
26501365 - 26501300 = 65


Oscillations
Start: mid
  loop detected at step 148 with 7496 items in queue
  loop detected at step 149 with 7570 items in queue
Up: [130, 65]
  loop detected at step 213 with 7496 items in queue
  loop detected at step 214 with 7570 items in queue
Down: [0, 65]
  loop detected at step 195 with 7496 items in queue
  loop detected at step 196 with 7570 items in queue
Left: [65, 130]
  loop detected at step 235 with 7496 items in queue
  loop detected at step 236 with 7570 items in queue
Right: [65, 0]
  loop detected at step 233 with 7496 items in queue
  loop detected at step 234 with 7570 items in queue

Starting at mid doWork(steps) = total
0: f(65) = 94353 (1x1 map)
1: f(65 + 131) = 34009 (3x3 map)
2: f(65 + 131 * 2) = 94353 (5x5 map)

Quadratic interpolation
iterpolating polynomial {{0,3797},{1,34009},{2,94353}}
15066 x^2 + 15146 x + 3797
https://www.wolframalpha.com/input?i=interpolating+polynomial+calculator&assumption=%7B%22F%22%2C+%22InterpolatingPolynomialCalculator%22%2C+%22data2%22%7D+-%3E%22%7B%7B0%2C3797%7D%2C%7B1%2C34009%7D%2C%7B2%2C94353%7D%7D%22

From above, 26501365 / 131 = 202300
Use x = 202300
616,583,483,179,597
616583483179597
*/
