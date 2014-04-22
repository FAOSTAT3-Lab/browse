if (!window.UIBuilderGrowthRate) {

    window.UIBuilderGrowthRate = {

        objStructure: '<div class="obj-box">' +
            ' <div id="obj_header_REPLACE" class="obj-box-header">' +

            '<div class="obj-box-header-text">' +
            '<div id="obj_title_REPLACE" class="obj-box-title"></div>' +
            '<div id="obj_subtitle_REPLACE" class="obj-box-subtitle"></div>' +
            '</div>' +

            '<div class="obj-box-icons">' +
            '<div class="obj-box-icon export-icon" id="obj_export_REPLACE"></div>' +
            '</div>' +

            '</div>' +
            '<div id="REPLACE" style="width:100%"></div> ' +
            '<div id="obj_footer_REPLACE" class="obj-box-footer" style="display:none"></div> ' +
            '</div>',

        appendGrowthRateUI: function (growthrate) {

            var suffix = growthrate.object_parameters.renderTo;
            var structure = CORE.replaceAll(this.objStructure, 'REPLACE', suffix);

            $('#content_' + suffix).append(structure);

            $('#obj_title_' + suffix).append(growthrate[FAOSTATBrowse.lang + '_title']);
            $('#obj_subtitle_' + suffix).append(growthrate.subtitle);

            if (growthrate[FAOSTATBrowse.lang + '_footnote'] != null && growthrate[FAOSTATBrowse.lang + '_footnote'] != '') {
                $('#obj_footer_' + suffix).css('display', 'inline-block');
                $('#obj_footer_' + suffix).append(growthrate[FAOSTATBrowse.lang + '_footnote']);
            }

            // tooltip
            document.getElementById('obj_export_' + suffix).title = $.i18n.prop('_export');
            $('#obj_export_' + suffix).powerTip({placement: 's'});

            /** Test WDS */
            UIBuilderGrowthRate.queryDBAndCreateGrowthRate(growthrate);

        },

        queryDBAndCreateGrowthRate: function (growthrate) {

            var data = {};
            data.datasource = FAOSTATBrowse.datasource;
            data.thousandSeparator = ',';
            data.decimalSeparator = '.';
            data.decimalNumbers = '2';
            data.json = JSON.stringify(growthrate.sql);
            data.cssFilename = 'faostat';

            $.ajax({

                type: 'POST',
                url: 'http://' + FAOSTATBrowse.baseurl + '/wds/rest/table/json',
                data: data,

                success: function (response) {

                    var data = response;
                    if (typeof data == 'string')
                        data = $.parseJSON(response);
                    var label = data[0][0];
                    var labels = [];
                    labels.push(label);
                    var numbers = [];
                    var matrix = [];
                    for (var i = 0; i < data.length; i++) {
                        if (data[i][0] == label) {
                            numbers.push(data[i][2]);
                        } else {
                            label = data[i][0];
                            labels.push(label);
                            matrix.push(numbers);
                            numbers = [];
                            numbers.push(data[i][2]);
                        }
                    }

                    UIBuilderGrowthRate.createMultipleGrowthRate(labels, matrix, growthrate.object_parameters.renderTo);

                },

                error: function (err, b, c) {

                }

            });

        },

        createMultipleGrowthRate: function (labels, matrix, id) {
            var data = {};
            data.labels = JSON.stringify(labels);
            data.json = JSON.stringify(matrix);
            $.ajax({
                type: 'POST',
                url: 'http://' + FAOSTATBrowse.baseurl_r + '/r/rest/eval/multiplegrowthrate',
                data: data,
                success: function (response) {
                    var table = response;
                    if (typeof table == 'string')
                        table = $.parseJSON(response);
                    for (var i = 0; i < table.length; i++) {
                        var row = '<tr><td class="table_growthrate_label">' + table[i][0] + '</td>';
                        var col = table[i][1] > 0 ? '#0D8A28' : '#CA1616';
                        var val = Math.round(table[i][1] * 1000) / 1000;
                        row += '<td class="table_growthrate_value" style="color: ' + col + ';">' + val + '%</td></tr>';
                        $('#' + id).append(row);
                    }

                    $('#obj_export_' + id).bind('click', function () {
                        UIBuilderGrowthRate.exportGrowthRateTable(table);
                    });
                },
                error: function (err, b, c) {
                   // console.log(err.status + ", " + b + ", " + c);
                }
            });
        },

        exportGrowthRateTable: function (data) {

            var headers = [];
            headers.push('Geographic Area');
            headers.push('% Annual Growth Rate');
            data.splice(0, 0, headers);

            /** Stream the Excel through the hidden form */
            $('#data').val(JSON.stringify(data));
            document.growthRateExcelForm.submit();

        },

        createGrowthRate: function (label, numbers) {
            var data = {};
            data.label = label;
            data.json = JSON.stringify(numbers);
            $.ajax({
                type: 'POST',
                url: 'http://' + FAOSTATBrowse.baseurl_r + '/r/rest/eval/growthrate',
                data: data,
                success: function (response) {
                    var table = response;
                    if (typeof table == 'string')
                        table = $.parseJSON(response);
                    var row = '<tr><td style="background-color: #A2BFDE;">' + table[0][0] + '</td>';
                    var col = table[0][1] > 0 ? '#0D8A28' : '#CA1616';
                    var val = Math.round(table[0][1] * 1000) / 1000;
                    row += '<td style="color: ' + col + ';">' + val + '%</td></tr>';
                    $('#gr_1 > tbody:last').append(row);
                },
                error: function (err, b, c) {
                    console.log(err.status + ", " + b + ", " + c);
                }
            });
        }

    };

}