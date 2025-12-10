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
    if (area > max) {
      // now check every point to see if they are within this rect?
      var pointFoundInRect = false
      for (k in 0..puzzle.size - 1) {
        if (k == i || k == j) continue
        val xMin = minOf(p1[0], p2[0])
        val xMax = maxOf(p1[0], p2[0])
        val yMin = minOf(p1[1], p2[1])
        val yMax = maxOf(p1[1], p2[1])
        val p3 = puzzle[k].split(',').map { it.toLong() }
        if (xMin+1 <= p3[0] && p3[0] <= xMax+1 && yMin+1 <= p3[1] && p3[1] <= yMax+1) {
          pointFoundInRect = true
          break
        }
      }
      if (!pointFoundInRect) max = area
    }
  }
}

println("max $max")
