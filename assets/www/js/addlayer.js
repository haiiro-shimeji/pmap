pmap.AddLayer = {}

pmap.AddLayer.View = Backbone.View.extend({

    el: "#add_layer_popup",

    open: undefined,

    render: function() {

        var self = this

        var formatSelect = $("#add_layer_form select")

        $.each(pmap.AddLayer.Formats, function(tag, format) {

            formatSelect.append(
                $("<option>")
                .val(tag)
                .text(format.label)
            )

            var div = $("<div>")
                .addClass("add_layer_form_format")
                .attr("id", "add_layer_form_"+tag)
            $.each(format.form, function(i, e) {
                div.append(e)
            })

            $("#add_layer_form #add_layer_inputs").append(div)

        })

        formatSelect.find("option:first").attr("selected","selected")

        formatSelect.change(function() {
            self.$el.find(".add_layer_form_format").hide()
            self.$el.find("#add_layer_form_"+$(this).val()).show()
        })
        .change()

        formatSelect.selectmenu("refresh")

        $("#add_layer_form").submit(function() {

            var format = $("select[name=url_format]",this).val()
            var map = pmap.Application.getInstance().findView("Map").map

            if (pmap.AddLayer.Formats[format]) {
                pmap.AddLayer.Formats[format].callback(map, this)
                self.$el.popup("close")
            } else {
                $(".error",this).text("wms url must be input.")
            }

            return false

        })
 
        return this    

    }

})

pmap.Application.getInstance().addView( pmap.AddLayer.View, 101, "AddLayer" )

pmap.AddLayer.Formats = {

    "wms_capabilities": {
        label: "WMS Capabilities",
        form: [
            $("<span>").text("WMS Capabilities URL"),
            $("<input>").attr("name", "wms_capabilities_url").textinput()
        ],
        callback: function(map, form) {

            var url = $("input[name=wms_capabilities_url]",form).val()

            var self = this

            return $.Deferred()
                .resolve()
                .pipe(function () {

                    var defer = $.Deferred()

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
                        success: function (request) {
                            var doc = request.responseXML
                            if (!doc || !doc.documentElement) {
                                doc = request.responseText
                            }
                            defer.resolve( format.read(doc) )
                        },
                        failure: function () {
                            defer.reject("Failed to get capabilities doc.")
                        }
                    })

                    return defer.promise()

                })
                .pipe(function (capabilities) {
                    return self._addCapabilities(map, capabilities)            
                })

        },

        _addCapabilities: function(map, capabilities) {

            if (!capabilities.error) {

                $.each(capabilities.capability.layers, function(i, layer) {
                    map.addLayer(
                        new OpenLayers.Layer.WMS(
                            layer.title,
                            capabilities.service.href,
                            { layers: layer.name },
                            { visibility: false }
                        )
                    )
                })

                return $.Deferred().resolve()

            } else {
                return $.Deferred().reject("failed to parse the response.")
            }

        }
    },

    "wms": {
        label: "Single WMS",
        form: [
            $("<span>").text("WMS URL"),
            $("<input>").attr("name", "wms_url").textinput(),
            $("<span>").text("Name"),
            $("<input>").attr("name", "wms_name").attr("placeholder", "New Layer").textinput(),
            $("<span>").text("WMS Layers"),
            $("<input>").attr("name", "wms_layers").textinput(),
            $("<span>").text("please put the layer names which is sepalated by ','")
        ],
        callback: function(map, form) {
            var url = $("input[name=wms_url]",form).val()
            var layers = $("input[name=wms_layers]",form).val()
            var name = $("input[name=wms_name]",form).val() || "New Layer"
            map.addLayer(new OpenLayers.Layer.WMS(name, url, {
                LAYERS: layers
            }))
        }
    }

}
