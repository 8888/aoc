import java.io.File

val inputText = File("03.txt").readText()
val puzzle = inputText.split("\n")

var total = 0

for (line in puzzle) {
  var i1 = 0
  var i2 = 1

  for (i in 1..line.length-1) { // start at the second digit, first is already locked in as max i1
    val cur = line[i].toInt()
    if (i == line.length - 1) {
      // last index, can't be first number
      if (cur > line[i2].toInt()) i2 = i
    } else if (cur > line[i1].toInt()) {
      i1 = i
      i2 = i + 1
    } else if (cur > line[i2].toInt()) {
      i2 = i
    }
  }
  val jolts = "${line[i1]}${line[i2]}".toInt()
  total += jolts
}

println("total $total")
