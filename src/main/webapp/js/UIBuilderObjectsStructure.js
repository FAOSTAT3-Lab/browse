if (!window.UIBuilderObjectsStructure) {

    window.UIBuilderObjectsStructure = {

        horizontalSpacing: 10,
        verticalSpacing: 0,

        buildObjectStructure: function(objects, width) {
            $('#content').empty();

            var initialized = false;
            var currentSize = 0;
            //var contentWidth = width;
            var contentWidth = 12;

            // html structure
            var s = '';
            var counter = 0;

            for (var i = 0 ; i < objects.length ; i++) {
                // dynamic id
                objects[i].object_parameters.renderTo = 'obj_' + this.randomID();

                // based on bootstrap
                var objWidth = 0;
                objWidth = FAOSTATBrowseUtils.setObjWidth(objects[i]);
                console.log("OBJECT WIDTH " + objWidth );
                currentSize = currentSize + objWidth;

                // if it's empty open the table
                if ( initialized == false ) {
                    //s += this.openTable();
                    initialized = true;
                }
				console.log(currentSize + " | " + contentWidth + " | " + objWidth );
                // if doesn't go over the maximum width add it, otherwise create another table
                if ( currentSize <= contentWidth) {
                    if ( counter > 0 ) {
                        s += this.addObj('content_' + objects[i].object_parameters.renderTo, objWidth, false );
                    }
                    else {
                        // add TD
                        s += this.addObj('content_' + objects[i].object_parameters.renderTo, objWidth, true);
                    }
                    counter++;
                }
                else {
                    // close the old table
                    s += this.closeRow();
                    // create a new table
                    s += this.openRow();
                    // add the new TD
                    s += this.addObj('content_' + objects[i].object_parameters.renderTo, objWidth, false);

                    // initialize with the object dimension
                    currentSize = objWidth;
                }
            }
            // close the old table
            //s += this.closeTable();
            $('#content').append(s);
        },


        addObj: function(id, value, addRow) {
            var s = '';
            if ( addRow ) {
                console.log('openRow: ' + addRow);
                s += this.openRow();
            }

            s += '<div id="' + id + '" class="col-lg-'+ value +'"></div>';

            return s;
        },
        openRow: function() {

            return '<div class="row">';
        },
        closeRow: function() {
            return '</div>';
        },


        /*openTable: function() {
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
        },  */
        randomID: function() {
            var randLetter = Math.random().toString(36).substring(7);
            return (randLetter + Date.now()).toLocaleLowerCase();
        }

    };

}