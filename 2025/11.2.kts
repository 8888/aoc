/*
Part 1 was too slow, the path must be significantly larger between svr and out
Since we know our two points we can prune back to only points that can even reach out
Hopefully that limits the search space enough

This still blows up, I wonder if it is a DAG and I can memoize and not worry about cycle detection?
 */

import java.io.File
import java.util.ArrayDeque

class Graph {
  private val edges = mutableMapOf<String, MutableList<String>>()
  private val reverseEdges = mutableMapOf<String, MutableList<String>>()


  fun addNode(node: String) {
    edges.putIfAbsent(node, mutableListOf<String>())
    reverseEdges.putIfAbsent(node, mutableListOf<String>())
  }

  fun addEdge(from: String, to: String) {
    addNode(from)
    addNode(to)
    edges[from]!!.add(to)
    reverseEdges[to]!!.add(from)
  }

  fun neighbors(node: String): List<String> = edges[node].orEmpty()

  fun hasCycle(startNode: String, endNode: String): Boolean {
    // A cycle exists if there is a path from start->end AND end->start
    return hasPath(startNode, endNode) && hasPath(endNode, startNode)
  }

  private fun hasPath(startNode: String, endNode: String): Boolean {
      val queue = ArrayDeque<String>()
      val visited = mutableSetOf<String>()

      queue.add(startNode)
      visited.add(startNode)

      while (queue.isNotEmpty()) {
          val currentNode = queue.removeFirst()

          for (neighbor in neighbors(currentNode)) {
              if (neighbor == endNode) return true
              if (visited.add(neighbor)) {
                  queue.add(neighbor)
              }
          }
      }
      return false
  }

  private fun nodesThatCanReach(target: String): Set<String> {
    if (target !in edges) return emptySet()

    val canReach = HashSet<String>()
    val queue = ArrayDeque<String>()
    canReach.add(target)
    queue.addLast(target)

    while (queue.isNotEmpty()) {
      val cur = queue.removeFirst()
      for (prev in reverseEdges[cur].orEmpty()) {
        if (canReach.add(prev)) queue.addLast(prev)
      }
    }

    return canReach
  }

  fun countSimplePaths(start: String, target: String): Long {
    if (start !in edges || target !in edges) return 0L

    val canReachTarget = nodesThatCanReach(target)
    if (start !in canReachTarget) return 0L

    val memo = mutableMapOf<Triple<String, Boolean, Boolean>, Long>()

    fun dfs(node: String, seenDac: Boolean, seenFft: Boolean): Long {
      val memoKey = Triple(node, seenDac, seenFft)
      if (memo.containsKey(memoKey)) return memo.getValue(memoKey)

      if (node !in canReachTarget) return 0L

      val nextSeenDac = seenDac || (node == "dac")
      val nextSeenFft = seenFft || (node == "fft")

      val total = if (node == target) {
        if (nextSeenDac && nextSeenFft) 1L else 0L
      } else {
        var sum = 0L
        for (neighbor in neighbors(node)) {
          if (neighbor in canReachTarget) {
            sum += dfs(neighbor, nextSeenDac, nextSeenFft)
          }
        }
        sum
      }

      memo[memoKey] = total
      return total
    }

    return dfs(start, false, false)
  }
}

val graph = Graph()

File("11.txt").forEachLine { line ->
  val devices = line.split("\\s|:\\s".toRegex()).toMutableList()
  val from = devices.removeFirst()
  for (to in devices) {
    graph.addEdge(from, to)
  }
}

// println(graph.hasCycle("svr", "out")) // false
println(graph.countSimplePaths("svr", "out"))
