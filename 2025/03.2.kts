import java.io.File

val inputText = File("03.txt").readText()
val puzzle = inputText.split("\n").map { line ->
  line.map { it.digitToInt() }
}
var total: Long = 0

for (line: List<Int> in puzzle) {
  var jolts = ""

  val numBatteries = 12
  var segmentStart = 0
  for (remainderRequired in numBatteries downTo 1) {
    val segmentEnd = line.size - remainderRequired
    // println("segmentStart: $segmentStart segmentEnd: $segmentEnd remainderRequired: $remainderRequired")
    val segment = line.slice(segmentStart..segmentEnd)

    var max = 0
    var iMax = -1
    for (i in segment.indices) {
      if (max == 9) break
      if (segment[i] > max) {
        max = segment[i]
        iMax = i
      }
    }
    segmentStart += iMax + 1
    jolts += "$max"
    // println("largest: $max jolts: $jolts")
  }
  total += jolts.toLong()
}

println("total $total")
