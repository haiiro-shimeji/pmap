pmap.AddFeature = {}

pmap.AddFeature.View = Backbone.View.extend({

    el: "#add_feature_panel",

    open: undefined,

    render: function() {

        var self = this

        var movingIcon = undefined
        var basePoint = undefined

        $(".feature_icon", this.$el.get(0))
        .mousedown(function(e) {
            var offset = $(this).offset()
            basePoint = {
                x: e.pageX - offset.left,
                y: e.pageY - offset.top
            }
            movingIcon = $(this).clone()
            movingIcon.css({
                position: "absolute",
                left: $(this).offset().left,
                top: $(this).offset().top,
                "z-index": 65535
            })
            $("#main").append(movingIcon)
        })

        $("#main")
        .mousemove(function(e) {
            if (movingIcon) {
                movingIcon.offset({
                    left: e.pageX - basePoint.x,
                    top: e.pageY - basePoint.y
                })
            }
        })
        .mouseup(function(e) {
            if (movingIcon) {
                if (self._inMapRegion(e.pageX, e.pageY)) {
                    var mapOffset = $("#map").offset()
                    pmap.Map.getInstance().addLocalFeature(
                        "images/feature_dummy.png",
                        e.pageX - basePoint.x + movingIcon.width()/2 - mapOffset.left,
                        e.pageY - basePoint.y + movingIcon.height()/2 - mapOffset.top
                    )
                }
                movingIcon.remove()
                movingIcon = undefined
            }
        })

        $("#map")
        .mouseup(function(e) {
            movingIcon = undefined
        })

        return this

    },

    _inMapRegion: function (x, y) {
        var mapOffset = $("#map").offset(),
            mapWidth = $("#map").width(), mapHeight = $("#map").height()
        return mapOffset.left <= x && mapOffset.left + mapWidth >= x
            && mapOffset.top <= y && mapOffset.top + mapHeight >= y
    }

})

pmap.Application.getInstance().addView( pmap.AddFeature.View, 101, "AddFeature" )
