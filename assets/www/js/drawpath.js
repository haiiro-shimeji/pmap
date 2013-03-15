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

        var mapOffset = $("#map").offset()

        var _makePoint = function(e) {
            return {
                x: e.pageX - mapOffset.left,
                y: e.pageY - mapOffset.top
            }
        }

        var pathBuilder = new pmap.DrawPath.PathBuilder

        var slider = undefined
        var canvas = undefined

        this.$el.click(function() {

            if (!self.toggled) {

                $.each(navigations, function(i, c) {
                    c.deactivate()
                })
                slider = new pmap.DrawPath.LineWidthSlider
                slider.render()
                canvas = new pmap.DrawPath.Canvas
                canvas.render()
                self.toggled = true

                canvas.$el
                .bind("vmousedown", function (e) {
                    var newPoint = _makePoint(e)
                    pathBuilder.start()
                    pathBuilder.addPoint(newPoint)
                    canvas.startPath(newPoint)
                })
                .bind("vmousemove", function (e) {
                    if (pathBuilder.drawing) {
                        var newPoint = _makePoint(e)
                        pathBuilder.addPoint(newPoint)
                        canvas.lineTo(newPoint)
                    }
                })
                .bind("vmouseup vmouseout", function (e) {
                    if (pathBuilder.drawing) {
                        pathBuilder.addPoint(_makePoint(e))
                        pmap.Map.getInstance().addLocalPath(
                            null,
                            pathBuilder.points,
                            {
                                strokeWidth: slider.value()
                            }
                        )
                        pathBuilder.stop()
                        canvas.clearPath()
                    }
                })

            } else {
                $.each(navigations, function(i, c) {
                    c.activate()
                })
                pathBuilder.stop()
                slider.$el.remove()
                slider = undefined
                canvas.$el.remove()
                canvas = undefined
                self.toggled = false
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

pmap.DrawPath.PathBuilder = function () {}

pmap.DrawPath.PathBuilder.prototype = {

    drawing: false,
    points: undefined,

    start: function () {
        this.drawing = true
        this.points = []
    },

    stop: function () {
        this.drawing = false
    },

    addPoint: function (newPoint) {
        if (this.drawing) {
            if (!pmap.DrawPath.checkLinearExtended(this.points, newPoint)) {
                this.points.push(newPoint)
            } else {
                this.points[this.points.length-1] = newPoint
            }
        }
    }

}

pmap.DrawPath.LineWidthSlider = Backbone.View.extend({

    slider: undefined,

    render: function() {

        this.slider = $("<input>")
            .attr("id", "linewidth_slider")
            .attr("value", 1)
            .attr("min", 1)
            .attr("max", 20)

        this.$el = $("<div>")
            .css({
                position: "absolute",
                left: "128px",
                right: "16px",
                bottom: "16px",
                height: "44px"
            })
            .append(this.slider)

        $("#main").append(this.$el)
        this.slider.slider()

        return this

    },

    value: function () {
        return this.slider.val()
    }

})

pmap.DrawPath.Canvas = Backbone.View.extend({

    currentContext: undefined,

    render: function () {

        var mapOffset = $("#map").offset(),
            mapWidth = $("#map").width(), mapHeight = $("#map").height()

        this.$el = $("<canvas>")
            .attr("width", mapWidth)
            .attr("height", mapHeight)
            .css({
                position: "absolute",
                left: mapOffset.left,
                top: mapOffset.top,
                width: mapWidth,
                height: mapHeight
            })

        $("#main").append(this.$el)

        return this

    },

    startPath: function(newPoint) {
        this.currentContext = this.$el.get(0).getContext('2d')
        this.currentContext.beginPath()
        this.currentContext.moveTo(newPoint.x, newPoint.y)
    },

    lineTo: function(newPoint) {
        this.currentContext.lineTo(newPoint.x, newPoint.y)
        this.currentContext.stroke()
    },

    clearPath: function() {
        this.currentContext.closePath()
    }

})
