import java.io.File

var total = 0
var set = mutableSetOf<Int>() // col index

var initializing = true
File("07.txt").forEachLine { line ->
  if (initializing) {
    set.add(line.indexOf('S'))
    initializing = false
  } else {
    val next = mutableSetOf<Int>()
    for (beam in set) {
      if (line[beam] == '.') {
        next.add(beam)
      } else {
        total++
        if (beam > 0) next.add(beam - 1)
        if (beam < line.length-2) next.add(beam + 1)
      }
    }
    set = next
  }
}

println("total $total")
