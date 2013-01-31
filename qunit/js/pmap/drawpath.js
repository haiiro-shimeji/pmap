test("pmap.DrawPath.checkLinearExtended", function () {

    //  if newPoint is linear extended, returns true
    (function () {
        var points = [
                { x: 1, y: 1 },
                { x: 2, y: 2 }
            ],
            newPoint = { x: 3, y: 3 }

        strictEqual(pmap.DrawPath.checkLinearExtended(points, newPoint), true)
    })()

    //  if not linear, returns false
    ;(function() {
        var points = [
                { x: 1, y: 1 },
                { x: 2, y: 2 }
            ],
            newPoint = { x: 3, y: 4 }

        strictEqual(pmap.DrawPath.checkLinearExtended(points, newPoint), false)
    })()

    //  if could not decide linear or not, returns false.
    ;(function() {
        var points = [
                { x: 1, y: 1 }
            ],
            newPoint = { x: 3, y: 3 }

        strictEqual(pmap.DrawPath.checkLinearExtended(points, newPoint), false)
    })()

})

test("pmap.DrawPath.PathBuilder", function () {

    (function() {
        var points = [
                { x: 1, y: 1 },
                { x: 2, y: 4 },
                { x: 3, y: 8 }
            ]
        var instance = new pmap.DrawPath.PathBuilder
        instance.mapOffset = { left: 0, top: 0 }
        instance.start()
        instance.addPoint(points[0])
        instance.addPoint(points[1])
        instance.addPoint(points[2])
        instance.stop()

        deepEqual(
            instance.points,
            [
                { x: 1, y: 1 },
                { x: 2, y: 4 },
                { x: 3, y: 8 }
            ]
        )

    })()

    //  confirm lineal extended check
    ;(function() {
        var points = [
                { x: 1, y: 1 },
                { x: 2, y: 4 },
                { x: 3, y: 7 }
            ]
        var instance = new pmap.DrawPath.PathBuilder
        instance.mapOffset = { left: 0, top: 0 }
        instance.start()
        instance.addPoint(points[0])
        instance.addPoint(points[1])
        instance.addPoint(points[2])
        instance.stop()

        deepEqual(
            instance.points,
            [
                { x: 1, y: 1 },
                { x: 3, y: 7 }
            ]
        )

    })()

})
