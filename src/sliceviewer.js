/*!
 * Slice Viewer @VERSION
 *
 * Copyright (c) 2012 Kai Schlamp
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * https://github.com/medihack/sliceviewer
 *
 * Depends:
 *	 jquery.js
 *	 jquery.mousewheel.js
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 *   jquery.ui.mouse.js
 *   jquery.ui.slider.js
 *   jquery.ui.touch-punch.js
 */
(function($, undefined) {

$.widget("neuromia.sliceviewer", {
	options: {
		active: true,
		images: [],
		width: 362,
		height: 434
	},
	
	_create: function() {
		var self = this,
			options = self.options;

		self._createViewer();
	},
	
	_init: function() {
		var self = this,
			options = self.options;

		self.currentSliceNumber = null;

		self._loadImages();

		initialSlice = Math.round(options.images.length / 2);
		self.showSlice(initialSlice);
	},

	_createViewer: function() {
		var self = this,
			options = self.options;

		self.element.addClass("sliceviewer")
		.width(options.width)
		.height(options.height);

		self._createViewport();
		self._createSlider();

		self.glasspane.mousewheel(function(event, delta, deltaX, deltaY) {
			if (delta > 0) {
				if (self.currentSlice < options.images.length - 1) {
					self.showSlice(self.currentSlice + 1);
				}
			}
			else if (delta < 0) {
				if (self.currentSlice > 0) {
					self.showSlice(self.currentSlice - 1);
				}
			}
		});

		self.glasspane.mousemove(function(event) {
			var $this = $(this);
			var x = Math.round(event.pageX - $this.offset().left);
			var y = Math.round(event.pageY - $this.offset().top);
		});
	},

	_createViewport: function() {
		var self = this,
			options = self.options;

		var viewport = $('<div class="viewport">')
		.width(options.width)
		.height(options.height)
		.appendTo(self.element);

		self.stack = $('<div class="stack">')
		.css('background-color', 'black')
		.width(options.width)
		.height(options.height)
		.appendTo(viewport);

		self.glasspane = $('<div class="glasspane">')
		.width(options.width)
		.height(options.height)
		.appendTo(viewport);
	},

	_createSlider: function() {
		var self = this,
			options = self.options;

		var sliderport = $('<div class="sliderport">')
		.height(options.height)
		.appendTo(self.element);

		var max = options.images.length - 1;

		self.slider = $('<div class="slider">')
		.height(options.height - 20)
		.css("top", "11px")
		.appendTo(sliderport)
		.slider({
			orientation: "vertical",
			range: "min",
			min: 0,
			max: max,
			slide: function(event, ui) {
				self.showSlice(ui.value);
			}
		});
	},

	_loadImages: function() {
		var self = this,
			options = self.options;

		var imagesCount = options.images.length;

		var loader = self._createLoader(imagesCount);

		var imagesLoaded = 0;

		for (var i = 0; i < imagesCount; i++) {
			var image = options.images[i];
			$('<img src="' + image + '">')
			.width(options.width)
			.height(options.height)
			.appendTo(self.stack)
			.load(function() {
				imagesLoaded++;
				loader.find(".counter")
				.text(imagesLoaded + "/" + imagesCount);

				if (imagesLoaded === imagesCount) {
					var ret = self._trigger("loadingFinished", null, {
						loader: loader
					});
					
					if (ret) {
						loader.text("Loading finished");
						loader.slideUp("slow");
					}
				}
			});
		}
	},

	_createLoader: function(imagesCount) {
		var self = this,
			options = self.options;

		var loader = $('<div class="loader">')
		.text("Loading images ")
		.append('<span class="counter">0/' + imagesCount + '</span>')
		.hide()
		.width(self.options.width)
		.height(20)
		.offset({
			top: self.element.height(),
			left: 0
		})
		.appendTo(self.element)
		.slideDown("slow");

		return loader;
	},

	showSlice: function(sliceNumber) {
		var self = this,
			options = self.options;

		if (sliceNumber < 0) {
			sliceNumber = 0;
		}

		if (sliceNumber > options.images.length - 1) {
			sliceNumber = options.images.length;
		}

		if (self.currentSliceNumber !== sliceNumber) {
			self.currentSlice = sliceNumber;

			self.stack.find("img.current")
			.removeClass("current");

			self.stack.find("img")
			.eq(sliceNumber)
			.addClass("current");

			if (self.slider.slider("value") != sliceNumber) {
				self.slider.slider("value", sliceNumber);
			}

			self._trigger("sliceChanged", null, {
				sliceNumber: sliceNumber
			});
		}
	},

	destroy: function() {
		var self = this;

		return $.Widget.prototype.destroy.call(self);
	}
});

$.extend($.neuromia.sliceviewer, {
	version: "@VERSION"
});

})(jQuery);
