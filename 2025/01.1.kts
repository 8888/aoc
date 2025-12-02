import java.io.File

val inputText = File("01.txt").readText()
val puzzle = inputText.split("\n")

var position = 50
var hits = 0

for (line in puzzle) {
  val direction = if (line[0] == 'L') -1 else 1
  val amount = line.substring(1).toInt() % 100
  val move = direction * amount
  position += move
  position %= 100
  if (position < 0) position += 100
  if (position == 0) hits += 1
  // println("$line $direction $amount $move $position")
}

println("hits $hits")
