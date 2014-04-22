if (!window.FAOSTATBrowseTree) {

    window.FAOSTATBrowseTree = {

        baseurl : '',

        datasource : '',

        language : 'EN',

        selectedCode : null,

        populateTree : function(type) {

            $.getJSON(FAOSTATBrowse.prefix + 'config/tree.json', function(json) {

                // Fetch parameters from the JSON
                FAOSTATBrowseTree.baseurl = json.baseurl;
                FAOSTATBrowseTree.datasource = json.datasource;
                FAOSTATBrowseTree.tablelimit = json.tablelimit;

                $.ajax({

                    type: 'GET',
                    url: 'http://' + FAOSTATBrowseTree.baseurl + '/wds/rest/groupsanddomains/' + FAOSTATBrowseTree.datasource + '/' + FAOSTATBrowse.lang,
                    dataType: 'json',

                    success : function(response) {

                        // Fetch JSON
                        var data = response;
                        if (typeof data == 'string')
                            data = $.parseJSON(response);

                        // Create root item
                        $('#metadata_tree').append('<ul id="root"></ul>');

                        var groupIndices = FAOSTATBrowseTree.findGroupIndices(data);
                        for (var i = 0 ; i < groupIndices.length ; i++)
                            FAOSTATBrowseTree.buildGroup(data, groupIndices[i]);

                        // Initiate JQWidgets
                        $('#metadata_tree').jqxTree({
                            theme : FAOSTATBrowse.theme
                        });

                        // Expand Group
                        if ( (FAOSTATBrowse.domainCode == 'null' || FAOSTATBrowse.domainCode == '*') && FAOSTATBrowse.groupCode != 'null') {
                            var groupCode =  FAOSTATBrowse.groupCode;
                            if ( groupCode.indexOf('-') != -1)
                                groupCode = groupCode.substring(0, groupCode.indexOf('-'));
                            $("#metadata_tree").jqxTree('expandItem', $('#' + groupCode)[0]);
                            $("#metadata_tree").jqxTree('selectItem', $('#' + groupCode)[0]);
                        }

                        // Expand Domain
                        /*                        else {
                         $("#metadata_tree").jqxTree('expandItem', $('#' + FAOSTATBrowse.domainCode)[0]);
                         $("#metadata_tree").jqxTree('selectItem', $('#' + FAOSTATBrowse.domainCode)[0]);
                         }*/

                        // Expand Domain
                        else {
                            var domaincode =  FAOSTATBrowse.domainCode;
                            if ( domaincode.indexOf('-') != -1)
                                domaincode = domaincode.substring(0, domaincode.indexOf('-'));
                            $("#metadata_tree").jqxTree('expandItem', $('#' + domaincode)[0]);
                            $("#metadata_tree").jqxTree('selectItem', $('#' + domaincode)[0]);
                        }

                        // Bind tree selection
                        $('#metadata_tree').on('select',function (event) {
                            var args = event.args;
                            var item = $('#metadata_tree').jqxTree('getItem', args.element);
                            if (item.parentId == 0) {
                                FAOSTATBrowse.groupCode = item.id;
                                FAOSTATBrowse.domainCode = 'null';
                            } else {
                                FAOSTATBrowse.groupCode = item.parentId;
                                FAOSTATBrowse.domainCode = item.id;
                            }

                            FAOSTATBrowse.loadView(FAOSTATBrowse.groupCode, FAOSTATBrowse.domainCode, item.label);
                        });

                        // load view
                        var item = $('#metadata_tree').jqxTree('getItem', args.element);
                        /**if (item.parentId == 0) {
                            FAOSTATBrowse.groupCode = item.id;
                            FAOSTATBrowse.domainCode = 'null';
                        } else {
                            FAOSTATBrowse.groupCode = item.parentId;
                        }**/
                        FAOSTATBrowse.loadView(FAOSTATBrowse.groupCode, FAOSTATBrowse.domainCode, item.label);

                    },

                    error : function(err,b,c) {
                        alert(err.status + ', ' + b + ', ' + c);
                    }

                });

            });

        },

        findGroupIndices : function(data) {
            var groups = [];
            var a = [];
            for (var i = 0 ; i < data.length ; i++) {
                if ($.inArray(data[i][0], groups) < 0) {
                    groups.push(data[i][0]);
                    a.push(i);
                }
            }
            return a;
        },

        buildGroup : function(data, startIDX) {
            var groupCode = data[startIDX][0];
            $('#root').append('<li id="' + groupCode + '">' + CORE.breakLabel(data[startIDX][1]));
            $('#' + groupCode).append('<ul id ="' + groupCode + '_root">');
            for (var i = startIDX ; i < data.length ; i++) {
                if (data[i][0] == groupCode) {
                    //
                    if (FAOSTATBrowseTree.isNotInBlacklist( data[i][2]))
                        $('#' + groupCode + '_root').append('<li id="' + data[i][2] + '">' + CORE.breakLabel(data[i][3]) + '</li>');
                }
            }
            $('#' + groupCode).append('</ul>');
            $('#root').append('</li>');
        },

        isNotInBlacklist:function (domaincode) {
            if ( domaincode == 'FT' ||
                domaincode == 'QV' ||
                domaincode == 'TI' ||
                domaincode == 'GT' ||
                domaincode == 'GL' ||

                // prices
                domaincode == 'PA' ||
                domaincode == 'PM' ||
                domaincode == 'PP' ||

                // fertilizers
                domaincode == 'RA' ||
                domaincode == 'RT' ||

                domaincode == 'GT' ||
                domaincode == 'RY' ||
                domaincode == 'TM') {
                return false;
            }
            return true;
        }

    };

}