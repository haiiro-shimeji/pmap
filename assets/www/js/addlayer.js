pmap.AddLayer = {}

pmap.AddLayer.View = Backbone.View.extend({

    el: "#add_layer_popup",

    open: undefined,

    map: undefined,

    urlFormats: [
        {
            label: "WMS Capabilities",
            value: "wms_capabilities",
            form: [
                $("<span>").text("WMS Capabilities URL"),
                $("<input>").attr("name", "wms_capabilities_url").textinput()
            ]
        },
        {
            label: "Single WMS",
            value: "wms",
            form: [
                $("<span>").text("WMS URL"),
                $("<input>").attr("name", "wms_url").textinput(),
                $("<span>").text("WMS Layers"),
                $("<input>").attr("name", "wms_layers").textinput(),
                $("<span>").text("please put the layer names which is sepalated by ','")
            ]
        }
    ],

    render: function() {

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
            self.$el.find(".add_layer_form_format").hide()
            self.$el.find("#add_layer_form_"+$(this).val()).show()
        })
        .val(this.urlFormats[0].value)
        .change()

        formatSelect.selectmenu("refresh")

        $("#add_layer_form").submit(function() {

            var format = $("select[name=url_format]",this).val()
            var map = pmap.Application.getInstance().findView("Map").map

            switch (format) {
                case self.urlFormats[0].value: {  //wms_capabilities
                    self._addWMSCapability(
                        map, 
                        $("input[name=wms_capabilities_url]",this).val()
                    )
                    self.$el.popup("close")
                }
                break;
                default: {
                    $(".error",this).text("wms url must be input.")
                }
            }

            return false

        })
 
        return this    

    },

    _addWMSCapability: function(map, url) {

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
                return self.__addCapabilities(map, capabilities)            
            })

    },

    __addCapabilities: function(map, capabilities) {

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

    },

    _addWMS: function(map, url) {
        map.addLayer(new OpenLayers.Layer.WMS("New Layer", url))
    }

})

pmap.Application.getInstance().addView( pmap.AddLayer.View, 101, "AddLayer" )
