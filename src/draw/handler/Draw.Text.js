L.Draw.Text = L.Draw.Feature.extend({
    statics: {
        TYPE: 'text'
    },
    options: {
        textInput: 'draw-text-input',
        icon: new L.divIcon({
            className: 'text-icon',
            html: 'text sample'
        }),
        shapeOptions: {
            stroke: true,
            color: 'black',
            weight: 3,
            opacity: 0.6,
            radius: 5,
            fill: true,
            fillColor: null, //same as color by default
            fillOpacity: 0.9,
            clickable: true
        },
        repeatMode: false,
        zIndexOffset: 2000 // This should be > than the highest z-index any markers
    },

    initialize: function (map, options) {
        // Save the type so super can fire, need to do this as cannot do this.TYPE :(
        this.type = L.Draw.Text.TYPE;

        L.Draw.Feature.prototype.initialize.call(this, map, options);

        if (!document.getElementById(this.options.textInput)) {
            console.warn('L.Draw.Text: Draw input is not defined');
        }
    },

    addHooks: function () {
        L.Draw.Feature.prototype.addHooks.call(this);

        if (this._map) {
            // Same mouseMarker as in Draw.Polyline
            if (!this._mouseMarker) {
                this._mouseMarker = L.marker(this._map.getCenter(), {
                    icon: L.divIcon({
                        className: 'leaflet-mouse-marker',
                        iconAnchor: [20, 20],
                        iconSize: [40, 40]
                    }),
                    opacity: 0,
                    zIndexOffset: this.options.zIndexOffset
                });
            }

            this._mouseMarker
                .on('click', this._onClick, this)
                .addTo(this._map);

            this._map.on('mousemove', this._onMouseMove, this);
        }
    },

    removeHooks: function () {
        L.Draw.Feature.prototype.removeHooks.call(this);

        if (this._map) {
            if (this._marker) {
                this._marker.off('click', this._onClick, this);
                this._map
                    .off('click', this._onClick, this)
                    .removeLayer(this._marker);
                delete this._marker;
            }

            this._mouseMarker.off('click', this._onClick, this);
            this._map.removeLayer(this._mouseMarker);
            delete this._mouseMarker;

            this._map.off('mousemove', this._onMouseMove, this);
        }
    },

    _onMouseMove: function (e) {
        var inputElement = document.getElementById(this.options.textInput);
        if (inputElement && inputElement.value !== '') {
            var latlng = e.latlng;

            var icon = this._getMarkerIcon();

            this._mouseMarker.setLatLng(latlng);

            if (!this._marker) {
                this._marker = new L.marker(latlng, {
                    icon: icon
                });
                // Bind to both marker and map to make sure we get the click event.
                this._marker.on('click', this._onClick, this);
                this._map
                    .on('click', this._onClick, this)
                    .addLayer(this._marker);
            }
            else {
                latlng = this._mouseMarker.getLatLng();
                this._marker.setLatLng(latlng);
                this._marker.setIcon(icon);
            }
        }
    },

    _onClick: function () {
        this._fireCreatedEvent();

        this.disable();
        if (this.options.repeatMode) {
            this.enable();
        }
    },

    _getMarkerIcon: function () {
        var inputElement = document.getElementById(this.options.textInput);
        if (inputElement && inputElement.value !== '') {
            var markerHtmlStyles = [
                'color:' + this.options.shapeOptions.color,
                // 'background-color:' + this.options.shapeOptions.fillColor
            ];

            return new L.divIcon({
                className: 'text-icon',
                html: '<div class="text-container" style="' + markerHtmlStyles.join(';') + '">' + inputElement.value + '</div>',
                iconAnchor: [-10, -10]
            });
        }
    },

    _fireCreatedEvent: function () {
        var inputElement = document.getElementById(this.options.textInput);
        if (inputElement && inputElement.value !== '') {

            var marker = new L.marker(this._marker.getLatLng(), {
                icon: this._getMarkerIcon()
            });

            L.Draw.Feature.prototype._fireCreatedEvent.call(this, marker);
            // clean text value
            inputElement.value = '';
        }
    }
});