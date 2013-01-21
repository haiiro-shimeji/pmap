pmap.Location = {}

pmap.Location.View = Backbone.View.extend({

	el: "#location",

    app: undefined,

	position: { coords: {} },

    geolocationWatchId: undefined,
    compassWatchId: undefined,

	initialize: function( data ) {

		var self = this

        this.app = data.app

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

        self._displayLocationalMarker()

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

    _displayLocationalMarker: function() {

        var self = this

        var _updatePosition = function() {

            return $.Deferred()
                .resolve()
                .pipe(function(defer) {
                    return $.Deferred(function(defer) {
                        setTimeout(function() {
                            defer.resolve()
                        }, 1000)
                    })
                    .promise()
                })
            .done(function() {

                if (self.position.coords.latitude
                    && self.position.coords.longitude) {
                    marker.move(
                        new OpenLayers.LonLat(
                            self.position.coords.longitude,
                            self.position.coords.latitude
                        )
                        .transform('EPSG:4326', 'EPSG:900913')
                    )
                }

                if (self.position.coords.magneticHeading) {
                    marker.attributes.angle = self.position.coords.magneticHeading
                }

            })
            .pipe(function() {
                return _updatePosition()
            })

        }

        var overlay = new OpenLayers.Layer.Vector('Overlay', {
            styleMap: new OpenLayers.StyleMap({
                externalGraphic: 'img/direction.png',
                graphicWidth: 24,
                graphicHeight: 24,
                graphicXOffset: -12,
                graphicYOffset: -12,
                rotation: "${angle}",
                title: 'current location'
            })
        })

        self.app.findView("Map").map.addLayer(overlay)

        var marker = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(139.764772, 35.681610)
                .transform('EPSG:4326', 'EPSG:900913'),
            {
                tooltip: 'Location',
                angle: 0
            }
        )
        overlay.addFeatures([marker])

        _updatePosition()

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
