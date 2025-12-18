# Moving this to a python solution using Shapely as I have been unable to wrangle in the geometry on my own

from shapely.geometry import Polygon, box

def main():
  points = []
  with open('09.txt') as f:
    for line in f:
      points.append(tuple(map(int, line.strip().split(','))))

  poly = Polygon(points)
  max_area = 0
  n = len(points)

  for i in range(n):
    x1, y1 = points[i]
    for j in range(i + 1, n):
      x2, y2 = points[j]

      width = abs(x1 - x2) + 1
      height = abs(y1 - y2) + 1
      area = width * height

      if area > max_area:
        b = box(min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2))
        if poly.covers(b):
          max_area = area

  print(max_area)

if __name__ == "__main__":
  main()
