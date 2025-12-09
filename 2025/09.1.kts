import java.io.File
import kotlin.math.abs

val inputText = File("09.txt").readText()
val puzzle = inputText.split("\n")

var max: Long = 0

for (i in 0..puzzle.size - 2) {
  for (j in i..puzzle.size - 1) {
    val p1 = puzzle[i].split(',').map { it.toLong() }
    val p2 = puzzle[j].split(',').map { it.toLong() }
    val area = (abs(p1[0] - p2[0]) + 1) * (abs(p1[1] - p2[1]) + 1)
    max = maxOf(max, area)
  }
}

println("max $max")
