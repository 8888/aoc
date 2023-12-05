const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

const stages = [
  'seeds: ',
  'seed-to-soil map:',
  'soil-to-fertilizer map:',
  'fertilizer-to-water map:',
  'water-to-light map:',
  'light-to-temperature map:',
  'temperature-to-humidity map:',
  'humidity-to-location map:',
];
let currentStage = 0;
// [ [seed, soil, fertilizer, water, light, temperature, humidity, location] ]
let seedMap = [];
// [{Destination, Source, Length}] seed-to-soil: d=soil s=seed
let currentRangeList = [];

const doWork = (line) => {
  if (!line) {
    // process completed stage
    console.log(stages[currentStage]);
    currentRangeList.sort((a, b) => a.s - b.s);
    console.log(currentRangeList);

    if (currentStage) {
      // search for best match
      seedMap.forEach((seed, i) => {
        const target = seed[currentStage - 1];
        let start = 0;
        let end = currentRangeList.length - 1;
        let mid;

        while (start <= end) {
          mid = Math.ceil(start + ((end - start) / 2));
          const range = currentRangeList[mid];
          if (target < range.s) {
            // search right
            end = mid - 1;
          } else if (target > range.s) {
            // search left
            start = mid + 1;
          } else {
            break;
          }
        }

        if (target < currentRangeList[mid].s) {
          if (mid === 0) {
            seedMap[i][currentStage] = seedMap[i][currentStage - 1];
          } else {
            mid--;
          }
        }

        if (target === currentRangeList[mid].s) {
          seedMap[i][currentStage] = currentRangeList[mid].d;
        } else if (
          target > currentRangeList[mid].s &&
          target - currentRangeList[mid].s <= currentRangeList[mid].l) {
            seedMap[i][currentStage] = currentRangeList[mid].d + (target - currentRangeList[mid].s);
        } else {
          seedMap[i][currentStage] = seedMap[i][currentStage - 1];
        }
      });
    }

    // setup for next stage
    currentStage++;
    currentRangeList = [];
  } else if (currentStage === 0) {
    // seeds
    const seeds = line.replace(/seeds: /, '').match(/[0-9]+/g);
    seeds.forEach(seed => {
      const arr = Array(8);
      arr[0] = seed;
      seedMap.push(arr);
    });
  } else if (isNaN(line[0])) { // skip the titles
    return;
  } else {
    // continue with current stage
    const nums = line.match(/[0-9]+/g);
    currentRangeList.push({d: parseInt(nums[0]), s: parseInt(nums[1]), l: parseInt(nums[2])});
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

    console.log(seedMap.sort((a, b) => a[7] - b[7])[0][7]);

  } catch (err) {
    console.error(err);
  }
})();
