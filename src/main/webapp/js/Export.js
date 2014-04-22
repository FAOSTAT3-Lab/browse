if (!window.Export) {
	
	window.Export = {
			
		exportDataMap : function(object) {
            /** Stream the Excel through the hidden form */
            $('#datasource_WQ').val(FAOSTATBrowse.datasource);
            $('#thousandSeparator_WQ').val(',');
            $('#decimalSeparator_WQ').val('.');
            $('#decimalNumbers_WQ').val('2');
            $('#json_WQ').val(JSON.stringify(object.sql));
            $('#cssFilename_WQ').val('');
            $('#valueIndex_WQ').val('3');
            $('#quote_WQ').val('');
            $('#title_WQ').val('');
            $('#subtitle_WQ').val('');
            document.excelFormWithQuotes.submit();
		},

		exportPlainData : function(object) {
            /** Stream the Excel through the hidden form */
            $('#datasource_WQ').val(FAOSTATBrowse.datasource);
            $('#thousandSeparator_WQ').val(',');
            $('#decimalSeparator_WQ').val('.');
            $('#decimalNumbers_WQ').val('2');
            $('#json_WQ').val(JSON.stringify(object.sql));
            $('#cssFilename_WQ').val('');
            $('#valueIndex_WQ').val(null);
            $('#quote_WQ').val('');
            $('#title_WQ').val('');
            $('#subtitle_WQ').val('');
            document.excelFormWithQuotes.submit();

		},
		
		// TODO fix for multiple axis and tables with joins... (dynamic "." on the replace of the alias)
		exportData : function(object) {
            var exportObject = Export.injectParameters(JSON.parse(JSON.stringify(object)));
            /** Stream the Excel through the hidden form */
            $('#datasource_WQ').val(FAOSTATBrowse.datasource);
            $('#thousandSeparator_WQ').val(',');
            $('#decimalSeparator_WQ').val('.');
            $('#decimalNumbers_WQ').val('2');
            $('#json_WQ').val(JSON.stringify(exportObject.sql));
            $('#cssFilename_WQ').val('');
            $('#valueIndex_WQ').val(null);
            $('#quote_WQ').val('');
            $('#title_WQ').val('');
            $('#subtitle_WQ').val('');
            document.excelFormWithQuotes.submit();

		},

		injectParameters : function(json) {

            var columns = new Array();
			var selects = new Array();
					
					
			// SELECTS
			for (var j = 0 ; j < json.sql.selects.length ; j++) {
				var select = json.sql.selects[j];
				if ( jQuery.inArray(select.column, columns) == -1 ) {
					columns.push(select.column);
				}
			}
					
			for(var i = 0; i < columns.length; i++ ) {

				var select = json.sql.selects[i];
						
				// change alias
				selects.push(select);
						
				var c = select.column.toLowerCase();
				if (c.indexOf('code') != -1) {
					var addSelect = {};
					addSelect.aggregation = select.aggregation;
					addSelect.column = select.column.toLowerCase().replace("code","name") + FAOSTATBrowse.lang;
					addSelect.alias = $.i18n.prop('_' + addSelect.column.toLowerCase().substring(2, addSelect.column.length -1));
					selects.push(addSelect);
				}

				if (c.indexOf('name') != -1) {
					if (c.indexOf('unit') == -1) {;
						var addSelect = {};
						addSelect.aggregation = select.aggregation;
						addSelect.column = select.column.toLowerCase().replace("name","code");
						addSelect.column = addSelect.column.substring(2, addSelect.column.length - 1);
						addSelect.column = 'D.' + addSelect.column;
						addSelect.alias = $.i18n.prop('_' + addSelect.column.toLowerCase().substring(2, addSelect.column.length));
						selects.push(addSelect);
					}
				}
						
			}
					
			json.sql.selects = selects;
					
			// GroupBys
			var groupbys = new Array();
			var columns = new Array();
			if (json.sql.groupBys != null) {

                for (var j = 0 ; j < json.sql.groupBys.length ; j++) {
					var groupby = json.sql.groupBys[j];
					if ( jQuery.inArray(groupby.column, columns) == -1 ) {
						columns.push(groupby.column);
					}
				}
						
				for(var i = 0; i < columns.length; i++ ) {

					var groupby = json.sql.groupBys[i];
					groupbys.push(groupby);
							
					var c = groupby.column.toLowerCase();
					if (c.indexOf('code') != -1) {
						var addSelect = {};
						addSelect.column = groupby.column.toLowerCase().replace("code","name") + FAOSTATBrowse.lang;
						groupbys.push(addSelect);
					}
								
					if (c.indexOf('name') != -1) {
						if (c.indexOf('Unit') != -1) {
						    var addSelect = {};
							addSelect.column = groupby.column.toLowerCase().replace("name","code");
							addSelect.column = addSelect.column.substring(0, addSelect.column.length - 1);
							groupbys.push(addSelect);
							}
						}
							
				}
						
				json.sql.groupBys = groupbys;

			}

			return json;

		}
			
	};
	
}