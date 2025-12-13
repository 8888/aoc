import java.io.File

val map = HashMap<String, List<String>>()
var total = 0

File("11.txt").forEachLine { line ->
  val devices = line.split("\\s|:\\s".toRegex()).toMutableList()
  val key = devices.removeFirst()
  map.put(key, devices)
}

println("total $total")
