from math import fmod

#for each coordinate, it should be added to 8 bounding boxes (the surrounding 8)

coordinateBounds = {
    (0, 8, 16) : [
        (3, 5, 14)
    ],
    (0, 8, 0) : [
        (0, 7, 3)
    ]
}

#print(coordinateBounds[(0, 1, 10)])

coords = [(0, 0, 0), (10, 11, -3), (8, 2, 10), (2, 7, 11), (-3, 4, 3), (-14, 7, -14), (-1, 0, 0), (-2, 0, 0), (7, 0, 0)]
minDistance = 8

coords2 = [(1, 7, 15), (0, 7, 0), (3, -3, 0), (4, 4, 8)]
coords3 = [(1, 0, -1), (2, 1, 0), (3, 2, 1), (4, 3, 2), (5, 4, 3), (6, 5, 4), (7, 6, 5), (8, 7, 6), (9, 8, 7)]
coords4 = [(0, 0, 0), (0, 0, 8), (0, 0, 16)]

#functions

def calculateDistance(coord1, coord2):
    return pow(pow(coord1[0] - coord2[0], 2) + pow(coord1[1] - coord2[1], 2) + pow(coord1[2] - coord2[2], 2), 0.5)

def roundInt(num, roundToNearest):
    sign = 1
    if num < 0:
        sign = -1
    if abs(fmod(num, roundToNearest)/roundToNearest) < 0.5:
        return int(num - sign * abs(fmod(num, roundToNearest)))
    return int(num + sign * (roundToNearest - abs(fmod(num, roundToNearest))))

def getBoundingBoxSets(real, rounded):
    xValues, yValues, zValues = [], [], []
    if abs(fmod(real[0], minDistance)) == 0:
        xValues.append(minDistance/2)
        xValues.append((-1) * minDistance/2)
    else:
        xValues.append(0)
        xValues.append(minDistance)
        if real[0] - rounded[0] < 0:
            xValues[1] *= -1
    
    if abs(fmod(real[1], minDistance)) == 0:
        yValues.append(minDistance/2)
        yValues.append((-1) * minDistance/2)
    else:
        yValues.append(0)
        yValues.append(minDistance)
        if real[1] - rounded[1] < 0:
            yValues[1] *= -1

    if abs(fmod(real[2], minDistance)) == 0:
        zValues.append(minDistance/2)
        zValues.append((-1) * minDistance/2)
    else:
        zValues.append(0)
        zValues.append(minDistance)
        if real[2] - rounded[2] < 0:
            zValues[1] *= -1
    
    return [xValues, yValues, zValues]

#testing

#print(roundInt(-3, 5))

#main

count = 0

for i in coords4:
    #print(i in coordinateBounds)
    approx = (roundInt(i[0], minDistance), roundInt(i[1], minDistance), roundInt(i[2], minDistance))
    boundingVertices = getBoundingBoxSets(i, approx)
    
    #print(i)
    boundingAreas = [
        (approx[0] + boundingVertices[0][0], approx[1] + boundingVertices[1][0], approx[2] + boundingVertices[2][0]),
        (approx[0] + boundingVertices[0][0], approx[1] + boundingVertices[1][0], approx[2] + boundingVertices[2][1]),
        (approx[0] + boundingVertices[0][0], approx[1] + boundingVertices[1][1], approx[2] + boundingVertices[2][0]),
        (approx[0] + boundingVertices[0][0], approx[1] + boundingVertices[1][1], approx[2] + boundingVertices[2][1]),
        (approx[0] + boundingVertices[0][1], approx[1] + boundingVertices[1][0], approx[2] + boundingVertices[2][0]),
        (approx[0] + boundingVertices[0][1], approx[1] + boundingVertices[1][0], approx[2] + boundingVertices[2][1]),
        (approx[0] + boundingVertices[0][1], approx[1] + boundingVertices[1][1], approx[2] + boundingVertices[2][0]),
        (approx[0] + boundingVertices[0][1], approx[1] + boundingVertices[1][1], approx[2] + boundingVertices[2][1]),
    ]
    """
    for i in boundingAreas:
        print(i)

    #print("_________________________________")
    """
    
    for gridCoord in boundingAreas:
        if gridCoord in coordinateBounds:
            for j in coordinateBounds[gridCoord]:
                distance = calculateDistance(i, j)
                if distance < minDistance:
                    
                    count += 1
        else:
            coordinateBounds[gridCoord] = []
        coordinateBounds[gridCoord].append(i)


    
    #temp_tuple = (temp_tuple[0] + boundingVertices, temp_tuple[1], temp_tuple[2]]
    
print(count)
print(coordinateBounds)