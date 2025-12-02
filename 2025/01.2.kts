import java.io.File

val inputText = File("01.txt").readText()
val puzzle = inputText.split("\n")

var position = 50
var hits = 0

for (line in puzzle) {
  // println("$position $line")
  val direction = if (line[0] == 'L') -1 else 1
  val amount = line.substring(1).toInt()
  hits += amount / 100
  val move = direction * amount % 100
  if (
    (position != 0 && position != 100) &&
    (position + move < 0 || position + move > 100)
  ) hits++
  position += move
  position %= 100
  if (position < 0) position += 100
  if (position == 0) hits += 1
  // println("d:$direction a:$amount m:$move p:$position h:$hits")
}

println("hits $hits")
