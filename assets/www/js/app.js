angular.module('app', [])
.factory('mapControl', function() {

    var map = new OpenLayers.Map( {
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
    map.addControl(new OpenLayers.Control.Zoom())
    map.addControl(new OpenLayers.Control.Navigation({
        zoomWheelEnabled: true
    }))
    map.addControl(new OpenLayers.Control.KeyboardDefaults())
    map.addControl(new OpenLayers.Control.TouchNavigation())
    map.addControl(new OpenLayers.Control.LayerSwitcher())

    map.addLayer( new OpenLayers.Layer.OSM( "Simple OSM Map") )

    map.setCenter(
        new OpenLayers.LonLat( 139.764772, 35.681610 ).transform(
            new OpenLayers.Projection("EPSG:4326"),
            map.getProjectionObject()
        ), 12
    )

    map.addLayer(new OpenLayers.Layer.Vector('LocalFeatures'))

})

var MapCtrl = function() {
    app.mapControl()
}
