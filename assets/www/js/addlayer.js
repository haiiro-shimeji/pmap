pmap.AddLayer = {}

pmap.AddLayer.View = Backbone.View.extend({

    el: "#add_layer_popup",

    open: undefined,

    urlCache: undefined,

    initialize: function() {
        this.urlCache = new pmap.AddLayer.UrlCache
    },

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

        var map = pmap.Map.getInstance()
        var cache = this.urlCache.cache()

        if (0 < cache.length) {

            var hist = $("#add_layer_history")
            hist.append($("<span>").text("History"))

            var list = $("<ul>")
            hist.append(list)

            $.each(cache, function(i, c) {
                list.append(
                    $("<li>")
                    .append(
                        $("<a>")
                        .attr("href", "#")
                        .text(c.name)
                        .click(function() {
                            self.$el.popup("close")
                            pmap.AddLayer.Formats[c.format]
                            .callback(map, c, self.urlCache)
                            .fail(function (message) {
                                alert(message)
                            })
                        })
                    )
                )
            })

            list.listview({ inset: true })

        }

        $("#add_layer_form").submit(function() {

            var format = $("select[name=url_format]",this).val()

            if (pmap.AddLayer.Formats[format]) {
                var args = pmap.AddLayer.Formats[format].getArgs(this)
                pmap.AddLayer.Formats[format].callback(map, args)
                .fail(function(message) {
                    alert(message)
                })
            } else {
                alert("Invalid format is selected (programing error).")
            }

            self.$el.popup("close")

            return false

        })
 
        return this

    }

})

pmap.Application.getInstance().addView( pmap.AddLayer.View, 101, "AddLayer" )


pmap.AddLayer.UrlCache = function() {
    this.storage = new pmap.CookieStorage
}

pmap.AddLayer.UrlCache.LIMIT = 5

pmap.AddLayer.UrlCache.prototype = {

    storage: undefined,

    addCache: function(format, name, args) {
        caches = this.storage.get("variables", "layer_caches") || []
        caches.push($.extend({ format: format, name: name }, args))
        while (pmap.AddLayer.UrlCache.LIMIT < caches.length) {
            caches.shift()
        }
        this.storage.set("variables", "layer_caches", caches)
    },

    cache: function() {
        return this.storage.get("variables", "layer_caches") || []
    }

}


pmap.AddLayer.CapabilitiesFormatBase = {
    _getCapabilities: function(url, format, param) {

        var _request = function() {

            var defer = $.Deferred()

            OpenLayers.Request.GET({
                url: url,
                params: param,
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

        }

        return $.Deferred()
            .resolve()
            .pipe( function() {
                return _request()
            } )
            .pipe( function(capabilities) {
                if (capabilities.error && capabilities.error.version && !param.VERSION) {
                    param.VERSION = capabilities.error.version
                    return _request()
                } else {
                    return $.Deferred().resolve(capabilities)
                }
            } )

    }
}

pmap.AddLayer.Formats = {

    "wms_capabilities": $.extend( {
        label: "WMS Capabilities",
        form: [
            $("<span>").text("WMS Capabilities URL"),
            $("<input>").attr("name", "wms_capabilities_url").textinput()
        ],
        getArgs: function(form) {
            return {
                url: $("input[name=wms_capabilities_url]",form).val()
            }
        },
        callback: function(map, args, urlCache) {

            var url = args.url

            var self = this

            return $.Deferred()
                .resolve()
                .pipe(function () {
                    return self._getCapabilities(
                        url,
                        new OpenLayers.Format.WMSCapabilities({
                            yx: {
                                "urn:ogc:def:crs:EPSG::900913": true
                            }
                        }),
                        {
                            SERVICE: "WMS",
                            REQUEST: "GetCapabilities"
                        }
                    )
                })
                .done(function (capabilities) {
                    if (urlCache) {
                        urlCache.addCache("wms_capabilities", capabilities.service.title, {url: url})
                    }
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
    }, pmap.AddLayer.CapabilitiesFormatBase),

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
        getArgs: function(form) {
            return {
                url: $("input[name=wms_url]",form).val(),
                layers: $("input[name=wms_layers]",form).val(),
                name: $("input[name=wms_name]",form).val() || "New Layer"
            }
        },
        callback: function(map, args, urlCache) {
            var url = args.url
            var layers = args.layers
            var name = args.name
            map.addLayer(new OpenLayers.Layer.WMS(name, url, {
                LAYERS: layers
            }))
            if (urlCache) {
                urlCache.addCache("wms", name, {
                    url: url,
                    layers: layers,
                    name: name
                })
            }
        }
    },

    "wfs_capabilities": $.extend({
        label: "WFS Capabilities",
        form: [
            $("<span>").text("WFS Capabilities URL"),
            $("<input>").attr("name", "wfs_capabilities_url").textinput()
        ],
        getArgs: function(form) {
            return {
                url: $("input[name=wfs_capabilities_url]",form).val()
            }
        },
        callback: function(map, args, urlCache) {

            var url = args.url

            var self = this

            return $.Deferred()
                .resolve()
                .pipe(function () {
                    return self._getCapabilities(
                        url,
                        new OpenLayers.Format.WFSCapabilities({
                            yx: {
                                "urn:ogc:def:crs:EPSG::900913": true
                            }
                        }),
                        {
                            SERVICE: "WFS",
                            REQUEST: "GetCapabilities"
                        }
                    )
                })
                .done(function (capabilities) {
                    if (urlCache) {
                        urlCache.addCache("wfs_capabilities", capabilities.service.title, { url: url })
                    }
                })
                .pipe(function (capabilities) {
                    return self._addCapabilities(map, capabilities)            
                })

        },

        _addCapabilities: function(map, capabilities) {
            if (!capabilities.error) {

                $.each(capabilities.featureTypeList, function(i, featureType) {
                    new OpenLayers.Layer.Vector("WFS", {
                        strategies: [new OpenLayers.Strategy.BBOX()],
                        protocol: new OpenLayers.Protocol.WFS({
                            url: capabilities.service.href,
                            featureType: featureType.name
                        })
                    })
                })

                return $.Deferred().resolve()

            } else {
                return $.Deferred().reject("Failed to parse response.")
            }
        }

    }, pmap.AddLayer.CapabilitiesFormatBase)

}
