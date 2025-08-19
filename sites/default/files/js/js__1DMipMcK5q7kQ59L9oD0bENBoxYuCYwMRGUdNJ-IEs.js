/* $Id: markerloader_static.js,v 1.3 2009/02/11 19:30:22 bdragon Exp $ */

/**
 * @file
 * GMap Marker Loader
 * Static markers.
 * This is a simple marker loader to read markers from the map settings array.
 * Commonly used with macros.
 */

/*global Drupal */

// Add a gmap handler
Drupal.gmap.addHandler('gmap', function (elem) {
    var obj = this;
    var marker, i;
    if (obj.vars.markers) {
        // Inject markers as soon as the icon loader is ready.
        obj.bind('iconsready', function () {
            for (i = 0; i < obj.vars.markers.length; i++) {
                marker = obj.vars.markers[i];
                if (!marker.opts) {
                    marker.opts = {};
                }
                // Pass around the object, bindings can change it if necessary.
                obj.change('preparemarker', -1, marker);
                // And add it.
                if (marker && marker.marker == undefined) {
                  obj.change('addmarker', -1, marker);
                }
            }
            obj.change('markersready', -1);
        });
    }
});
;
/**
 * @file
 * GMap Markers
 * GMap API version -- No manager
 */

/*global Drupal, GMarker */

// Replace to override marker creation
Drupal.gmap.factory.marker = function (opts) {
    return new google.maps.Marker(opts);
};

Drupal.gmap.addHandler('gmap', function (elem) {
    var obj = this;

    obj.bind('addmarker', function (marker) {
        if (!obj.map.markers) obj.map.markers = [];
        marker.marker.setMap(obj.map);
        obj.map.markers.push(marker.marker);
    });

    obj.bind('delmarker', function (marker) {
        marker.marker.setMap(null);
    });

    obj.bind('clearmarkers', function () {
        // @@@ Maybe don't nuke ALL overlays?
        if (obj.map.markers) {
            for (var i = 0; i < obj.map.markers.length; i++) {
                obj.map.markers[i].setMap(null);
            }
        }
    });
});;
