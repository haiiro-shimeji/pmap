pmap.Location = {}

pmap.Location.View = Backbone.View.extend({
	
	el: "#location",
	
	position: { coords: {} },
	
	initialize: function( data ) {
		
		var self = this
		
		var debug = data.app.findView("Debug")
		if ( debug ) {
			debug.$el.append( ( this.$el = $("<div>").attr("id","location") ) )
		}
		
		if ( location.href == 'file:///android_asset/www/index.html' ) {
			document.addEventListener("deviceready", function() { self._init() }, false);
		} else {
			this._init()
		}
		
	},
	
	_init: function() {
		
		var self = this
		
		var geolocationWatchId = navigator.geolocation.watchPosition(
			function( position ) {
				$.map( position.coords, function( value, key ) {			
					if ( null != value ) {
						self.position.coords[ key ] = value
					}
				} )
			},
			$.noop,
			{
				enableHighAccuracy: true,
				maximumAge: 3000, 
				timeout: 5000
			}
		)

		//	geolocation api does not always return heading.
		//	But navigator.compass is not always defined (in device does not support it?).
		if ( navigator.compass ) {
			var compassWatchId = navigator.compass.watchHeading(
				function( heading ) {
					$.each( heading, function( key, value ) {
						return self.position.coords[ key ] = value
					} )
				},
				$.noop
			)
		}

		this._debugPrintPosition()
			
	},
	
	_debugPrintPosition: function() {
		
		var self = this
		
		$.Deferred()
		.resolve()
		.pipe( function() {
			return $.Deferred( function(defer) {
				setTimeout( function() {
					defer.resolve()
				}, 1000 )
			} )
			.promise()
		} )
		.done( function() {
			self.$el.html( $.map( self.position.coords, function( value, key ) {
					return key + ": " + value
				} )
				.join( "<br/>" ) )
		} )
		.pipe( function() {
			return self._debugPrintPosition()
		} )
		
	}
	
})

pmap.Application.getInstance().addView( pmap.Location.View, 101, "Location" )