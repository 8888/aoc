const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const test = { file: '20.test.txt' };
const goal = { file: '20.txt' };
const game = goal;

const map = [];
const start = {r: 0, c: 0, time: 0}
const end = {r: 0, c: 0}
const path = [];
const cheats = [];

const directions = [
  {r: -1, c: 0},
  {r: 0, c: 1},
  {r: 1, c: 0},
  {r: 0, c: -1},
]

const init = (line = '') => {
  const row = [];
  for (let i = 0; i < line.length; i++) {
    if (line[i] === 'S') {
      start.r = map.length;
      start.c = i;
    } else if (line[i] === 'E') {
      end.r = map.length;
      end.c = i;
    }
    row.push({space: line[i], time: 0});
  }
  if (row.length) map.push(row);
}

const printMap = (showTime = false) => {
  if (showTime) {
    map.forEach(r => {
      console.log(r.reduce((acc, cur) => {
        if (cur.space === '#') {
          return `${acc}.`;
        } else {
          const timeStr = cur.time.toString();
          return `${acc}${timeStr[timeStr.length-1]}`;
        }
      }, ''))
    })
  } else {
    map.forEach(r => {
      console.log(r.reduce((acc, cur) => `${acc}${cur.space}`, ''))
    })
  }
}

const findTimes = () => {
  let cur = {...start};
  let prev = {r: -1, c: -1};
  while (cur.r !== end.r || cur.c !== end.c) {
    path.push({...cur});
    for (let i = 0; i < directions.length; i++) {
      const dir = directions[i];
      const next = {r: cur.r + dir.r, c: cur.c + dir.c, time: cur.time + 1}
      if (
        (next.r !== prev.r || next.c !== prev.c) &&
        map[next.r][next.c].space !== '#'
      ) {
        map[next.r][next.c].time = next.time;
        prev = cur;
        cur = next;
        break;
      }
    }
  }
  printMap(true)
}

const isStepInBounds = (loc) => {
  return (
    loc.r >= 0 &&
    loc.r < map.length &&
    loc.c >= 0 &&
    loc.c < map[0].length
  );
}

const checkCheats = () => {
  const cheatCandidates = [...path];
  while (cheatCandidates.length) {
    // now find all unique spaces that can be stepped to in 20 steps or less
    // can only move through walls, once you're on a path you're done
    // ^^ this probably isn't true, just keep moving as far as possible
    // and then still check that the end location has a higher time than current location
    // seen will only be unique to each starting space, does not need to be shared
    // pop a starting space, BFS from there, all unique locations with a higher time are possible cheats
    const startSpace = cheatCandidates.shift();
    const queue = [startSpace];
    const seen = new Set();
    while (queue.length) {
      const cur = queue.shift();
      directions.forEach(dir => {
        const next = {r: cur.r + dir.r, c: cur.c + dir.c}
        const str = `${next.r},${next.c}`;
        const distance = Math.abs(next.r - startSpace.r) + Math.abs(next.c - startSpace.c);
        if (isStepInBounds(next) && !seen.has(str) && distance <= 20) {
          if (
            map[next.r][next.c].space !== '#' &&
            map[next.r][next.c].time - distance > map[startSpace.r][startSpace.c].time &&
            distance > 1 // don't step along path from start space
          ) {
            cheats.push({
              start: {...startSpace},
              end: {...next},
              time: map[next.r][next.c].time - distance - map[startSpace.r][startSpace.c].time,
            });
          }
          queue.push({r: next.r, c: next.c});
          seen.add(str);
        }
      })
    }
  }
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

    printMap()
    findTimes()
    checkCheats()

    console.log('Number of cheats for each amount of time saved:')
    console.log(cheats.reduce((prev, cur) => {
      prev[cur.time] = prev[cur.time] ? prev[cur.time] + 1 : 1;
      return prev;
    }, {}));

    console.log(`Total cheats: ${cheats.length}`)
    console.log(`Cheats saving at least 100 steps: ${cheats.filter(c => c.time >= 100).length}`)

  } catch (err) {
    console.error(err);
  }
})();
