var UIBuilderTable = function() {
	
	var result = {	
			
		decimalValues: 2,

        objStructure :
            '<div class="obj-box">' +
                ' <div id="obj_header_REPLACE" class="obj-box-header">' +

                '<div class="obj-box-header-text">' +
                '<div id="obj_title_REPLACE" class="obj-box-title"></div>' +
                '<div id="obj_subtitle_REPLACE" class="obj-box-subtitle"></div>' +
                '</div>' +

                '<div class="obj-box-icons">' +
                    '<div class="obj-box-icon export-icon" id="obj_export_REPLACE"></div>' +
                '</div>' +

                '</div>' +
                '<div id="REPLACE" style="width:$_WIDTH;"></div> ' +
                '<div id="obj_footer_REPLACE" class="obj-box-footer" style="display:none"></div> ' +
                '</div>',

		createTable : function(obj) {

            var suffix =  obj.object_parameters.renderTo;
            var structure = CORE.replaceAll(this.objStructure, 'REPLACE', suffix);
            structure = CORE.replaceAll(structure, '$_WIDTH',  obj.width );

            $('#content_' + suffix).append(structure);
            $('#obj_title_' + suffix).append(obj[FAOSTATBrowse.lang + '_title']);
            $('#obj_subtitle_' + suffix).append(obj.subtitle);

            // Loading image
            document.getElementById(suffix).innerHTML = "<div style='height:"+ this.height+"'><img src='"+ FAOSTATBrowse.prefix +'images/loading.gif' +"'></div>";


            if (obj[FAOSTATBrowse.lang + '_footnote'] != null && obj[FAOSTATBrowse.lang + '_footnote'] != '' ) {
                $('#obj_footer_' + suffix).css('display', 'inline-block');
                $('#obj_footer_' + suffix).append(obj[FAOSTATBrowse.lang + '_footnote']);
            }

            // tooltip
            document.getElementById('obj_export_' + suffix).title = $.i18n.prop('_export');
            $('#obj_export_' + suffix).powerTip({placement: 's'});

            $("#obj_export_" + suffix).bind('click', function() {
            	// TODO: change style to item
            	Export.exportPlainData(obj);
            });
	
			// query and create the map
			this.queryDB(obj);
			
		},
		
		queryDB: function(obj, response) {
			
			var data = {};
			data.datasource = FAOSTATBrowse.datasource,
			data.thousandSeparator = ',';
			data.decimalSeparator = '.';
			data.decimalNumbers = this.decimalValues;
			data.json = JSON.stringify(obj.sql);
			data.cssFilename = '';
			data.nowrap = false;
			
			var indexes = this.getValuesIndex(obj);
			data.valuesIndex = indexes;
			var _this = this;
			$.ajax({
				type : 'POST',
				url : 'http://' + FAOSTATBrowse.baseurl + '/wds/rest/table/html2',
				data : data,			
				success : function(response) {				
					_this.getData(obj, response);
				},
				error : function(err, b, c) { }
			});
		},
		
		getData: function(obj, response) {		
//			parse the first row per gli hearder
            $('#' + obj.object_parameters.renderTo).empty();
			$('#' + obj.object_parameters.renderTo).append(response);
		},
		
		getValuesIndex: function(obj) {
			var i = '';
			for (var j = 0 ; j < obj.sql.selects.length ; j++) {
				var o = obj.sql.selects[j];
				if (o.column.toLowerCase().indexOf("value") !=-1) {
					i += j + ',';
				}
			}
			i = i.substring(0, i.length - 1);		
			return i;
		}
	};
	
	return result;
}