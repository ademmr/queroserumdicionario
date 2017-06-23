/*
 * Get and display the response of a single, or multiple, AJAX GET request
 *
 * TODO: Launch event when fetching is done and make possible to set a limit for active requests
 */
 
(function(){
    this.Fetcher = function( args )
    {
        var stopXHR                 = false;
        var resultsNode             = {};
        var requests                = [];
        var date                    = new Date();
        var noResultsMsg            = "No results.";
        var fetchingMsg             = "Fetching";
        var allowBlankAnchors       = false;
        //var fetchedEvent          = new Event( "fetched" );

        /* Public methods to start the XMLHttpRequest and display its response
         *
         * @param object obj Object that holds the information needed to make the request
             * string label                 Title of the results to be displayed (optional)
             * string uri                   Complete URI for request or base URI to be concatenated with a query string
             * string anchorsDomainRoot     Root domain for anchors
             * array successElements        Nodes, from the HTTP response, to be parsed and displayed.
             * object elementsToRemove      Nodes to be removed from the success elements (optional)
             
             * Example:
                foo :
                { 
                    label : "label for foo", 
                    uri : "https://www.foo.com/bar/search?var=", 
                    anchorsDomainRoot : https://www.foo.com",
                    successElements : [ [ "id", "fooId" ], [ "class", "bar2ndElem", 1 ] ], 
                    elementsToRemove: { classes : ["fooRed","fooGreen","fooBlue"], tags: ["barTop"], id: ["barBottom"] }
                }
         
         * @param string propName Name of the property that contains the preceding data
         * @param string queryStr Query string to append to uri (optional)
        */
        this.getSingle = function( obj, propName, queryStr )
        {
            this.stop();
            stopXHR = false;
            if( queryStr === undefined )
            {
                queryStr = "";
            }
            handleRequest( obj, propName, obj[ "uri" ] + queryStr );
        }
      
        this.getMultiple = function( obj, queryStr )
        {
            this.stop();
            stopXHR = false;
            if( queryStr === undefined )
            {
                queryStr = "";
            }
            for( var prop in obj ) 
            {
                if( obj.hasOwnProperty( prop ) ) 
                {
                    handleRequest( obj[ prop ], prop, obj[ prop ][ "uri" ] + queryStr );
                }
            }
        }
        
        /* Public method to set the container of the HTTP requests responses */
        this.setResultsNode = function( node )
        {
            resultsNode = node;
        }

        /* Public method to set messages to be displayed to the user */
        this.setMessages = function( msgs )
        {
            if( msgs[ "noResults" ] !== undefined && msgs[ "noResults" ] != "" )
            {
                noResultsMsg = msgs[ "noResults" ];
            }
            if( msgs[ "fetching" ] !== undefined && msgs[ "fetching" ] != "" )
            {
                fetchingMsg  = msgs[ "fetching" ];
            }
        }
        
        /* Public method to abort all active XMLHttpRequest requests */
        this.stop = function()
        {
            stopXHR = true;
            while( requests.length > 0 )
            {
                stopRequest( requests[ 0 ] );
                requests.splice( 0, 1 );
            }
        }
        
        /* Public method to set if target _blank anchors should be maintained or removed */
        this.allowExternalAnchors = function( value )
        {
            allowBlankAnchors = value;
        }

        function parseUri( uri )
        {
            return encodeURI( uri.trim() );
        }

        function stopRequest( request )
        {
            request.abort();
            request.onreadystatechange = null;
            request = null;
        }

        /* Manage XMLHttpRequest */
        function handleRequest( prop, propName, uri )
        {
            var id          = propName + "_" + date.getTime();
            var label       = prop[ "label" ] !== undefined ? prop[ "label" ] : "";
            uri             = parseUri( uri );
            createContainer( id, label, propName );

            if( uri.length > 2048 )
            {
                displayResult( prop, null, uri, id, label );
                return false;
            }
           
            var httpRequest = new XMLHttpRequest();
            requests.push( httpRequest );
            httpRequest.onreadystatechange = function()
            { 
                if( httpRequest.readyState == 4 ) 
                {
                    //resultsNode.dispatchEvent( fetchedEvent );
                    var responseNode = null;
                    if( httpRequest.status == 200 && httpRequest.responseText.length > 0 )
                    {
                        var parser       = new DOMParser();
                        var responseNode = parser.parseFromString( httpRequest.responseText, "text/html" );
                    }
                    stopRequest( httpRequest );
                    displayResult( prop, responseNode, uri, id, label );
                }
            }
            httpRequest.open( 'GET', uri );
            httpRequest.send();
        }

        /* Create a section, in the results node, to display the result of the HTTP request made. While the response isn't received, display a message to inform the user that the request is being processed. */ 
        function createContainer( id, label, propName )
        {
            var container            = document.createElement( "div" );
            container.id             = id;
            container.className      = "fetcher-container";
            container.dataset.prop   = propName;
            container.innerHTML      = '<section class="fetcher-title"><h2 class="fetcher-msg">' + fetchingMsg + ' ' + label + '...</h2></section>';
            resultsNode.appendChild( container );  
        }

        /* Get and display the content of each of the nodes to be selected in the HTTP request's response. If HTTP request didn't return results, or nodes weren't found, display the appropriate msg. */ 
        function displayResult( prop, responseNode, uri, id, label )
        {
            var content = document.createElement( "section" );       
            content.className = "fetcher-content";
            var containersCount = prop[ "successElements" ].length;

            if( responseNode === null || containersCount == 0 )
            {
                content.innerHTML = '<h2 class="fetcher-msg">' + noResultsMsg + '</h2>';
            }
            else
            {
                var contentHtml = "";

                for( var i = 0; i < containersCount; i++ )
                {
                    var contentNode  = getContentNode( responseNode, prop[ "successElements" ][ i ][ 0 ], prop[ "successElements" ][ i ][ 1 ], prop[ "successElements" ][ i ][ 2 ] );
                    if( contentNode !== null && contentNode !== undefined )
                    {
                        parseResult( contentNode, prop );
                        contentHtml += contentNode.innerHTML;
                    }
                    else if( i == 0 )
                    {
                        contentHtml += '<h2 class="fetcher-msg">' + noResultsMsg + '</h2>';
                    }
                }
                content.innerHTML = contentHtml;               
            }
            
            // If, in the meantime, getSimple(), getMultiple() or stop() were called, don't display the current requests results.        
            if( !stopXHR )
            {
                var container       = document.getElementById( id );
                container.innerHTML = "";
                
                if( label !== "" )
                {
                    var labelElem       = document.createElement( "section" );
                    labelElem.className = "fetcher-title";
                    labelElem.innerHTML = '<h1 class="fetcher-label"><a href="' + uri + '" target="_blank">' + prop[ "label" ] + '</<></h1>';
                    container.appendChild( labelElem );     
                }

                container.appendChild( content );
            }
        }

        /* Select, from the HTTP response, the nodes which contain the desired content */
        function getContentNode( responseNode, attribute, identifier, index )
        {
            //return responseNode.querySelector( "[" + attribute + "='" + identifier + "']" );
            var element = null;
            if( index === undefined )
            {
                index = 0;
            }
            switch( attribute )
            {
                case "id":
                    element = responseNode.getElementById( identifier );
                    break;
                case "class":
                    var classes = responseNode.getElementsByClassName( identifier );
                    element = classes[ index ];
                    break;
                case "tag":
                    var tags = responseNode.getElementsByTagName( identifier );
                    element = tags[ index ];
                    break;

                default:
                    break;
            }
            return element;
        }
   
        /* Parse the content nodes, processing its anchors and removing undesired elements */
        function parseResult( contentNode, prop )
        {
            var defaultTagsToRemove = [ "iframe", "script", "form", "button", "input", "meta", "img", "audio" ];
            defaultTagsToRemove.map( function( tag )
            { 
                removeElementsByTag( contentNode, tag ); 
            });

            if( prop[ "elementsToRemove" ] !== undefined )
            {
                for( var attr in prop[ "elementsToRemove" ] ) 
                {
                    if( prop[ "elementsToRemove" ].hasOwnProperty( attr ) )
                    {
                        switch( attr )
                        {
                            case "id":
                                prop[ "elementsToRemove" ][ "id" ].map( function( id )
                                { 
                                    removeElementById( contentNode, id ); 
                                });
                                break;

                            case "class":
                                prop[ "elementsToRemove" ][ "class" ].map( function( className )
                                { 
                                    removeElementsByClass( contentNode, className ); 
                                });
                                break;

                            case "tag":
                                prop[ "elementsToRemove" ][ "tag" ].map( function( tag )
                                { 
                                    removeElementsByTag( contentNode, tag ); 
                                });
                                break;
                            
                            default:
                                break;
                        }
                    }
                }
            }

            parseAnchors( contentNode, prop[ "anchorsDomainRoot" ] );
        }

        function removeElementById( parentNode, id )
        {
            var element = parentNode.querySelector( "#" + id );
            if( element !== null )
            {
                element.remove();
            }
        }
        
        function removeElementsByClass( parentNode, cls )
        {
            var elements    = parentNode.getElementsByClassName( cls );
            while( elements.length > 0 )
            {
                elements[ 0 ].remove();
            }
        }

        function removeElementsByTag( parentNode, tag )
        {
            var elements    = parentNode.getElementsByTagName( tag );
            while( elements.length > 0 )
            {
                elements[ 0 ].remove();
            }
        }

        function parseAnchors( contentNode, anchorsDomainRoot )
        {
            var anchors = contentNode.getElementsByTagName( "a" );
            var count   = anchors.length;
            if( count )
            {
                var i;
                for ( i = 0; i < count; i++) 
                { 
                    if( anchors[ i ].getAttribute( "onclick" ) )
                    {
                        anchors[ i ].removeAttribute( "onclick" )   
                    }

                    // Remove anchors that open a new window / tab
                    if( anchors[ i ].getAttribute( "target" ) == "_blank" )
                    {
                        if( !allowBlankAnchors )
                        {
                            anchors[ i ].remove();
                            --i;
                            count -= 1;
                        }
                    }
                    // If no base uri was given to build anchor full path, or href attribute contains email link, remove href.
                    else if( ( anchorsDomainRoot === undefined || anchorsDomainRoot == "" ) || ( anchors[ i ].getAttribute( "href" ) != null && anchors[ i ].getAttribute( "href" ).indexOf( "mailto" ) > -1 ) )
                    {
                       anchors[ i ].removeAttribute( "href" );  
                       anchors[ i ].classList = "ignore";  
                    }
                    // Set href attribute with full path so anchor content can be fetched
                    else
                    {
                        var href = anchors[ i ].getAttribute( "href" );
                        if( href !== null && href.charAt( 0 ) != "/" && anchorsDomainRoot.charAt( anchorsDomainRoot.length - 1 ) != "/" )
                        {
                            href = "/" + href;
                        }
                        anchors[ i ].dataset.ref = anchorsDomainRoot + href; 
                        anchors[ i ].setAttribute( "href", "#" ); 
                    }
                }
            }
        }
    }
}());