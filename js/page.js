/* When window is resized, if user has Mac OS, send message to event page
No need for window onload since content scripts running at "document_idle" are guaranteed to run after the DOM is complete. */
if( window.navigator.platform.indexOf( "Mac" ) > -1 )
{
	function resizeMsg()
	{
		if( typeof chrome.runtime != "undefined" )
		{
			chrome.runtime.sendMessage({ resizedMacOS: 1 }, function( response ){});
		}
	}
	var timeout;
	window.addEventListener( "resize" , function( event )
	{
		clearTimeout( timeout );
	   	timeout = setTimeout( resizeMsg, 200 );
	});
}