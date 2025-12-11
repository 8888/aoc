import java.io.File
import java.util.ArrayDeque

val inputText = File("10.txt").readText()
val puzzle = inputText.split("\n")

data class Attempt(
  var current: IntArray,
  var presses: Int = 0
)

class State(val lights: IntArray) {
  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (other !is State) return false
    return lights.contentEquals(other.lights)
  }

  override fun hashCode(): Int {
    return lights.contentHashCode()
  }
}

var total = 0

val lightsPattern = "\\{(.*?)\\}".toRegex()
val buttonsPattern = "\\(([^)]*)\\)".toRegex()

fun pressButton(index: Int, attempt: Attempt, buttons: List<List<Int>>): Attempt {
  val lights = attempt.current.copyOf()
  for (button in buttons[index]) {
    lights[button]++
  }
  return Attempt(lights, attempt.presses + 1)
}

for (line in puzzle) {
  val goalList = lightsPattern.find(line)
    ?.groupValues[1]
    ?.split(',')
    ?.map { it.toInt() }
    ?: listOf()
  val goal = goalList.toIntArray()
  val buttons = buttonsPattern.findAll(line)
    .map { it.groupValues[1] }
    .map { button ->
      button.split(',').map { it.toInt() }
    }
    .toList()
  val current = IntArray(goal.size)
  val attempt = Attempt(current)

  val queue = ArrayDeque<Attempt>()
  queue.add(attempt)

  val seen = mutableSetOf<State>()
  seen.add(State(current))

  while (queue.isNotEmpty()) {
    val step = queue.removeFirst()

    if (step.current.contentEquals(goal)) {
      total += step.presses
      queue.clear()
      break
    }

    for (button in buttons.indices) {
      val result = pressButton(button, step, buttons)

      var inBounds = true
      for (i in result.current.indices) {
        if (result.current[i] > goal[i]) {
          inBounds = false
          break
        }
      }

      if (inBounds) {
        val state = State(result.current)
        if (!seen.contains(state)) {
          seen.add(state)
          queue.add(result)
        }
      }
    }
  }
}

println("total $total")
