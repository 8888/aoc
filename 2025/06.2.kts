import java.io.File

data class Problem(val op: Char, var total: Long)

val inputText = File("06.txt").readText()
val puzzle = inputText.split("\n")
val homework = mutableListOf<Problem>()

for (col in 0..puzzle[0].length-1) {
  val newOp = puzzle.last()[col]
  var problem: Problem
  if (newOp.isWhitespace()) {
    problem = homework.last()
  } else {
    problem = Problem(newOp, 0)
    homework.add(problem)
  }

  var value = ""
  for (row in 0..puzzle.size-2) { // skip the op line at the end
    if (!puzzle[row][col].isWhitespace()) value += puzzle[row][col]
  }

  if (value.isEmpty()) continue
  if (problem.op == '+') {
    problem.total += value.toLong()
  } else {
    if (problem.total == 0L) problem.total = 1
    problem.total *= value.toLong()
  }
}

val total = homework.sumOf { it.total }
println("total $total")
