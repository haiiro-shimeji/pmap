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

        this.$el.click(function() {
            if (!self.toggled) {
                $.each(navigations, function(i, c) {
                    c.deactivate()
                })
                self.toggled = true
            } else {
                $.each(navigations, function(i, c) {
                    c.activate()
                })
                self.toggled = false
            }
        })

        var drawing = false
        var points = undefined
        var c = 0

        var mapOffset = $("#map").offset()

        $("#map")
        .mousedown(function (e) {
            if (self.toggled) {
                drawing = true
                points = [{
                    x: e.pageX - mapOffset.left,
                    y: e.pageY - mapOffset.top
                }]
                c = 0
            }
        })
        .mousemove(function (e) {
            if (self.toggled && drawing) {
                var v2 = {
                        x: e.pageX - mapOffset.left,
                        y: e.pageY - mapOffset.top
                    },
                    v1 = points[points.length-1]

                if (3 > points.length) {
                    points.push(v2)
                } else {
                    var v0 = points[points.length-2]
                    if (0 != (v1.x-v0.x) * (v2.y-v1.y) - (v2.x-v1.x) * (v1.y-v0.y)) {
                        points.push(v2)
                    }
                }
            }
        })
        .mouseup(function (e) {
            if (self.toggled && drawing) {
                pmap.Map.getInstance().addLocalPath(null, points)
                console.log(points.length)
                drawing = false
            }
        })

        return this

    }

})

pmap.Application.getInstance().addView( pmap.DrawPath.View, 101, "DrawPath" )
