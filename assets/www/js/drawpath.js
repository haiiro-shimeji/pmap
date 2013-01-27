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
            if (self.toggled && drawing ) {
                points.push({
                    x: e.pageX - mapOffset.left,
                    y: e.pageY - mapOffset.top
                })
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
