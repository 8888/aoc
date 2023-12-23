const { once } = require('node:events');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

/*
Input:  x,y,z
Map:    z,y,x
level -> row -> col
*/

let blocks = [[[]]];
let blockCount = -1;
let size = {x: 0, y: 0, z: 0};
const blockList = [];
let inputLines = [];

const readInput = (line) => {
  inputLines.push(line);
};

const buildTower = () => {
  inputLines.sort((a, b) => {
    return parseInt(a.match(/([0-9]+)/g)[2]) - parseInt(b.match(/([0-9]+)/g)[2]);
  });
  inputLines.forEach((line) => {
    parse(line);
  });
}

const parse = (line) => {
  console.log(line);
  blockCount++;
  const [x1, y1, z1, x2, y2, z2] = line.match(/[0-9]+/g).map(n => parseInt(n));
  // is there enough space for this block?
  size.x = Math.max(size.x, x1+1, x2+1);
  size.y = Math.max(size.y, y1+1, y2+1);
  size.z = Math.max(size.z, z1+1, z2+1);
  if (size.z > blocks.length || size.y > blocks[0].length || size.x > blocks[0][0].length) {
    for (let level = 0; level < size.z; level++) {
      if (blocks[level]) {
        for (let row = 0; row < size.y; row++) {
          if (blocks[level][row]) {
            for (let col = blocks[level][row].length; col < size.x; col++) {
              blocks[level][row].push(null);
            }
          } else {
            blocks[level].push(Array(size.x).fill(null));
          }
        }
      } else {
        const emptyLevel = []
        for (let row = 0; row < size.y; row++) {
          emptyLevel.push(Array(size.x).fill(null));
        }
        blocks.push(emptyLevel);
      }
    }
  }
  blockList.push({id: blockCount, supportedBy: new Set(), supporting: new Set()});
  dropBrick(x1, y1, z1, x2, y2, z2, blockCount);
}

const dropBrick = (x1, y1, z1, x2, y2, z2, id) => {
  let collision = 0;
  if (x1 != x2) {
    // brick along x axis
    // same row and level
    for (let level = z1-1; level >= 1; level--) {
      if (collision) break;
      for (let col = x1; col <= x2; col++) {
        if (blocks[level][y1][col] !== null) {
          collision = level;
          blockList[id].supportedBy.add(blocks[level][y1][col]);
          blockList[blocks[level][y1][col]].supporting.add(id);
        }
      }
    }
  } else if (y1 != y2) {
    // brick along y axis
    // same level, across different rows in the same col
    for (let level = z1-1; level >= 1; level--) {
      if (collision) break;
      for (let row = y1; row <= y2; row++) {
        if (blocks[level][row][x1] !== null) {
          collision = level;
          blockList[id].supportedBy.add(blocks[level][row][x1]);
          blockList[blocks[level][row][x1]].supporting.add(id);
        }
      }
    }
  } else {
    // brick along z axis
    // across differnt levels, same row and col
    for (let level = z1-1; level >= 1; level--) {
      if (blocks[level][y1][x1] !== null) {
        collision = level;
        blockList[id].supportedBy.add(blocks[level][y1][x1]);
        blockList[blocks[level][y1][x1]].supporting.add(id);
        break;
      }
    }
  }
  const length = z2 - z1;
  z1 = collision + 1;
  z2 = z1 + length;

  for (let level = z1; level <= z2; level++) {
    for (let row = y1; row <= y2; row++) {
      for (let col = x1; col <= x2; col++) {
        blocks[level][row][col] = id;
      }
    }
  }
};

const disintegrate = () => {
  let total = 0;
  // can disintegrate if it's not supporting any blocks
  // or if all the blocks it's supported are supported by more than one block
  blockList.forEach(block => {
    let canDisintegrate = true;
    block.supporting.forEach(support => {
      if (blockList[support].supportedBy.size <= 1) {
        canDisintegrate = false;
      }
    });
    if (canDisintegrate) total++;
  });
  return total;
};

const viz = () => {
  for (let i = blocks.length - 1; i >= 0; i--) {
    const level = blocks[i];
    console.log(`------Level ${i}`);
    level.forEach((row) => {
      console.log(row.map(col => col === null ? '.' : col).join(' '))
    });
  }
}

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('22.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      readInput(line);
    });

    await once(rl, 'close');

    buildTower();
    viz();
    const total = disintegrate();
    console.log(total);

  } catch (err) {
    console.error(err);
  }
})();
