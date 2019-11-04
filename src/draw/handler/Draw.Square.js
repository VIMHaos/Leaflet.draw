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

        this._northEastPixel;
        this._southWestPixel;
        this._check = false;

        this._x1 = 0, this._y1 = 0, this._x2 = 0, this._y2 = 0;

        // this._map.on("mousedown", this._mouseDown);
        // this._map.on("mousemove", this._mouseMove);
        // this._map.on("mouseup", this._mouseUp);
    },

    _reCalc: function () {
        // 1 - vzdy horny lavy
        // 3 - vzdy dolny pravy
        newX1 = Math.min(this._x1, this._x2);
        newY1 = Math.min(this._y1, this._y2);
        newX3 = Math.max(this._x1, this._x2);
        newY3 = Math.max(this._y1, this._y2);

        // 2 - vzdy horny pravy
        // 4 - vzdy dolny lavy
        newX2 = Math.max(this._x1, this._x2);
        newY2 = Math.min(this._y1, this._y2);
        newX4 = Math.min(this._x1, this._x2);
        newY4 = Math.max(this._y1, this._y2);

        var height = newX3 - newX1;

        // ak sa taha smerom dole
        if (this._y2 >= this._y1) {
            this._northEastPixel = this._map.containerPointToLatLng([newX1, newY1]);
            this._southWestPixel = this._map.containerPointToLatLng([newX1 + height, newY1 + height]);
        }
        // ak sa taha smerom hore
        else {
            this._northEastPixel = this._map.containerPointToLatLng([newX3 - height, newY3 - height]);
            this._southWestPixel = this._map.containerPointToLatLng([newX3, newY3]);
        }

    },

    _onMouseDown: function (e) {
        console.log('_mouseDown', e);
        var originalEvent = e.originalEvent;
        this._x1 = originalEvent.clientX;
        this._y1 = originalEvent.clientY;
        this._reCalc();
        this._check = true;
    },

    _onMouseMove: function (e) {
        if (this._check) {
            console.log('_onMouseMove', e);
            this._x2 = originalEvent.clientX;
            this._y2 = originalEvent.clientY;
            this._reCalc();
        }
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
        console.log('_onMouseUp', this._check);
        if (this._check) {
            console.log('_mouseUp', e);
            this._x1 = 0, this._y1 = 0, this._x2 = 0, this._y2 = 0;
            this._check = false;
            return;
        }

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
        if (!this._shape) {
            this._shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
            this._map.addLayer(this._shape);
        } else {
            this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng));
        }
    },

    _fireCreatedEvent: function () {
        // var northEast = map.options.crs.project( this._northEastPixel );
        // var southWest = map.options.crs.project( this._southWestPixel );

        console.log(this._northEastPixel);
        console.log(this._southWestPixel);
        console.log(this._shape.getBounds());

        // var rectangle = new L.polygon(
        //     [[southWestWGS[1], southWestWGS[0]],
        //     [northWestWGS[1], northWestWGS[0]],
        //     [northEastWGS[1], northEastWGS[0]],
        //     [southEastWGS[1], southEastWGS[0]]
        // ], this.options.shapeOptions)

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
