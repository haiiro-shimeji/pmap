pmap.Map = {}

pmap.Map.View = Backbone.View.extend({

    render: function() {
        var map = pmap.Map.getInstance()
        map.init()
        ;(new pmap.ZoomControl.View({ map: map.olMap })).render()
        return this
    }

} )
pmap.Application.getInstance().addView( pmap.Map.View, 100, "Map" )

pmap.Map = function () {
}

pmap.Map.instance = undefined

pmap.Map.getInstance = function () {
    if (!pmap.Map.instance) {
        pmap.Map.instance = new pmap.Map()
    }
    return pmap.Map.instance
}

pmap.Map.prototype = {

    olMap: undefined,

    init: function() {

        this.olMap = new OpenLayers.Map( {
            div: "map",
            allOverlays: true,
            maxResolution : 156543.0339,
            numZoomLevels : 20,
            projection: new OpenLayers.Projection("EPSG:900913"),
            displayProjection : new OpenLayers.Projection("EPSG:4326"),
            units: "m",
            maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
            controls: []
        } )
        this.olMap.addControl(new OpenLayers.Control.Zoom())
        this.olMap.addControl(new OpenLayers.Control.Navigation({
            'zoomWheelEnabled': true
        }))
        this.olMap.addControl(new OpenLayers.Control.KeyboardDefaults())
        this.olMap.addControl(new OpenLayers.Control.TouchNavigation())
        this.olMap.addControl(new OpenLayers.Control.LayerSwitcher())

        this.olMap.addLayer( new OpenLayers.Layer.OSM( "Simple OSM Map") )

        this.olMap.setCenter(
            new OpenLayers.LonLat( 139.764772, 35.681610 ).transform(
                new OpenLayers.Projection("EPSG:4326"),
                this.olMap.getProjectionObject()
                ), 12
            )

        this.olMap.addLayer(new OpenLayers.Layer.Vector('LocalFeatures'))

    },

    addLayer: function (layer) {
        this.olMap.addLayer(layer)
    },

    //@TODO iconUrl -> LocalFeatureType Object
    addLocalFeature: function (iconUrl, pixelX, pixelY) {

        try {
            var localFeatureLayer = Enumerable.from( this.olMap.layers )
                .where( function(x) {return 'LocalFeatures' == x.name} )
                .first()

            var lonlat = this.olMap.getLonLatFromPixel({
                x: pixelX,
                y: pixelY
            })

            var marker = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat),
                {
                    tooltip: 'feature',
                },
                {
                    externalGraphic: iconUrl,
                    graphicWidth: 32,
                    graphicHeight: 32,
                    graphicXOffset: -16,
                    graphicYOffset: -16,
                    rotation: 0,
                    title: 'feature'
                }
            )
            localFeatureLayer.addFeatures([marker])

        } catch (e) {
            alert("Local feature layer is not found.")
        }

    },

    addLocalPath: function (localFeatureType, points, style) {

        var self = this

        try {
            if ( 0 < points.length ) {

                var localFeatureLayer = Enumerable.from( this.olMap.layers )
                    .where( function(x) {return 'LocalFeatures' == x.name} )
                    .first()

                points = $.map( points, function( point ) {
                    var lonlat = self.olMap.getLonLatFromPixel({
                        x: point.x,
                        y: point.y
                    })
                    return new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat)
                } )

                localFeatureLayer.addFeatures([
                    new OpenLayers.Feature.Vector(
                        new OpenLayers.Geometry.LineString( points ),
                        { tooltip: "feature" },
                        style
                    )
                ])

            }
        } catch(e) {
            alert("Local feature layer is not found.")
        }

    }

}
