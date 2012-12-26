if (  !( location.href == 'file:///android_asset/www/index.html' ) ) {
	navigator.geolocation = {}
	navigator.geolocation.getCurrentPosition = function( success, error ) {
		success( {
			coords: {
				latitude: 70,
				longitude: 140
			}
		} )
	} 
}