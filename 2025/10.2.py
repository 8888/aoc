# We'll move to a z3 solution as I haven't been able to solve this without extensive linear algebra

import re
from z3 import *

def main():
  machines = []
  with open("10.txt", "r") as f:
    for line in f:
      targets = [int(x) for x in re.search(r"\{([\d,]+)\}", line).group(1).split(",")]
      buttons = [[int(x) for x in m.split(",")] for m  in re.findall(r"\(([\d,]+)\)", line)]
      machines.append({"targets": targets, "buttons": buttons})

  total_presses = 0

  for machine in machines:
    targets = machine["targets"]
    buttons = machine["buttons"]

    opt = Optimize()
    presses = [Int(f"b_{i}") for i in range(len(buttons))]

    for p in presses:
      opt.add(p >= 0)

    for i in range(len(targets)):
      button_sum = Sum([presses[j] for j, btn in enumerate(buttons) if i in btn])
      opt.add(button_sum == targets[i])

    total = Sum(presses)
    opt.minimize(total)

    if opt.check() == sat:
      total_presses += opt.model().eval(total).as_long()

  print(total_presses)

if __name__ == "__main__":
  main()
