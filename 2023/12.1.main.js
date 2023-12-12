const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;

const doWork = (line) => {
  console.log(line)
  const [springString, groupString] = line.split(' ');
  const springs = springString.split('');
  const groups = groupString.split(',').map(g => {
    return { total: parseInt(g), remaining: parseInt(g) };
  });

  const queue = [{
    springs: JSON.parse(JSON.stringify(springs)),
    groups: JSON.parse(JSON.stringify(groups))
  }];

  while (queue.length) {
    const { springs, groups } = queue.shift();
    if (springs.length === 0) {
      if (groups.length === 0 || (groups.length === 1 && groups[0].remaining === 0)) total++;
      continue;
    }

    if (springs[0] === '#') {
      if (groups[0]?.remaining > 0) {
        groups[0].remaining--;
        springs.shift();
        queue.push({
          springs: JSON.parse(JSON.stringify(springs)),
          groups: JSON.parse(JSON.stringify(groups))
        });
      } else {
        continue;
      }
    } else if (springs[0] === '.') {
      if (groups.length === 0 || groups[0].remaining === 0 || groups[0].remaining === groups[0].total) {
        if (groups[0]?.remaining === 0) groups.shift();
        springs.shift();
        queue.push({
          springs: JSON.parse(JSON.stringify(springs)),
          groups: JSON.parse(JSON.stringify(groups))
        });
      } else {
        continue;
      }
    } else { // ?
      let newSprings = JSON.parse(JSON.stringify(springs));
      newSprings[0] = '#';
      queue.push({
        springs: newSprings,
        groups: JSON.parse(JSON.stringify(groups))
      });
      newSprings = JSON.parse(JSON.stringify(springs));
      newSprings[0] = '.';
      queue.push({
        springs: newSprings,
        groups: JSON.parse(JSON.stringify(groups))
      });
    }
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('12.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      doWork(line);
    });

    await once(rl, 'close');

    console.log(total)

  } catch (err) {
    console.error(err);
  }
})();
