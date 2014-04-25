if (!window.UIBuilderSelectors) {

    window.UIBuilderSelectors = {

        $selectors : "selectors",
        $selector_dd_fromyear : 'selector_dd_fromyear',
        $selector_dd_toyear : 'selector_dd_toyear',

        BASE_URL_DBMS : "", //pass it on the function
        BASE_URL_WDS : "", //pass it on the function
        DATASOURCE: "",
        WIDTH: "",

        appendSelectors : function(selectors, lang) {
            console.log('appendSelectors')
            console.log(lang)
            lang = lang.toUpperCase()

            // TODO: load it dinamically
            UIBuilderSelectors.BASE_URL_DBMS = FAOSTATBrowse.CONFIG.BASE_URL_DBMS;
            UIBuilderSelectors.BASE_URL_WDS = FAOSTATBrowse.CONFIG.BASE_URL_WDS;
            UIBuilderSelectors.WIDTH = FAOSTATBrowse.CONFIG.width_browse_by_domain;
            UIBuilderSelectors.DATASOURCE = FAOSTATBrowse.CONFIG.DATASOURCE;


            var s = '<table width="100%">';
            s += '<tr>';
            var width = 100 / selectors.length;
            for (var i = 0 ; i < selectors.length ; i++) {
                selectors[i].width = "100%";
                s += '<td width="' + width + '%" class="visualize_filters_combo">' + $.i18n.prop('_' + selectors[i].keyword); + '</td>';
            }
            s += '</tr>';
            s += '<tr>';
            for (var i = 0 ; i < selectors.length ; i++)
                s += '<td><div id="selector_' + selectors[i].keyword + '"></td>';
            s += '</tr>';
            s += '</table>';

            $('#' + UIBuilderSelectors.$selectors).append(s);
            for (var i = 0 ; i < selectors.length ; i++) {
                UIBuilderSelectors.populateSelector(selectors[i], lang);
            }
        },

        populateSelector : function(selector, lang) {
            switch (selector.type) {
                case 'dropdown_aggregation': UIBuilderSelectors.populateNoSQLSelector(selector, lang); break;
                case 'dropdown_orderby': UIBuilderSelectors.populateFixedValues(selector, lang); break;
                // TODO: change the name in the JSON configuration files to dropdown_years_fixed
                case 'dropdown_years_projection': UIBuilderSelectors.populateFixedValues(selector, lang); break;
                default: UIBuilderSelectors.populateDefaultSelector(selector, lang); break;
            }
        },

        populateNoSQLSelector : function(selector, lang) {
            console.log('populateNoSQLSelector')
            console.log(UIBuilderSelectors.BASE_URL_DBMS)
            $.ajax({
                type : 'POST',
                url :  UIBuilderSelectors.BASE_URL_DBMS + selector.rest,
                success : function(response) {
                    var json = (typeof response == 'string')? $.parseJSON(response) : response;
                    var data = [];
                    for (var i = 0 ; i < json.length ; i++) {
                        var parse = $.parseJSON(json[i]);
                        var row = []
                        row.push(parse.code)
                        row.push(parse[lang + '_label'])
                        data.push(row)
                    }
                    UIBuilderSelectors._createDropDown(data, selector, 'selector_' + selector.keyword, 'selector_dd_' + selector.keyword, selector.width, lang);

                }, error : function(err, b, c) {}
            });
        },

        populateFixedValues : function(selector, lang) {
            var data = [];
            for (var i = 0 ; i < selector.codes.length ; i++) {
                var parse = selector.codes[i];
                var row = []
                row.push(parse.code)
                row.push(parse[lang + '_label'])
                data.push(row)
            }
            UIBuilderSelectors._createDropDown(data, selector, 'selector_' + selector.keyword, 'selector_dd_' + selector.keyword, selector.width, lang);
        },

        populateDefaultSelector : function(selector, lang) {
            var data = {};
            data.datasource = UIBuilderSelectors.DATASOURCE;
            data.thousandSeparator = ',';
            data.decimalSeparator = '.';
            data.decimalNumbers = '2';
            data.json = JSON.stringify(selector.sql);
            data.cssFilename = 'faostat';
            $.ajax({
                type : 'POST',
                url : UIBuilderSelectors.BASE_URL_WDS + '/rest/table/json',
                data : data,
                success : function(response) {
                    var json = (typeof response == 'string')? $.parseJSON(response) : response;
                    switch (selector.type) {
                        case 'dropdown_year':
                            UIBuilderSelectors._createDropDownTimerange(json, selector, 'selector_' + selector.keyword, 'selector_dd_' + selector.keyword, selector.width, lang);
                            break;
                        default:
                            UIBuilderSelectors._createDropDown(json, selector, 'selector_' + selector.keyword, 'selector_dd_' + selector.keyword, selector.width, lang);
                            break;
                    }
                },
                error : function(err, b, c) {

                }
            });
        },

        _createDropDown: function(json, selector, divID, dropdowndID, width, lang) {
            //console.log(json)
            // TODO: dynamic width
            var html = '<select id="'+ dropdowndID+'" style="width:"'+ width +'">';
            for(var i=0; i < json.length; i++) {
                var selected = (json[i][0] == selector.default_code)? 'selected': '';
                html += '<option value="' + json[i][0] + '" '+ selected +'>' + json[i][1] + '</option>';
            }
            html += '</select>';
            $('#' + divID).empty();
            $('#' + divID).append(html);
            try { $('#' + dropdowndID).chosen({disable_search_threshold:10, width: '100%'});}  catch (e) {}
            $( "#" + dropdowndID ).change({selector: selector},  function (event) {
                var keyword = event.data.selector.keyword;
                console.log($( this ).val())
                var values = [];
                values.push( $( this ).val());
                UIBuilder.onchange(keyword, values, UIBuilderSelectors.WIDTH, lang)
            });
        },

        _createDropDownTimerange: function(json, selector, divID, dropdowndID, width, lang) {
            var data = [];
            for (var i = parseInt(json[0][1]) ; i >= parseInt(json[0][0]) ; i--) {
                data.push(i);
            }
            // TODO: dynamic width
            var html = '<select id="'+ dropdowndID+'" style="width:"'+ width +'">';
            for(var i=0; i < data.length; i++) {
                var selected = (data[i] == selector.default_code)? 'selected': '';
                html += '<option value="' + data[i] + '" '+ selected +'>' + data[i] + '</option>';
            }
            html += '</select>';
            $('#' + divID).empty();
            $('#' + divID).append(html);
            try { $('#' + dropdowndID).chosen({"disable_search": true, "width": '100%'}); } catch (e) {}
            $( "#" + dropdowndID ).change(function (event) {
                UIBuilderSelectors.onChangeTimeriod(lang);
            });
        },

        onChangeTimeriod: function(lang) {
            switch (FAOSTATBrowse.section) {
                case 'DOMAIN'   : BROWSE_STATS.updateBrowseByDomain();          break;
                case 'AREA'     : BROWSE_STATS.updateBrowseByCountryRegion();   break;
                case 'RANKINGS' : BROWSE_STATS.updateBrowseRankings();          break;
            }
            var fromyear = $('#' + UIBuilderSelectors.$selector_dd_fromyear).val();
            var toyear   = $('#' + UIBuilderSelectors.$selector_dd_toyear).val();

            if ( fromyear > toyear ) {
                // TODO: multilanguage
                alert("Please make sure that your year selection is fine");
            }
            else{
                var values = [];
                for (var i = fromyear ; i <= toyear; i++ ) {
                    values.push(i);
                }
                UIBuilder.onchange("year", values, UIBuilderSelectors.WIDTH, lang);
            }
        }

    };
}