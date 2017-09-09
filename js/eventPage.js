/* 
  Open extension from context menu, by creating a new window that emulates the position and measurements of the extension's pop up,
  since pop ups cannot be opened programmatically.

  NOTE: in Mac OS, if Chrome is in fullscreen mode, each new window will also be opened in fullscreen. To prevent the extension's window 
        overlapping the page that user is browsing, context menu is disabled in this situation. 
        Until a better way is found, a content script in injected in the page, detecting OS + window resize and passing a message to the current
        event page, to update the context menu. NOT the best way, but still better than user clicking context menu and getting an alert, 
        instead of the expected functionality.
*/

/* Object to be passed to Main.js with tab's language, text selection and window's measurements */
var extensionData = {};

/* Create window with similar measurements and position of browser action pop up  */
function openPopUp( info, tab ) 
{
    extensionData = {};
    /*Chrome PDF reader case
    Since tab and window ids have the value of -1, it is not possible to detect language or window coordinates. */
    if( tab.id < 0 )
    {
        createWindow( info, "", { top: 0, left: 0, width: tab.width } );
    }
    /* Regular cases */
    else
    {
        chrome.tabs.detectLanguage( tab.id, function( language )
        {
            chrome.windows.get( tab.windowId, function( windowOfTab )
            {
                createWindow( info, language, windowOfTab );
            });
        });
    }
}

function createWindow( info, language, windowOfTab )
{
    /* Each OS has small differences in the pop up's width and height */
    chrome.runtime.getPlatformInfo( function( platformInfo ) 
    { 
        var height, resultsHeight, width, resultsWidth, fromTopToOmnibox;
        switch( platformInfo.os )
        {
            case "mac":
                if( windowOfTab.state == "fullscreen" )
                {
                    /* Just in case context menu isn't disabled in time */
                    alert( "Em modo fullscreen, use o atalho de teclado ou clique no ícone da extensão." );
                    return;
                }

                height              = 112;
                resultsHeight       = 622;
                width               = 436;
                resultsWidth        = 436;
                fromTopToOmnibox    = 70;
                break;

            case "linux":
                height              = 90;
                resultsHeight       = 600;
                width               = 436;
                resultsWidth        = 451;
                fromTopToOmnibox    = 70;
                break;

            //"win"
            //case "cros": Chrome OS not tested, so it will have same values as Windows, for now.
            default:
                height              = 129;
                resultsHeight       = 639;
                width               = 452;
                resultsWidth        = 469;
                fromTopToOmnibox    = 80;
                break;
        }
      
        //Create window at browser's top right corner, like the browser action pop up
        var top = windowOfTab.top + fromTopToOmnibox;
        var left = windowOfTab.left + windowOfTab.width - resultsWidth - 15;
        //Multiple screens
        if( windowOfTab.left < 0 )
        {
            left   = windowOfTab.left + windowOfTab.width - resultsWidth - 15;
        }
      
        extensionData = { lang: language, selection: info.selectionText, width: width, height : height, resultsWidth: resultsWidth, resultsHeight: resultsHeight };
                    
        chrome.windows.create({'url': 'popup.html', 'state' : 'normal', 'type': 'popup', 'height': height, 'width': width, 'top' : top, 'left': left, }, function( newWindow ) 
        {
        });
    });
}

/* Create context menus for 2 contexts (page without and with a text selection) and add action */
chrome.contextMenus.removeAll();
chrome.contextMenus.create({ id: "page", title: "Quero ser um dicionário", contexts:[ "page" ] });
chrome.contextMenus.create({ id: "selection", title: "Dicionário: pesquisar '%s'", contexts:[ "selection" ] });
chrome.contextMenus.onClicked.addListener( openPopUp );

/* If OS is Mac OS and there's a change in window (from or to fullscreen), update context menu */
var windowState   = "";
function checkFullScreenMacOs()
{
    chrome.windows.getCurrent( function( currentWindow )
    {
        if( ( windowState != "" && windowState != currentWindow.state ) || ( windowState == "" && currentWindow.state == "fullscreen" ) )
        {
            var title         = "Quero ser um dicionário";
            var selTitle      = "Dicionário: pesquisar '%s'";
            var enabled       = true;
            if( currentWindow.state == "fullscreen" )
            {
                title         = "Em modo fullscreen, use o atalho do teclado ou clique no ícone da extensão";
                selTitle      = title;
                enabled       = false;
            }
            chrome.contextMenus.update("page", { title: title, enabled: enabled });
            chrome.contextMenus.update("selection", { title: selTitle, enabled: enabled });
        }
        windowState = currentWindow.state;
    });
}   
chrome.runtime.getPlatformInfo( function( platformInfo ) 
{
    if( platformInfo.os == "mac" )
    {
        checkFullScreenMacOs();
    }
});
chrome.runtime.onMessage.addListener( function( request, sender, sendResponse ) 
{
    if ( request.resizedMacOS == 1 )
    {
        checkFullScreenMacOs();
    }
});