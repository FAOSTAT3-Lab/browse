if (!window.UIBuilderChart) {

    window.UIBuilderChart = {

        objStructure :
            '<div id="obj_box_REPLACE" class="obj-box">' +
                ' <div id="obj_header_REPLACE" class="obj-box-header">' +

                '<div class="obj-box-header-text">' +
                '<div id="obj_title_REPLACE" class="obj-box-title"></div>' +
                '<div id="obj_subtitle_REPLACE" class="obj-box-subtitle"></div>' +
                '</div>' +

                '<div class="obj-box-icons">' +
                '<div class="obj-box-icon export-icon" id="obj_export_REPLACE"></div>' +
                '</div>' +

                '</div>' +
                '<div id="REPLACE" style="width:$_WIDTH; height:$_HEIGHT"></div> ' +
                '<div id="obj_footer_REPLACE" class="obj-box-footer" style="display:none"></div> ' +
                '</div>',

        appendChart : function(chart) {

            var structure = CORE.replaceAll(this.objStructure, 'REPLACE', chart.object_parameters.renderTo);
            structure = CORE.replaceAll(structure, '$_WIDTH',  chart.width );
            structure = CORE.replaceAll(structure, '$_HEIGHT',  chart.height );

            $('#content_' + chart.object_parameters.renderTo).append(structure);

            // Loading image
            document.getElementById(chart.object_parameters.renderTo).innerHTML = "<div style='height:"+ this.height+"'><img src='"+ FAOSTATBrowse.prefix +'images/loading.gif' +"'></div>";


            $('#obj_title_' + chart.object_parameters.renderTo).append(chart[FAOSTATBrowse.lang + '_title']);
            $('#obj_subtitle_' + chart.object_parameters.renderTo).append(chart.subtitle);

            if (chart[FAOSTATBrowse.lang + '_footnote'] != null && chart[FAOSTATBrowse.lang + '_footnote'] != '' ) {
                $('#obj_footer_' + chart.object_parameters.renderTo).css('display', 'inline-block');
                $('#obj_footer_' + chart.object_parameters.renderTo).append(chart[FAOSTATBrowse.lang + '_footnote']);
            }

            var suffix =  chart.object_parameters.renderTo;
            // tooltip
            document.getElementById('obj_export_' + suffix).title = $.i18n.prop('_export');
            $('#obj_export_' + suffix).powerTip({placement: 's'});


            $("#obj_export_" + chart.object_parameters.renderTo).bind('click', function() {
                Export.exportPlainData(chart);
            });

            /** Test WDS */
            UIBuilderChart.queryDBAndCreateChart(chart);

        },

        queryDBAndCreateChart : function(chart) {

            var data = {};
            data.datasource = FAOSTATBrowse.datasource;
            data.thousandSeparator = ',';
            data.decimalSeparator = '.';
            data.decimalNumbers = '2';
            data.json = JSON.stringify(chart.sql);
            data.cssFilename = 'faostat';

            $.ajax({
                type : 'POST',
                url : 'http://' + FAOSTATBrowse.baseurl + '/wds/rest/table/json',
                data : data,

                success : function(response) {

                    $('#' + chart.object_parameters.renderTo).empty();

                    switch(chart.object_parameters.keyword) {
                        case 'FAOSTAT_DEFAULT_LINE': UIBuilderChart.queryDBAndCreateChart_Line(chart, response); break;
                        case 'FAOSTAT_DEFAULT_BAR': UIBuilderChart.queryDBAndCreateChart_Bar(chart, response); break;
                        case 'FAOSTAT_DEFAULT_BAR_STACKED': UIBuilderChart.queryDBAndCreateChart_Bar_Stacked(chart, response); break;
                        case 'FAOSTAT_DEFAULT_DOUBLE_AXES_BAR': UIBuilderChart.queryDBAndCreateChart_MultipleAxes(chart, 'column', response); break;
                        case 'FAOSTAT_DEFAULT_DOUBLE_AXES_LINE': UIBuilderChart.queryDBAndCreateChart_MultipleAxes(chart, 'line', response); break;
                        case 'FAOSTAT_DEFAULT_DOUBLE_AXES_TIMESERIES_BAR': UIBuilderChart.queryDBAndCreateChart_MultipleAxes_Timeseries(chart, 'column', response); break;
                        case 'FAOSTAT_DEFAULT_DOUBLE_AXES_TIMESERIES_LINE': UIBuilderChart.queryDBAndCreateChart_MultipleAxes_Timeseries(chart, 'line', response); break;
                        case 'FAOSTAT_DEFAULT_PIE': UIBuilderChart.queryDBAndCreateChart_Pie(chart, response); break;
                        case 'FAOSTAT_DEFAULT_GROWTHRATE': UIBuilderChart.queryDBAndCreateChart_GrowthRate(chart, response); break;
                    }

                },

                error : function(err, b, c) {

                }

            });

        },

        queryDBAndCreateChart_Bar : function(chart, response) {

            var data = response;
            if (typeof data == 'string')
                data = $.parseJSON(response);

            var categories = [];
            for (var i = 0 ; i < data.length ; i++)
                if ($.inArray(data[i][0], categories) < 0)
                    categories.push(data[i][0]);

            var seriesNumber = data.length / categories.length;
            var series = [];
            var seriesNames = [];

            for (var i = 0 ; i < seriesNumber ; i++) {
                seriesNames.push(data[i][1]);
                var tmp = {};
                tmp.name = null;
                tmp.data = [];
                series.push(tmp);
            }

            for (var i = 0 ; i < data.length ; i++) {
                series[i % seriesNumber].name = data[i][1];
                series[i % seriesNumber].data.push(parseFloat(data[i][2]));
            }

            var payload = {};
            payload.engine = 'highcharts';
            payload.keyword = 'FAOSTAT_DEFAULT_BAR';
            payload.renderTo = chart.object_parameters.renderTo;
            payload.categories = categories;
            payload.title = chart.object_parameters.title;
            payload.credits = $.i18n.prop('_millionthousand');
            payload.series = series;
            payload.yaxis = {};
            payload.yaxis.min = null;
            payload.yaxis.max = null;
            payload.yaxis.step = null;
            payload.yaxis.title = data[0][3];

            FENIXCharts.plot(payload);
        },

        queryDBAndCreateChart_Bar_Stacked : function(chart, response) {

            var data = response;
            if (typeof data == 'string')
                data = $.parseJSON(response);

            if ( data == '') {
                UIUtils.noValuesFoundPanel( chart.object_parameters.renderTo)
            }
            else {

                var categories = [];
                for (var i = 0 ; i < data.length ; i++)
                    if ($.inArray(data[i][0], categories) < 0)
                        categories.push(data[i][0]);

                var seriesNumber = data.length / categories.length;
                var series = [];
                var seriesNames = [];

                for (var i = 0 ; i < seriesNumber ; i++) {
                    seriesNames.push(data[i][1]);
                    var tmp = {};
                    tmp.name = null;
                    tmp.data = [];
                    series.push(tmp);
                }

                for (var i = 0 ; i < data.length ; i++) {
                    series[i % seriesNumber].name = data[i][1];
                    series[i % seriesNumber].data.push(parseFloat(data[i][2]));
                }

                var payload = {};
                payload.engine = 'highcharts';
                payload.keyword = 'FAOSTAT_DEFAULT_BAR_STACKED';
                payload.renderTo = chart.object_parameters.renderTo;
                payload.categories = categories;
                payload.title = chart.object_parameters.title;
                payload.credits = $.i18n.prop('_millionthousand');
                payload.series = series;
                payload.yaxis = {};
                payload.yaxis.min = null;
                payload.yaxis.max = null;
                payload.yaxis.step = null;
                payload.yaxis.title = (data[0] != null && data[0][3] != null) ? data[0][3] : '';

                FENIXCharts.plot(payload);
            }

        },

        queryDBAndCreateChart_Pie : function(chart, response) {

            var data = response;
            if (typeof data == 'string')
                data = $.parseJSON(response);

            if ( data == '') {
                UIUtils.noValuesFoundPanel( chart.object_parameters.renderTo)
            }
            else {

                var categories = [];
                for (var i = 0 ; i < data.length ; i++)
                    categories.push(data[i][1]);

                var series = [];
                series[0] = {};
                series[0].name = chart.object_parameters.title;
                series[0].type = 'pie';
                series[0].data = [];
                for (var i = 0 ; i < data.length ; i++) {
                    var tmp = [];
                    tmp[0] = data[i][1];
                    tmp[1] = parseFloat(data[i][0]);
                    series[0].data.push(tmp);
                }

                var payload = {};
                payload.engine = 'highcharts';
                payload.keyword = 'FAOSTAT_DEFAULT_PIE';
                payload.renderTo = chart.object_parameters.renderTo;
                payload.categories = categories;
                payload.title = chart.object_parameters.title;
                payload.credits = chart.object_parameters.credits;
                payload.series = series;

                FENIXCharts.plot(payload);
            }
        },

        /**
         * @param chart Parameters stored in the JSON
         * @param type 'column', 'line'
         * @param response Data fetch through WDS
         */
        queryDBAndCreateChart_MultipleAxes : function(chart, type, response) {

            var data = response;
            if (typeof data == 'string')
                data = $.parseJSON(response);

            // no series found.
            if ( data == '') {
                UIUtils.noValuesFoundPanel( chart.object_parameters.renderTo)
            }
            else {

                var categories = [];
                var series = [];
                var mus = [];
                var yAxis = [];

                for (var i = 0 ; i < data.length ; i++)
                    categories.push(data[i][0]);

                for (var i = 0 ; i < data[0].length - 1; i += 3) {
                    var s = {};
                    s.name = data[0][1 + i];
                    s.type = type;
                    s.data = [];
                    if ($.inArray(data[0][3 + i], mus) < 0)
                        mus.push(data[0][3 + i]);
                    s.yAxis = $.inArray(data[0][3 + i], mus);
                    for (var j = 0 ; j < data.length ; j++)
                        s.data.push(parseFloat(data[j][2 + i]));
                    series.push(s);
                }

                for (var i = 0 ; i < mus.length ; i++) {
                    var a = {};
                    a.title = {};
                    a.title.text = mus[i];
                    a.title.style = {};
                    a.title.style.color = FENIXCharts.COLORS[i];
                    if (i > 0)
                        a.opposite = true;
                    a.labels = {};
                    a.labels.style = {};
                    a.labels.style.color = FENIXCharts.COLORS[i];
                    yAxis.push(a);
                }

                var chart_payload = {};
                chart_payload.engine = chart.object_parameters.engine;
                chart_payload.keyword = chart.object_parameters.keyword;
                chart_payload.renderTo = chart.object_parameters.renderTo;
                chart_payload.categories = categories;
                chart_payload.title = '';
                chart_payload.credits = $.i18n.prop('_millionthousand');
                chart_payload.yaxis = {};
                chart_payload.yaxis = yAxis;
                chart_payload.series = series;

                FENIXCharts.plot(chart_payload);
            }

        },

        /**
         * @param chart Parameters stored in the JSON
         * @param type 'column', 'line'
         * @param response Data fetch through WDS
         */
        queryDBAndCreateChart_MultipleAxes_Timeseries : function(chart, type, response) {

            var data = response;
            if (typeof data == 'string')
                data = $.parseJSON(response);

            // no series found.
            if ( data == '') {
                UIUtils.noValuesFoundPanel( chart.object_parameters.renderTo)
            }
            else {

                var series = [];
                var yAxis = [];

                /** Initiate variables */
                var check = [];
                var mus = [];
                var ind = data[0][1];
                var count = 0;
                var maxLength = 0;
                var maxLengthIND = data[0][1];

                /** Re-shape data into 'vectors' */
                var vectors = {};
                vectors[ind] = {};
                vectors[ind].dates = [];
                vectors[ind].values = [];
                vectors[ind].mus = [];

                /** Create a vector for each indicator */
                for (var i = 0 ; i < data.length ; i++) {
                    if (data[i][1] == ind) {
                        count++;
                        vectors[ind].dates.push(data[i][0]);
                        vectors[ind].values.push(data[i][2]);
                        vectors[ind].mus.push(data[i][3]);
                    } else {
                        check.push(count);
                        if (count > maxLength) {
                            maxLength = count;
                            maxLengthIDX = check.length - 1;
                            maxLengthIND = ind;
                        }
                        ind = data[i][1];
                        vectors[ind] = [];
                        vectors[ind].dates = [];
                        vectors[ind].values = [];
                        vectors[ind].mus = [];
                        count = 1;
                        vectors[ind].dates.push(data[i][0]);
                        vectors[ind].values.push(data[i][2]);
                        vectors[ind].mus.push(data[i][3]);
                    }
                }
                check.push(count);

                /** Collect years from the longest vector */
                var years = [];
                for (var i = 0 ; i < vectors[maxLengthIND].dates.length ; i++)
                    years.push(vectors[maxLengthIND].dates[i]);

                /** Collect measurement units */
                $.each(vectors, function(k, v) {
                    if ($.inArray(vectors[k].mus[0], mus) < 0)
                        mus.push(vectors[k].mus[0]);
                });

                /** Fill shorter vectors with 'null' values */
                $.each(vectors, function(k, v) {
                    var fix = vectors[k].dates.length < maxLength;
                    if (fix) {
                        for (var i = 0 ; i < years.length ; i++) {
                            if ($.inArray(years[i], vectors[k].dates) < 0) {
                                vectors[k].dates.splice(i, 0, years[i]);
                                vectors[k].values.splice(i, 0, null);
                                vectors[k].mus.splice(i, 0, vectors[k].mus[0]);
                            }
                        }
                    }
                });

                // check if it's just one year (X-axis), in that case force to bar chart (if it's not column/bar)
                if ( years.length <= 1 && type != 'bar' && type != 'column') {
                    type = 'column';
                }

                /** Create objects for Highcharts */
                $.each(vectors, function(k, v) {
                    var s = {};
                    s.name = k;
                    s.type = type;
                    s.yAxis = $.inArray(vectors[k].mus[0], mus);
                    s.data = [];
                    for (var i = 0 ; i < vectors[k].values.length ; i++) {
                        if (vectors[k].values[i] != null)
                            s.data.push(parseFloat(vectors[k].values[i]));
                        else
                            s.data.push(null);
                    }
                    series.push(s);
                });

                /** Create a Y-Axis for each measurement unit */
                for (var i = 0 ; i < mus.length ; i++) {
                    var a = {};
                    a.title = {};
                    a.title.text = mus[i];
                    a.title.style = {};
                    a.title.style.color = FENIXCharts.COLORS[i];
                    if (i > 0)
                        a.opposite = true;
                    a.labels = {};
                    a.labels.style = {};
                    a.labels.style.color = FENIXCharts.COLORS[i];
                    yAxis.push(a);
                }



                /** Create chart */
                var chart_payload = {};
                chart_payload.engine = chart.object_parameters.engine;
                chart_payload.keyword = chart.object_parameters.keyword;
                chart_payload.renderTo = chart.object_parameters.renderTo;
                chart_payload.categories = years;
                chart_payload.title = '';
                chart_payload.credits = $.i18n.prop('_millionthousand');
                chart_payload.yaxis = {};
                chart_payload.yaxis = yAxis;
                chart_payload.xaxis = {};
                if (chart.object_parameters.xaxis != null) {
                    chart_payload.xaxis.rotation = chart.object_parameters.xaxis.rotation;
                    chart_payload.xaxis.fontSize = chart.object_parameters.xaxis.fontSize;
                }
                chart_payload.series = series;

                // TODO: make it better, quick fix for GHG Timeserie
                if ( years.length > 30 ) {
                    chart_payload.xaxis.style = {};
                    // chart_payload.xaxis.style.color = 'red'; 
                    // chart_payload.xaxis.style.fontSize = '5px';
                    chart_payload.xaxis.tickinterval = 2;
                }

                FENIXCharts.plot(chart_payload);
            }
        },

        queryDBAndCreateChart_GrowthRate : function(chart, response) {

            var data = response;
            if (typeof data == 'string')
                data = $.parseJSON(response);

            if ( data == '') {
                UIUtils.noValuesFoundPanel( chart.object_parameters.renderTo)
            }
            else {

                var min = 1000000;
                var max = 0;
                var matrix = [];
                var labels = [];

                for (var i = 0 ; i < data.length ; i++) {
                    if (parseInt(data[i][2]) > max)
                        max = parseInt(data[i][2]);
                    if (parseInt(data[i][2]) < min)
                        min = parseInt(data[i][2]);
                }

                var step = 1+ max - min;
                var numbers = [];
                for (var i = 0 ; i < data.length ; i++) {
                    numbers.push(data[i][3]);
                    if ((i + 1) % step == 0) {
                        labels.push(data[i][0] + ', ' + data[i][1]);
                        matrix.push(numbers);
                        numbers = [];
                    }
                }

                var categories = [];
                var elements = [];
                for (var i = 0 ; i < labels.length ; i++) {
                    var s1 = labels[i].substring(0, labels[i].indexOf(','));
                    if ($.inArray(s1, categories) < 0)
                        categories.push(s1);
                    var s2 = labels[i].substring(1 + labels[i].indexOf(','));
                    if ($.inArray(s2, elements) < 0)
                        elements.push(s2);
                }

                var restdata = {};
                restdata.labels = JSON.stringify(labels);
                restdata.json = JSON.stringify(matrix);

                $.ajax({

                    type : 'POST',
                    url : 'http://' + FAOSTATBrowse.baseurl_r + '/r/rest/eval/multiplegrowthrate',
                    data : restdata,

                    success : function(response) {

                        var table = response;
                        if (typeof table == 'string')
                            table = $.parseJSON(response);
                        var series = [];
                        for (var j = 0 ; j < elements.length ; j++) {
                            var tmp = {};
                            tmp.name = elements[j];
                            tmp.data = [];
                            for (var i = j ; i < table.length ; i += elements.length) {
                                var val = Math.round(parseFloat(table[i][1]) * 1000) / 1000;
                                tmp.data.push(val);
                            }
                            series.push(tmp);
                        }

                        var chart_payload = {};
                        chart_payload.engine = chart.object_parameters.engine;
                        chart_payload.keyword = 'FAOSTAT_DEFAULT_BAR';
                        chart_payload.renderTo = chart.object_parameters.renderTo;
                        chart_payload.categories = categories;
                        chart_payload.title = chart.object_parameters.title;
                        chart_payload.credits = chart.object_parameters.credits;
                        chart_payload.yaxis = {};
                        chart_payload.yaxis.min = chart.object_parameters.yaxis.min;
                        chart_payload.yaxis.max = chart.object_parameters.yaxis.max;
                        chart_payload.yaxis.tickInterval = chart.object_parameters.yaxis.tickInterval;
                        chart_payload.yaxis.title = chart.object_parameters.yaxis.title;
                        chart_payload.series = series;

                        FENIXCharts.plot(chart_payload);

                    },

                    error : function(err, b, c) {
                        console.log(err.status + ", " + b + ", " + c);
                    }

                });
            }

        },

        checkData: function() {
            return true;
        }

    };

}
