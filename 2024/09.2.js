const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

let total = 0;
let map = [];

const init = (line) => {
  let file = 0;
  for (let i = 0; i < line.length; i++) {
    if (i % 2) {
      map.push({ empty: true, size: parseInt(line[i]) });
    } else {
      map.push({ empty: false, size: parseInt(line[i]), file })
      file++;
    }
  }
  mergeEmpty();
}

const mergeEmpty = () => {
  for (let i = map.length - 1; i > 0; i--) {
    if (map[i].empty && map[i-1].empty) {
      map[i-1] = {...map[i-1], size: map[i].size + map[i-1].size}
      map.splice(i, 1)
    }
  }
}

const defrag = () => {
  let file = map[map.length-1].file;
  for (let f = file; f >= 0; f--) {
    let right = map.length - 1;
    let left = 0;
    while (right > 0 && left < right) {
      if (map[right].empty || map[right].file > f) {
        right--;
      } else if (!map[left].empty || map[left].size < map[right].size) {
        left++;
      } else {
        const oldLeft = structuredClone(map[left]);
        const extra = map[left].size - map[right].size;
        map[left] = map[right];
        map[right] = {empty: true, size: map[left].size};
        if (extra) map.splice(left+1, 0, {empty: true, size: extra});
        left = 0;
        mergeEmpty();
        // printMap();
        break;
      }
    }
  }
}

const printMap = () => {
  let mapStr = '';
  map.forEach(m => {
    if (m.empty) {
      mapStr += '.'.repeat(m.size)
    } else {
      mapStr += `${m.file}`.repeat(m.size);
    }
  });
  console.log(mapStr);
}

const checkSum = () => {
  let digits = 0;
  map.forEach(m => {
    for (let i = 0; i < m.size; i++) {
      if (!m.empty) total += digits * m.file;
      digits++;
    }
  });
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('09.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      init(line);
    });

    await once(rl, 'close');

    defrag()
    checkSum();
    console.log(total);

  } catch (err) {
    console.error(err);
  }
})();
