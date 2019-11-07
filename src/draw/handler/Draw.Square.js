/**
 * @class L.Draw.Square
 * @aka Draw.Square
 * @inherits L.Draw.SimpleShape
 */
L.Draw.Square = L.Draw.SimpleShape.extend({
    statics: {
        TYPE: 'square'
    },

    options: {
        shapeOptions: {
            stroke: true,
            color: '#3388ff',
            weight: 4,
            opacity: 0.5,
            fill: true,
            fillColor: null, //same as color by default
            fillOpacity: 0.2,
            showArea: true,
            clickable: true
        },
        metric: true // Whether to use the metric measurement system or imperial
    },

    // @method initialize(): void
    initialize: function (map, options) {
        // Save the type so super can fire, need to do this as cannot do this.TYPE :(
        this.type = L.Draw.Square.TYPE;

        this._initialLabelText = L.drawLocal.draw.handlers.square.tooltip.start;

        L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
    },

    _calcNewCoordsSquare: function (startLatLng, finishLatLng) {
        var distance = startLatLng.distanceTo(finishLatLng);
        var radius = distance / (2 * Math.sqrt(2));

        if (!this._tempCircle) {
            this._tempCircle = new L.Circle(startLatLng, { radius: radius });
        } else {
            this._tempCircle.setRadius(radius);
        }

        // add circle to map for get bounds
        this._map.addLayer(this._tempCircle);

        var bounds = this._tempCircle.getBounds();

        // remove circle from map after get bounds
        this._map.removeLayer(this._tempCircle);

        // move coordinate by startPoint
        var northEast = bounds.getNorthEast();

        var dX = Math.abs(northEast.lat - startLatLng.lat);
        var dY = Math.abs(northEast.lng - startLatLng.lng);

        if (finishLatLng.lat >= startLatLng.lat) {
            bounds._northEast.lat += dX;
            bounds._southWest.lat += dX;
        } else {
            bounds._northEast.lat -= dX;
            bounds._southWest.lat -= dX;
        }

        if (finishLatLng.lng >= startLatLng.lng) {
            bounds._northEast.lng += dY;
            bounds._southWest.lng += dY;
        } else {
            bounds._northEast.lng -= dY;
            bounds._southWest.lng -= dY;
        }

        return bounds;
    },

    // @method disable(): void
    disable: function () {
        if (!this._enabled) {
            return;
        }

        this._isCurrentlyTwoClickDrawing = false;
        L.Draw.SimpleShape.prototype.disable.call(this);
    },

    _onMouseUp: function (e) {
        if (!this._shape && !this._isCurrentlyTwoClickDrawing) {
            this._isCurrentlyTwoClickDrawing = true;
            return;
        }

        // Make sure closing click is on map
        if (this._isCurrentlyTwoClickDrawing && !_hasAncestor(e.target, 'leaflet-pane')) {
            return;
        }

        L.Draw.SimpleShape.prototype._onMouseUp.call(this);
    },

    _drawShape: function (latlng) {
        var newShapeBounds = this._calcNewCoordsSquare(this._startLatLng, latlng);

        if (!this._shape) {
            this._shape = new L.Rectangle(newShapeBounds, this.options.shapeOptions);
            this._map.addLayer(this._shape);
        } else {
            this._shape.setBounds(newShapeBounds);
        }
    },

    _fireCreatedEvent: function () {
        var rectangle = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions);
        L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, rectangle);
    },

    _getTooltipText: function () {
        var tooltipText = L.Draw.SimpleShape.prototype._getTooltipText.call(this),
            shape = this._shape,
            showArea = this.options.showArea,
            latLngs, area, subtext;

        if (shape) {
            latLngs = this._shape._defaultShape ? this._shape._defaultShape() : this._shape.getLatLngs();
            area = L.GeometryUtil.geodesicArea(latLngs);
            subtext = showArea ? L.GeometryUtil.readableArea(area, this.options.metric) : '';
        }

        return {
            text: tooltipText.text,
            subtext: subtext
        };
    }
});

function _hasAncestor(el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls)) {
        ;
    }
    return el;
}
