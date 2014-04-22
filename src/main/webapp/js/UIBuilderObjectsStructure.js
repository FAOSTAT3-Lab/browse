if (!window.UIBuilderObjectsStructure) {

    window.UIBuilderObjectsStructure = {

        horizontalSpacing: 10,
        verticalSpacing: 0,

        buildObjectStructure: function(objects, width) {
            $('#content').empty();

            var initialized = false;
            var currentSize = 0;
            var contentWidth = width;

            // html structure
            var s = '';
            var counter = 0;

            for (var i = 0 ; i < objects.length ; i++) {
                // dynamic id
                objects[i].object_parameters.renderTo = 'obj_' + this.randomID();

                var objWidth = 0;
                objWidth = FAOSTATBrowseUtils.setObjWidth(objects[i]);
                currentSize = currentSize + objWidth;

                // if it's empty open the table
                if ( initialized == false ) {
                    s += this.openTable();
                    initialized = true;
                }
//				console.log(currentSize + " | " + contentWidth );
                // if doesn't go over the maximum width add it, otherwise create another table
                if ( currentSize < (contentWidth - this.horizontalSpacing)) {

                    if ( counter > 0 ) {
                        s += this.addTD(objWidth, 'content_' + objects[i].object_parameters.renderTo, this.horizontalSpacing );
                    }
                    else {
                        // add TD
                        s += this.addTD(objWidth, 'content_' + objects[i].object_parameters.renderTo, null);
                    }
                    counter++;
                }
                else {
                    // close the old table
                    s += this.closeTable();
                    // create a new table
                    s += this.openTable();
                    // add the new TD
                    s += this.addTD(objWidth, 'content_' + objects[i].object_parameters.renderTo);
                    // initialize with the object dimension
                    currentSize = objWidth;
                }
            }
            // close the old table
            s += this.closeTable();
            $('#content').append(s);
        },
        openTable: function() {
            var s = '<table style="margin-bottom:' + this.verticalSpacing +'px";><tr>';
            return s;
        },
        closeTable: function() {
            var s = '</tr></table>';
            return s;
        },
        addTD: function(width, id, hspacing) {
            var s = '<td valign="top" width="' + width + 'px">';
            s += "<div ";

            if ( hspacing != null )
                s += 'style="margin-left:'+ hspacing +'px"';
            s += ' id="' + id + '"></div>';

            s += '</td>';
            return s;
        },
        randomID: function() {
            var randLetter = Math.random().toString(36).substring(7);
            return (randLetter + Date.now()).toLocaleLowerCase();
        }

    };

}