import java.io.File

val inputText = File("02.txt").readText()
val puzzle = inputText.split(",")

var total: Long = 0

for (line in puzzle) {
  val range = line.split("-")
  var target = range[0]
  while (target.toLong() <= range[1].toLong()) {
    if (target.length % 2 == 0) {
      var l = 0
      var r = target.length / 2
      var pattern = true
      while (pattern) {
        if (l == target.length / 2) break
        if (target[l] == target[r]) {
          l++
          r++
        } else {
          pattern = false
        }
      }
      if (pattern) total += target.toLong()
    }
    target = (target.toLong() + 1).toString()
  }
}

println("total: $total")
