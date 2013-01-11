pmap.Map = {}

pmap.Map.View = Backbone.View.extend({

	app: undefined,
	map: undefined,

	initialize: function( data ) {

		this.map = new OpenLayers.Map( {
			div: "map",
			allOverlays: true,
			maxResolution : 156543.0339,
			numZoomLevels : 20,
			projection: new OpenLayers.Projection("EPSG:900913"),
			displayProjection : new OpenLayers.Projection("EPSG:4326"),
			units: "m",
			maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
			controls: []
		} );
        this.map.addControl(new OpenLayers.Control.Zoom());
        this.map.addControl(new OpenLayers.Control.Navigation({'zoomWheelEnabled': true}));
        this.map.addControl(new OpenLayers.Control.KeyboardDefaults());
        this.map.addControl(new OpenLayers.Control.TouchNavigation());

		this.map.addLayer( new OpenLayers.Layer.OSM( "Simple OSM Map") );

		this.map.setCenter(
			new OpenLayers.LonLat( 139.764772, 35.681610 ).transform(
				new OpenLayers.Projection("EPSG:4326"),
				this.map.getProjectionObject()
				), 12
			);    

	}

} )
pmap.Application.getInstance().addView( pmap.Map.View, 100, "Map" )
