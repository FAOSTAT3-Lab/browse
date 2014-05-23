if (!window.FAOSTATBrowseUtils) {
	
	window.FAOSTATBrowseUtils = {

        // TODO: use config file in the future
        /*WIDTH_100: '920px',
        WIDTH_66: '428px',
        WIDTH_50: '428px',
        WIDTH_33: '428px',
        WIDTH_25: '296px',
        WIDTH_20: '256px',


        // 100% configuration
        WIDTH_100_100: '960px',
        WIDTH_66_100: '600px',
        WIDTH_50_100: '428px',
        WIDTH_33_100: '316px',
        WIDTH_25_100: '296px',
        WIDTH_20_100: '256px', */

        WIDTH_100: '12',
        WIDTH_66:  '8',
        WIDTH_50:  '6',
        WIDTH_33:  '4',
        WIDTH_25:  '2',
        WIDTH_20:  '2',


        // 100% configuration
        WIDTH_100_100:'12',
        WIDTH_66_100: '8',
        WIDTH_50_100: '6',
        WIDTH_33_100: '4',
        WIDTH_25_100: '2',
        WIDTH_20_100: '2',
		
		setObjWidth: function (obj) {
            console.log(obj.width);
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
				//width = parseInt(obj.width.replace("px",""));
			}
            else
                obj.width = "12";

            obj.width = parseInt(obj.width);
            return obj.width;
		}
			
	};
	
}