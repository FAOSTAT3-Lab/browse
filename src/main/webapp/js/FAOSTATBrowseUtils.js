if (!window.FAOSTATBrowseUtils) {
	
	window.FAOSTATBrowseUtils = {

        // TODO: use config file in the future
        WIDTH_100: '713px',
		WIDTH_66: '495px',
		WIDTH_50: '330px',
		WIDTH_33: '200px',
		WIDTH_25: '180px',
		WIDTH_20: '140px',


        // 100% configuration
        WIDTH_100_100: '960px',
        WIDTH_66_100: '600px',
        WIDTH_50_100: '428px',
        WIDTH_33_100: '316px',
        WIDTH_25_100: '296px',
        WIDTH_20_100: '256px',
		
		setObjWidth: function (obj) {
			var width = "100%";
			if ( obj.width != null ) {
                if ( obj.width.toUpperCase().indexOf("$_WIDTH") > -1) {
					switch(obj.width) {

                        // this is for by domain and rankings
						case "$_WIDTH_100": obj.width = FAOSTATBrowseUtils.WIDTH_100; break;
						case "$_WIDTH_66": obj.width = FAOSTATBrowseUtils.WIDTH_66; break;
						case "$_WIDTH_50": obj.width = FAOSTATBrowseUtils.WIDTH_50; break;
						case "$_WIDTH_33": obj.width = FAOSTATBrowseUtils.WIDTH_33; break;
                        case "$_WIDTH_20": obj.width = FAOSTATBrowseUtils.WIDTH_20; break;

                        // this is used by country
                        case "$_WIDTH_100_100": obj.width = FAOSTATBrowseUtils.WIDTH_100_100; break;
                        case "$_WIDTH_66_100": obj.width = FAOSTATBrowseUtils.WIDTH_66_100; break;
                        case "$_WIDTH_50_100": obj.width = FAOSTATBrowseUtils.WIDTH_50_100; break;
                        case "$_WIDTH_33_100": obj.width = FAOSTATBrowseUtils.WIDTH_33_100; break;
                        case "$_WIDTH_20_100": obj.width = FAOSTATBrowseUtils.WIDTH_20_100; break;
					}
				}
				width = parseInt(obj.width.replace("px",""));
			}
			return width;
		}
			
	};
	
}