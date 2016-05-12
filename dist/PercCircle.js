/**
 *  Plugin Name: PercCircle
 *  Plugin URL: https://github.com/Fuxy526/PercCircle
 *  Version: 1.0.0
 *  Author: Fuxy526
 *  Author URL: https://github.com/Fuxy526
 *  License: Licensed under MIT
 */

(function() {

	this.PercCircle = function(el, opts) {

		el = (el && typeof el === 'string') ? document.querySelector(el) : el;
		this.el = el;
		this.canvasWidth = this.el.clientWidth * 2;
		this.canvasHeight = this.el.clientHeight * 2;

		// default options
		var defaults = {
			circleScale: 0.7,
			lineWidth: 14,
			hoverEffect: true,
			hoverLineWidth: null,
			pointer: true,
			showName: true,
			showValue: false,
			showPercent: true,
			fontFamily: 'Microsoft Yahei',
			fontSize: 14,
			bold: true,
			animate: true,
			animateTime: 500,
			data: []  // type: array 
					//sub options: name, value, color 
		};

		// replace defaut options with costomized options
		if (opts && typeof opts === 'object') {
			extendDefaults(defaults, opts);
		}
		this.options = defaults;

		// no data alert
		if (this.options.data.length === 0) {
			throw new Error('No data...');
		};

		this.radius = this.canvasHeight < this.canvasWidth ? this.canvasHeight / 2 : this.canvasWidth / 2;
		this.radius = this.radius * this.options.circleScale;
		this.lineWidth = this.options.lineWidth * 2;
		this.hoverLineWidth = this.options.hoverLineWidth ? this.options.hoverLineWidth * 2 : this.lineWidth + 8;
		this.fontSize = this.options.fontSize * 2;

	};

	PercCircle.prototype.init = function() {
		createCanvas.call(this);
		calculateParams.call(this);
		if (this.options.animate) {
			animateCircle.call(this);
		}
		else {
			drawCircle.call(this);
		}
		if (this.options.hoverEffect) {
			hoverEffect.call(this);
		}
	}

	function extendDefaults(src, props) {
		for (var prop in props) {
			if (src.hasOwnProperty(prop)) {
				src[prop] = props[prop];
			}
		}
	}

	function createCanvas() {
		var wrapperHeight = this.el.clientHeight;
		var wrapperWidth = this.el.clientWidth;
		this.canvas = document.createElement('canvas');
		this.canvas.style.height = wrapperHeight + 'px';
		this.canvas.style.width = wrapperWidth + 'px';
		this.canvas.height = this.canvasHeight;
		this.canvas.width = this.canvasWidth;
		this.el.appendChild(this.canvas);
		this.context = this.canvas.getContext('2d');
	}

	function calculateParams() {
		var data = this.options.data;
		var sum = 0;
		var prevSumAngle = 0;
		var prevSumPercent = 0;
		var i, j, k;
		for (i in data) {
			sum = sum + data[i].value;
		}
		for (j in data) {
			data[j].percent = data[j].value / sum;
			data[j].sumPercent = data[j].percent + prevSumPercent;
			data[j].angle = data[j].percent * 360;
			data[j].maxAngle = data[j].angle + prevSumAngle;
			data[j].minAngle = prevSumAngle;
			prevSumAngle = data[j].maxAngle;
			prevSumPercent = data[j].percent;
		}
	}

	function drawCircle() {
		for (var i = 0; i < this.options.data.length; i++) {
			this.context.beginPath();
			this.context.arc(this.canvasWidth/2, this.canvasHeight/2, this.radius, this.options.data[i].minAngle / 180 * Math.PI - 0.5 * Math.PI,  this.options.data[i].maxAngle / 180 * Math.PI - 0.5 * Math.PI);
			this.context.lineWidth = this.lineWidth;
			this.context.strokeStyle = this.options.data[i].color && typeof this.options.data[i].color === 'string' ? this.options.data[i].color : '#ddd';
			this.context.stroke();
		}
	}

	function drawPartCircle(index) {
		this.context.beginPath();
		this.context.arc(this.canvasWidth/2, this.canvasHeight/2, this.radius, this.options.data[index].minAngle / 180 * Math.PI - 0.5 * Math.PI,  this.options.data[index].maxAngle / 180 * Math.PI - 0.5 * Math.PI);
		this.context.lineWidth = this.hoverLineWidth;
		this.context.strokeStyle = this.options.data[index].color && typeof this.options.data[index].color === 'string' ? this.options.data[index].color : '#ddd';
		this.context.stroke();
	}

	function animateCircle() {
		var _ = this;
		var i = 0;
		var speed = 2 / (_.options.animateTime / 20);
		var d = 0;
		var timeIntv = [];
		timeIntv[i] = setInterval(function() {
			_.context.beginPath();
			_.context.arc(_.canvasWidth/2, _.canvasHeight/2, _.radius, _.options.data[i].minAngle / 180 * Math.PI - 0.5 * Math.PI,  (_.options.data[i].minAngle / 180 + d) * Math.PI - 0.5 * Math.PI);
			_.context.lineWidth = _.lineWidth;
			_.context.strokeStyle = _.options.data[i].color && typeof _.options.data[i].color === 'string' ? _.options.data[i].color : '#ddd';
			_.context.stroke();
			if (d >= 2 * _.options.data[i].percent) {
				d = 0;
				clearInterval(timeIntv[i]);
				i++;
				if (i < _.options.data.length) {
					timeIntv[i] = setInterval(arguments.callee, 20);
				}
				else {
					drawCircle.call(_);
				}
			}
			d = d + speed;
		}, 20);
	}

	function hoverEffect() {
		var _ = this;
		var xc = this.canvasWidth / 4;
		var yc = this.canvasHeight / 4;
		var rmax = (this.radius + this.options.lineWidth) / 2;
		var rmin = (this.radius - this.options.lineWidth) / 2;
		var rhmax = (this.radius + this.options.hoverLineWidth) / 2;
		var rhmin = (this.radius - this.options.hoverLineWidth) / 2;
		var activeIndex = null;

		this.canvas.addEventListener('mousemove', function(e) {
			var x = e.clientX - this.offsetLeft;
			var y = e.clientY - this.offsetTop;
			var dx = x - xc;
			var dy = y - yc;
			if (Math.abs(dx*dx) + Math.abs(dy*dy) >= rmin*rmin && Math.abs(dx*dx) + Math.abs(dy*dy) <= rmax*rmax) {
				if (_.options.pointer) {
					_.canvas.style.cursor = 'pointer';
				}
				for (var l = 0; l < _.options.data.length; l++) {
					if (calculateAngle(dx,-dy) >= _.options.data[l].minAngle && calculateAngle(dx,-dy) < _.options.data[l].maxAngle) {
						if (activeIndex !== l) {
							activeIndex = l;
							_.context.clearRect(0,0,_.canvasWidth,_.canvasHeight);
							drawCircle.call(_);
							drawPartCircle.call(_, l);
							_.context.font = _.options.bold ? 'bold ' + _.fontSize + 'px ' + _.options.fontFamily : _.fontSize + 'px ' + _.options.fontFamily;
							_.context.fillStyle = _.options.data[l].color;
							_.context.textAlign = 'center';
							_.context.textBaseline = 'middle';
							_.context.fillText((_.options.showName ? _.options.data[l].name + ' ' : '') + (_.options.showValue ? _.options.data[l].value + ' ' : '') + (_.options.showPercent ? Math.round(_.options.data[l].percent * 1000)/10 + '%' : ''), _.canvasWidth / 2, _.canvasHeight / 2);
						}
					}
				}
			}
			else if (Math.abs(dx*dx) + Math.abs(dy*dy) < rhmin*rhmin || Math.abs(dx*dx) + Math.abs(dy*dy) > rhmax*rhmax) {
				if (_.options.pointer) {
					_.canvas.style.cursor = '';
				}
				_.context.clearRect(0,0,_.canvasWidth,_.canvasHeight);
				drawCircle.call(_);
				activeIndex = null;
			}
		})
	}

	function calculateAngle(x, y) {
		if ((x > 0 && y <= 0) || (x <= 0 && y <= 0)) {
			return Math.atan(x/y) / Math.PI * 180 + 180;
		}
		else if (x < 0 && y > 0) {
			return Math.atan(x/y) / Math.PI * 180 + 360;
		}
		else if (x >= 0 && y > 0) {
			return Math.atan(x/y) / Math.PI * 180;
		}
	}

})();