if (!window.UIBuilderByCountry) {

    window.UIBuilderByCountry = {

        view_id: 'country_view',

        /** JSON objects are stored here to enable selectors */
        objects : null,

        buildUI : function(subsection) {
            // load view if is gived a countrycode
            if ( subsection != '*' && subsection != 'null') {
                $.ajax({
                    type: 'GET',
                    url: 'http://'+ FAOSTATBrowse.baseurl_bletchley +'/bletchley/rest/codes/search/'+ subsection +'/areas/'+ FAOSTATBrowse.datasource +'/'+ FAOSTATBrowse.lang,
                    success : function(response) {
                        var data = response;
                        if (typeof data == 'string')
                            data = $.parseJSON(response);
                        UIBuilderByCountry.buildCountryView(subsection, response[0].label)

                    },
                    error : function(err,b,c) {
                        alert(err.status + ", " + b + ", " + c);
                    }
                });

            }else {
                // load default view
                this.buildArea("5100", $.i18n.prop('_africa'));
                this.buildArea("5200", $.i18n.prop('_america'));
                this.buildArea("5300", $.i18n.prop('_asia'));
                this.buildArea("5400", $.i18n.prop('_europe'));
                this.buildArea("5500", $.i18n.prop('_oceania'));
            }

        },
        buildArea: function(code, label) {

            var s = '<div style="padding:10px 20px 20px 20px">';
            s += '<div class="standard-title">'+ label +'</div>';
            s += '<hr class="standard-hr">';
            s += '<div id="box_' + code +'"></div>';
            s += '</div>';
            s += '<div class="spacer-medium"></div>';



            this.createCountriesTable(code);
            $('#main-content-leftsidebar').append(s);
        },
        createCountriesTable: function(code) {

            $.ajax({
                type : 'GET',
                url : 'http://' + FAOSTATBrowse.baseurl_bletchley + '/bletchley/rest/codes/all/countries/' + FAOSTATBrowse.datasource + '/'+ code +'/'+ FAOSTATBrowse.lang,

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
                        s += "<div class='summary-item' id='country_" + first[i].code + "'>" + first[i].label + "</div>";
                        s += '</td>';
                        try {
                            s += '<td width="25%" valign="top">';
                            s += "<div class='summary-item' id='country_" + second[i].code + "'>" + second[i].label + "</div>";
                            s += '</td>';
                        }catch (e) {	}
                        try {
                            s += '<td width="25%" valign="top">';
                            s += "<div class='summary-item' id='country_" + third[i].code + "'>" + third[i].label + "</div>";
                            s += '</td>';
                        }catch (e) {	}
                        try {
                            s += '<td width="25%" valign="top">';
                            s += "<div class='summary-item' id='country_" + fourth[i].code + "'>" + fourth[i].label + "</div>";
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
                        $("#country_" + data[i].code).click({code: c, label: l}, UIBuilderByCountry.onCountryClick);
                    }
                },
                error : function(err, b, c) { }
            });
        },
        onCountryClick: function(event) {
            var code = event.data.code;
            var label = event.data.label;
            UIBuilderByCountry.buildCountryView(code, label);
        },

        getCountryLabel: function(code) {
            // TODO: implement the call

            $.ajax({
                type : 'GET',
                url : 'http://' + FAOSTATBrowse.baseurl_bletchley + '/bletchley/rest/codes/all/countries/' + FAOSTATBrowse.datasource + '/'+ code +'/'+ FAOSTATBrowse.lang,

                success : function(response) {

                    var data = response;
                    if (typeof data == 'string')
                        data = $.parseJSON(response);



                },
                error : function(err, b, c) { }
            });
        },
        buildCountryView: function(code, label) {
            // get json gefinition and create the objects
            var data = {};
            data.viewID = UIBuilderByCountry.view_id;
            data.schema = FAOSTATBrowse.FAOSTAT_DBMS_DATASOURCE;

            $('#main-content-leftsidebar').empty();
            $('#main-content-leftsidebar').load(FAOSTATBrowse.prefix + 'browse_by_country.html', function() {
                $.ajax({
                    type : 'POST',
                    url : FAOSTATBrowse.baseurl_dbms + FAOSTATBrowse.FAOSTAT_DBMS_SERVICENAME + FAOSTATBrowse.FAOSTAT_DBMS_REST_GETVIEW,
                    data : data,
                    success : function(response) {
                        UIBuilderByCountry.buildUICountryView(response, code, label);
                    },
                    error : function(err, b, c) {
                        //console.log(err.status + ", " + b + ", " + c);
                    }
                });

            });
        },
        buildUICountryView : function(json, code, label) {
            var payload = json;
            if (typeof payload == 'string')
                payload = $.parseJSON(json);

            /** Inject multi-language into SQL definition */
            payload = I18NInjector.injectLanguage(payload);

            /** Store objects as a global variable */
            UIBuilder.objects = payload.objects;

            // title
            $('#title').append('<div class="visualize_title">'+ label +'<div>');

            /** country change */
            UIBuilder.onchange('area', code, FAOSTATBrowse.width_browse_by_country);

            FAOSTATBrowse.upgradeURL('area', code)
        }

    };

}