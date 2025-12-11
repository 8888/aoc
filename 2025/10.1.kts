import java.io.File

val inputText = File("10.txt").readText()
val puzzle = inputText.split("\n")

data class Attempt(
  val goal: String,
  val buttons: List<List<Int>>,
  var current: String,
  var presses: Int = 0
)

var total = 0

val lightsPattern = "\\[(.*?)\\]".toRegex()
val buttonsPattern = "\\(([^)]*)\\)".toRegex()

fun pressButton(index: Int, attempt: Attempt): Attempt {
  var lights = attempt.current.toCharArray()
  for (button in attempt.buttons[index]) {
    lights[button] = if (lights[button] == '.') '#'  else '.'
  }
  return Attempt(attempt.goal, attempt.buttons, String(lights), attempt.presses + 1)
}

for (line in puzzle) {
  val lights = lightsPattern.find(line)?.groupValues[1] ?: ""
  val buttons = buttonsPattern.findAll(line)
    .map { it.groupValues[1] }
    .map { button ->
      button.split(',').map { it.toInt() }
    }
    .toList()
  var current = ".".repeat(lights?.length ?: 0)
  val attempt = Attempt(lights, buttons, current)

  var queue = mutableListOf<Attempt>(attempt)
  val seen = mutableSetOf<String>()
  while (queue.isNotEmpty()) {
    val step = queue.removeFirst()
    if (seen.contains(step.current)) {
      continue
    } else {
      seen.add(step.current)
    }
    for (button in step.buttons.indices) {
      val result = pressButton(button, step)
      if (result.current == result.goal) {
        total += result.presses
        queue = mutableListOf<Attempt>()
        break
      } else {
        queue.add(result)
      }
    }
  }
}

println("total $total")
