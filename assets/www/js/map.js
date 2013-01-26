pmap.Map = {}

pmap.Map.View = Backbone.View.extend({

    render: function() {
        pmap.Map.getInstance().init()
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

    },

    addLayer: function(layer) {
        this.olMap.addLayer(layer)
    }

}
