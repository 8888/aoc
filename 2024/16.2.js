const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const example = { file: '16.example.txt' };
const test = { file: '16.test.txt' };
const goal = { file: '16.txt' };
const game = goal;

const map = [];
const seen = new Set();
let lowestScore = 0;
let goodSeats = new Set();

const directions = {
  'n': { r: -1, c: 0, turns: ['e', 'w'] },
  'e': { r: 0, c: 1, turns: ['n', 's'] },
  's': { r: 1, c: 0, turns: ['e', 'w'] },
  'w': { r: 0, c: -1, turns: ['n', 's'] },
};

const init = (line = '') => {
  if (line === '') return;
  map.push(line.split(''));
}

const search = () => {
  const goal = { r: 1, c: map[1].length - 2 };
  // use an array and sort each time to make sure its in priority order for each pop
  // replace with an implementation of a min priority queue if performance requires
  const queue = [{
    loc: { r: map.length - 2, c: 1 },
    dir: directions.e,
    score: 0,
    path: [`${map.length - 2},1`],
  }];
  while (queue.length) {
    queue.sort((a, b) => b.score - a.score);
    const cur = queue.pop();

    let next = { r: cur.loc.r + cur.dir.r, c: cur.loc.c + cur.dir.c };

    // check seen
    // const str = `${next.r},${next.c},${cur.dir.r},${cur.dir.c}`;
    // if (seen.has(str)) {
    //   continue;
    // } else {
    //   seen.add(str);
    // }

    // check next straight move
    if (map[next.r][next.c] === 'E') {
      lowestScore = lowestScore === 0 ? cur.score + 1 : lowestScore;
      if (cur.score + 1 === lowestScore) {
        cur.path.push(`${next.r}},${next.c}`);
        cur.path.forEach(p => goodSeats.add(p));
        printMap(cur.path)
      }
    } else if (map[next.r][next.c] === '.') {
      if (lowestScore === 0 || cur.score < lowestScore) {
        queue.push({
          loc: next,
          dir: cur.dir,
          score: cur.score + 1,
          path: [...cur.path, `${next.r}},${next.c}`],
        });
      }
    }

    // check turning for a move
    for (let i = 0; i < cur.dir.turns.length; i++) {
      const nextDir = directions[cur.dir.turns[i]];
      next = { r: cur.loc.r + nextDir.r, c: cur.loc.c + nextDir.c };
      if (map[next.r][next.c] === 'E') {
        cur.path.push(`${next.r}},${next.c}`);
        cur.path.forEach(p => goodSeats.add(p));
        if (lowestScore === 0) lowestScore = cur.score + 1001;
        printMap(cur.path)
      } else if (map[next.r][next.c] === '.') {
        if (lowestScore === 0 || cur.score < lowestScore - 1000) {
          queue.push({
            loc: next,
            dir: nextDir,
            score: cur.score + 1001,
            path: [...cur.path, `${next.r}},${next.c}`],
          });
        }
      }
    }
  }
}

const printMap = (path = []) => {
  console.log(`lowest score: ${lowestScore}`);
  const temp = JSON.parse(JSON.stringify(map));
  path.forEach(p => {
    const [r, c] = p.split(',');
    temp[parseInt(r)][parseInt(c)] = '0';
  });
  temp.forEach(m => console.log(m.join('')));
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream(game.file),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    search();
    console.log(goodSeats.size);
    console.log('*** final map ***');
    printMap(goodSeats)

  } catch (err) {
    console.error(err);
  }
})();
