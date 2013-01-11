var pmap = {}

pmap.Application = function() {
	this.viewClasses = {}
	this.viewInstances = {}
	this.config = {}
}

pmap.Application.prototype = {
	viewClasses: undefined,	///< Array of pmap.View
	viewInstances: undefined,
	config: undefined
}

pmap.Application.DEFAULT_PRIORITY = 100

pmap.Application.instance = undefined

pmap.Application.getInstance = function() {

	if ( !pmap.Application.instance ) {
		pmap.Application.instance = new pmap.Application
	}

	return pmap.Application.instance

}

pmap.Application.prototype.addView = function( view, priority, tag ) {

	priority = priority || pmap.Application.DEFAULT_PRIORITY

	if ( !this.viewClasses[ priority ] ) {
		this.viewClasses[ priority ] = []
	}

	this.viewClasses[ priority ].push( {
		tag: tag,
		view: view
	} )

}

pmap.Application.prototype.init = function() {

	var self = this

	var defer = $.Deferred()
	var piped = defer

	var priorities = $.map( this.viewClasses, function( value, key ) {
		return key
	} )

	priorities.sort()

	$.each( priorities, function( i, priority ) {
		var viewClassesInPriority = self.viewClasses[ priority ]
		$.each( viewClassesInPriority, function( i, obj ) {
			piped = piped.pipe( function() {
				var instance = ( new ( obj.view )( { app: self } ) )
				if ( obj.tag ) {
					self.viewInstances[ obj.tag ] = instance
				}
				return instance.defer || $.Deferred().resolve()
			} )
		} )
	} )

	defer.resolve()

}

pmap.Application.prototype.findView = function( tag ) {
	return this.viewInstances[ tag ]
}
