const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const games = [];

const init = (line = '') => {
  if (line === '') {
    return;
  } else if (line.match(/Button A/)) {
    const vals = [...line.matchAll(/[0-9]+/g)];
    const game = {a : { x: parseInt(vals[0][0]), y: parseInt(vals[1][0]) }};
    games.push(game);
  } else if (line.match(/Button B/)) {
    const vals = [...line.matchAll(/[0-9]+/g)];
    games[games.length - 1].b = { x: parseInt(vals[0][0]), y: parseInt(vals[1][0]) };
  } else {
    const vals = [...line.matchAll(/[0-9]+/g)];
    games[games.length - 1].p = { x: parseInt(vals[0][0]), y: parseInt(vals[1][0]) };
  }
}

playGames = () => {
  games.forEach(game => {
    console.log(game)
    const wins = [];
    const aStart = Math.floor(game.p.x / game.a.x);
    for (let a = aStart; a >= 0; a--) {
      for (let b = 0; b <= 100; b++) {
        const loc = {
          x: (game.a.x * a) + (game.b.x * b),
          y: (game.a.y * a) + (game.b.y * b),
        };
        if (loc.x === game.p.x && loc.y === game.p.y) {
          const c = (a * 3) + b;
          wins.push({a, b, c});
        } else if (loc.x > game.p.x || loc.y > game.p.y) {
          break;
        }
      }
    }
    wins.sort((a, b) => a.c - b.c);
    console.log(wins);
    if (wins.length) total += wins[0].c;
  });
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('13.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    playGames();
    console.log(total);

  } catch (err) {
    console.error(err);
  }
})();
