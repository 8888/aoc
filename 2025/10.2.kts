import java.io.File
import java.util.ArrayDeque

val inputText = File("10.txt").readText()
val puzzle = inputText.split("\n")

data class Attempt(
  val goal: IntArray,
  val buttons: List<List<Int>>,
  var current: IntArray,
  var presses: Int = 0
)

class State(val lights: IntArray) {
  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (other !is State) return false
    return lights.contentEquals(other.lights)
  }
}

var total = 0

val lightsPattern = "\\{(.*?)\\}".toRegex()
val buttonsPattern = "\\(([^)]*)\\)".toRegex()

fun pressButton(index: Int, attempt: Attempt): Attempt {
  var lights = attempt.current.copyOf()
  for (button in attempt.buttons[index]) {
    lights[button]++
  }
  return Attempt(attempt.goal, attempt.buttons, lights, attempt.presses + 1)
}

for (line in puzzle) {
  var lights = lightsPattern.find(line)
    ?.groupValues[1]
    ?.split(',')
    ?.map { it.toInt() }
    ?.toIntArray()
    ?: IntArray(0)
  val buttons = buttonsPattern.findAll(line)
    .map { it.groupValues[1] }
    .map { button ->
      button.split(',').map { it.toInt() }
    }
    .toList()
  val current = IntArray(lights.size)
  val attempt = Attempt(lights, buttons, current)

  val queue = ArrayDeque<Attempt>()
  queue.add(attempt)
  val seen = mutableSetOf<State>()
  while (queue.isNotEmpty()) {
    val step = queue.removeFirst()
    for (button in step.buttons.indices) {
      val result = pressButton(button, step)
      if (result.current.contentEquals(result.goal)) {
        total += result.presses
        queue.clear()
        break
      } else {
        // check if any field is over
        var inBounds = true
        for ((index, light) in result.current.withIndex()) {
          if (light > result.goal[index]) {
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
}

println("total $total")
