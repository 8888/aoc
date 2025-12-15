import java.io.File

data class Shape(
  var area: Int,
  val layout: MutableList<BooleanArray>
)

var total = 0
var shapes = mutableListOf<Shape>()
// prune the field as much as possible
var totalRegions = 0
var insufficientArea = 0

fun doWork(rows: Int, cols: Int, shapeQuantities: IntArray) {
  // println("rows: $rows, cols: $cols, shapes: ${shapeQuantities.contentToString()}")

  val areaAvailable = rows * cols
  var areaRequired = 0
  for ((index, quantity) in shapeQuantities.withIndex()) {
    areaRequired += quantity * shapes[index].area
  }
  if (areaRequired > areaAvailable) {
    insufficientArea++
    return
  }
}

File("12.txt").forEachLine { line ->
  if (line.contains('x')) {
    totalRegions++
    val parts = line.split(":")
    val dims = parts[0].split("x")
    val cols = dims[0].toInt()
    val rows = dims[1].toInt()
    val shapeQuantities = parts[1].trim().split(Regex("\\s+"))
      .map { it.toInt() }.toIntArray()
    doWork(rows, cols, shapeQuantities)
  } else if (line.contains(':')) {
    shapes.add(Shape(0, mutableListOf<BooleanArray>()))
  } else {
    shapes.last().area += line.count { it == '#' }
    shapes.last().layout.add(line.map { it == '#' }.toBooleanArray())
  }
}

println("Total regions: $totalRegions")
println("Insufficient area available: $insufficientArea")
println("Remaining regions: ${totalRegions - insufficientArea}")
