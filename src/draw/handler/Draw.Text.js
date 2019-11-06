L.Draw.Text = L.Draw.Feature.extend({
	statics: {
		TYPE: 'text'
	},
	options: {
		icon: new L.divIcon({
			className:'text-icon',
			html:'text sample'
		}),
		shapeOptions: {
			stroke: true,
			color: 'black',
			weight:3,
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
	},

	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);

		if (this._map) {
			this._tooltip.updateContent({ text: L.drawLocal.draw.handlers.marker.tooltip.start });

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
		var latlng = e.latlng;
		var icon = new L.divIcon({
			className:'text-icon',
			html:document.getElementById('draw-text').value,
			iconAnchor: [-10,-10]
		});

		//this._tooltip.updatePosition(latlng);
		this._mouseMarker.setLatLng(latlng);

		if (!this._marker) {
			this._marker = new L.marker(latlng,{
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
	},

	_onClick: function () {
		this._fireCreatedEvent();

		this.disable();
		if (this.options.repeatMode) {
			this.enable();
		}
	},

	_fireCreatedEvent: function () {
		var content = document.getElementById('draw-text').value;
		var marker = new L.marker(this._marker.getLatLng(), {
			icon: new L.divIcon({
				className:'text-icon',
				html:content,
				iconAnchor: [-10,-10],
			}),
			color: this.options.shapeOptions.color,
			colorCode: this.options.shapeOptions.colorCode,
			fillColor: this.options.shapeOptions.fillColor,
			fillColorCode: this.options.shapeOptions.fillColorCode

		});
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, marker);
	}
});