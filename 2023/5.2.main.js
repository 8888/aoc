const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let stage = 0;
let seedMap = [];

const createSeeds = (line) => {
  const seeds = line.replace(/seeds: /, '').match(/[0-9]+/g);
  for (let i = 0; i < seeds.length; i += 2) {
    const min = parseInt(seeds[i]);
    const max = min + parseInt(seeds[i + 1]) - 1;
    seedMap.push({min, max, stage});
  }
  seedMap.sort((a, b) => a.min - b.min);
}

const updateSeeds = (seed, next) => {
  let postSeedMap = null;

  if (seed.min < next.min) {
    const preMapSeed = {
      min: seed.min,
      max: next.min - 1,
      stage: seed.stage,
    };
    seed.min = next.min;
    seedMap.push(preMapSeed);
    seedMap.sort((a, b) => a.min - b.min);
  }

  if (next.min < seed.min) {
    next.min = seed.min;
  }

  if (seed.max > next.max) {
    const postMapSeed = {
      min: next.max + 1,
      max: seed.max,
      stage: seed.stage,
    };
    seed.max = next.max;
    seedMap.push(postMapSeed);
    seedMap.sort((a, b) => a.min - b.min);
  }

  if (next.max > seed.max) {
    postSeedMap = {
      min: seed.max + 1,
      max: next.max,
      operator: next.operator,
    };
    next.max = seed.max;
  }

  if (seed.min === next.min && seed.max === next.max) {
    seed.min += next.operator;
    seed.max += next.operator;
    seed.stage = stage;
  }

  return postSeedMap;
}

const doWork = (line) => {
  if (!line) {
    stage++;
    return;
  } else if (!seedMap.length) {
    createSeeds(line);
  } else if (isNaN(line[0])) {
    // skip the titles
    return;
  } else {
    // numbers
    const nums = line.match(/[0-9]+/g);
    const min = parseInt(nums[1]);
    const max = min + parseInt(nums[2]) - 1;
    const operator = parseInt(nums[0]) - min;
    const next = {min, max, operator};

    for (let i = 0; i < seedMap.length; i++) {
      if (
        seedMap[i].stage != stage &&
        seedMap[i].min <= next.max && next.min <= seedMap[i].max
      ) {
        const newNext = updateSeeds(seedMap[i], next);
        if (newNext) {
          const dest = newNext.min + newNext.operator;
          const source = newNext.min;
          const length = newNext.max - newNext.min + 1;
          doWork(`${dest} ${source} ${length}`);
        }
        break;
      }
    }
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('5.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      doWork(line);
    });

    await once(rl, 'close');
    console.log(seedMap.sort((a, b) => a.min - b.min)[0].min);

  } catch (err) {
    console.error(err);
  }
})();
