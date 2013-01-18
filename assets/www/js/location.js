pmap.Location = {}

pmap.Location.View = Backbone.View.extend({

	el: "#location",

	position: { coords: {} },

    geolocationWatchId: undefined,
    compassWatchId: undefined,

	initialize: function( data ) {

		var self = this

		var debug = data.app.findView("Debug")
		if ( debug ) {
			debug.$el.append( ( this.$el = $("<div>").attr("id","location") ) )
		}

        $("#location_button").click(function() {
            if (!self.geolocationWatchId) {
                self._startWatch()
            } else {
                self._stopWatch()
            }
        })

		this._debugPrintPosition()

	},

	_startWatch: function() {

		var self = this

        if (!this.geolocationWatchId) {
    		this.geolocationWatchId = navigator.geolocation.watchPosition(
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
        }

		//	geolocation api does not always return heading.
		//	But navigator.compass is not always defined (in device does not support it?).
		if (!this.compassWatchId && navigator.compass) {
			this.compassWatchId = navigator.compass.watchHeading(
				function( heading ) {
					$.each( heading, function( key, value ) {
						return self.position.coords[ key ] = value
					} )
				},
				$.noop
			)
		}

	},

    _stopWatch: function() {

        if (this.geolocationWatchId) {
            navigator.geolocation.clearWatch(this.geolocationWatchId)
            this.geolocationWatchId = null
        }

        if (this.compassWatchId) {
            navigator.compass.clearWatch(this.compassWatchId)
            this.compassWatchId = null
        }

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
