var UIBuilderMap = function() {

    var result = {

        div: '',
        iframeURL: '',

        // default values
        baselayers: 'osm,mapquest,mapquest_nasa',
        layers: 'gaul0_faostat_3857,gaul0_line_3857',
        styles: 'join,gaul0_line',
        joinboundary: 'FAOSTAT',
        enablejoingfi: true,
        joindata: '',
        classification: 'equalarea',
        mu: '',
        intervals: '7',
        decimalValues: '0',
        colorramp: 'Blues',
        zoomto: '0',
        jointype: 'shaded', // shaded, point
        ranges: '',
        colors: '',

        maximizeHeight: '',
        originalHeigtht: '',


        objStructure : '<div id="obj_box_REPLACE" class="obj-box">' +
            ' <div id="obj_header_REPLACE" class="obj-box-header">' +

            '<div class="obj-box-header-text">' +
            '<div id="obj_title_REPLACE" class="obj-box-title"></div>' +
            '<div id="obj_subtitle_REPLACE" class="obj-box-subtitle"></div>' +
            '</div>' +

            '<div class="obj-box-icons">' +
            '<div class="obj-box-icon export-icon" id="obj_export_REPLACE"></div>' +
            '<div class="obj-box-icon map-shaded"  id="obj_shaded_REPLACE"></div>' +
            '<div class="obj-box-icon map-points"  id="obj_point_REPLACE"></div>' +
            '</div>' +

            '</div>' +
            '<div id="REPLACE" style="width:$_WIDTH; height:$_HEIGHT"></div> ' +
            '<div id="obj_footer_REPLACE" class="obj-box-footer"></div> ' +
            '</div>',

        createMap : function(obj) {

            var structure = CORE.replaceAll(this.objStructure, 'REPLACE', obj.object_parameters.renderTo);
            structure = CORE.replaceAll(structure, '$_WIDTH',  obj.width );
            structure = CORE.replaceAll(structure, '$_HEIGHT',  obj.height );

            var suffix =  obj.object_parameters.renderTo;

            $('#content_' + suffix).append(structure);
            $('#obj_title_' + suffix).append(obj[FAOSTATBrowse.lang + '_title']);
            $('#obj_subtitle_' + suffix).append(obj.subtitle);
            $('#obj_footer_' + suffix).append(obj[FAOSTATBrowse.lang + '_footnote']);

            // tooltip
            document.getElementById('obj_point_' + suffix).title = $.i18n.prop('_map_point');
            document.getElementById('obj_shaded_' + suffix).title = $.i18n.prop('_map_shaded');
            document.getElementById('obj_export_' + suffix).title = $.i18n.prop('_export');

            $('#obj_point_' + suffix).powerTip({placement: 's'});
            $('#obj_shaded_' + suffix).powerTip({placement: 's'});
            $('#obj_export_' + suffix).powerTip({placement: 's'});



            // query and create the map
            this.queryDBandMapCreate(obj);

            // add shaded/point
            var _this = this;
            $("#obj_point_" + obj.object_parameters.renderTo).bind('click', function() {
                _this.refreshmap(obj, 'point');
            });

            $("#obj_shaded_" + obj.object_parameters.renderTo).bind('click', function() {
                // TODO: change style to item
                _this.refreshmap(obj, 'shaded');
            });

            $("#obj_export_" + obj.object_parameters.renderTo).bind('click', function() {
                Export.exportDataMap(obj);
            });

        },


        refreshmap : function(obj, jointype) {

            // get div replace (take widht and height)
            this.iframeURL = this.addParameter(this.iframeURL, 'jointype', jointype);
            this.createIframe(obj);
        },

        queryDBandMapCreate : function(obj, response) {

            var data = {};
            data.datasource = FAOSTATBrowse.datasource,
            data.thousandSeparator = ',';
            data.decimalSeparator = '.';
            data.decimalNumbers = this.decimalValues;
            data.json = JSON.stringify(obj.sql);
            data.cssFilename = 'faostat';
            data.valueIndex = '1';

            var _this = this;
            //console.log(data);
            $.ajax({
                type : 'POST',
                url : 'http://' + FAOSTATBrowse.baseurl + '/wds/rest/table/json',
                data : data,
                success : function(response) {
                    _this.getData(obj, response);
                },
                error : function(err, b, c) { }
            });
        },

        getData : function(obj, response) {
            var data = response;
            if (typeof data == 'string')
                data = $.parseJSON(response);

            // no series found.
            if ( data == '') {
                UIUtils.noValuesFoundPanel( obj.object_parameters.renderTo)
            }
            else {
                this.setOptionalMapParameters(obj);
                this.mu = (data[0] != null && data[0][3] != null) ? data[0][3] : '';

                // data to be passed to the iframe
                var joindata = '[';
                for (var i = 0 ; i < data.length ; i++) {
                    // FIXME: this should be performed at the level of WDS
                    var value =  Number(data[i][2]).toFixed(this.decimalValues);
                    joindata += '(';
                    joindata += data[i][0] + "," + value;
                    joindata += ')';
                    if ( i < data.length -1) {
                        joindata += ',';
                    }
                }
                joindata += ']';

                this.joindata = joindata;
                this.createIframeURL(obj);
            }
        },
        createIframeURL: function(obj) {
            this.iframeURL = "http://" + FAOSTATBrowse.baseurl_maps + "/maps/api?" +
                "baselayers=" + this.baselayers +
                "&layers=" + this.layers +
                "&styles=" + this.styles +
                "&joindata=" + this.joindata +
                "&joinboundary="+ this.joinboundary +
                "&enablejoingfi="+ this.enablejoingfi +
                "&legendtitle=" + this.mu + // should dynamic measurement unit
                "&mu=" + this.mu +
                "&lang=" + FAOSTATBrowse.lang +
                "&classification=" + this.classification +
                "&zoomto=FAOSTAT(" + this.zoomto + ")" +
                "&jointype=" + this.jointype;


            if ( this.colors != '' )
                this.iframeURL += "&colors=" + this.colors;
            else
                this.iframeURL += "&colorramp=" + this.colorramp;

            if ( this.ranges != '' )
                this.iframeURL += "&ranges=" + this.ranges;

            if ( this.classification != 'custom' )
                this.iframeURL += "&intervals=" + this.intervals;

            if ( this.decimalValues != '0' )
                this.decimalValues += "&decimalValues=" + this.decimalValues;

            // create the iframe
            this.createIframe(obj);
        },

        createIframe : function(obj) {
            $('#' + obj.object_parameters.renderTo).empty();

            var iframe ='<div>';
            iframe += "<iframe id='mapFrame'  width='"+ obj.width+"' height='" + obj.height + "' frameBorder='0' ";
            // add the this.iframeURL to iframe

            var url = encodeURI(this.iframeURL);

            var url = CORE.replaceAll(this.iframeURL, "(", "%28");
            url = CORE.replaceAll(url, ")", "%29");

            iframe += "src='" + url +"'";

            iframe += ">";
            iframe += "</iframe>";
            iframe += "</div>";

            $('#' + obj.object_parameters.renderTo).append(iframe);

        },

        setOptionalMapParameters: function(obj) {
            if ( obj.object_parameters.colors != null ) {
                this.colors = obj.object_parameters.colors;
            }

            if ( obj.object_parameters.ranges != null ) {
                this.ranges = obj.object_parameters.ranges;
            }

            if ( obj.object_parameters.ranges != null ) {
                this.classification = obj.object_parameters.classification;
            }

            if ( obj.object_parameters.colorramp != null ) {
                this.colorramp = obj.object_parameters.colorramp;
            }

            if ( obj.object_parameters.decimalValues != null ) {
                this.decimalValues = obj.object_parameters.decimalValues;
            }
        },
        addParameter: function(href, key, val){

            var newParam = key + '=' + val,
                params = '?' + newParam;

            // If the "search" string exists, then build params from it
            if (href) {
                // Try to replace an existance instance
                params = href.replace(new RegExp('[\?&]' + key + '[^&]*'), '&' + newParam);

                // If nothing was replaced, then add the new param to the end
                if (params === href) {
                    params += '&' + newParam;
                }
            }
            return params;
        }
    };

    return result;
}