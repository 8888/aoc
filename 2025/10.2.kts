/*
A new plan is needed
We are using a BFS, and optimized memory as much as my limited Kotlin knowledge allowed
But we are still running out of memory before completing

Move to A*
- First recheck all of the setup to make sure its cler and correct
- Then we need some heuristic to prioritize the queue
-- the difference between the sum of all goal lights and all current lights could be a distance away
-- we should still always prioritize least presses first, then distance
-- we'll have to use the value of the largest increase from a button to weight how far we are from the goal so presses don't get ignored
-- set a heuristic equal to distance / largest step? then add number of presses? This way the pressess are properly weighted to how far they can go
 */

import java.io.File
import java.util.PriorityQueue

data class Attempt(
  val current: IntArray,
  val presses: Int = 0,
  // heuristic will attempt to estimate how many pressess we are away from the goal
  val heuristic: Int
): Comparable<Attempt> {
  val fScore: Int = presses + heuristic

  override fun compareTo(other: Attempt): Int {
    val fDiff = this.fScore.compareTo(other.fScore)
    if (fDiff != 0) return fDiff
    // if a tie, the one with more pressess is actually closer?
    return other.presses.compareTo(this.presses)
  }
}

class SeenAttemptWrapper(val lights: IntArray) {
  // allow quicker equality comparisons between IntArrays in the seen set
  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (other !is SeenAttemptWrapper) return false
    return lights.contentEquals(other.lights)
  }

  override fun hashCode(): Int {
    return lights.contentHashCode()
  }
}

var total = 0

val goalPattern = "\\{(.*?)\\}".toRegex()
val buttonsPattern = "\\(([^)]*)\\)".toRegex()

fun calculateHeuristic(current: IntArray, totalGoalSum: Int, maxButtonPower: Int): Int {
  val currentSum = current.sum()
  val remaining = totalGoalSum - currentSum
  if (remaining <= 0) return 0
  return (remaining + maxButtonPower - 1) / maxButtonPower
}

File("10.txt").forEachLine { line ->
  val goalList = goalPattern.find(line)
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

  // all buttons increment each index by 1, so more indexes = mo powa!
  val maxButtonPower = buttons.maxOfOrNull { it.size } ?: 1
  val totalGoalSum = goal.sum()

  val current = IntArray(goal.size)
  val initialH = calculateHeuristic(current, totalGoalSum, maxButtonPower)
  val attempt = Attempt(current, 0, initialH)

  val queue = PriorityQueue<Attempt>()
  queue.add(attempt)

  val seen = mutableSetOf<SeenAttemptWrapper>()
  seen.add(SeenAttemptWrapper(current))

  while (queue.isNotEmpty()) {
    val step = queue.poll() // pull best attempt first

    if (step.current.contentEquals(goal)) {
      total += step.presses
      break
    }

    for (i in buttons.indices) {
      val next = step.current.copyOf()
      for (idx in buttons[i]) next[idx]++

      var inBounds = true
      for (k in next.indices) {
        if (next[k] > goal[k]) {
          inBounds = false
          break
        }
      }

      if (inBounds) {
        val seenWrapper = SeenAttemptWrapper(next)
        if (!seen.contains(seenWrapper)) {
          seen.add(seenWrapper)
          val h = calculateHeuristic(next, totalGoalSum, maxButtonPower)
          queue.add(Attempt(next, step.presses + 1, h))
        }
      }
    }
  }
}

println("total $total")
