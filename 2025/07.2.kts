import java.io.File

var map = HashMap<Int, Long>() // col index, count

var initializing = true
File("07.txt").forEachLine { line ->
  if (initializing) {
    map.put(line.indexOf('S'), 1)
    initializing = false
  } else {
    val next = HashMap<Int, Long>()
    for ((col, count) in map) {
      if (line[col] == '.') {
        next[col] = (next[col] ?:0) + count
      } else {
        if (col > 0) next[col - 1] = (next[col - 1] ?: 0) + count
        if (col < line.length - 1) next[col + 1] = (next[col + 1] ?: 0) + count
      }
    }
    map = next
  }
}

println("total ${map.values.sum()}")
