/*
Pass 1
A new plan is needed
We are using a BFS, and optimized memory as much as my limited Kotlin knowledge allowed
But we are still running out of memory before completing

Pass 2
Move to A*
- First recheck all of the setup to make sure its cler and correct
- Then we need some heuristic to prioritize the queue
-- the difference between the sum of all goal lights and all current lights could be a distance away
-- we should still always prioritize least presses first, then distance
-- we'll have to use the value of the largest increase from a button to weight how far we are from the goal so presses don't get ignored
-- set a heuristic equal to distance / largest step? then add number of presses? This way the pressess are properly weighted to how far they can go

Pass 3
A* works but the heuristic needs some tuning
- Just using the sum of the current location, goal, and buttons ignores which index needs to increment
- A button that increments many lights gets valued higher, even if they're the wrong lights
- We can probably still create a few less objects and make less copies
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

fun calculateHeuristic(current: IntArray, goal: IntArray, maxIncPerIndex: IntArray): Int {
  var maxRequiredPresses = 0
  for (i in current.indices) {
    val remaining = goal[i] - current[i]
    if (remaining <= 0) continue
    if (maxIncPerIndex[i] == 0) return Int.MAX_VALUE

    val power = maxIncPerIndex[i]
    val pressesNeeded = (remaining + power - 1) / power
    if (pressesNeeded > maxRequiredPresses) maxRequiredPresses = pressesNeeded
  }
  return maxRequiredPresses
}

File("10.txt").forEachLine { line ->
  val goalList = goalPattern.find(line)
    ?.groupValues[1]
    ?.split(',')
    ?.map { it.toInt() }
    ?: listOf()
  val goal = goalList.toIntArray()

  // there are some buttons that increment the same index multiple times in a single press!
  // we need to make sure that we don't miss that this can bring it over the goal, which gives you a negative h
  val rawButtons = buttonsPattern.findAll(line)
    .map { it.groupValues[1] }
    .map { button ->
      button.split(',').map { it.toInt() }
    }
    .toList()
  val buttonDeltas = ArrayList<IntArray>()
  for (indices in rawButtons) {
    val delta = IntArray(goal.size)
    for (idx in indices) delta[idx]++
    buttonDeltas.add(delta)
  }

  val maxIncPerIndex = IntArray(goal.size)
  for (delta in buttonDeltas) {
    for (i in delta.indices) maxIncPerIndex[i] = maxOf(maxIncPerIndex[i], delta[i])
  }

  val queue = PriorityQueue<Attempt>()
  val current = IntArray(goal.size)
  val initialH = calculateHeuristic(current, goal, maxIncPerIndex)
  queue.add(Attempt(current, 0, initialH))

  val seen = mutableSetOf<SeenAttemptWrapper>()
  seen.add(SeenAttemptWrapper(current))

  while (queue.isNotEmpty()) {
    val step = queue.poll() // pull best attempt first

    if (step.current.contentEquals(goal)) {
      total += step.presses
      queue.clear()
      break
    }

    for (delta in buttonDeltas) {
      var isValid = true
      for (i in step.current.indices) {
        if (step.current[i] + delta[i] > goal[i]) {
          isValid = false
          break
        }
      }
      if (isValid) {
        val next = IntArray(goal.size)
        for (i in step.current.indices) next[i] = step.current[i] + delta[i]

        val seenWrapper = SeenAttemptWrapper(next)
        if (!seen.contains(seenWrapper)) {
          seen.add(seenWrapper)
          val h = calculateHeuristic(next, goal, maxIncPerIndex)
          if (h != Int.MAX_VALUE) queue.add(Attempt(next, step.presses + 1, h))
        }
      }
    }
  }
}

println("total $total")
