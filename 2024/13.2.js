const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
const games = [];
const increase = 10000000000000;

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
    games[games.length - 1].p = { x: parseInt(vals[0][0]) + increase, y: parseInt(vals[1][0]) + increase };
  }
}

const playGames = () => {
  games.forEach(game => {
    console.log(game)
    /*
    {
      a: { x: 94, y: 34 },
      b: { x: 22, y: 67 },
      p: { x: 8400, y: 5400 }
    }
    two linear equations
    x1 * a + x2 * b = px
    y1 * a + y2 + b = py

    a.x * n + b.x * m = p.x
    94n + 22m = 8400
    a.y * n + b.y * m = p.y
    34n + 67m = 5400
    n = how many times you press a
    m = how many times you press b
    find n & m

    Go back to variables as we'll use that in code
    Solve both for n
    a.x * n + b.x * m = p.x
    a.x * n = p.x - (b.x * m)
    n = (p.x - (b.x * m)) / a.x

    a.y * n + b.y * m = p.y
    a.y * n = p.y - (b.y * m)
    n = (p.y - (b.y * m)) / a.y

    We have two equations solving for n, set them equal to each other
    (p.x - (b.x * m)) / a.x = (p.y - (b.y * m)) / a.y

    Now get this to just solve for m alone
    p.x/a.x - (b.x*m)/a.x = p.y/a.y - (b.y * m)/a.y
    move the pieces w/ m to the same side
    (b.y * m)/a.y - (b.x*m)/a.x = p.y/a.y - p.x/a.x
    m * (b.y/a.y - b.x/a.x) = p.y/a.y - p.x/a.x
    cross multiply to clean up a bit
    m * ((a.x * b.y) - (b.x * a.y))/(a.x * a.y) = ((p.y * a.x) - (p.x * a.y)) / (a.x * a.y)
    remove common denominator
    m * ((a.x * b.y) - (b.x * a.y)) = (p.y * a.x) - (p.x * a.y)
    solve for m
    m = ((p.y * a.x) - (p.x * a.y)) / ((a.x * b.y) - (b.x * a.y))

    plug in values from game above
    {
      a: { x: 94, y: 34 },
      b: { x: 22, y: 67 },
      p: { x: 8400, y: 5400 }
    }
    m = ((5400 * 94) - (8400 * 34)) / ((94 * 67) - (22 * 34))
    m = (507600 - 285600) / (6298 - 748)
    m = 222000 / 5550
    m = 40

    now use the value of m to solve for n
    we have an equation from before already
    n = (p.x - (b.x * m)) / a.x
    n = (8400 - (22 * 40)) / 94
    n = (8400 - 880) / 94
    n = 7520 / 94
    n = 80

    m = 40
    n = 80

    press button A 80 times
    press button B 40 times
    cost = 80 * 3 + 40
    cost = 240 + 40
    cost = 280

    Before calculating a cost, just check if both pressess are integers and that will be the correct answer.

    Moving to code
    m = ((p.y * a.x) - (p.x * a.y)) / ((a.x * b.y) - (b.x * a.y))
    This is how many times you press B
    Use that to solve for how many times you press A
    n = (p.x - (b.x * m)) / a.x
    Check for ints
    calc total

    Somewhere I mixed up m and n in my brain
    m = b button presses
    n = a button presses
    */
    const {a, b, p} = game;
    const m = ((p.y * a.x) - (p.x * a.y)) / ((a.x * b.y) - (b.x * a.y));
    const n = (p.x - (b.x * m)) / a.x
    console.log(`A ${n}, B ${m}`)
    if (Number.isInteger(n) && Number.isInteger(m)) {
      total += n*3 + m;
    }
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
