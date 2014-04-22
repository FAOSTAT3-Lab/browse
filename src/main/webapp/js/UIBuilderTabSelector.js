if (!window.UIBuilderTabSelector) {

    window.UIBuilderTabSelector = {

        /** JSON objects are stored here to enable selectors */
        objects : null,

        buildUI : function(object, groupcode, selectedViewID, title, lang) {
            for (var i = 0 ; i < object.length ; i++) {
                var isSelected = ( object[i].view_id == selectedViewID) ? true : false;
                UIBuilderTabSelector.buildTab(object[i], groupcode, isSelected, title, lang)
            }
        },

        buildTab: function(object, groupcode, isSelected, title, lang) {
            var tab = '<span id="tab_'+ object.view_id + '" class="faostat-browse-tab">'+ object[lang + '_tab_title'] + '</span>';
            $('#tabs').append(tab);
            if ( isSelected) $('#tab_'+ object.view_id).addClass('faostat-browse-tab-selected')
            $('#tab_'+ object.view_id).click( {view_id: object.view_id, title: title}, function(e) {
                FAOSTATBrowse.loadView(groupcode, e.data.view_id, e.data.title);
            });
        }

    };

}