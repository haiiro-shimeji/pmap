pmap.AddLayer = {}

pmap.AddLayer.View = Backbone.View.extend({

    el: "#add_layer_popup",

    open: undefined,

    urlFormats: [
        {
            label: "WMS Capabilities",
            value: "wms_capabilities",
            form: [
                $("<span>").text("WMS Capabilities URL"),
                $("<input>").attr("name", "wms_capabilities_url")
            ]
        },
        {
            label: "Single WMS",
            value: "wms",
            form: [
                $("<span>").text("WMS URL"),
                $("<input>").attr("name", "wms_url"),
                $("<span>").text("WMS Layers"),
                $("<input>").attr("name", "wms_layers"),
                $("<span>").text("please put the layer names which is sepalated by ','")
            ]
        }
    ],

    initialize: function() {

        var self = this

        var formatSelect = $("#add_layer_form select")

        $.each(this.urlFormats, function(i, format) {

            formatSelect.append(
                $("<option>")
                .val(format.value)
                .text(format.label)
                .data("form", format.form)
            )

            var div = $("<div>")
                .addClass("add_layer_form_format")
                .attr("id", "add_layer_form_"+format.value)
            $.each(format.form, function(i, e) {
                div.append(e)
            })

            $("#add_layer_form #add_layer_inputs").append(div)

        })

        formatSelect.change(function() {
            //self.$el.find(".add_layer_form_format").hide()
            self.$el.find("#add_layer_form_"+$(this).val()).show()
        })
        .val(this.urlFormats[0].value)
        .change()

        formatSelect.selectmenu("refresh")

        $("#add_layer_form").submit(function() {

            var wmsUrl = $("input[name=wms_url]",this).val()

            if (wmsUrl) {
                self._addWMSCapability(wmsUrl)
                self.$el.popup("close")
            } else {
                $(".error",this).text("wms url must be input.")
            }

            return false

        })
        

    },

    _addWMSCapability: function(url) {

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
                if (!capabilities.error) {
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
                } else {
                    alert("failed to parse the response.")
                }
            },
            failure: function() {
                alert("Trouble getting capabilities doc")
            }
        })

    },

    _addWMS: function(url) {
        pmap.Application.getInstance().findView("Map").map.addLayer(
            new OpenLayers.Layer.WMS("New Layer", url)
        )        
    }

})

pmap.Application.getInstance().addView( pmap.AddLayer.View, 101, "AddLayer" )
