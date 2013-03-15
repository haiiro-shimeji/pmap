pmap.ZoomControl = {}

pmap.ZoomControl.View = Backbone.View.extend({

    el: "#zoom_control",

    map: undefined,

    control: undefined,

    initialize: function(data) {

        var self = this

        this.map = data.map

        ;(function() {

            var moving = false
            var startPoint = {}

            self.$el
            .bind("vmousedown", function(event) {
                startPoint = {
                    x: event.clientX,
                    y: event.clientY
                }
                moving = true
            })
            .bind("vmouseup", function(event) {
                moving = false
            })
            .bind("vmouseleave", function(event) {
                moving = false
            })
            .bind("vmousemove", function(event) {
                if (moving) {
                    var delta = 1.0 + (event.clientY - startPoint.y) / 100
                    self.applyTransform(
                        "translate(0px, 0px) scale(" + delta + ")"
                    );
                }
            })

        })()

    },

    applyTransform: function(transform) {
        var style = this.map.layerContainerDiv.style;
        style['-webkit-transform'] = transform;
        style['-moz-transform'] = transform;
    }

})
