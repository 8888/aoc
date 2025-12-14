import java.io.File

class Graph {
  private val edges = mutableMapOf<String, MutableList<String>>()

  fun addNode(node: String) {
    edges.putIfAbsent(node, mutableListOf<String>())
  }

  fun addEdge(from: String, to: String) {
    addNode(from)
    addNode(to)
    edges[from]!!.add(to)
  }

  fun neighbors(node: String): List<String> =
    edges[node].orEmpty()

  fun countSimplePaths(start: String, target: String): Long {
    if (start !in edges || target !in edges) return 0L

    val inPath = HashSet<String>()

    fun dfs(node: String): Long {
      if (node == target) return 1L
      if (!inPath.add(node)) return 0L // set.add returns a boolean! ez cycle detection!

      var total = 0L
      for (neighbor in neighbors(node)) {
        total += dfs(neighbor)
      }

      inPath.remove(node)
      return total
    }

    return dfs(start)
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

println(graph.countSimplePaths("you", "out"))
