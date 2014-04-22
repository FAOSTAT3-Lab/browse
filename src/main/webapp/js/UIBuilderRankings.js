if (!window.UIBuilderRankings) {

    window.UIBuilderRankings = {

        view_id: 'rankings_view',

        objects : null,

        buildUI : function(subsection) {

            $('#main-content-leftsidebar').empty();
            $('#main-content-leftsidebar').load(FAOSTATBrowse.prefix + 'browse_rankings.html', function() {
                $("#selectorsHead").sticky({topSpacing:0});
                UIBuilderRankings.buildTree(subsection);
            });
        },
        buildTree: function(subsection) {

            // TODO: load json
            var data = {};
            data.viewID = UIBuilderRankings.view_id;
            data.schema = FAOSTATBrowse.FAOSTAT_DBMS_DATASOURCE;

            $.ajax({
                type : 'POST',
                url : FAOSTATBrowse.baseurl_dbms + FAOSTATBrowse.FAOSTAT_DBMS_SERVICENAME + FAOSTATBrowse.FAOSTAT_DBMS_REST_GETVIEW,
                data : data,
                success : function(response) {

                    // Fetch JSON
                    var data = response;
                    if (typeof data == 'string')
                        data = $.parseJSON(response);

                    var defaulfCode;

                    // Create root item
                    $('#metadata_tree').append('<ul id="root"></ul>');

                    for(var i=0; i < data.objects.length; i++) {
                        var l = data.objects[i][FAOSTATBrowse.lang + '_title'];
                        l = CORE.breakLabel(l);
                        rootID = 'root_' + i;
                        $('#root').append('<li id="' + rootID + '">' + l);

                        $('#' + rootID).append('<ul id="' + rootID + '_root">');

                        for(var j=0; j < data.objects[i].categories.length; j++) {

                            var l = data.objects[i].categories[j][FAOSTATBrowse.lang + '_title'];
                            var view_id =  data.objects[i].categories[j].view_id;

                            var label = CORE.breakLabel(l);

                            $('#' + rootID + '_root').append('<li id="' + view_id + '">' + label + '</li>');

                            //$('#metadata_tree').jqxTree('addTo', { label: label, value: view_id, id: view_id }, id);

                            // setting the default code on the tree
                            if ( subsection != '*' && subsection != 'null' ) {
                                if ( subsection ==  data.objects[i].categories[j].view_id ) {
                                    defaulfCode = $('#metadata_tree').find('#' + subsection)[0];
                                }
                            }
                            else if ( i == 0 && j == 0) {
                                defaulfCode  = $('#metadata_tree').find('#' + view_id)[0];
                            }
                        }

                        $('#' + rootID + '_root').append('</ul>');
                        $('#' + rootID).append('</li>');
                    }
                    $('#root').append('</li>');

                    // Initiate JQWidgets
                    $('#metadata_tree').jqxTree({
                        theme : FAOSTATBrowse.theme
                    });

                    // bind
                    $('#metadata_tree').bind('select', function (event) {
                        var args = event.args;
                        var item = $('#metadata_tree').jqxTree('getItem', args.element);
                        var label =  CORE.replaceAll(item.label, '<br>', '');
                        FAOSTATBrowse.loadView('rankings', item.id, label);
                    });

                    // setting default code
                    $("#metadata_tree").jqxTree('selectItem', defaulfCode);
                    $('#metadata_tree').jqxTree('expandAll');
                },
                error : function(err, b, c) {
                    console.log(err.status + ", " + b + ", " + c);
                }
            });


        }
    };

}