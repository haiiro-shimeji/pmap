pmap.Debug = {}

pmap.Debug.View = Backbone.View.extend({

    el: "#debug",

    initialize: function() {
        $("#map").append( ( this.$el = $("<div>").attr("id","debug") ) )
    }

} )

pmap.Application.getInstance().addView( pmap.Debug.View, 100, "Debug" )
