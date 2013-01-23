pmap.Wms = {}

pmap.Wms.View = Backbone.View.extend({

    el: "#wms_popup",

    open: undefined,

    initialize: function() {

        var self = this

        $("#wms_form").submit(function() {

            var wmsUrl = $("input[name=wms_url]",this).val()

            if (wmsUrl) {

                var request = RegExp.$1.toLowerCase()

                self._addWmsCapability(wmsUrl)

                self.$el.popup("close")

            } else {
                $(".error",this).text("wms url must be input.")
            }

            return false

        })
        

    },

    _addWmsCapability: function(url) {

        var format = new OpenLayers.Format.WMSCapabilities({
            yx: {
                "urn:ogc:def:crs:EPSG::900913": true
            }
        })

        OpenLayers.Request.GET({
            url: url,
            params: {
                SERVICE: "WMS",
                REQUEST: "GetCapabilities"
            },
            success: function(request) {
                var doc = request.responseXML
                if (!doc || !doc.documentElement) {
                    doc = request.responseText
                }
                var capabilities = format.read(doc)
                var map = pmap.Application.getInstance().findView("Map").map
                $.each(capabilities.capability.layers, function(i, layer) {
                    map.addLayer(
                        new OpenLayers.Layer.WMS(
                            layer.title, 
                            url,
                            { layers: layer.name },
                            { visibility: false }
                        )
                    )
                })
            },
            failure: function() {
                alert("Trouble getting capabilities doc")
                OpenLayers.Console.error.apply(OpenLayers.Console, arguments)
            }
        })

    },

    _addWms: function(url) {
        pmap.Application.getInstance().findView("Map").map.addLayer(
            new OpenLayers.Layer.WMS("New Layer", url)
        )        
    }

})

pmap.Application.getInstance().addView( pmap.Wms.View, 101, "Wms" )
