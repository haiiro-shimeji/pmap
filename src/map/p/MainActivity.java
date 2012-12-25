package map.p;

import android.os.Bundle;
import org.apache.cordova.DroidGap;

public class MainActivity extends DroidGap {

	@Override
	public void onCreate( Bundle savedInstanceState ) {
		
		super.onCreate( savedInstanceState );
		super.init();
		super.setIntegerProperty("loadUrlTimeoutValue", 300000);
		
		super.loadUrl("file:///android_asset/www/index.html");
		
	}
	
	@Override
	public void onBackPressed() {
	}
	
}
