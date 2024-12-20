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
    const candidate = cheatCandidates.pop();
    directions.forEach(dir => {
      const next = {r: candidate.r + (dir.r * 2), c: candidate.c + (dir.c * 2)}
      if (
        isStepInBounds(next) &&
        map[next.r][next.c].space !== '#' &&
        map[next.r][next.c].time - 2 > map[candidate.r][candidate.c].time
      ) {
        cheats.push({
          start: {...candidate},
          end: {...next},
          time: map[next.r][next.c].time - map[candidate.r][candidate.c].time - 2 // count the two cheat steps
        });
      }
    })
  }
  cheats.sort((a, b) => b.time - a.time)
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
    console.log(cheats)

    console.log('Cheats saving at least 100 steps:')
    console.log(cheats.filter(c => c.time >= 100).length)

  } catch (err) {
    console.error(err);
  }
})();
