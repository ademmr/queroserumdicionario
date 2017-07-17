/*
 * Auxiliar functions for main.js
 */

(function()
{
    this.Helper = function(){};
    
    /* Get index of given value in material design select box */
    Helper.prototype.getIndex = function( sbOptions, value )
    {
        var i, size = sbOptions.length;
        for( i = 0; i < size; i++ )
        {
            if( sbOptions[ i ].id == value )
            {
                return i;
            }
        }

        return -1;
    }

    /* Place a given word in the input field and start search */
    Helper.prototype.clickSearch = function( word )
    {
        searchInput.value = word;
        searchInput.focus();  
        searchBtn.click();
    }

    /* Search definition for the anchor clicked in the results container. */
    Helper.prototype.searchAnchor = function( event, input, dictionaries )
    {
        var element = event.target;

        if( !element.className.match( /(material-icons|ignore)/ ) && element.parentNode.className.indexOf( 'fetcher-label' ) < 0 )
        {
            event.preventDefault();
            if( typeof element.dataset.done != "undefined" )
            {
                return;
            }

            var word = element.text;
            var parent = element.parentNode;
            // If element is child of anchor
            if( word === undefined )
            {
                word   = element.innerHTML;
                parent = parent.parentNode;
            }

            /* 
            Anchor might be a link to a related word or a different meaning for the current word (Michaelis case).
            In the former case, just set the word as the input value and follow the regular procedure.
            In the latter case - for Michaelis dictionary -, make request and show the results below the anchor. 
            */
            if( input != word )
            {
                this.clickSearch( word );
            }
            else
            {
                // Prevent further actions on element
                element.dataset.done = "1";

                var propName = element.closest( ".fetcher-container" ).dataset.prop;
                if( typeof propName != "undefined" )
                {
                    // Since this is an additional definition being shown in the dictionary's container, don't display the dictionary's label and only get the content of the main success div
                    var dict = Object.create( dictionaries[ propName ] );
                    dict[ "label" ] = "";
                    dict[ "uri" ] = element.dataset.ref;
                    dict[ "successElements" ] = [];
                    dict[ "successElements" ].push( dictionaries[ propName ][ "successElements" ][ 0 ] );

                    var additionalDefinition = new Fetcher();
                    additionalDefinition.setMessages( { noResults: "Sem resultados.", fetching: "A pesquisar" } );
                    additionalDefinition.setResultsNode( parent );
                    additionalDefinition.getSingle( dict, propName );                        
                }
            }
        }
    }

    /* Input validation - check for empty value, empty language and input max length */
    Helper.prototype.validation = function( value, lang )
    {
        if( value == "" )
        {
            helpText.innerHTML = 'Insira um termo de pesquisa.';
        }
        else if( lang == "" )
        {
            helpText.innerHTML = 'Seleccione o idioma.';
        }
        else if( value.length > 65 )
        {
            helpText.innerHTML = 'O limite máximo é de 65 caracteres.';
        } 
        else
        {
            this.hideContainer( helpText );
            this.addToHistory( value, lang );
            return true;
        }

        searchInput.focus();  
        helpText.style.display = 'block';
        return false;
    }

    /* Clears node's innerHTML and controls its visibility */
    Helper.prototype.showContainer = function( node )
    {
        node.innerHTML = '';
        node.style.display = 'block';
    }
    Helper.prototype.hideContainer = function( node )
    {
        node.innerHTML = '';
        node.style.display = 'none';
    }

    /* Word search history management */
    Helper.prototype.addToHistory = function( value, lang )
    {
        chrome.storage.sync.get( null, function( data )
        { 
            if( data[ "words" ] === undefined ) data[ "words" ] = [];
            if( data[ "langs" ] === undefined ) data[ "langs" ] = [];
            
            //If word has already been searched, remove it from history object, so it can be re-added as the last entry.
            var index = data.words.indexOf( value );
            if( index > -1 )
            {
                data.words.splice( index, 1 );
                data.langs.splice( index, 1 ); 
            }

            data.words.push( value );
            data.langs.push( lang );
            //History will be synchronized to any Chrome browser that the user is logged into
            chrome.storage.sync.set( data, function(){} );
        }); 
    }
    Helper.prototype.clearHistory = function( containerDiv )
    {
        chrome.storage.sync.clear();
        this.hideContainer( containerDiv );
    }
    Helper.prototype.displayHistory = function( containerDiv )
    {
        /* 
        If history results container is being shown and history button is pressed, hide it. 
        Else, evaluate if there are history results and show the according results
        */
        if( document.getElementById( "displayHistory" ) !== null )
        {
            this.hideContainer( containerDiv );
        }
        else
        {
            var results             = document.createElement( "div" );
            results.id              = "displayHistory";
            results.className       = "mdc-card";
            var historyContent      = '<section class="mdc-card__primary"><h2 class="mdc-card__subtitle">Sem histórico.</h2></section>';

            chrome.storage.sync.get( null, function( history ) 
            {   
                if( Object.keys( history ).length > 0 )
                {
                    results.className   = "mdc-layout-grid";
                    historyContent      = '<div class=" mdc-layout-grid__cell"><a id="clearHistory" title="limpar histórico" class="material-icons">delete</a></div>';
                    var langs           = { pt: "por", es: "esp", en: "ing", de: "ale", fr: "fra" };
                    for( var i = 0; i < history[ "langs" ].length; i++ )
                    {
                         historyContent += '<span class="mdc-layout-grid__cell mdc-layout-grid__cell--span-2 mdc-ripple-surface mdc-ripple-surface--primary mdc-theme--primary historyRow mdc-elevation--z2" tabindex="0" data-lang="' + history[ "langs" ][ i ] + '" >' + history[ "words" ][ i ] 
                            + '</span><div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-1 historyRow mdc-elevation--z2" tabindex="0">' + langs[ history[ "langs" ][ i ] ] + '</div>';
                        
                    }
                }
                results.innerHTML = historyContent;
            });
            
            this.showContainer( containerDiv );
            containerDiv.appendChild( results );  
        }
    }
}());