import java.io.File

val inputText = File("06.txt").readText()
val puzzle = inputText.split("\n")

data class Problem(val op: String, var total: Long)
val homework = mutableListOf<Problem>()

var setupComplete = false
for (line in puzzle.reversed()) {
  if (setupComplete) {
    val values = Regex("\\d+").findAll(line).map { it.value.toLong() }.toList()
    for ((index, value) in values.withIndex()) {
      if (homework[index].op == "+") {
        homework[index].total += value
      } else {
        if (homework[index].total == 0L) {
          homework[index].total = value
        } else {
          homework[index].total *= value
        }
      }
    }
  } else {
    setupComplete = true
    for (op in line.split("\\s+".toRegex())) {
      homework.add(Problem(op, 0))
    }
  }
}

val total = homework.sumOf { it.total }

println("total $total")
