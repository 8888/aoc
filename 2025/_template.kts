import java.io.File

val inputText = File("01.txt").readText()
val puzzle = inputText.split("\n")

var total = 0

for (line in puzzle) {
  println(line)
}

println("total $total")
