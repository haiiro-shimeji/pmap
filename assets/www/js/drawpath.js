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

        var slider = undefined

        this.$el.click(function() {
            if (!self.toggled) {
                $.each(navigations, function(i, c) {
                    c.deactivate()
                })
                slider = new pmap.DrawPath.LineWidthSlider
                slider.render()
                self.toggled = true
            } else {
                $.each(navigations, function(i, c) {
                    c.activate()
                })
                pathBuilder.stop()
                slider.$el.remove()
                slider = undefined
                self.toggled = false
            }
        })

        $("#map")
        .bind("vmousedown", function (e) {
            if (self.toggled) {
                pathBuilder.start()
                pathBuilder.addPoint(e)
            }
        })
        .bind("vmousemove", function (e) {
            if (self.toggled) {
                pathBuilder.addPoint(e)
            }
        })
        .bind("vmouseup vmouseout", function (e) {
            if (self.toggled) {
                pathBuilder.addPoint(e)
                if (pathBuilder.drawing) {
                    pmap.Map.getInstance().addLocalPath(
                        null,
                        pathBuilder.points,
                        {
                            strokeWidth: slider.value()
                        }
                    )
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
