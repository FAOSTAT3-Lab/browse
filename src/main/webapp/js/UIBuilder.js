if (!window.UIBuilder) {

    window.UIBuilder = {

        /** JSON objects are stored here to enable selectors */
        objects : null,

        buildUI : function(json, title) {

            $('#title').empty();
            $('#tabs').empty();
            $('#subtitle').empty();
            $('#separator').empty();
            $('#selectors').empty();
            $('#content').empty();
            $('#footnote').empty();
            $('#footnote').hide();

            /** Convert from String to Object */
            var payload = json;
            if (typeof payload == 'string')
                payload = $.parseJSON(json);

            /** Inject multi-language into SQL definition */
            payload = I18NInjector.injectLanguage(payload);

            /** Store objects as a global variable */
            UIBuilder.objects = payload.objects;

            /** Append Title */
            if ( title != null )
                UIBuilder.appendTitle(title);
            else if ( payload['abstract'][FAOSTATBrowse.lang + '_title'] != null )
                UIBuilder.appendTitle(payload['abstract'][FAOSTATBrowse.lang + '_title']);

            /** Append subtitle */
            if ( payload['abstract'][FAOSTATBrowse.lang + '_subtitle'] != null )
                UIBuilder.appendSubtitleTitle(payload['abstract'][FAOSTATBrowse.lang + '_subtitle']);

            /** Append Selectors*/
            if ( payload.selectors != null )
                UIBuilderSelectors.appendSelectors(payload.selectors);

            /** Append Footnote*/
            if ( payload.footnote != null ) $('#footnote').append(payload['footnote'][FAOSTATBrowse.lang + '_footnote']).show();

            /** Build Objects Structure **/
            UIBuilderObjectsStructure.buildObjectStructure(UIBuilder.objects, FAOSTATBrowse.width_browse_by_domain);

            /** Append Objects */
            UIBuilder.appendObjects(UIBuilder.objects);
        },

        appendTitle : function(text) {
            var s = '<div class="standard-title">' + text + '</div>';
            $('#title').append(s);
        },
        appendSubtitleTitle : function(text) {
            var s = '<div>' + text + '</div>';
            $('#subtitle').append(s);
        },

        appendObjects : function(objects) {
            for (var i = 0 ; i < objects.length ; i++) {
                switch (objects[i].type) {
                    case 'chart' : UIBuilderChart.appendChart(objects[i]); break;
                    case 'growthrate' : UIBuilderGrowthRate.appendGrowthRateUI(objects[i]); break;
                    case 'map' :  new UIBuilderMap().createMap(objects[i]); break;
                    case 'table' :  new UIBuilderTable().createTable(objects[i]); break;
                }
            }
        },

        /**
         * @param keyword e.g. 'item', or 'element'
         * @param selectedCode e.g. 2 (Afghanistan)
         *
         * Generic function to be called on selector's change.
         */
        onchange : function(keyword, selectedCode, contentWidth) {
            selectedCode = (typeof(selectedCode) == 'object' && selectedCode.length == 1)? selectedCode[0]: selectedCode;

            switch (FAOSTATBrowse.section) {
                case 'DOMAIN'   : BROWSE_STATS.updateBrowseByDomain();          break;
                case 'AREA'     : BROWSE_STATS.updateBrowseByCountryRegion();   break;
                case 'RANKINGS' : BROWSE_STATS.updateBrowseRankings();          break;
            }

            UIBuilderObjectsStructure.buildObjectStructure(UIBuilder.objects, contentWidth);

            /** Edit SQL's INS */
            for (var i = 0 ; i < UIBuilder.objects.length ; i++) {
                switch (keyword) {
                    case 'item' :
                        if (UIBuilder.objects[i].item_onchange == null || UIBuilder.objects[i].item_onchange) {
                            var wheres = UIBuilder.objects[i].sql.wheres;
                            for (var j = 0 ; j < wheres.length ; j++) {
                                if (wheres[j].value == null && wheres[j].column.toUpperCase().indexOf('ITEMCODE') != -1) {
                                    wheres[j].ins = [];
                                    wheres[j].ins.push(selectedCode);
                                }
                            }
                            UIBuilder.changeNestedWheres(UIBuilder.objects[i], selectedCode,'ITEMCODE');
                        }
                        break;
                    case 'year' :
                        if (UIBuilder.objects[i].year_onchange == null || UIBuilder.objects[i].year_onchange) {
                            var wheres = UIBuilder.objects[i].sql.wheres;
                            var date = "";
                            UIBuilder.objects[i].show_aggregation = true;
                            for (var j = 0 ; j < wheres.length ; j++) {
                                if (wheres[j].value == null && wheres[j].column.toUpperCase().indexOf('YEAR') != -1) {
                                    wheres[j].ins = [];
                                    if ( selectedCode.length != null ) {
                                        for (var k =0; k < selectedCode.length; k++ ) {
                                            wheres[j].ins.push(selectedCode[k]);
                                        }
                                        if ( selectedCode.length > 1)
                                            date = selectedCode[0] + ' - ' + selectedCode[selectedCode.length -1];
                                        else {
                                            date = selectedCode[0];
                                            UIBuilder.objects[i].show_aggregation = false;
                                        }
                                    }
                                    else {
                                        wheres[j].ins.push(selectedCode);
                                        date = selectedCode;
                                        UIBuilder.objects[i].show_aggregation = false;
                                    }
                                }
                            }

                            UIBuilder.changeNestedWheres(UIBuilder.objects[i], selectedCode,'YEAR');

                            /** Edit subtitles when aggregation changes */
                                // TODO: create label
                            I18NInjector.injectLanguage_Subtitles_cachedObjects(UIBuilder.objects[i], null , date);
                        }
                        break;
                    case 'area' :
                        if (UIBuilder.objects[i].area_onchange == null || UIBuilder.objects[i].area_onchange) {
                            var wheres = UIBuilder.objects[i].sql.wheres;
                            for (var j = 0 ; j < wheres.length ; j++) {
                                if (wheres[j].value == null && wheres[j].column.toUpperCase().indexOf('AREACODE') != -1) {
                                    wheres[j].ins = [];
                                    wheres[j].ins.push(selectedCode);
                                }
                            }
                            UIBuilder.changeNestedWheres(UIBuilder.objects[i], selectedCode,'AREACODE');
                        }
                        break;
                    case 'element' :
                        if (UIBuilder.objects[i].element_onchange == null || UIBuilder.objects[i].element_onchange) {
                            var wheres = UIBuilder.objects[i].sql.wheres;
                            for (var j = 0 ; j < wheres.length ; j++) {
                                if (wheres[j].value == null && wheres[j].column.toUpperCase().indexOf('ELEMENTLISTCODE') != -1) {
                                    wheres[j].ins = [];
                                    wheres[j].ins.push(selectedCode);
                                }
                                if (wheres[j].value == null && wheres[j].column.toUpperCase().indexOf('ELEMENTCODE') != -1) {
                                    wheres[j].ins = [];
                                    wheres[j].ins.push(selectedCode);
                                }
                            }

                            UIBuilder.changeNestedWheres(UIBuilder.objects[i], selectedCode,'ELEMENTLISTCODE');
                            UIBuilder.changeNestedWheres(UIBuilder.objects[i], selectedCode,'ELEMENTCODE');
                        }
                        break;
                    case 'aggregation' :
                        if (UIBuilder.objects[i].aggregation_onchange == null || UIBuilder.objects[i].aggregation_onchange) {

                            /** Edit subtitles when aggregation changes */
                            I18NInjector.injectLanguage_Subtitles_cachedObjects(UIBuilder.objects[i], selectedCode, null);


                            var selects = UIBuilder.objects[i].sql.selects;

                            for (var j = 0 ; j < selects.length ; j++) {
                                if (selects[j].aggregation != null ) {
                                    if ( selects[j].aggregation.toUpperCase() != 'NONE' ) {
                                        selects[j].aggregation = selectedCode;
                                    }
                                }
                            }
                            var orderBys = UIBuilder.objects[i].sql.orderBys;
                            if ( orderBys != null ) {
                                for (var j = 0 ; j < orderBys.length ; j++) {
                                    var idx_start = -1;
                                    for (var z = 0 ; z < orderBys[j].column.length ; z++) {
                                        if (orderBys[j].column[z] == '(') {
                                            idx_start = z;
                                            break;
                                        }
                                    }
                                    if (idx_start > -1) {
                                        var agg = orderBys[j].column.substring(0, idx_start);
                                        orderBys[j].column = orderBys[j].column.replace(agg, selectedCode);
                                    }
                                }
                            }

                            var nestedWheres = UIBuilder.objects[i].sql.nestedWheres;
                            if (nestedWheres != null) {
                                for (var z = 0 ; z < nestedWheres.length ; z++) {
                                    for (var k = 0 ; k < nestedWheres[z].nestedCondition.orderBys.length ; k++) {
                                        var idx_start = -1;
                                        var column = nestedWheres[z].nestedCondition.orderBys[k].column;
                                        for (var a = 0 ; a < column.length ; a++) {
                                            if (column[a] == '(') {
                                                idx_start = a;
                                                break;
                                            }
                                        }
                                        if (idx_start > -1) {
                                            var agg = nestedWheres[z].nestedCondition.orderBys[k].column.substring(0, idx_start);
                                            nestedWheres[z].nestedCondition.orderBys[k].column = nestedWheres[z].nestedCondition.orderBys[k].column.replace(agg, selectedCode);
                                        }
                                    }
                                }
                            }

                        }
                        break;
                    case 'orderby' :
                        if (UIBuilder.objects[i].orderby_onchange == null || UIBuilder.objects[i].orderby_onchange) {
                            var orderBys = UIBuilder.objects[i].sql.orderBys;
                            for (var j = 0 ; j < orderBys.length ; j++) {
                                orderBys[j].column = selectedCode;
                            }
                        }
                        break;
                }
            }

            /** Re-create objects */
            UIBuilder.appendObjects(UIBuilder.objects);

        },

        changeNestedWheres: function(object, selectedCode, column) {
            var nestedWheres = object.sql.nestedWheres;
            if ( nestedWheres != null ) {
                for (var z = 0 ; z < nestedWheres.length ; z++) {
                    var wheres = object.sql.nestedWheres[z].nestedCondition.wheres;
                    for (var j = 0 ; j < wheres.length ; j++) {
                        if (wheres[j].value == null && wheres[j].column.toUpperCase().indexOf(column) != -1) {
                            wheres[j].ins = [];
                            if ( selectedCode.length != null ) {
                                if ( selectedCode.length  > 1) {
                                    for (var k =0; k < selectedCode.length; k++ ) {
                                        wheres[j].ins.push(selectedCode[k]);
                                    }
                                }
                                else
                                    wheres[j].ins.push(selectedCode);
                            }
                        }
                    }
                }
            }
        }

    };

}