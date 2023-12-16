const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

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

const doWork = (start) => {
  const stack = [start];
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
  // count and reset state
  let total = 0;
  map.forEach(row => {
    row.forEach(cell => {
      total += cell.energized ? 1 : 0
      cell.energized = false;
      cell.visited = {
        [JSON.stringify([0, 1])]: false,
        [JSON.stringify([0, -1])]: false,
        [JSON.stringify([1, 0])]: false,
        [JSON.stringify([-1, 0])]: false,
      };
    });
  });
  return total;
};

const checkAll = () => {
  let highest = 0;
  for (let r = 0; r < map.length; r++) {
    if (r === 0) {
      // run full row
      for (let c = 0; c < map[r].length; c++) {
        if (c === 0) {
          // move right in row
          doWork({r, c, velocity: [0, 1]});
          const total = count();
          highest = Math.max(highest, total);
        } else if (c === map[r].length - 1) {
          // move left in row
          doWork({r, c, velocity: [0, -1]});
          const total = count();
          highest = Math.max(highest, total);
        }
        // move down for all cols
        doWork({r, c, velocity: [1, 0]});
        const total = count();
        highest = Math.max(highest, total);
      }
    } else if (r === map.length - 1) {
      // run full row
      for (let c = 0; c < map[r].length; c++) {
        if (c === 0) {
          // move right in row
          doWork({r, c, velocity: [0, 1]});
          const total = count();
          highest = Math.max(highest, total);
        } else if (c === map[r].length - 1) {
          // move left in row
          doWork({r, c, velocity: [0, -1]});
          const total = count();
          highest = Math.max(highest, total);
        }
        // move up for all cols
        doWork({r, c, velocity: [-1, 0]});
        const total = count();
        highest = Math.max(highest, total);
      }
    } else {
      // run first col
      doWork({r, c: 0, velocity: [0, 1]});
      let total = count();
      highest = Math.max(highest, total);
      // run last col
      doWork({r, c: map[r].length - 1, velocity: [0, -1]});
      total = count();
      highest = Math.max(highest, total);
    }
  }
  return highest;
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

    let total = checkAll();
    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
