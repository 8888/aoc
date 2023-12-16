const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const map = [];

const parse = (line) => {
  // console.log(line)
  const row = [];
  for (let i = 0; i < line.length; i++) {
    row.push({type: line[i], energized: false, visited: {
      [JSON.stringify([0, 1])]: false,
      [JSON.stringify([0, -1])]: false,
      [JSON.stringify([1, 0])]: false,
      [JSON.stringify([-1, 0])]: false,
    }});
  }
  map.push(row);
}

const doWork = () => {
  const stack = [{r: 0, c: 0, velocity: [0, 1]}];
  while (stack.length) {
    const beam = stack.pop();
    const {r, c, velocity} = beam;
    map[r][c].energized = true;
    map[r][c].visited[JSON.stringify(velocity)] = true;

    const newBeams = [];
    if (map[r][c].type === '\\') {
      const tempCol = beam.velocity[1];
      beam.velocity[1] = beam.velocity[0];
      beam.velocity[0] = tempCol;
      beam.r += beam.velocity[0];
      beam.c += beam.velocity[1];
      newBeams.push(beam);
    } else if (map[r][c].type === '/') {
      const tempCol = beam.velocity[1];
      beam.velocity[1] = beam.velocity[0] * -1;
      beam.velocity[0] = tempCol * -1;
      beam.r += beam.velocity[0];
      beam.c += beam.velocity[1];
      newBeams.push(beam);
    } else if (map[r][c].type === '-' && beam.velocity[0] != 0) {
      const beam1 = {r, c: c+1, velocity: [0, 1]};
      const beam2 = {r, c: c-1, velocity: [0, -1]};
      newBeams.push(beam1, beam2);
    } else if (map[r][c].type === '|' && beam.velocity[1] != 0) {
      // split
      const beam1 = {r: r+1, c, velocity: [1, 0]};
      const beam2 = {r: r-1, c, velocity: [-1, 0]};
      newBeams.push(beam1, beam2);
    } else {
      beam.r += beam.velocity[0];
      beam.c += beam.velocity[1];
      newBeams.push(beam);
    }

    newBeams.forEach(b => {
      if (
        b.r >= 0 && b.r < map.length &&
        b.c >= 0 && b.c < map[0].length &&
        !map[b.r][b.c].visited[JSON.stringify(b.velocity)]
      ) {
        stack.push(b);
      }
    });
  }
}

const count = () => {
  map.forEach(row => {
    row.forEach(cell => total += cell.energized ? 1 : 0);
    // console.log(row.map(cell => cell.energized ? '#' : '.').join(''))
  });
};

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('16.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');

    doWork();
    count();
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
