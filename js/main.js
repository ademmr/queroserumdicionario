(function()
{
    var dictionaries    = 
    {
        pt : 
        {
            priberam : 
            { 
                label : "Priberam", 
                uri : "https://www.priberam.pt/dlpo/", 
                anchorsDomainRoot : "https://www.priberam.pt/dlpo", 
                successElements : [ [ "id", "resultados" ] ], 
                elementsToRemove: { class : ["aAO","dAO","varpb"] }
            },
            michaelis:
            {
                label: "Michaelis On-line",
                uri: "http://michaelis.uol.com.br/busca?r=0&f=0&t=0&palavra=",
                anchorsDomainRoot: "http://michaelis.uol.com.br",
                successElements: [ [ "id", "content" ], [ "id", "secondary" ] ],
                elementsToRemove: { tag: ["e1", "ei", "es"] }
            }
        },
        en : 
        {
            michaelis:
            {
                label: "Michaelis On-line",
                uri: "http://michaelis.uol.com.br/busca?r=1&f=1&t=0&palavra=",
                anchorsDomainRoot: "http://michaelis.uol.com.br",
                successElements: [ [ "id", "content" ], [ "id", "secondary" ] ],
                elementsToRemove: { tag: ["e1", "ei", "es"] }
            },
            collins:
            {
                label: "Dicionário Collins",
                uri: "https://www.collinsdictionary.com/dictionary/english-portuguese/",
                successElements: [ [ "class", "definitions" ] ],
                elementsToRemove: { class: [ "socialButtons" ] }
            },
            linguee:
            {
                label: "Linguee",
                uri: "http://www.linguee.pt/english-portuguese/search?source=auto&query=",
                anchorsDomainRoot: "",
                successElements: [ [ "id", "dictionary" ] ],
                elementsToRemove: { class: [ "app_teaser", "sep", "dash", "openTriangle", "dict_headline_for_0", "lemma_desc", "inexact", "audio" ], id: [ "wikipedia-header", "wikipedia-body" ] }
            }
        },
        es : 
        {
            michaelis:
            {
                label: "Michaelis On-line",
                uri: "http://michaelis.uol.com.br/busca?r=3&f=2&t=0&palavra=",
                anchorsDomainRoot: "http://michaelis.uol.com.br",
                successElements: [ [ "id", "content" ], [ "id", "secondary" ] ],
                elementsToRemove: { tag: ["e1", "ei", "es"] }
            },
            linguee:
            {
                label: "Linguee",
                uri: "http://www.linguee.pt/spanish-portuguese/search?source=auto&query=",
                anchorsDomainRoot: "",
                successElements: [ [ "id", "dictionary" ] ],
                elementsToRemove: { class: [ "app_teaser", "sep", "dash", "openTriangle", "dict_headline_for_0", "lemma_desc", "inexact", "audio" ], id: [ "wikipedia-header", "wikipedia-body" ] }
            }
        },
        de : 
        {
            michaelis:
            {
                label: "Michaelis On-line",
                uri: "http://michaelis.uol.com.br/busca?r=4&f=3&t=0&palavra=",
                anchorsDomainRoot: "http://michaelis.uol.com.br",
                successElements: [ [ "id", "content" ], [ "id", "secondary" ] ],
                elementsToRemove: { tag: ["e1", "ei", "es"] }
            },
            linguee:
            {
                label: "Linguee",
                uri: "http://www.linguee.pt/german-portuguese/search?source=auto&query=",
                anchorsDomainRoot: "",
                successElements: [ [ "id", "dictionary" ] ],
                elementsToRemove: { class: [ "app_teaser", "sep", "dash", "openTriangle", "dict_headline_for_0", "lemma_desc", "inexact", "audio" ], id: [ "wikipedia-header", "wikipedia-body" ] }
            }
        },
        it : 
        {
            michaelis:
            {
                label: "Michaelis On-line",
                uri: "http://michaelis.uol.com.br/busca?r=5&f=4&t=0&palavra=",
                anchorsDomainRoot: "http://michaelis.uol.com.br",
                successElements: [ [ "id", "content" ], [ "id", "secondary" ] ],
                elementsToRemove: { tag: ["e1", "ei", "es"] }
            },
            linguee:
            {
                label: "Linguee",
                uri: "http://www.linguee.pt/italian-portuguese/search?source=auto&query=",
                anchorsDomainRoot: "",
                successElements: [ [ "id", "dictionary" ] ],
                elementsToRemove: { class: [ "app_teaser", "sep", "dash", "openTriangle", "dict_headline_for_0", "lemma_desc", "inexact", "audio" ], id: [ "wikipedia-header", "wikipedia-body" ] }
            }
        },
        fr : 
        {
            michaelis:
            {
                label: "Michaelis On-line",
                uri: "http://michaelis.uol.com.br/busca?r=6&f=5&t=0&palavra=",
                anchorsDomainRoot: "http://michaelis.uol.com.br",
                successElements: [ [ "id", "content" ], [ "id", "secondary" ] ],
                elementsToRemove: { tag: ["e1", "ei", "es"] }
            },
            linguee:
            {
                label: "Linguee",
                uri: "http://www.linguee.pt/french-portuguese/search?source=auto&query=",
                anchorsDomainRoot: "",
                successElements: [ [ "id", "dictionary" ] ],
                elementsToRemove: { class: [ "app_teaser", "sep", "dash", "openTriangle", "dict_headline_for_0", "lemma_desc", "inexact", "audio" ], id: [ "wikipedia-header", "wikipedia-body" ] }
            }
        }
    };

    document.addEventListener( 'DOMContentLoaded', function()
    {
        var searchBtn       = document.getElementById( 'searchBtn' );
        var historyBtn      = document.getElementById( 'historyBtn' );
        var clearBtn        = document.getElementById( 'clearBtn' );
        var searchInput     = document.getElementById( 'searchInput' );
        var containerDiv    = document.getElementById( 'container' );

        /* Material design JS select box initialization */
        var MDCSelect       = mdc.select.MDCSelect;
        var selectDiv       = document.getElementById( 'js-select' );
        var langsSB         = MDCSelect.attachTo( selectDiv );
        /* Material design JS text input field initialization */
        var tfsection       = document.getElementById( 'toolbarForm' );
        var tfRoot          = tfsection.querySelector( '.mdc-textfield' );
        var helpText        = tfsection.querySelector( '#helpText' );
        var tf              = new mdc.textfield.MDCTextfield( tfRoot );
        
        var helper          = new Helper();
        var definition      = new Fetcher();
        definition.setMessages( { noResults: "Sem resultados.", fetching: "A pesquisar" } );
        definition.setResultsNode( containerDiv );

        var lang            = "";
        var input           = "";
        var searched        = false;

        var search          = function()
        {
            if( !searched )
            {
                input = searchInput.value.trim();
                let valid = helper.validation( searchInput.value, lang );
                if( valid )
                {
                    helper.showContainer( containerDiv );     
                    definition.getMultiple( dictionaries[ lang ], input );
                }

                //http://stackoverflow.com/a/40638238/5905523
                searched = true;
                setTimeout( function(){ searched = false; }, 1000);
            }
        }
        
        chrome.tabs.query( { currentWindow: true, active: true }, function (tabs) 
        {
            /* If language of current page has, at least, one correspondence in the dictionaries object, set it as the value of the languages select box */
            chrome.tabs.detectLanguage( tabs[0].id, function( language )
            {
                if( typeof language != "undefined" && language != "" && dictionaries[ language ] != undefined )
                {
                    lang = language;
                    langsSB.selectedIndex = helper.getIndex( langsSB.options, language );
                }
            });
            
            /* Grab text selection from current page and place it in input field.
               Prevent script execution if current page is Chrome's new tab page or extensions gallery */
            if( tabs[0].url.search( 'chrome://|chrome.google.com/webstore' ) < 0 )
            {
                chrome.tabs.executeScript( 
                {
                    code: 'window.getSelection().toString();'
                }, function(selection) 
                {
                    if( typeof selection != "undefined" && selection[ 0 ] != "" )
                    {
                        searchInput.value = selection[ 0 ].trim();
                        searchInput.focus();  
                        if( lang != "" )
                        {
                            search();
                        }
                    }
                });
            }
        });
        
        /* Display definitions for the text field's value. 
           If there are validation issues, stop and warn user; if not, add to history and fetch the value's definition. */
        searchInput.addEventListener( 'keyup', function( event )
        {
            if( event.which == 13 || event.keyCode == 13 )
            {
                search();
            }
            else
            {
                /* Hide validation message when user start typing */
                helper.hideContainer( helpText );
            }
        });
        searchBtn.addEventListener( 'click', function()
        {
            search();
        });
        
        /* Clear text field */
        clearBtn.addEventListener( 'click', function()
        {
            definition.stop();
            searchInput.value = "";
            helper.hideContainer( containerDiv );
        });
        
        /* Update lang variable if language is changed by user */
        selectDiv.addEventListener('MDCSelect:change', function() 
        {
            if( langsSB.value != "" )
            {
                lang = langsSB.value;
                helper.hideContainer( helpText );
            }
        });
        
        containerDiv.addEventListener('click', function(event) 
        {
            // Clear history
            if (event.target.id === 'clearHistory') 
            {
                helper.clearHistory( containerDiv );
            }
            // If results have links to related words, get its meaning if clicked.
            else if( event.target.tagName === 'A' || event.target.parentNode.tagName === 'A' )
            {
                helper.searchAnchor( event, input, dictionaries[ lang ] );
            }
            // Search word saved in history
            else if( event.target.tagName === 'SPAN' && event.target.classList.contains( "historyRow" ) )
            {
                lang                    = event.target.dataset.lang;
                langsSB.selectedIndex   = helper.getIndex( langsSB.options, lang );
                helper.clickSearch( event.target.innerHTML );
            }
        });     
        
        /* Get text selection in the results container */
        containerDiv.addEventListener( 'mouseup', function( event )
        {
            var selection = window.getSelection().toString();
            if( selection != "" )
            {
                searchInput.value = selection.trim();
                searchInput.focus();  
            }
        });

        /* Display or hide history */
        historyBtn.addEventListener( 'click', function()
        {
            definition.stop();
            helper.displayHistory( containerDiv );
        });
    });
}());

      