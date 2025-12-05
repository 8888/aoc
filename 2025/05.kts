import java.io.File

data class IngredientRange(var min: Long, var max: Long)

class Fresh {
  private val ranges = mutableListOf<IngredientRange>()

  fun add(range: IngredientRange) {
    var min = range.min
    var max = range.max
    var searching = true
    while (searching) {
      searching = false
      for ((index, value) in this.ranges.withIndex()) {
        if (min <= value.max && max >= value.min) {
          min = minOf(min, value.min)
          max = maxOf(max, value.max)
          ranges.removeAt(index)
          searching = true
          break
        }
      }
    }
    ranges.add(IngredientRange(min, max))
    // this.print()
  }

  fun checkIngredient(id: Long) {
    for (range in this.ranges) {
      if (id >= range.min && id <= range.max) total += 1
    }
  }

  fun total(): Long {
    var count: Long = 0
    for (range in this.ranges) {
      count += range.max - range.min + 1
    }
    return count
  }

  fun print() {
    ranges.forEach { println(it) }
  }
}

val fresh = Fresh()
var total = 0

var setupComplete = false
File("05.txt").forEachLine { line ->
  if (line.isEmpty()) {
    setupComplete = true
  } else if (setupComplete) {
    fresh.checkIngredient(line.toLong())
  } else {
    val values = line.split("-")
    fresh.add(IngredientRange(values[0].toLong(), values[1].toLong()))
  }
}

println("Silver: $total")
println("Gold: ${fresh.total()}")
