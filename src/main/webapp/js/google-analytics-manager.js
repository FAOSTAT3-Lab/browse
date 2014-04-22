if (!window.BROWSE_STATS) {

    window.BROWSE_STATS = {

        /**
         * @param category  VISUALIZE, VISUALIZE_BY_DOMAIN, VISUALIZE_BY_AREA, VISUALIZE_TOP_20
         * @param action    Access to ...
         * @param label     Group Code, countries_by_commodity, commodities_by_regions
         */
        track : function(category, action, label) {
            _gaq.push(['_trackEvent', category, action, label]);
        },

        showBrowseByDomain : function() {
            BROWSE_STATS.track('VISUALIZE_BY_DOMAIN', 'Visualize the domain', BROWSE_STATS.getCode());
        },

        updateBrowseByDomain : function() {
            BROWSE_STATS.track('VISUALIZE_BY_DOMAIN', 'Update VISUALIZE_BY_DOMAIN', BROWSE_STATS.getCode());
        },

        showBrowseByCountryRegion : function() {
            BROWSE_STATS.track('VISUALIZE_BY_AREA', 'Visualize by Area', BROWSE_STATS.getCode());
        },

        updateBrowseByCountryRegion : function() {
            BROWSE_STATS.track('VISUALIZE_BY_AREA', 'Update VISUALIZE_BY_AREA', BROWSE_STATS.getCode());
        },

        showBrowseRankings : function() {
            BROWSE_STATS.track('VISUALIZE_TOP_20', 'Visualize Rankings', BROWSE_STATS.getCode());
        },

        updateBrowseRankings : function() {
            BROWSE_STATS.track('VISUALIZE_TOP_20', 'Update VISUALIZE_TOP_20', BROWSE_STATS.getCode());
        },

        getCode : function() {
            return (FAOSTATBrowse.domainCode != null && FAOSTATBrowse.domainCode != 'null') ? FAOSTATBrowse.domainCode : FAOSTATBrowse.groupCode;
        }

    };

}