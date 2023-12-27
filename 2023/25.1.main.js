const { once } = require('node:events');
const { createReadStream, readFileSync, writeFile } = require('node:fs');
const { createInterface } = require('node:readline');
const { exec } = require('child_process');

const inputText = ['digraph {'];

(async function processLineByLine() {
  try {
    const rl = createInterface({
      input: createReadStream('25.1.input.txt'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      // parse input to graphviz syntax
      inputText.push(line.replace(/: /g, ' -> {') + '}');
    });

    await once(rl, 'close');

    inputText.push('}')
    writeFile('input.dot', inputText.join('\n'), err => {
      if (err) console.error(err);
    });
    exec('dot -Tsvg input.dot > output.svg; open output.svg', (err, stdout, stderr) => {
      if (err) return;
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });

    console.log()

  } catch (err) {
    console.error(err);
  }
})();

stream = readFileSync('output.txt', 'utf8')
data = stream.replace(/\r/,'')

bound = 26316.23 - 10
vertices = (data.match(/middle(.*?)font/g))
count = 0
num_vertices = 0
for(let line of vertices){
    num_vertices++
    if((parseFloat(line.split("x=\"")[1].split("\" y=")[0])) <= bound){
        count++
    }
}
console.log(count * (num_vertices - count))
