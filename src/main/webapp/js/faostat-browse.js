if (!window.FAOSTATBrowse) {

    window.FAOSTATBrowse = {

        /*
         This setting is used to integrate FAOSTAT Browse with the Gateway.
         It can't be stored in the JSON configuration file because it is
         used to locate the JSON configuration file.
         */
        CONFIG : {
            PLACEHOLDER : 'main-content-leftsidebar',
            LANG : 'EN',
            //lang_iso2: 'EN',

            PREFIX : 'http://localhost:8080/faostat-browse-js/',
            CONFIG_FILE: 'http://localhost:8080/faostat-browse-js/config/faostat-browse-config.json',
            theme : 'faostat',

            SECTION: 'domain', //this should be passed from the config param
            CODE: 'QC' //this should be passed from the config param
        },

        init : function(config) {
            console.log('FAOSTATBrowse: ')
            console.log(config)

            /**
             * Read and store settings for web-services
             */
            $.getJSON(FAOSTATBrowse.CONFIG.CONFIG_FILE, function(data) {
                // do it twice?
                FAOSTATBrowse.CONFIG = $.extend(true, FAOSTATBrowse.CONFIG, data);
                FAOSTATBrowse.CONFIG = $.extend(true, FAOSTATBrowse.CONFIG, config);

                // Load view's JSON
                var data = {};
                data.viewID = FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_BROWSE_STRUCTURE;
                data.schema = FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_DATASOURCE;
                var url = FAOSTATBrowse.CONFIG.BASE_URL_DBMS + FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_SERVICENAME + FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_REST_GETVIEW;
                console.log(url)
                    $.ajax({
                    type : 'POST',
                    url : url,
                    data : data,
                    success : function(response) {
                        response = (typeof response == 'string')? $.parseJSON(response) : response;
                        FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_BROWSE_STRUCTURE = response;
                        $('#container').load(FAOSTATBrowse.CONFIG.PREFIX + 'browse_bootstrap.html', function() {
                            /**
                             * Initiate multi-language
                             */
                            var I18NLang = FAOSTATBrowse.CONFIG.LANG.toLocaleLowerCase();
                            $.i18n.properties({
                                name: 'I18N',
                                path: FAOSTATBrowse.CONFIG.PREFIX + 'I18N/',
                                mode: 'both',
                                language: I18NLang,
                                callback: function() {
                                    // modify languages
                                    /*document.getElementById('pageTitle').innerHTML = $.i18n.prop('_browse');
                                    document.getElementById('domain_label').innerHTML = $.i18n.prop('_by_domain');
                                    document.getElementById('area_label').innerHTML = $.i18n.prop('_by_area');
                                    document.getElementById('rankings_label').innerHTML = $.i18n.prop('_rankings');
                                     */
                                    FAOSTATBrowse.loadUI(FAOSTATBrowse.CONFIG.SECTION, FAOSTATBrowse.CONFIG.CODE)
                                }
                            });
                        });
                    },
                    error : function(err, b, c) {
                        console.log(err.status + ", " + b + ", " + c);
                    }
                });
            });

        },

        loadUI : function(section, code) {
            // TODO: handle the code : null

            switch (section) {

                case 'area':
                    //radiobtn = document.getElementById('area').checked = true;
                    BROWSE_STATS.showBrowseByCountryRegion();
                    FAOSTATBrowse.loadUI_byArea(section, code);
                    FAOSTATBrowse.section = 'AREA';
                    break;
                case 'rankings':
                    //radiobtn = document.getElementById('rankings').checked = true;
                    BROWSE_STATS.showBrowseRankings();
                    FAOSTATBrowse.loadUI_Rankings(section, code);
                    FAOSTATBrowse.section = 'RANKINGS';
                    break;
                default:
                   // radiobtn = document.getElementById('domain').checked = true;
                    BROWSE_STATS.showBrowseByDomain();
                    FAOSTATBrowse.loadUI_ByDomain(section, code);
                    break;
            }

        },

        loadUI_ByDomain : function(section, code) {
            console.log(section)
            console.log(code)
            FAOSTATBrowse.upgradeURL(section, code);

            $('#' + FAOSTATBrowse.CONFIG.PLACEHOLDER).empty();
            $('#' + FAOSTATBrowse.CONFIG.PLACEHOLDER).load(FAOSTATBrowse.CONFIG.PREFIX + 'browse_by_domain_bootstrap.html', function() {
                $("#selectorsHead").sticky({topSpacing:0});
                FAOSTATBrowse.loadView(section, code, "TITLE");
            });
        },

        loadUI_byArea : function(section, code) {
            console.log('DAJE')
            $('#main-content-leftsidebar').empty();
            FAOSTATBrowse.upgradeURL('area', section)
            UIBuilderByCountry.buildUI(section, code, CORE.convertISO2toFAOSTATLang(FAOSTATBrowse.CONFIG.LANG.toLocaleUpperCase()));
        },

        loadUI_Rankings : function(subsection) {
            FAOSTATBrowse.upgradeURL('rankings', subsection)
            $('#main-content-leftsidebar').empty();
            UIBuilderRankings.buildUI(subsection);
        },

        loadView : function(section, code, title) {
            console.log('---------------------loadView--------------')
            console.log(section)
            console.log(code)
            console.log(title)

            // Initiate variables
            var data = {};
            data.viewID = code;
            data.schema = FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_DATASOURCE;



            /** Workaround for GHG presentation (if contains '-' for the tabs) **/
            var url = FAOSTATBrowse.CONFIG.BASE_URL_DBMS + FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_SERVICENAME + FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_REST_GETVIEW;

            // Load view's JSON
            $.ajax({
                type : 'POST',
                url  : FAOSTATBrowse.CONFIG.BASE_URL_DBMS + FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_SERVICENAME + FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_REST_GETVIEW,
                data : data,
                success : function(response) {

                    // Build the UI
                    UIBuilder.buildUI(response, title, section, CORE.convertISO2toFAOSTATLang(FAOSTATBrowse.CONFIG.LANG), FAOSTATBrowse.CONFIG.width_browse_by_domain);

                    FAOSTATBrowse.upgradeURL(section, code);

                    // Tab Selector
                    var tabID = data.viewID;
                    if ( data.viewID.indexOf('-') != -1) tabID = data.viewID.substring(0, data.viewID.indexOf('-'));
                    if (FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_BROWSE_STRUCTURE[tabID] != null) {
                        UIBuilderTabSelector.buildUI(FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_BROWSE_STRUCTURE[tabID], code, data.viewID, title, FAOSTATBrowse.CONFIG.lang)
                    }
                },

                error : function(err, b, c) {
                    console.log(err.status + ", " + b + ", " + c);
                }

            });

        },

        upgradeURL: function(section, subsection) {
            // Upgrade the URL
            if (CORE != null) {
                var subsection = (subsection == 'null') ? '*' : subsection;
                CORE.upgradeURL('browse', section, subsection, FAOSTATBrowse.CONFIG.lang);
            }
        }

    };

}
