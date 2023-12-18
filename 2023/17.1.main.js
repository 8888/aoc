const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let map = [];
const directions = {
  'n': [-1, 0],
  's': [1, 0],
  'e': [0, 1],
  'w': [0, -1],
};

const parse = (line) => {
  console.log(line);
  map.push(line.split('').map(c => {
    return {
      heat: parseInt(c),
      total: Infinity,
      visited: false,
    };
  }));
}

const sortQueue = (queue) => {
  // this could be a performance issue
  // if needed, replace with a min heap maybe
  queue.sort((a, b) => {
    return map[a.r][a.c].total - map[b.r][b.c].total;
  });
}

const doWork = () => {
  map[0][0].total = 0;
  const queue = [{r: 0, c: 0}];
  while (queue.length) {
    const {r, c} = queue.shift();
    for (const dir of Object.values(directions)) {
      const newR = r + dir[0];
      const newC = c + dir[1];
      // check if we are at the end
      if (newR === map.length-1 && newC === map[0].length-1) {
        return map[r][c].total + map[newR][newC].heat;
      }

      // if the new cell is in bounds and has not been visited
      // and if current cell has not been visited
      //  worried that I'm pushing cells to the queue multiple times before working on them
      if (
        newR >= 0 && newR < map.length &&
        newC >= 0 && newC < map[0].length &&
        !map[newR][newC].visited &&
        !map[r][c].visited
      ) {
        map[newR][newC].total = Math.min(
          map[newR][newC].total,
          map[r][c].total + map[newR][newC].heat,
        );
        queue.push({r: newR, c: newC});
        sortQueue(queue);
      }
    }
    map[r][c].visited = true;
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('17.1.sample.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      parse(line);
    });

    await once(rl, 'close');

    const min = doWork();
    console.log(min)
    console.log('visited in map')
    map.forEach(row => {
      console.log(row.map(c => c.visited ? 'T' : 'F').join(''));
    })

  } catch (err) {
    console.error(err);
  }
})();
