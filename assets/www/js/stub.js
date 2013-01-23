if (  !( location.href == 'file:///android_asset/www/index.html' ) ) {

    navigator.compass = {

        watchHeading: function( success, error, options ) {
            var _callSuccess = function( interval, _callback ) {
                return $.Deferred()
                    .resolve()
                    .pipe( function() {
                        return $.Deferred( function(defer) {
                            setTimeout( function() { defer.resolve() }, interval )
                        } ).promise()
                    } )
                    .done( function() {
                        _callback( {
                            magneticHeading: 33
                        } )
                    } )
                    .pipe( function() {
                        return _callSuccess( interval, _callback )
                    } )
            }

            options = options || {}
            _callSuccess( options.frequency || 100, success )

        }

    }

    OpenLayers.ProxyHost = "proxy.php/?url="

}
