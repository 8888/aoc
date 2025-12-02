import java.io.File

val inputText = File("02.txt").readText()
val puzzle = inputText.split(",")

var total: Long = 0

for (line in puzzle) {
  val range = line.split("-")
  var target = range[0]
  while (target.toLong() <= range[1].toLong()) {
    var chunkSize = 1
    while (chunkSize < target.length) {
      if (target.length % chunkSize == 0) {
        val chunks = target.chunked(chunkSize)
        val uniquePatterns = chunks.distinct()
        if (uniquePatterns.size == 1) {
          // println(chunks)
          total += target.toLong()
          break
        }
      }
      chunkSize++
    }
    target = (target.toLong() + 1).toString()
  }
}

println("total: $total")
