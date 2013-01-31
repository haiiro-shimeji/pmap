pmap.DrawPath = {}

pmap.DrawPath.View = Backbone.View.extend({

    el: "#draw_path_toggle",

    toggled: false,

    render: function() {

        var self = this

        var navigations = Enumerable
            .from(pmap.Map.getInstance().olMap.controls)
            .where(function (x) {
                return x instanceof OpenLayers.Control.Navigation
                    || x instanceof OpenLayers.Control.TouchNavigation
            })
            .select()
            .toArray()

        var pathBuilder = new pmap.DrawPath.PathBuilder

        this.$el.click(function() {
            if (!self.toggled) {
                $.each(navigations, function(i, c) {
                    c.deactivate()
                })
                $("#main").append(
                    $("<div>").slider()
                )
                self.toggled = true
            } else {
                $.each(navigations, function(i, c) {
                    c.activate()
                })
                pathBuilder.stop()
                self.toggled = false
            }
        })

        $("#map")
        .mousedown(function (e) {
            if (self.toggled) {
                pathBuilder.start()
                pathBuilder.addPoint(e)
            }
        })
        .mousemove(function (e) {
            if (self.toggled) {
                pathBuilder.addPoint(e)
            }
        })
        .bind("mouseup mouseleave", function (e) {
            if (self.toggled) {
                pathBuilder.addPoint(e)
                if (pathBuilder.drawing) {
                    pmap.Map.getInstance().addLocalPath(null, pathBuilder.points)
                    pathBuilder.stop()
                }
            }
        })

        return this

    }

})

pmap.Application.getInstance().addView( pmap.DrawPath.View, 101, "DrawPath" )

pmap.DrawPath.checkLinearExtended = function (points, newPoint) {

    if (2 > points.length) {
        return false
    } else {
        var v2 = newPoint,
            v1 = points[points.length-1]
            v0 = points[points.length-2]

        return 0 == (v1.x-v0.x) * (v2.y-v1.y) - (v2.x-v1.x) * (v1.y-v0.y)
    }

}

pmap.DrawPath.PathBuilder = function () {
    this.mapOffset = $("#map").offset()
}

pmap.DrawPath.PathBuilder.prototype = {

    drawing: false,
    points: undefined,

    mapOffset: undefined,

    _makePoint: function(e) {
        return {
            x: e.pageX - this.mapOffset.left,
            y: e.pageY - this.mapOffset.top
        }
    },

    start: function () {
        this.drawing = true
        this.points = []
    },

    stop: function () {
        this.drawing = false
    },

    addPoint: function (e) {
        if (this.drawing) {
            var newPoint = this._makePoint(e)
            if (!pmap.DrawPath.checkLinearExtended(this.points, newPoint)) {
                this.points.push(newPoint)
            } else {
                this.points[this.points.length-1] = newPoint
            }
        }
    }

}
