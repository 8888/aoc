/*
We need to find the distances between each combination of the points
1000 points ~= 500k pairs
Then we need a graph of all the Nodes
A circuit is a Node with children, a single Node is still a circuit
Each Node will have reference to the root of the circuit, we can use this to know if two nodes are in the same circuit, because they have the same root. Which Node is the root is arbitrary aslong as it's consistent which one we use. If there is no parent, then this is the root Node
When two circuits connect, just move one root to the other and will bring over all its children. All the children then need to have their root updated to the root of the other circuit.
Since we're updating roots we aren't preserving actual connections between specific nodes, just full circuits, which should be easy to support if part 2 needs it
 */

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

for (line in puzzle) {
  graph.put(line, Node(line))
}

val connectionsToMake = 1000
for (i in 0..connectionsToMake - 1) {
  val p1 = graph[distances[i].p1]
  val p2 = graph[distances[i].p2]
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
  }
}

val roots = graph.values.toList().filter { it.root == null}.sortedByDescending { it.connections.size }
val total = (roots[0].connections.size + 1) * (roots[1].connections.size + 1) * (roots[2].connections.size + 1)
println("total $total")
