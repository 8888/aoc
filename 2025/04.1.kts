import java.io.File

val inputText = File("04.txt").readText()
val puzzle = inputText.split("\n")

var total = 0

for ((r, line) in puzzle.withIndex()) {
  // println(line)
  for ((c, space) in line.withIndex()) {
    if (space == '.') continue

    var count = 0
    if (r > 0 && c > 0 && puzzle[r-1][c-1] == '@') count++
    if (r > 0 && puzzle[r-1][c] == '@') count++
    if (r > 0 && c < line.length - 1 && puzzle[r-1][c+1] == '@') count++

    if (c > 0 && puzzle[r][c-1] == '@') count++
    if (c < line.length - 1 && puzzle[r][c+1] == '@') count++

    if (r < puzzle.size - 1 && c > 0 && puzzle[r+1][c-1] == '@') count++
    if (r < puzzle.size - 1 && puzzle[r+1][c] == '@') count++
    if (r < puzzle.size - 1 && c < line.length - 1 && puzzle[r+1][c+1] == '@') count++

    if (count < 4) total++
  }
}

println("total $total")
