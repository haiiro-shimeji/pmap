pmap.Menu = {}

pmap.Menu.View = Backbone.View.extend({

    el: "#menu",

    open: undefined,

    initialize: function() {

        var self = this

        self.$el
        .append(
            $("<div>")
            .text("Add WMS")
            .click(function() {
                pmap.Application.getInstance().findView("Wms").$el.popup("open")
            })
        )
        .append($("<div>").text("Settings"))
        .hide()

        this.open = false

        $("#menu_button").click(function() {
            if (self.open) {
                self.$el.hide()
                self.open = false
            } else {
                self.$el.show()
                self.open = true
            }
        })

    }

})

pmap.Application.getInstance().addView( pmap.Menu.View, 101, "Menu" )
