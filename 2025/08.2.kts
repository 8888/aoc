import java.io.File
import kotlin.math.sqrt

fun Double.square(): Double = this * this

data class PointPair(val p1: String, val p2: String, val distance: Double)
data class Node(
  val loc: String,
  var root: Node? = null,
  val connections: MutableList<Node> = mutableListOf()
)

val inputText = File("08.txt").readText()
val puzzle = inputText.split("\n")

val distances = mutableListOf<PointPair>()
val graph = HashMap<String, Node>() // id is string from puzzle ex "162,817,812"

for (i in 0..puzzle.size-2) {
  for (j in i+1..puzzle.size-1) {
    val p1 = puzzle[i].split(',').map { it.toDouble() }
    val p2 = puzzle[j].split(',').map { it.toDouble() }
    val dx = (p1[0] - p2[0]).square()
    val dy = (p1[1] - p2[1]).square()
    val dz = (p1[2] - p2[2]).square()
    val distance = sqrt(dx + dy + dz)
    distances.add(PointPair(puzzle[i], puzzle[j], distance))
  }
}

distances.sortBy { it.distance }

val rootNodes = mutableSetOf<String>()

for (line in puzzle) {
  graph.put(line, Node(line))
  rootNodes.add(line)
}

for (pair in distances) {
  val p1 = graph[pair.p1]
  val p2 = graph[pair.p2]
  if (p1 != null && p2 != null) {
    // must combine the circuits that p1 and p2 are in
    // find the root of each and combine
    val r1 = p1.root ?: p1
    val r2 = p2.root ?: p2

    if (r1.loc == r2.loc) continue // already in the same circuit

    r2.root = r1
    r1.connections.add(r2)
    for (connection in r2.connections) {
      connection.root = r1
      r1.connections.add(connection)
    }
    rootNodes.remove(r2.loc)
    if (rootNodes.size == 1) {
      println("Final connection of ${p1.loc} <> ${p2.loc}")
      val x1 = p1.loc.split(',')[0].toInt()
      val x2 = p2.loc.split(',')[0].toInt()
      println("result: ${x1 * x2}")
    }
  }
}
