<?php
/**
 * open proxy for debug
 *
 * DONT put the directory that is accessible from the external place.
 *
 */

ini_set('session.cookie_path', dirname( $_SERVER['PHP_SELF'] ) );
session_start();

class Proxy {
	
	var $url;
	var $method;
	var $data;
	
	function __construct( $url, $method, $data ) {
		
		$this->url = $url;
		$this->method = $method;
		$this->data = $data;
		
	}
	
	function proxy() {
		
		$data = $this->data;
		
		$result = array();

		$url = null;
		$options = null;
		
		if ( 'POST' == $this->method ) {
			$url = $this->url;
			$options = array('http' => array(
				'method' => $this->method,
				'content' => http_build_query( $data )
			));
		} else {
            $url = $this->url
                .( empty($this->data) ? "" : "?".http_build_query($data) );
			$options = array();
		}

		if (FALSE !== ( $fp = @fopen( $url, 'r', false, stream_context_create($options)) )) {

			$meta_data = stream_get_meta_data($fp);
			$result['headers'] = $meta_data['wrapper_data'];

			if ( preg_match( '%^HTTP/1\.[01]\s+(\d+) %', $result['headers'][0], $match ) )
				$result['status'] = (int)$match[1];

			$r = "";

			while (!feof($fp))
				$r .= fgets($fp, 4096);

			fclose($fp);

			$result['data'] = $r;

		} else {
			if ( $http_response_header ) {
				if ( preg_match( '%^HTTP/1\.[01]\s+(\d+) %', $http_response_header[0], $match ) )
					$result['status'] = (int)$match[1];
				$result['headers'] = $http_response_header;
			} else {
				$result['headers'][] = 'HTTP/1.0 404 Not Found.';
			}
		}

		return $result;

	}
	
}

$url = $_REQUEST['url'];
unset( $_REQUEST['url'] );

$proxy = new Proxy( $url, $_SERVER['REQUEST_METHOD'], $_REQUEST );
$result = $proxy->proxy();

foreach ( $result["headers"] as $header ) {
	header( $header );
}

if ( isset( $result['data'] ) ) echo $result['data'];
