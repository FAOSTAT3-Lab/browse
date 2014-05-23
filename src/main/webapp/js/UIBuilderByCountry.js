if (!window.UIBuilderByCountry) {

    window.UIBuilderByCountry = {

        view_id: 'country_view',

        /** JSON objects are stored here to enable selectors */
        objects : null,

        buildUI : function(section, code, lang) {
            console.log('buildUI')
            console.log(section)
            console.log(code)
            console.log(lang)


            var datasource = FAOSTATBrowse.CONFIG.DATASOURCE;

            // load view if is gived a countrycode
            if ( code != '*' && code != 'null') {
                $.ajax({
                    type: 'GET',
                    url: FAOSTATBrowse.CONFIG.BASE_URL_BLETCHLEY + '/rest/codes/search/'+ code +'/areas/'+ datasource +'/'+ lang,
                    success : function(response) {
                        var data = (typeof response == 'string')? $.parseJSON(response) : response;
                        UIBuilderByCountry.buildCountryView(code, response[0].label, lang)
                    },
                    error : function(err,b,c) {
                        alert('HRE' + err.status + ", " + b + ", " + c);
                    }
                });
            }else {
                // load default view
                this.buildArea("5100", $.i18n.prop('_africa'), datasource, lang);
                this.buildArea("5200", $.i18n.prop('_america'), datasource, lang);
                this.buildArea("5300", $.i18n.prop('_asia'), datasource, lang);
                this.buildArea("5400", $.i18n.prop('_europe'), datasource, lang);
                this.buildArea("5500", $.i18n.prop('_oceania'), datasource, lang);
            }
        },

        buildArea: function(code, label, datasource, lang) {

            var s = '<div style="padding:10px 20px 20px 20px">';
            s += '<div class="standard-title">'+ label +'</div>';
            s += '<hr class="standard-hr">';
            s += '<div id="box_' + code +'"></div>';
            s += '</div>';
            s += '<div class="spacer-medium"></div>';



            this.createCountriesTable(code, datasource, lang);
            $('#main-content-leftsidebar').append(s);
        },
        createCountriesTable: function(code, datasource, lang) {

            $.ajax({
                type : 'GET',
                url : FAOSTATBrowse.CONFIG.BASE_URL_BLETCHLEY + '/rest/codes/all/countries/' + datasource + '/'+ code +'/'+ lang,

                success : function(response) {

                    var data = response;
                    if (typeof data == 'string')
                        data = $.parseJSON(response);

                    var s = '<table width="100%" align="left">';

                    var first = [];
                    var second = [];
                    var third = [];
                    var fourth = [];

                    var steps = data.length / 4;
                    steps = parseInt(steps);

                    for (var i = 0 ; i < data.length ; i++) {
                        if ( i <= steps )
                            first.push(data[i]);
                        if ( i > steps && i <= (steps * 2) +1 )
                            second.push(data[i]);
                        if ( i > (steps * 2)+1  && i <= (steps * 3) +2 )
                            third.push(data[i]);
                        if (  i > (steps * 3)+2 && i <= (steps * 4) + 3)
                            fourth.push(data[i]);
                    }

                    for (var i = 0 ; i < first.length ; i++) {
                        s += '<tr>';
                        s += '<td width="25%" valign="top">';
                        s += "<a class='summary-item' id='country_" + first[i].code + "'>" + first[i].label + "</a>";
                        s += '</td>';
                        try {
                            s += '<td width="25%" valign="top">';
                            s += "<a class='summary-item' id='country_" + second[i].code + "'>" + second[i].label + "</a>";
                            s += '</td>';
                        }catch (e) {	}
                        try {
                            s += '<td width="25%" valign="top">';
                            s += "<a class='summary-item' id='country_" + third[i].code + "'>" + third[i].label + "</a>";
                            s += '</td>';
                        }catch (e) {	}
                        try {
                            s += '<td width="25%" valign="top">';
                            s += "<a class='summary-item' id='country_" + fourth[i].code + "'>" + fourth[i].label + "</a>";
                            s += '</td>';
                        }catch (e) {	}
                        s += '</tr>';
                    }


                    s += '</table>';

                    $('#box_' + code).append(s);

                    // bind
                    for (var i = 0 ; i < data.length ; i++) {
                        var c = data[i].code;
                        var l = data[i].label;
                        $("#country_" + data[i].code).click({code: c, label: l, lang: lang}, UIBuilderByCountry.onCountryClick);
                    }
                },
                error : function(err, b, c) { }
            });
        },
        onCountryClick: function(event) {
            var code = event.data.code;
            var label = event.data.label;
            var lang = event.data.lang;
            UIBuilderByCountry.buildCountryView(code, label, lang);
        },

        getCountryLabel: function(code, datasource, lang) {
            // TODO: implement the call

            $.ajax({
                type : 'GET',
                url :  FAOSTATBrowse.CONFIG.BASE_URL_BLETCHLEY + '/rest/codes/all/countries/' +datasource + '/'+ code +'/'+ lang,

                success : function(response) {

                    var data = response;
                    if (typeof data == 'string')
                        data = $.parseJSON(response);



                },
                error : function(err, b, c) { }
            });
        },
        buildCountryView: function(code, label, lang) {
            console.log('buildCountryView');
            // get json gefinition and create the objects
            var data = {};
            data.viewID = UIBuilderByCountry.view_id;
            data.schema = FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_DATASOURCE;

            $('#' + FAOSTATBrowse.CONFIG.PLACEHOLDER).empty();
            $('#' +  FAOSTATBrowse.CONFIG.PLACEHOLDER).load(FAOSTATBrowse.CONFIG.PREFIX + 'browse_by_country.html', function() {
                $.ajax({
                    type : 'POST',
                    url  : FAOSTATBrowse.CONFIG.BASE_URL_DBMS + FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_SERVICENAME + FAOSTATBrowse.CONFIG.FAOSTAT_DBMS_REST_GETVIEW,
                    data : data,
                    success : function(response) {
                        UIBuilderByCountry.buildUICountryViewUI(response, code, label, lang);
                    },
                    error : function(err, b, c) {
                        console.log(err.status + ", " + b + ", " + c);
                    }
                });

            });
        },
        buildUICountryViewUI : function(payload, code, label, lang) {
            var payload = (typeof payload == 'string')? $.parseJSON(payload) : payload;

            /** Inject multi-language into SQL definition */
            payload = I18NInjector.injectLanguage(payload, lang);

            /** Store objects as a global variable */
            UIBuilder.objects = payload.objects;

            // title
            $('#title').append('<div class="visualize_title">'+ label +'<div>');

            /** country change */
            UIBuilder.onchange('area', code, FAOSTATBrowse.CONFIG.width_browse_by_country, lang);

            FAOSTATBrowse.upgradeURL('area', code)
        }

    };

}