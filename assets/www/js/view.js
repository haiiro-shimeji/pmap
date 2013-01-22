pmap.View = Backbone.View.extend( {

    defer: undefined,

    initialize: function( data ) {
        this.defer = $.Deferred()
        this._initAsync( data )
    },

    _initAsync: function() {
        this.defer.resolve()
    }

} )
