if (!window.UIBuilderSelectors) {

    window.UIBuilderSelectors = {

        appendSelectors : function(selectors) {
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

            /** var s = '<div style="display:inline; position:relative;">'
             for (var i = 0 ; i < selectors.length ; i++) {

                s += '<div style="width:100px">';
                    s += '<div class="visualize_filters_combo">' + $.i18n.prop('_' + selectors[i].keyword); + '</div>';
                    s += '<div id="selector_' + selectors[i].keyword + '></div>';
                s += '</div>';

            }
             s += '</div>';  **/


            $('#selectors').append(s);
            for (var i = 0 ; i < selectors.length ; i++) {
                UIBuilderSelectors.populateSelector(selectors[i]);
            }
        },

        populateSelector : function(selector) {
            switch (selector.type) {
                case 'dropdown_aggregation': UIBuilderSelectors.populateNoSQLSelector(selector); break;
                case 'dropdown_orderby': UIBuilderSelectors.populateFixedValues(selector); break;
                // TODO: change the name in the JSON configuration files to dropdown_years_fixed
                case 'dropdown_years_projection': UIBuilderSelectors.populateFixedValues(selector); break;
                default: UIBuilderSelectors.populateDefaultSelector(selector); break;
            }
        },

        populateNoSQLSelector : function(selector) {
            $.ajax({
                type : 'POST',
                url :  FAOSTATBrowse.baseurl_dbms + selector.rest,
                success : function(response) {
                    var tmp = response;
                    if (typeof tmp == 'string')
                        tmp = $.parseJSON(response);
                    var data = [];
                    var selectedIndex = 0;
                    for (var i = 0 ; i < tmp.length ; i++) {
                        var parse = $.parseJSON(tmp[i]);
                        var row = {};
                        row.code = parse.code;
                        row.label = parse[FAOSTATBrowse.lang + '_label'];
                        data.push(row);
                        if (row.code == selector.default_code)
                            selectedIndex = i;
                    }

                    $('#selector_' + selector.keyword).jqxComboBox({
                        // id: selector.keyword,
                        source: data,
                        selectedIndex: selectedIndex,
                        width: selector.width,
                        height: '25px',
                        theme: FAOSTATBrowse.theme
                    });

                    $('#selector_' + selector.keyword).on('change', function (event)  {
                        var args = event.args;
                        if (args) {
                            var item = args.item;
                            UIBuilder.onchange(selector.keyword, item.originalItem.code, FAOSTATBrowse.width_browse_by_domain);
                        }
                    });

                }, error : function(err, b, c) {

                }

            });

        },

        populateFixedValues : function(selector) {
            var data = [];
            for (var i = 0 ; i < selector.codes.length ; i++) {
                var row = {};
                row.code = selector.codes[i].code;
                row.label = selector.codes[i][FAOSTATBrowse.lang + '_label'];
                data.push(row);
                if (row.code == selector.default_code)
                    selectedIndex = i;
            }

            $('#selector_' + selector.keyword).jqxComboBox({
                // id: selector.keyword,
                source: data,
                selectedIndex: selectedIndex,
                width: selector.width,
                height: '25px',
                theme: FAOSTATBrowse.theme
            });
            $('#selector_' + selector.keyword).on('change', function (event)  {
                var args = event.args;
                if (args) {
                    var item = args.item;
                    UIBuilder.onchange(selector.keyword, item.originalItem.code, FAOSTATBrowse.width_browse_by_domain);
                }
            });
        },

        populateDefaultSelector : function(selector) {
            var data = {};
            data.datasource = FAOSTATBrowse.datasource;
            data.thousandSeparator = ',';
            data.decimalSeparator = '.';
            data.decimalNumbers = '2';
            data.json = JSON.stringify(selector.sql);
            data.cssFilename = 'faostat';

            $.ajax({
                type : 'POST',
                url : 'http://' + FAOSTATBrowse.baseurl + '/wds/rest/table/json',
                data : data,
                success : function(response) {
                    var json = response;
                    if (typeof json == 'string')
                        json = $.parseJSON(response);
                    var data = [];
                    var selectedIndex = 0;
                    switch (selector.type) {
                        case 'dropdown_year':
                            var counter = 0;
                            for (var i = parseInt(json[0][1]) ; i >= parseInt(json[0][0]) ; i--) {
                                var tmp = {};
                                tmp.code = i;
                                tmp.label = i;
                                data.push(tmp);
                                if (tmp.code == selector.default_code)
                                    selectedIndex = counter;
                                counter++;
                            }
                            break;
                        default:
                            for (var i = 0 ; i < json.length ; i++) {
                                var tmp = {};
                                tmp.code = json[i][0];
                                tmp.label = json[i][1];
                                data.push(tmp);
                                if (tmp.code == selector.default_code)
                                    selectedIndex = i;
                            }
                            break;
                    }
                    $('#selector_' + selector.keyword).jqxComboBox({
                        // id: selector.keyword,
                        source: data,
                        selectedIndex: selectedIndex,
                        width: selector.width,
                        height: '25px',
                        theme: FAOSTATBrowse.theme
                    });
                    switch (selector.keyword) {
                        case 'fromyear':
                            //TODO: get from year and toyear
                            $('#selector_fromyear').on('change', function (event)  {
                                UIBuilderSelectors.onChangeTimeriod();
                                // make a list fromyear toyear
                                // send to the method
                            });
                            break;
                        case 'toyear':
                            $('#selector_toyear').on('change', function (event)  {
                                UIBuilderSelectors.onChangeTimeriod();
                            });
                            // TODO: get from year and toyear
                            break;
                        default:
                            $('#selector_' + selector.keyword).on('change', function (event)  {
                                var args = event.args;
                                if (args) {
                                    var item = args.item;
                                    var values = [];
                                    values.push(item.originalItem.code);
                                    UIBuilder.onchange(selector.keyword, values, FAOSTATBrowse.width_browse_by_domain);
                                }
                            });
                            break;
                    }
                },
                error : function(err, b, c) {

                }
            });
        },
        onChangeTimeriod: function() {

            switch (FAOSTATBrowse.section) {
                case 'DOMAIN'   : BROWSE_STATS.updateBrowseByDomain();          break;
                case 'AREA'     : BROWSE_STATS.updateBrowseByCountryRegion();   break;
                case 'RANKINGS' : BROWSE_STATS.updateBrowseRankings();          break;
            }

            var fromyear = $('#selector_fromyear').jqxComboBox('getSelectedItem');
            var toyear = $('#selector_toyear').jqxComboBox('getSelectedItem');

            if ( fromyear.originalItem.code > toyear.originalItem.code ) {
                alert("Please make sure that your year selection is fine");
            }
            else{
                var values = [];
                for (var i = fromyear.originalItem.code ; i <= toyear.originalItem.code; i++ ) {
                    values.push(i);
                }
                UIBuilder.onchange("year", values, FAOSTATBrowse.width_browse_by_domain);

            }
        }

    };

}