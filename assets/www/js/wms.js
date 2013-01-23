pmap.Wms = {}

pmap.Wms.View = Backbone.View.extend({

    el: "#wms_popup",

    open: undefined,

    initialize: function() {

        var self = this

        $("#wms_form").submit(function() {

            var wmsUrl = $("input[name=wms_url]",this).val()

            if (wmsUrl) {

                if (wmsUrl.match(/request=([^&]+)/)) {

                    var request = RegExp.$1.toLowerCase()

                    if ("getcapablity" == request) {
                        self._addWmsCapability(wmsUrl)
                    } else if ("getmap" == request) {
                        self._addWms(wmsUrl)
                    }

                    self.$el.popup("close")

                } else {
                    $(".error",this).text("wms url does not include a valid request.")
                }

            } else {
                $(".error",this).text("wms url must be input.")
            }

            return false

        })
        

    },

    _addWmsCapability: function(url) {
    },

    _addWms: function(url) {
        pmap.Application.getInstance().findView("Map").map.addLayer(
            new OpenLayers.Layer.WMS("New Layer", url)
        )        
    }

})

pmap.Application.getInstance().addView( pmap.Wms.View, 101, "Wms" )
