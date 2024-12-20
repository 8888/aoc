from functools import cache

with open("19.txt") as file:
  inputs = [line.rstrip() for line in file]

towels = []
designs = []
total = 0

parsedTowels = False
for i in inputs:
  if i == '':
    parsedTowels = True
  elif parsedTowels:
    designs.append(i)
  else:
    towels = i.split(', ')

@cache
def search(design: str):
  if design == "":
    return 1

  found = 0
  for towel in towels:
    if design.startswith(towel):
      found += search(design[len(towel):])

  return found

for design in designs:
  if search(design):
    total += 1

print(total)
