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

        // this._map.on("mousedown", this._mouseDown);
        // this._map.on("mousemove", this._mouseMove);
        // this._map.on("mouseup", this._mouseUp);
    },

    _calcNewCoordsSquare: function (startLatLng, finishLatLng) {
        var northEastPixel, southWestPixel;

        var newX1 = Math.min(startLatLng.lat, finishLatLng.lat),
            newY1 = Math.min(startLatLng.lng, finishLatLng.lng),
            newX2 = Math.max(startLatLng.lat, finishLatLng.lat),
            newY2 = Math.max(startLatLng.lng, finishLatLng.lng);

        var height = newX2 - newX1;

        // ak sa taha smerom dole
        if (finishLatLng.lng >= startLatLng.lng) {
            northEastPixel = new L.LatLng(newX1, newY1);
            southWestPixel = new L.LatLng(newX1 + height, newY1 + height);
        }
        // ak sa taha smerom hore
        else {
            northEastPixel = new L.LatLng(newX2 - height, newY2 - height);
            southWestPixel = new L.LatLng(newX2, newY2);
        }

        return [northEastPixel, southWestPixel];
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
        var newShape = this._calcNewCoordsSquare(this._startLatLng, latlng);

        console.log('_drawShape', this._startLatLng, latlng);
        console.log('_newShape', newShape[0], newShape[1]);

        if (!this._shape) {
            this._shape = new L.Rectangle(new L.LatLngBounds(newShape[0], newShape[1]), this.options.shapeOptions);
            this._map.addLayer(this._shape);
        } else {
            this._shape.setBounds(new L.LatLngBounds(newShape[0], newShape[1]));
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
