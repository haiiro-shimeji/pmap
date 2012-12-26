pmap.Location = {}

pmap.Location.View = Backbone.View.extend({
	
	el: "#location",
	
	initialize: function( data ) {
		
		var debug = data.app.findView("Debug")
		if ( debug ) {
			debug.$el.append( ( this.$el = $("<div>").attr("id","location") ) )
		}
		
		this._getCurrentPosition()
		
	},
	
	_getCurrentPosition: function() {
		
		var self = this
		
		$.Deferred()
		.resolve()
		.pipe( function() {
			return $.Deferred( function(defer) {
				setTimeout( function() {
					defer.resolve()
				}, 5000 )
			} )
			.promise()
		} )
		.done( function() {
			//start animation.
			self.$el.text("get location..")
		} )
		.pipe( function() {
			return $.Deferred( function(defer) {
				navigator.geolocation.getCurrentPosition(
					function( position ) {
						defer.resolve( position )
					},
					function( error ) {
						defer.reject( error )
					},
					{ 
						enableHighAccuracy: true 
					}
				)
			} )
			.promise()
		} )
		.always( function() {
			//stop animation.
		} )
		.pipe( 
			function( position ) {
				self.$el.html( $.map( position.coords, function( value, key ) {
						return key + ": " + value
					} )
					.join( "<br/>" ) )
				return $.Deferred().resolve()
			},
			function( error ) {
				self.$el.html( 
					"error!<br/>"
					+ $.map( error, function( value, key ) {
							return key + ": " + value
						} )
						.join( "<br/>" ) 
				)
				return $.Deferred().resolve()
			} 
		)
		.pipe( function() {
			return self._getCurrentPosition()
		} )
		
	}
	
})

pmap.Application.getInstance().addView( pmap.Location.View, 101, "Location" )