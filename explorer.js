(function ()
{
	'use strict';

	window.clamp = function(value, min, max)
	{
		if (value < min)
		{
			return min;
		} else if (value > max)
		{
			return max;
		}

		return value;
	};

	window.distance = function(x1, y1, x2, y2)
	{
		return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
	};

	window.r_encode = function(data)
	{
		var output = '';
		var last = data[0];
		var count = 1;

		for (var i = 1; i <= data.length; i++)
		{
			var chr = data[i];

			if (chr != last || i == data.length - 1)
			{
				if (count <= 3)
				{
					for (var j = 0; j < count; j++)
					{
						output += last;
					}
				} else
				{
					var chunk = '!' + count + '*' + last;
					output += chunk;
				}

				last = chr;
				count = 1;
			} else
			{
				count++;
			}
		}

		return output;
	};

	window.r_decode = function(data)
	{
		var output = '';

		for (var i = 0; i < data.length; i++)
		{
			var chr = data[i];

			if (chr == '!')
			{
				var count = '';

				while (i++ < data.length - 1)
				{
					if (data[i] == '*')
					{
						break;
					}

					count += data[i];
				}

				count = parseInt(count);

				if (count == count)
				{
					if (i++ < data.length - 1)
					{
						chr = data[i];
					}

					for (var j = 0; j < count; j++)
					{
						output += chr;
					}
				} else
				{
					alert('parse error');
					break;
				}
			} else
			{
				output += chr;
			}
		}

		return output;
	};

	window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;
	window.hasAnimationFrame = typeof window.requestAnimationFrame != 'undefined';

	window.KEY = { IS_PRESSED: 0, IS_RELEASED: 1, IS_DOWN: 2, IS_UP: 3, SPACE: 32, BACKSPACE: 8, TAB: 9, ENTER: 13, SHIFT: 16, CTRL: 17, ALT: 18, PAUSE: 19, CAPS_LOCK: 20, ESCAPE: 27, PAGE_UP: 33, PAGE_DOWN: 34, END: 35, HOME: 36, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, INSERT: 45, DELETE: 46, 0: 48, 1: 49, 2: 50, 3: 51, 4: 52, 5: 53, 6: 54, 7: 55, 8: 56, 9: 57, A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, WINDOW_LEFT: 91, WINDOW_RIGHT: 92, SELECT_KEY: 93, NUMPAD_0: 96, NUMPAD_1: 97, NUMPAD_2: 98, NUMPAD_3: 99, NUMPAD_4: 100, NUMPAD_5: 101, NUMPAD_6: 102, NUMPAD_7: 103, NUMPAD_8: 104, NUMPAD_9: 105, MULTIPLY: 106, ADD: 107, SUBSTRACT: 109, DECIMAL: 110, DIVIDE: 111, F1: 112, F2: 113, F3: 114, F4: 115, F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123, NUM_LOCK: 144, SCROLL_LOCK: 145, SEMI_COLON: 186, EQUAL: 187, COMMA: 188, DASH: 189, PERIOD: 190, SLASH: 191, BRACKET_OPEN: 219, BACKSLASH: 220, BRACKET_CLOSE: 221, QUOTE: 222, MOUSE_LEFT: 0, MOUSE_RIGHT: 1, MOUSE_WHEEL_UP: 2, MOUSE_WHEEL_DOWN: 3 };
	window.CHAR = [{ 32: ' ', 222: '\'', 188: ',', 189: '-', 190: '.', 191: '/', 48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 56: '8', 57: '9', 186: ';', 65: 'a', 66: 'b', 67: 'c', 68: 'd', 69: 'e', 70: 'f', 71: 'g', 72: 'h', 73: 'i', 74: 'j', 75: 'k', 76: 'l', 77: 'm', 78: 'n', 79: 'o', 80: 'p', 81: 'q', 82: 'r', 83: 's', 84: 't', 85: 'u', 86: 'v', 87: 'w', 88: 'x', 89: 'y', 90: 'z', 219: '[', 187: '=', 221: ']' }, { 32: ' ', 222: '"', 188: '<', 189: '_', 190: '>', 191: '?', 48: ')', 49: '!', 50: '@', 51: '#', 52: '$', 53: '%', 54: '^', 55: '&', 56: '*', 57: '(', 186: ':', 65: 'A', 66: 'B', 67: 'C', 68: 'D', 69: 'E', 70: 'F', 71: 'G', 72: 'H', 73: 'I', 74: 'J', 75: 'K', 76: 'L', 77: 'M', 78: 'N', 79: 'O', 80: 'P', 81: 'Q', 82: 'R', 83: 'S', 84: 'T', 85: 'U', 86: 'V', 87: 'W', 88: 'X', 89: 'Y', 90: 'Z', 219: '{', 187: '+', 221: '}' }];

	window.Input = (function(self)
	{
		self = function(options)
		{
			var self = this;

			self.canvas = options.canvas;
			self.keys = [];
			self.offset = { x: 0, y: 0 };
			self.mouse = { x: 0, y: 0, wheel: { up: false, down: false }, button: []};

			self.listen('mousemove', window, self.mousemove_event.bind(self, false));

			for (var i = 0; i < 2; i++)
			{
				self.mouse.button[i] = { down: false, up: false, state: KEY.IS_RELEASED };
			}

			self.listen('mousedown', window, self.mousedown_event.bind(self, false));

			self.listen('mouseup', window, self.mouseup_event.bind(self, false));

			self.listen('contextmenu', window, function(e)
			{
				e.preventDefault();
			});

			self.listen('mousewheel', window, self.mousewheel_event.bind(self, false));

			for (var i = 0; i < 255; i++)
			{
				self.keys[i] = { down: false, up: false, state: KEY.IS_RELEASED, once: false };
			}

			self.listen('keydown', window, self.keydown_event.bind(self, false));

			self.listen('keyup', window, self.keyup_event.bind(self, false));

			return self;
		};

		self.prototype.listen = function(event, element, callback)
		{
			if (element.addEventListener)
			{
				element.addEventListener(event, callback, false);
			} else if (element.attachEvent)
			{
				element.attachEvent('on' + event, callback);
			}
		};

		self.prototype.trigger = function(event, element)
		{
			if (typeof(element[event]) == 'function')
			{
				element[event]();
			}
		};

		self.prototype.mousemove_event = function(e)
		{
			var self = this;

			e = e || window.event;

			if (e.pageX || e.pageY)
			{
				self.mouse.x = e.pageX;
				self.mouse.y = e.pageY;
			} else
			{
				self.mouse.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				self.mouse.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			}

			self.offset.x = self.canvas.offsetParent.offsetLeft;
			self.offset.y = self.canvas.offsetParent.offsetTop;

			self.mouse.x -= self.canvas.offsetLeft;
			self.mouse.y -= self.canvas.offsetTop;
		};

		self.prototype.mousedown_event = function(e)
		{
			var self = this;

			e = e || window.event;

			if (e.which)
			{
				self.mouse.button[0].down = (e.which == 1);
				self.mouse.button[1].down = (e.which == 3);
			} else if (e.button)
			{
				self.mouse.button[0].down = (e.button == 0);
				self.mouse.button[1].down = (e.button == 2);
			}

			for (var i = 0; i < 2; i++)
			{
				if (self.mouse.button[i].down)
				{
					self.mouse.button[i].state = KEY.IS_PRESSED;
				}
			}
		};

		self.prototype.mouseup_event = function(e)
		{
			var self = this;

			e = e || window.event;

			if (e.which)
			{
				self.mouse.button[0].up = (e.which == 1);
				self.mouse.button[1].up = (e.which == 3);
			} else if (e.button)
			{
				self.mouse.button[0].up = (e.button == 0);
				self.mouse.button[1].up = (e.button == 2);
			}

			for (var i = 0; i < 2; i++)
			{
				if (self.mouse.button[i].up)
				{
					self.mouse.button[i].state = KEY.IS_RELEASED;
				}
			}
		};

		self.prototype.mousewheel_event = function(e)
		{
			var self = this;
			var delta = 0;

			self.mouse.wheel.up = false;
			self.mouse.wheel.down = false;

			e = e || window.event;

			if (e.wheelDelta)
			{
				delta = event.wheelDelta / 120;

				if (window.opera)
				{
					delta = -delta;
				}
			} else if (e.detail)
			{
				delta = -e.detail / 3;
			}

			if (delta > 0)
			{
				self.mouse.wheel.up = true;
			} else if (delta < 0)
			{
				self.mouse.wheel.down = true;
			}
		};

		self.prototype.keydown_event = function(e)
		{
			var self = this;

			e = e || window.event;

			if ( ! self.keys[e.keyCode].once)
			{
				self.keys[e.keyCode].down = true;
				self.keys[e.keyCode].state = KEY.IS_PRESSED;
				self.keys[e.keyCode].once = true;
			}
		};

		self.prototype.keyup_event = function(e)
		{
			var self = this;

			e = e || window.event;

			self.keys[e.keyCode].up = true;
			self.keys[e.keyCode].once = false;
			self.keys[e.keyCode].state = KEY.IS_RELEASED;
		};

		self.prototype.keycode = function(key)
		{
			for (var k in CHAR[0])
			{
				if (CHAR[0][k] == key)
				{
					return k;
				}
			}

			return;
		};

		self.prototype.keydown = function(key)
		{
			var self = this;

			if (typeof key == 'string')
			{
				key = self.keycode(key);
			}

			if (typeof self.keys[key] != 'undefined')
			{
				if (self.keys[key].down)
				{
					return true;
				}
			}

			return false;
		};

		self.prototype.keyup = function(key)
		{
			var self = this;

			if (typeof key == 'string')
			{
				key = self.keycode(key);
			}

			if (typeof self.keys[key] != 'undefined')
			{
				if (self.keys[key].up)
				{
					return true;
				}
			}

			return false;
		};

		self.prototype.keypressed = function(key)
		{
			var self = this;

			if (typeof key == 'string')
			{
				key = self.keycode(key);
			}

			if (typeof self.keys[key] != 'undefined')
			{
				if (self.keys[key].state == KEY.IS_PRESSED)
				{
					return true;
				}
			}

			return false;
		};

		self.prototype.mousedown = function(button)
		{
			var self = this;

			if (self.mouse.button[button].down)
			{
				return true;
			}

			return false;
		};

		self.prototype.mouseup = function(button)
		{
			var self = this;

			if (self.mouse.button[button].up)
			{
				return true;
			}

			return false;
		};

		self.prototype.mousepressed = function(button)
		{
			var self = this;

			if (self.mouse.button[button].state == KEY.IS_PRESSED)
			{
				return true;
			}

			return false;
		};

		self.prototype.mousewheelup = function()
		{
			var self = this;

			return self.mouse.wheel.up;
		};

		self.prototype.mousewheeldown = function()
		{
			var self = this;

			return self.mouse.wheel.down;
		};

		self.prototype.mousepos = function(relative)
		{
			var self = this;

			return { x: self.mouse.x - (relative ? self.offset.x : 0), y: self.mouse.y - (relative ? self.offset.y : 0) };
		};

		self.prototype.update = function()
		{
			var self = this;

			self.mouse.wheel.down = false;
			self.mouse.wheel.up = false;

			for (var i = 0; i < 2; i++)
			{
				self.mouse.button[i].down = false;
				self.mouse.button[i].up = false;
			}

			for (var i = 0; i < 255; i++)
			{
				self.keys[i].down = false;
				self.keys[i].up = false;
			}
		};

		return self;
	}(window.Input || {}));

	window.Loop = (function(self)
	{
		self = function(options)
		{
			var self = this;

			self.min_fps = 60;
			self.max_fps = 60;
			self.limit = 0;
			self.ticks = 0;
			self.frame = 0;
			self.last_time = window.performance.now();
			self.update_callback = false;
			self.render_callback = false;
			self.update_id = 0;
			self.render_id = 0;
			self.running = true;
			self.events = [];
			self.event_count = 0;

			return self;
		};

		self.prototype.request_update = function(callback)
		{
			self.update_id = setTimeout(callback, 1000 / 60);
		};

		self.prototype.request_render = function(callback)
		{
			if (window.hasAnimationFrame)
			{
				self.render_id = window.requestAnimationFrame(callback);
			} else
			{
				self.render_id = setTimeout(callback, 1000 / 60);
			}
		};

		self.prototype.update_frame = function()
		{
			var self = this;

			if (self.running)
			{
				var time = window.performance.now();
				var diff = time - self.last_time;
				self.last_time = time;

				self.request_update(self.update_frame.bind(self));

				var fps = 1000 / diff;

				self.frame += diff;
				var max_frames = Math.floor(self.frame);

				for (var i = 1, frames = Math.min(self.limit, max_frames); i <= frames; i += 1)
				{
					if (self.update_callback)
					{
						self.update_callback();
					}

					for (var j = self.event_count - 1; j >= 0; j--)
					{
						var mod1 = self.ticks - self.events[j].start + 1;
						var mod2 = self.events[j].time + (self.events[j].time_var > 0 ? Math.floor(Math.random() * self.events[j].time_var) : 0);

						var mod = mod1 / mod2;

						if (parseInt(mod1) % parseInt(mod2) == 0)
						{
							self.events[j].callback();

							if (self.events[j].limit > 0)
							{
								self.events[j].count++;

								if (self.events[j].count >= self.events[j].limit)
								{
									self.events[j] = self.events[self.event_count - 1];
									self.event_count--;
								}
							}
						}
					}

					self.ticks += 1;
				}

				self.frame -= max_frames;
			}
		};

		self.prototype.render_frame = function()
		{
			var self = this;

			if (self.running)
			{
				self.request_render(self.render_frame.bind(self));

				if (self.render_callback)
				{
					self.render_callback();
				}
			}
		};

		self.prototype.init = function(update_callback, render_callback)
		{
			var self = this;

			self.update_callback = update_callback;
			self.render_callback = render_callback;

			self.start();
		};

		self.prototype.stop = function()
		{
			var self = this;

			self.running = false;

			clearTimeout(self.update_id);

			if (window.hasAnimationFrame)
			{
				window.cancelAnimationFrame(self.render_id);
			} else
			{
				clearTimeout(self.render_id);
			}

		};

		self.prototype.start = function()
		{
			var self = this;

			self.running = true;

			self.limit = Math.ceil(self.max_fps / self.min_fps);
			self.last_time = window.performance.now();

			self.request_update(self.update_frame.bind(self));
			self.request_render(self.render_frame.bind(self));
		};

		self.prototype.on_timer = function(time, time_var, limit, callback)
		{
			var self = this;

			self.events[self.event_count] =
			{
				start: self.ticks,
				time: time,
				timer_var: time_var,
				limit: limit,
				count: 0,
				callback: callback
			};

			self.event_count++;
		};

		return self;
	}(window.Loop || {}));

	window.Bitmap = (function(self)
	{
		self = function(options)
		{
			var self = this;

			self.canvas = options.canvas || document.createElement('canvas');

			self.ctx = options.context || self.canvas.getContext('2d', { antialias: false });
			self.width = options.width || (options.image ? options.image.width : 640);
			self.height = options.height || (options.image ? options.image.height : 480);
			self.canvas.width = self.width;
			self.canvas.height = self.height;

			if (options.image)
			{
				if (options.image instanceof Image)
				{
					self.ctx.drawImage(options.image, 0, 0);
				} else
				{
					self.ctx.drawImage(options.image.get_canvas(), 0, 0);
				}

				self.data = self.ctx.getImageData(0, 0, self.width, self.height);
			} else
			{
				self.data = self.ctx.createImageData(self.width, self.height);
			}

			return self;
		};

		self.prototype.load = function(path)
		{
			var self = this;
		};

		self.prototype.get = function(x, y)
		{
			var self = this;
			var data = self.data.data;
			x = Math.floor(x);
			y = Math.floor(y);

			if (x < 0 || y < 0 || x > self.data.width || y > self.data.height)
			{
				return [ 0, 0, 0, 0 ];
			}

			var offset = (y * self.data.width + x) * 4;
			var r = offset;
			var g = offset + 1;
			var b = offset + 2;
			var a = offset + 3;

			return [ data[r], data[g], data[b], data[a] ];
		};

		self.prototype.set = function(x, y, r, g, b, a)
		{
			var self = this;
			var data = self.data.data;
			x = Math.floor(x);
			y = Math.floor(y);

			var is_array = typeof r == 'array' || typeof r == 'object';

			var _r = is_array ? r[0] : r;
			var _g = is_array ? r[1] : g;
			var _b = is_array ? r[2] : b;
			var _a = is_array ? r[3] : a;

			var offset = (y * self.data.width + x) * 4;

			data[offset] = _r;
			data[offset + 1] = _g;
			data[offset + 2] = _b;
			data[offset + 3] = _a;
		};

		self.prototype.update = function()
		{
			var self = this;

			self.ctx.putImageData(self.data, 0, 0);
		};

		self.prototype.noise = function(alpha)
		{
			var self = this;
			var data = self.data.data;

			var alpha1 = 1 - alpha;

			var rl = Math.round(self.width * 3.73);
			var randoms = new Array(rl);

			for (var i = 0; i < rl; i++)
			{
				randoms[i] = Math.random() * alpha + alpha1;
			}

			for (var i = 0, il = data.length; i < il; i += 4)
			{
				if (data[i] > 0)
				{
					data[i + 0] = (data[i + 0] * randoms[i % rl]) | 0;
					data[i + 1] = (data[i + 1] * randoms[i % rl]) | 0;
					data[i + 2] = (data[i + 2] * randoms[i % rl]) | 0;
				}
			}

			self.update();
		};

		self.prototype.get_canvas = function()
		{
			var self = this;

			return self.canvas;
		};

		self.prototype.get_context = function()
		{
			var self = this;

			return self.ctx;
		};

		self.prototype.get_data = function()
		{
			var self = this;

			return self.data;
		};

		self.prototype.to_image = function()
		{
			var self = this;
			var image = new Image();

			image.src = self.canvas.toDataURL();

			return image;
		};

		return self;
	}(window.Bitmap || {}));

	window.Mask = (function(self)
	{
		self = function(options)
		{
			var self = this;

			self.create(options.width, options.height);

			return self;
		};

		self.prototype.create = function(width, height)
		{
			var self = this;

			self.data = [];
			self.width = width || 640;
			self.height = height || 480;

			for (var i = 0; i < self.width * self.height; i++)
			{
				self.data.push(0);
			}
		};

		self.prototype.from_string = function(string, width, height, callback)
		{
			var self = this;

			self.create(width, height);

			var data = r_decode(string);

			var lines = data.match(new RegExp('.{1,' + width + '}', 'g'));

			if (self.width == width)
			{
				for (var i = 0; i < lines.length; i++)
				{
					var line = lines[i];

					for (var j = 0; j < line.length; j++)
					{
						var k = parseInt(line[j]);

						if (typeof callback != 'undefined')
						{
							if (callback(self, j, i, k) === true)
							{
								self.set(j, i, k);
							}
						} else
						{
							self.set(j, i, k);
						}
					}
				}
			} else
			{
				alert('self.width != width');
			}
		};

		self.prototype.to_string = function()
		{
			var self = this;

			return r_encode(self.data);
		};

		self.prototype.from_image = function(image, color_map, callback)
		{
			var self = this;

			self.create(image.width, image.height);

			if (typeof image == 'object' && typeof image.update == 'function')
			{
				image.update();

				for (var i = 0; i < image.height; i++)
				{
					for (var j = 0; j < image.width; j++)
					{
						var c = image.get(j, i);
						delete c[3];
						c = c.join(',');

						for (var k = 0; k < color_map.length; k++)
						{
							if (color_map[k].substring(0, c.length) == c)
							{
								if (typeof callback != 'undefined')
								{
									if (callback(self, j, i, k) === true)
									{
										self.set(j, i, k);
									}
								} else
								{
									self.set(j, i, k);
								}

								break;
							}
						}
					}
				}
			} else
			{
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d', { antialias: false });

				canvas.width = image.width;
				canvas.height = image.height;

				ctx.drawImage(image, 0, 0);
				var data = ctx.getImageData(0, 0, image.width, image.height);

				for (var i = 0; i < image.height; i++)
				{
					for (var j = 0; j < image.width; j++)
					{
						var offset = (i * image.width + j) * 4;
						var r = offset;
						var g = offset + 1;
						var b = offset + 2;
						var a = offset + 3;

						var c = [ data.data[r], data.data[g], data.data[b] ].join(',');

						for (var k = 0; k < color_map.length; k++)
						{
							if (color_map[k].substring(0, c.length) == c)
							{
								if (typeof callback != 'undefined')
								{
									if (callback(self, j, i, k) === true)
									{
										self.set(j, i, k);
									}
								} else
								{
									self.set(j, i, k);
								}


								break;
							}
						}
					}
				}
			}
		};

		self.prototype.to_image = function(color_map)
		{
			var self = this;

			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d', { antialias: false });

			canvas.width = self.width;
			canvas.height = self.height;

			var data = ctx.createImageData(self.width, self.height);

			for (var i = 0; i < self.height; i++)
			{
				for (var j = 0; j < self.width; j++)
				{
					var offset = (i * self.width + j) * 4;
					var r = offset;
					var g = offset + 1;
					var b = offset + 2;
					var a = offset + 3;

					var index = self.get(j, i);

					var pixel = color_map[index];

					if (typeof pixel != 'undefined')
					{
						pixel = pixel.split(',');

						if (parseInt(pixel[3]) > 0)
						{
							data.data[r] = parseInt(pixel[0]);
							data.data[g] = parseInt(pixel[1]);
							data.data[b] = parseInt(pixel[2]);
							data.data[a] = parseInt(pixel[3]);
						}
					}
				}
			}

			ctx.clearRect(0, 0, self.width, self.height);
			ctx.putImageData(data, 0, 0);

			var image = new Image();

			image.src = canvas.toDataURL();

			return image;
		};

		self.prototype.get = function(x, y)
		{
			var self = this;
			x = Math.floor(x);
			y = Math.floor(y);

			return self.data[x + (y * self.width)];
		};

		self.prototype.set = function(x, y, c)
		{
			var self = this;
			x = Math.floor(x);
			y = Math.floor(y);

			self.data[x + (y * self.width)] = c;
		};

		return self;
	}(window.Mask || {}));

	window.Layer = (function(self)
	{
		self = function(options)
		{
			var self = this;

			self.webgl = false;
			self.data = {};
			self.width = options.width || 640;
			self.height = options.height || 480;

			self.canvas = options.canvas || document.createElement('canvas');
			self.canvas.width = self.width;
			self.canvas.height = self.height;

			self.ctx = null;

			if (options.context2d || ! window.WebGLRenderingContext)
			{
				self.ctx = self.canvas.getContext('2d', { antialias: false });
				self.ctx.imageSmoothingEnabled = self.ctx.mozImageSmoothingEnabled = self.ctx.webkitImageSmoothingEnabled = false;
				self.webgl = false;

				self.font_indices =
				[
					[ 0, 0 ], // 0
					[ 1, 0 ], // 1
					[ 2, 0 ], // 2
					[ 3, 0 ], // 3
					[ 4, 0 ], // 4
					[ 0, 1 ], // 5
					[ 1, 1 ], // 6
					[ 2, 1 ], // 7
					[ 3, 1 ], // 8
					[ 4, 1 ], // 9
					[ 0, 2 ], // 10
					[ 1, 2 ], // 11
					[ 2, 2 ], // 12
					[ 3, 2 ], // 13
					[ 4, 2 ], // 14
					[ 0, 3 ], // 15
					[ 1, 3 ], // 16
					[ 2, 3 ], // 17
					[ 3, 3 ], // 18
					[ 4, 3 ], // 19
					[ 0, 4 ], // 20
					[ 1, 4 ], // 21
					[ 2, 4 ], // 22
					[ 3, 4 ], // 23
					[ 4, 4 ] // 24
				];

				self.font_letters =
				{
					'a': '0,1,2,3,4,5,9,10,11,12,13,14,15,19,20,24',
					'b': '0,1,2,3,5,9,10,11,12,13,14,15,19,20,21,22,23',
					'c': '0,1,2,3,4,5,10,15,20,21,22,23,24',
					'd': '0,1,2,3,5,9,10,14,15,19,20,21,22,23',
					'e': '0,1,2,3,4,5,10,11,12,13,15,20,21,22,23,24',
					'f': '0,1,2,3,4,5,10,11,12,13,15,20',
					'g': '0,1,2,3,4,5,10,12,13,14,15,19,20,21,22,23,24',
					'h': '0,4,5,9,10,11,12,13,14,15,19,20,24',
					'i': '0,1,2,3,4,7,12,17,20,21,22,23,24',
					'j': '0,1,2,3,7,12,15,17,20,21,22',
					'k': '0,3,5,7,10,11,15,17,20,23',
					'l': '0,5,10,15,20,21,22,23',
					'm': '0,4,5,6,8,9,10,12,14,15,19,20,24',
					'n': '0,4,5,6,9,10,12,14,15,18,19,20,24',
					'o': '0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24',
					'p': '0,1,2,3,4,5,9,10,11,12,13,14,15,20',
					'q': '0,1,2,3,4,5,9,10,14,15,18,19,20,21,22,23,24',
					'r': '0,1,2,3,4,5,9,10,11,12,13,14,15,18,20,24',
					's': '0,1,2,3,4,5,10,11,12,13,14,19,20,21,22,23,24',
					't': '0,1,2,3,4,7,12,17,22',
					'u': '0,4,5,9,10,14,15,19,20,21,22,23,24',
					'v': '0,4,5,9,11,13,16,18,22',
					'w': '0,4,5,9,10,12,14,15,16,18,19,20,24',
					'x': '0,4,6,8,12,16,18,20,24',
					'y': '0,4,6,8,12,17,22',
					'z': '0,1,2,3,4,8,12,16,20,21,22,23,24',
					'0': '1,2,3,5,9,10,14,15,19,21,22,23',
					'1': '1,2,7,12,17,22',
					'2': '1,2,5,8,12,16,20,21,22,23',
					'3': '0,1,2,3,8,11,12,13,18,20,21,22,23',
					'4': '0,3,5,8,10,11,12,13,18,23',
					'5': '1,2,3,5,10,11,12,13,18,20,21,22,23',
					'6': '0,1,2,3,5,10,11,12,13,15,18,20,21,22,23',
					'7': '0,1,2,3,8,12,16,20',
					'8': '0,1,2,3,5,8,11,12,15,18,20,21,22,23',
					'9': '0,1,2,3,5,8,10,11,12,13,18,20,21,22,23',
					' ': '',
					'.': '23',
					'+': '7,10,11,12,17',
					'/': '3,7,12,17,21',
					'_': '20,21,22,23,24'
				};
			} else
			{
				self.ctx = self.canvas.getContext('webgl') || self.canvas.getContext('experimental-webgl');

				if (self.ctx == null)
				{
					self.ctx = self.canvas.getContext('2d', { antialias: false });
					self.ctx.imageSmoothingEnabled = self.ctx.mozImageSmoothingEnabled = self.ctx.webkitImageSmoothingEnabled = false;
					self.webgl = false;
				} else
				{
					self.init_webgl();
					self.webgl = true;
				}
			}

			return self;
		};

		self.prototype.init_webgl = function()
		{
			var self = this;

			self.vertices = self.ctx.createBuffer();
			self.texture = self.ctx.createBuffer();

			var vertices =
			[
				1, 1, 0,
				0, 1, 0,
				1, 0, 0,
				0, 0, 0
			];

			var coords =
			[
				1, 1,
				0, 1,
				1, 0,
				0, 0
			];

			self.ctx.bindBuffer(self.ctx.ARRAY_BUFFER, self.vertices);
			self.ctx.bufferData(self.ctx.ARRAY_BUFFER, new Float32Array(vertices), self.ctx.STATIC_DRAW);
			self.vertices.count = 4;
			self.vertices.size = 3;

			self.ctx.bindBuffer(self.ctx.ARRAY_BUFFER, self.texture);
			self.ctx.bufferData(self.ctx.ARRAY_BUFFER, new Float32Array(coords), self.ctx.STATIC_DRAW);
			self.texture.count = 4;
			self.texture.size = 2;

			var shaders =
			{
				vertex:
				[
					'attribute vec3 aVertexPosition;',
					'attribute vec2 aTextureCoord;',
					'',
					'uniform mat4 uMVMatrix;',
					'uniform mat4 uPMatrix;',
					'',
					'varying vec2 vTextureCoord;',
					'',
					'void main(void) {',
					'	vTextureCoord = aTextureCoord;',
					'	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',
					'}'
				].join('\n'),
				pixel:
				[
					'precision mediump float;',
					'varying vec2 vTextureCoord;',
					'uniform sampler2D uSampler;',
					'',
					'void main(void) {',
					'	gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',
					'}'
				].join('\n')
			};

			var pixel = self.ctx.createShader(self.ctx.FRAGMENT_SHADER);
			self.ctx.shaderSource(pixel, shaders.pixel);
			self.ctx.compileShader(pixel);

			var vertex = self.ctx.createShader(self.ctx.VERTEX_SHADER);
			self.ctx.shaderSource(vertex, shaders.vertex);
			self.ctx.compileShader(vertex);

			self.shader = self.ctx.createProgram();

			self.ctx.attachShader(self.shader, pixel);
			self.ctx.attachShader(self.shader, vertex);
			self.ctx.linkProgram(self.shader);

			self.ctx.useProgram(self.shader);

			self.shader.vertexPositionAttribute = self.ctx.getAttribLocation(self.shader, 'aVertexPosition');
			self.ctx.enableVertexAttribArray(self.shader.vertexPositionAttribute);

			self.shader.texCoordAttribute = self.ctx.getAttribLocation(self.shader, 'aTextureCoord');
			self.ctx.enableVertexAttribArray(self.shader.texCoordAttribute);

			self.shader.pMatrixUniform = self.ctx.getUniformLocation(self.shader, 'uPMatrix');
			self.shader.mvMatrixUniform = self.ctx.getUniformLocation(self.shader, 'uMVMatrix');

			var lr = 1 / (0 - 1);
			var bt = 1 / (1 - 0);
			var nf = 1 / (-1 - 1);

			self.p_matrix = new Float32Array([ -2 * lr, 0, 0, 0, 0, -2 * bt, 0, 0, 0, 0, 2 * nf, 0, (0 + 1) * lr, (0 + 1) * bt, (1 + -1) * nf, 1 ]);
			self.mv_matrix = new Float32Array([ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]);

			self.ctx.bindBuffer(self.ctx.ARRAY_BUFFER, self.vertices);
			self.ctx.vertexAttribPointer(self.shader.vertexPositionAttribute, self.vertices.size, self.ctx.FLOAT, false, 0, 0);

			self.ctx.bindBuffer(self.ctx.ARRAY_BUFFER, self.texture);
			self.ctx.vertexAttribPointer(self.shader.texCoordAttribute, self.texture.size, self.ctx.FLOAT, false, 0, 0);

			self.ctx.uniformMatrix4fv(self.shader.pMatrixUniform, false, self.p_matrix);
			self.ctx.uniformMatrix4fv(self.shader.mvMatrixUniform, false, self.mv_matrix);

			self.init_webgl_texture();
		};

		self.prototype.init_webgl_texture = function()
		{
			var self = this;

			self.texture = self.ctx.createTexture();
			self.ctx.bindTexture(self.ctx.TEXTURE_2D, self.texture);
			self.ctx.texParameteri(self.ctx.TEXTURE_2D, self.ctx.TEXTURE_MAG_FILTER, self.ctx.NEAREST);
			self.ctx.texParameteri(self.ctx.TEXTURE_2D, self.ctx.TEXTURE_MIN_FILTER, self.ctx.NEAREST);
			self.ctx.texParameteri(self.ctx.TEXTURE_2D, self.ctx.TEXTURE_WRAP_S, self.ctx.CLAMP_TO_EDGE);
			self.ctx.texParameteri(self.ctx.TEXTURE_2D, self.ctx.TEXTURE_WRAP_T, self.ctx.CLAMP_TO_EDGE);

			self.ctx.activeTexture(self.ctx.TEXTURE0);
			self.ctx.bindTexture(self.ctx.TEXTURE_2D, self.texture);
			self.ctx.uniform1i(self.ctx.getUniformLocation(self.shader, 'uSampler'), 0);
		};

		self.prototype.update_webgl_texture = function(texture)
		{
			var self = this;

			self.ctx.bindTexture(self.ctx.TEXTURE_2D, self.texture);
			self.ctx.texImage2D(self.ctx.TEXTURE_2D, 0, self.ctx.RGBA, self.ctx.RGBA, self.ctx.UNSIGNED_BYTE, texture);
		};

		self.prototype.render_webgl_texture = function(texture)
		{
			var self = this;

			self.ctx.viewport(0, 0, self.width, self.height);
			self.ctx.clear(self.ctx.COLOR_BUFFER_BIT | self.ctx.DEPTH_BUFFER_BIT);
			self.update_webgl_texture(texture);

			self.ctx.drawArrays(self.ctx.TRIANGLE_STRIP, 0, self.vertices.count);
		};

		self.prototype.get_canvas = function()
		{
			var self = this;

			return self.canvas;
		};

		self.prototype.get_context = function()
		{
			var self = this;

			return self.ctx;
		};

		self.prototype.clear = function()
		{
			var self = this;

			if (self.webgl)
			{
				self.ctx.clear(self.ctx.COLOR_BUFFER_BIT);
				self.ctx.clearColor(0, 0, 0, 1);
			} else
			{
				self.ctx.setTransform(1, 0, 0, 1, 0, 0);
				self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
			}
		};

		self.prototype.push = function()
		{
			var self = this;

			self.ctx.save();
		};

		self.prototype.pop = function()
		{
			var self = this;

			self.ctx.restore();
		};

		self.prototype.fill = function(color)
		{
			var self = this;

			self.ctx.fillStyle = color;
		};

		self.prototype.stroke = function(color)
		{
			var self = this;

			self.ctx.strokeStyle = color;
		};

		self.prototype.color = function(color)
		{
			var self = this;

			self.fill(color);
			self.stroke(color);
		};

		self.prototype.rect = function(x, y, width, height)
		{
			var self = this;

			self.ctx.fillRect(x, y, width || 1, height || 1);
		};

		self.prototype.line = function(x, y, x2, y2, width)
		{
			var self = this;

			self.ctx.beginPath();
			self.ctx.moveTo(x, y);
			self.ctx.lineTo(x2, y2);
			self.ctx.lineWidth = width || 1;
			self.ctx.closePath();
			self.ctx.stroke();
		};

		self.prototype.circle = function(x, y, radius)
		{
			var self = this;

			self.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
			self.ctx.fill();
		};

		/*self.prototype.write = function(x, y, string, size)
		{
			var self = this;

			self.fill('#fff');
			self.ctx.font = 'normal ' + (size || 8) + 'px Arial';
			self.ctx.fillText(string, x, y);
		};*/

		self.prototype.write = function(x, y, str, size, align)
		{
			var self = this;

			str = str.toString().toLowerCase().split('');
			align = align || 0;
			size = size || 1;

			var align_pos = 0;

			if (align == 1)
			{
				align_pos = -(str.length * (size * 6) - size) / 2;
			} else if (align == 2)
			{
				align_pos = -(str.length * (size * 6));
			}

			align_pos = Math.floor(align_pos);

			for (var i = 0; i < str.length; i++)
			{
				var letter = str[i];

				if (letter != ' ')
				{
					if (typeof self.font_letters[letter] != 'undefined')
					{
						var indices = self.font_letters[letter].split(',');

						for (var j = 0; j < indices.length; j++)
						{
							self.rect(align_pos + i * size + x + (self.font_indices[indices[j]][0] * size) + (i * (5 * size)), y + (self.font_indices[indices[j]][1] * size), size, size)
						}
					}
				}
			}
		};

		self.prototype.draw = function(image, x, y)
		{
			var self = this;

			if (self.webgl)
			{
				self.render_webgl_texture(image);
			} else
			{
				if (typeof image == 'object' && typeof image.update == 'function')
				{
					image.update();

					self.ctx.drawImage(image.get_canvas(), x || 0, y || 0, image.width, image.height);
				} else
				{
					self.ctx.drawImage(image, x || 0, y || 0, image.width, image.height);
				}
			}
		};

		self.prototype.frame = function(image, x, y, framex, framey, framesx, framesy, flip)
		{
			var self = this;

			flip = flip || false;

			if ( ! self.webgl)
			{
				var frame_width = image.width / framesx;
				var frame_height = image.height / framesy;

				if (flip)
				{
					self.ctx.save();
					self.ctx.translate(image.width, 0);
					self.ctx.scale(-1, 1);
				}

				if (typeof image == 'object' && typeof image.update == 'function')
				{
					image.update();

					self.ctx.drawImage(image.get_canvas(), framex * frame_width, framey * frame_height, frame_width, frame_height, x, y, frame_width, frame_height);
				} else
				{
					self.ctx.drawImage(image, framex * frame_width, framey * frame_height, frame_width, frame_height, x * (flip ? -1 : 1) + (flip ? image.width - frame_width + 1 : 0), y, frame_width, frame_height);
				}

				if (flip)
				{
					self.ctx.restore();
				}
			}
		};

		self.prototype.translate = function(x, y)
		{
			var self = this;

			self.ctx.translate(x, y);
		};

		self.prototype.init = function(update_callback, render_callback)
		{
			var self = this;

		};

		return self;
	}(window.Layer || {}));

	window.Fluid = (function(self)
	{
		self = function(options)
		{
			var self = this;

			self.level = options.level;
			self.foreground = options.foreground;
			self.material = options.material;
			self.material_index = options.material_index;
			self.width = self.material.width || 640;
			self.height = self.material.height || 480;
			self.fluid = [];
			self.spawn = [];
			self.buffer = new Mask({ width: self.width, height: self.height });
			self.stagnate_index = self.material_index;
			self.flow_index = BACKGROUND_INDEX;

			self.fluid_count = 0;
			self.spawn_count = 0;
			self.speed = options.speed || 1;

			for (var i = 0; i < self.width; i++)
			{
				for (var j = 0; j < self.height; j++)
				{
					if (self.material.get(i, j) == self.material_index)
					{
						if (self.material.get(i + 1, j) == self.material_index && self.material.get(i - 1, j) == self.material_index && self.material.get(i, j + 1) == self.material_index)
						{
							self.buffer.set(i, j, self.material_index);
						} else
						{
							self.fluid[self.fluid_count] =
							{
								x: i,
								y: j,
								dir: 1,
								time: 0,
								death_time: -1,
								remove_all: false,
								matunder: self.material_index,
								color: self.foreground.get(i, j)
							};

							self.fluid_count++;
						}
					}

					// spawns fluid
					if (self.material.get(i, j) == 10)
					{
						self.spawn[self.spawn_count] =
						{
							x: i,
							y: j,
						};

						self.material.set(i, j, SOLID_INDEX);

						self.spawn_count++;
					}
				}
			}

			return self;
		};

		self.prototype.stagnate = function(index)
		{
			var self = this;

			self.buffer.set(self.fluid[index].x, self.fluid[index].y, self.stagnate_index);

			self.fluid[index] = self.fluid[self.fluid_count - 1];
			self.fluid_count--;
		};

		self.prototype.remove = function(index)
		{
			var self = this;

			self.check_hole(self.fluid[index].x, self.fluid[index].y);

			if (self.fluid[index].remove_all || self.material.get(self.fluid[index].x, self.fluid[index].y) != ICE_INDEX)
			{
				self.material.set(self.fluid[index].x, self.fluid[index].y, BACKGROUND_INDEX);
				self.foreground.set(self.fluid[index].x, self.fluid[index].y, [ 0, 0, 0, 0 ]);
			}

			self.fluid[index] = self.fluid[self.fluid_count - 1];
			self.fluid_count--;
		};

		self.prototype.remove_at = function(x, y)
		{
			var self = this;

			self.check_hole(x, y);

			self.material.set(x, y, BACKGROUND_INDEX);
			self.foreground.set(x, y, [ 0, 0, 0, 0 ]);

			for (var i = 0; i < self.fluid_count; i++)
			{
				if (self.fluid[i].x == x && self.fluid[i].y == y)
				{
					self.fluid[i] = self.fluid[self.fluid_count - 1];
					self.fluid_count--;

					break;
				}
			}
		};

		self.prototype.remove_time = function(index, time, remove_all)
		{
			var self = this;

			self.fluid[index].death_time = time;
			self.fluid[index].remove_all = remove_all || false;
		};

		self.prototype.create = function(x, y, dir)
		{
			var self = this;

			self.buffer.set(x, y, 1);

			self.fluid[self.fluid_count] =
			{
				x: x,
				y: y,
				dir: dir,
				time: 0,
				death_time: -1,
				remove_all: false,
				matunder: self.material_index,
				color: self.foreground.get(x, y)
			};

			self.fluid_count++;
		};

		self.prototype.check_fluid = function(index)
		{
			var self = this;

			if (self.buffer.get(self.fluid[index].x + 1, self.fluid[index].y) == self.stagnate_index)
			{
				self.create(self.fluid[index].x + 1, self.fluid[index].y, self.fluid[index].dir);
			}

			if (self.buffer.get(self.fluid[index].x - 1, self.fluid[index].y) == self.stagnate_index)
			{
				self.create(self.fluid[index].x - 1, self.fluid[index].y, self.fluid[index].dir);
			}

			if (self.buffer.get(self.fluid[index].x, self.fluid[index].y - 1) == self.stagnate_index)
			{
				self.create(self.fluid[index].x, self.fluid[index].y - 1, self.fluid[index].dir);
			}
		};

		self.prototype.check_hole = function(x, y)
		{
			var self = this;

			if (self.buffer.get(x + 1, y) == self.stagnate_index)
			{
				self.create(x + 1, y, 1);
			}

			if (self.buffer.get(x - 1, y) == self.stagnate_index)
			{
				self.create(x - 1, y, 1);
			}

			if (self.buffer.get(x, y - 1) == self.stagnate_index)
			{
				self.create(x, y - 1, 1);
			}
		};

		self.prototype.update = function()
		{
			var self = this;

			var o, i, c;
			var ice_color = ICE_COLOR.split(',');


			for (i = 0; i < ice_color.length; i++)
			{
				ice_color[i] = parseInt(ice_color[i]);
			}

			if (self.fluid_count > 0)
			{
				for (o = self.fluid_count - 1; o >= 0; o--)
				{
					c = o;
					i = Math.floor(Math.random() * 20);

					if (i != 0)
					{
						if (self.fluid[c].y + 1 > self.material.height - 1)
						{
							i = -1;
						} else
						{
							i = self.material.get(self.fluid[c].x, self.fluid[c].y + 1);
						}

						if (i == ICE_INDEX && self.material_index == WATER_INDEX)
						{
							var color_var = Math.floor(Math.random() * 13);

							self.remove_time(c, 1);
							self.material.set(self.fluid[c].x, self.fluid[c].y, ICE_INDEX);
							self.foreground.set(self.fluid[c].x, self.fluid[c].y, ice_color[0] - color_var, ice_color[1] - color_var, ice_color[2] - color_var, ice_color[3]);
							self.material.set(self.fluid[c].x, self.fluid[c].y - 1, ICE_INDEX);
							self.foreground.set(self.fluid[c].x, self.fluid[c].y - 1, ice_color[0] - color_var, ice_color[1] - color_var, ice_color[2] - color_var, ice_color[3]);
						} else if (i == LAVA_INDEX && self.material_index == LAVA_INDEX && self.fluid[c].death_time > 0)
						{
							self.remove_time(c, 3, true);
						} else if ((i == OIL_INDEX && self.material_index == WATER_INDEX) || (i == WATER_INDEX && self.material_index == OIL_INDEX))
						{
							for (var j = 0; j < self.level.fluids.length; j++)
							{
								if (self.level.fluids[j].material_index != self.material_index)
								{
									self.level.fluids[j].remove_at(self.fluid[c].x, self.fluid[c].y + 1);
								}
							}

							self.remove(c);
						} else if ((i == LAVA_INDEX && self.material_index == WATER_INDEX) || (i == WATER_INDEX && self.material_index == LAVA_INDEX))
						{
							for (var j = 0; j < self.level.fluids.length; j++)
							{
								if (self.level.fluids[j].material_index != self.material_index)
								{
									self.level.fluids[j].remove_at(self.fluid[c].x, self.fluid[c].y + 1);
								}
							}

							self.level.hole(self.fluid[c].x, self.fluid[c].y + 2, 5, [ BACKGROUND_INDEX, WATER_INDEX, LAVA_INDEX ], DIRT_INDEX);
							self.remove(c);
						} else if (i == BACKGROUND_INDEX)
						{
							self.material.set(self.fluid[c].x, self.fluid[c].y + 1, self.material.get(self.fluid[c].x, self.fluid[c].y));
							self.material.set(self.fluid[c].x, self.fluid[c].y, i);
							self.fluid[c].matunder = i;

							self.foreground.set(self.fluid[c].x, self.fluid[c].y + 1, self.fluid[c].color[0], self.fluid[c].color[1], self.fluid[c].color[2], self.fluid[c].color[3]);
							if (i == BACKGROUND_INDEX)
							self.foreground.set(self.fluid[c].x, self.fluid[c].y, 0, 0, 0, 0);

							if (i != BACKGROUND_INDEX)
							{
								self.remove(c);
								self.level.hole(self.fluid[c].x, self.fluid[c].y + 5, 8, [ WATER_INDEX, LAVA_INDEX ], DIRT_INDEX);

							} else
							{
								self.check_fluid(c);

								self.fluid[c].y++;
								self.fluid[c].time = 0;
							}
						} else
						{
							if (self.fluid[c].x + self.fluid[c].dir > self.material.width - 1)
							{
								i = -1;
							} else if (self.fluid[c].x + self.fluid[c].dir < 0)
							{
								i = -1;
							} else
							{
								i = self.material.get(self.fluid[c].x + self.fluid[c].dir, self.fluid[c].y);
							}

							if (i == ICE_INDEX && self.material_index == WATER_INDEX)
							{
								var color_var = Math.floor(Math.random() * 13);

								self.remove_time(c, 1);
								self.material.set(self.fluid[c].x, self.fluid[c].y, ICE_INDEX);
								self.foreground.set(self.fluid[c].x, self.fluid[c].y, ice_color[0] - color_var, ice_color[1] - color_var, ice_color[2] - color_var, ice_color[3]);
								self.material.set(self.fluid[c].x - self.fluid[c].dir, self.fluid[c].y, ICE_INDEX);
								self.foreground.set(self.fluid[c].x - self.fluid[c].dir, self.fluid[c].y, ice_color[0] - color_var, ice_color[1] - color_var, ice_color[2] - color_var, ice_color[3]);

							} else if (i == ICE_INDEX && self.material_index == LAVA_INDEX)
							{
								loop.on_timer(20, 3, 1, (function(self, x, y) { self.material.set(x, y, BACKGROUND_INDEX); self.foreground.set(x, y, 0, 0, 0, 0); self.material.set(x, y + 1, BACKGROUND_INDEX); self.foreground.set(x, y + 1, 0, 0, 0, 0); self.material.set(x, y - 1, BACKGROUND_INDEX); self.foreground.set(x, y - 1, 0, 0, 0, 0); }).bind(self, self, self.fluid[c].x, self.fluid[c].y));

								self.fluid[c].x += self.fluid[c].dir;
								self.fluid[c].time = 0;
								self.remove_time(c, 10, true);
							} else if ((i == OIL_INDEX && self.material_index == WATER_INDEX) || (i == WATER_INDEX && self.material_index == OIL_INDEX))
							{
								for (var j = 0; j < self.level.fluids.length; j++)
								{
									if (self.level.fluids[j].material_index != self.material_index)
									{
										self.level.fluids[j].remove_at(self.fluid[c].x + self.fluid[c].dir, self.fluid[c].y);
									}
								}

								self.remove(c);
							} else if ((i == LAVA_INDEX && self.material_index == WATER_INDEX) || (i == WATER_INDEX && self.material_index == LAVA_INDEX))
							{
								for (var j = 0; j < self.level.fluids.length; j++)
								{
									if (self.level.fluids[j].material_index != self.material_index)
									{
										self.level.fluids[j].remove_at(self.fluid[c].x + self.fluid[c].dir, self.fluid[c].y);
									}
								}

								self.level.hole(self.fluid[c].x + self.fluid[c].dir * 2, self.fluid[c].y + 5, 8, [ BACKGROUND_INDEX, WATER_INDEX, LAVA_INDEX ], DIRT_INDEX);
								self.remove(c);
							} else if (i == BACKGROUND_INDEX)
							{
								self.material.set(self.fluid[c].x + self.fluid[c].dir, self.fluid[c].y, self.material.get(self.fluid[c].x, self.fluid[c].y));
								self.material.set(self.fluid[c].x, self.fluid[c].y, i);
								self.fluid[c].matunder = i;

								self.foreground.set(self.fluid[c].x + self.fluid[c].dir, self.fluid[c].y, self.fluid[c].color[0], self.fluid[c].color[1], self.fluid[c].color[2], self.fluid[c].color[3]);
								if (i == BACKGROUND_INDEX)
								self.foreground.set(self.fluid[c].x, self.fluid[c].y, 0, 0, 0, 0);

								if (i !== BACKGROUND_INDEX)
								{
									self.remove(c);
									self.level.hole(self.fluid[c].x + self.fluid[c].dir * 5, self.fluid[c].y, 5, [ WATER_INDEX, LAVA_INDEX ], DIRT_INDEX);
								} else
								{
									self.check_fluid(c);

									self.fluid[c].x += self.fluid[c].dir;
									self.fluid[c].time = 0;
								}
							} else
							{
								self.fluid[c].dir = self.fluid[c].dir * -1;
								self.fluid[c].time++;

								if (self.fluid[c].time > 10)
								{
									var g;
									i = 0;

									g = self.material.get(self.fluid[c].x + 1, self.fluid[c].y);

									if (g == BACKGROUND_INDEX && self.buffer.get(self.fluid[c].x + 1, self.fluid[c].y) == self.flow_index)
									{
										i = 1;
									}

									g = self.material.get(self.fluid[c].x - 1, self.fluid[c].y);

									if (g == BACKGROUND_INDEX && self.buffer.get(self.fluid[c].x - 1, self.fluid[c].y) == self.flow_index)
									{
										i = 1;
									}

									if (i == 0)
									{
										self.stagnate(c);
									} else
									{
										self.fluid[c].time = 0;
									}
								}
							}
						}
					}

					if (self.fluid[c].death_time != -1)
					{
						self.fluid[c].death_time--;

						if (self.fluid[c].death_time <= 0)
						{
							self.remove(c);
						}
					}
				}
			}

			for (o = self.spawn_count - 1; o >= 0; o--)
			{
				if (self.buffer.get(self.spawn[o].x, self.spawn[o].y) == self.flow_index)
				{
					self.material.set(self.spawn[o].x, self.spawn[o].y, self.material_index);
					self.buffer.set(self.spawn[o].x, self.spawn[o].y, self.stagnate_index);

					self.create(self.spawn[o].x, self.spawn[o].y, 1);
				}
			}
		};

		return self;
	}(window.Fluid || {}));

	window.Level = (function(self)
	{
		self = function(options)
		{
			var self = this;

			self.levels = [];
			self.level = 0;
			self.next_delay = 0;
			self.end = false;

			if (options instanceof Array)
			{
				self.levels = options;

				if (self.levels[self.level] instanceof Image)
				{
					self.image = self.levels[self.level];
				} else
				{
					self.data = self.levels[self.level];
				}
			} else
			{
				if (typeof options.image != 'undefined')
				{
					self.image = options.image;
				} else
				{
					self.data = options;
				}
			}

			if (typeof self.image != 'undefined')
			{
				self.width = self.image.width;
				self.height = self.image.height;
			} else
			{
				self.width = self.data.width;
				self.height = self.data.height;
			}

			self.generate_parllax();

			self.restart();

			return self;
		};

		self.prototype.generate_parllax = function()
		{
			var self = this;

			var parallax_layer = new Layer( { context2d: true, width: self.width + 50, height: self.height + 50 } );
			parallax_layer.color('#413232');
			parallax_layer.rect(0, 0, self.width + 50, self.height + 50);

			var parallax_bitmap = new Bitmap({ image: parallax_layer, width: self.width + 50, height: self.height + 50 });
			parallax_bitmap.noise(0.1);

			parallax = parallax_bitmap.to_image();
		};

		self.prototype.hole = function(cx, cy, diameter, source, target)
		{
			var self = this;

			var full = (1 << 2);
			var half = (full >> 1);
			var size = (diameter << 2);
			var ray = (size >> 1);
			var dY2;
			var ray2 = ray * ray;
			var posmin,posmax;
			var Y,X;
			var x = (diameter & 1) == 1 ? ray : ray - half;
			var y = half;
			cx -= (diameter>>1);
			cy -= (diameter>>1);
			var color_var = Math.floor(Math.random() * 15);

			for (;; y+=full)
			{
				dY2 = (ray - y) * (ray - y);

				for (;; x-=full)
				{
					if (dY2 + (ray - x) * (ray - x) <= ray2) continue;

					if (x < y)
					{
						Y = (y >> 2);
						posmin = Y;
						posmax = diameter - Y;

						while (Y < posmax)
						{
							for (X = posmin; X < posmax; X++)
							{
								var m = self.material.get(cx+X, cy+Y);

								if ((typeof source == 'object' && source.indexOf(m) >= 0) || source == m)
								{
									self.material.set(cx+X, cy+Y, target);
									self.foreground.set(cx+X, cy+Y, MATERIAL_COLOR[target][0] - color_var, MATERIAL_COLOR[target][1] - color_var, MATERIAL_COLOR[target][2] - color_var, MATERIAL_COLOR[target][3]);

									for (var f = 0; f < self.fluids.length; f++)
									{
										self.fluids[f].check_hole(cx + X, cy + Y);
									}
								}
							}

							Y++;
						}

						return;
					}

					X = (x >> 2) + 1;
					Y = y >> 2;
					posmax = diameter - X;
					var mirrorY = diameter - Y - 1;

					while (X < posmax)
					{
						var m = self.material.get(cx+X, cy+Y);

						if ((typeof source == 'object' && source.indexOf(m) >= 0) || source == m)
						{
							self.material.set(cx+X, cy+Y, target);
							self.foreground.set(cx+X, cy+Y, MATERIAL_COLOR[target][0] - color_var, MATERIAL_COLOR[target][1] - color_var, MATERIAL_COLOR[target][2] - color_var, MATERIAL_COLOR[target][3]);

							for (var f = 0; f < self.fluids.length; f++)
							{
								self.fluids[f].check_hole(cx+X, cy+Y);
							}
						}

						m = self.material.get(cx+X, cy+mirrorY);

						if ((typeof source == 'object' && source.indexOf(m) >= 0) || source == m)
						{
							self.material.set(cx+X, cy+mirrorY, target);
							self.foreground.set(cx+X, cy+mirrorY, MATERIAL_COLOR[target][0] - color_var, MATERIAL_COLOR[target][1] - color_var, MATERIAL_COLOR[target][2] - color_var, MATERIAL_COLOR[target][3]);

							for (var f = 0; f < self.fluids.length; f++)
							{
								self.fluids[f].check_hole(x+X, cy+mirrorY);
							}
						}

						m = self.material.get(cx+Y, cy+X);

						if ((typeof source == 'object' && source.indexOf(m) >= 0) || source == m)
						{
							self.material.set(cx+Y, cy+X, target);
							self.foreground.set(cx+Y, cy+X, MATERIAL_COLOR[target][0] - color_var, MATERIAL_COLOR[target][1] - color_var, MATERIAL_COLOR[target][2] - color_var, MATERIAL_COLOR[target][3]);

							for (var f = 0; f < self.fluids.length; f++)
							{
								self.fluids[f].check_hole(cx+Y, cy+X);
							}
						}

						m = self.material.get(cx+mirrorY, cy+X);

						if ((typeof source == 'object' && source.indexOf(m) >= 0) || source == m)
						{
							self.material.set(cx+mirrorY, cy+X, target);
							self.foreground.set(cx+mirrorY, cy+X, MATERIAL_COLOR[target][0] - color_var, MATERIAL_COLOR[target][1] - color_var, MATERIAL_COLOR[target][2] - color_var, MATERIAL_COLOR[target][3]);

							for (var f = 0; f < self.fluids.length; f++)
							{
								self.fluids[f].check_hole(cx+mirrorY, cy+X);
							}
						}

						X++;
					}

					break;
				}
			}
		};

		self.prototype.update = function()
		{
			var self = this;

			if (self.end)
			{
				return;
			}

			for (var f = 0; f < self.fluids.length; f++)
			{
				self.fluids[f].update();
			}

			if (self.exit != null)
			{
				if (distance(self.exit[0], self.exit[1], player.x + player.vx, player.y + player.vy) < 10)
				{
					if (self.gold.length == player.gold)
					{
						if (self.next_delay == 0)
						{
							message = 'you greedy bastard. you made it...';
							message_timer = 180;

							if (self.levels.length > 0)
							{
								self.next_delay = 120;
							}
						}
					} else
					{
						message = 'dont be stupid. get back and get more gold...';
						message_timer = 180;
					}
				}
			}

			if (self.next_delay > 0)
			{
				self.next_delay--;

				if (self.next_delay == 0)
				{
					if (self.levels.length > 0)
					{
						self.level++;

						if (self.level < self.levels.length)
						{
							if (self.levels[self.level] instanceof Image)
							{
								self.image = self.levels[self.level];
							} else
							{
								self.data = self.levels[self.level];
							}

							self.generate_parllax();

							self.restart();
						} else
						{
							self.end = true;
						}
					}
				}
			}
		};

		self.prototype.render = function(layer)
		{
			var self = this;

			layer.draw(self.foreground);
		};

		self.prototype.pack = function(image)
		{
			var material = new Mask({ width: image.width, height: image.height });

			material.from_image(image,
			[
			 	BACKGROUND_COLOR,
			 	SOLID_COLOR,
			 	DIRT_COLOR,
			 	WATER_COLOR,
			 	LAVA_COLOR,
			 	ICE_COLOR,
			 	OIL_COLOR,
			 	RESPAWN_COLOR,
			 	EXIT_COLOR,
			 	GOLD_COLOR
			]);

			return { width: image.width, height: image.height, data: material.to_string() };
		};

		self.prototype.restart = function()
		{
			var self = this;

			self.next_delay = 0;

			particles = [];
			particle_count = 0;

			self.width = 504;
			self.height = 418;

			if (typeof self.image != 'undefined')
			{
				self.width = self.image.width;
				self.height = self.image.height;
			} else
			{
				self.width = self.data.width;
				self.height = self.data.height;
			}

			self.respawn = null;
			self.exit = null;
			self.gold = [];

			message_timer = 0;

			self.material = new Mask({ width: self.width, height: self.height });

			if (typeof self.image != 'undefined')
			{
				self.material.from_image(self.image,
				[
				 	BACKGROUND_COLOR,
				 	SOLID_COLOR,
				 	DIRT_COLOR,
				 	WATER_COLOR,
				 	LAVA_COLOR,
				 	ICE_COLOR,
				 	OIL_COLOR,
				 	RESPAWN_COLOR,
				 	EXIT_COLOR,
				 	GOLD_COLOR
				], function(material, x, y, index)
				{
					if (index == RESPAWN_INDEX)
					{
						self.respawn = [ x, y ];

						return false;
					} else if (index == EXIT_INDEX)
					{
						self.exit = [ x, y ];

						return false;
					} else if (index == GOLD_INDEX)
					{
						self.gold.push([ x, y ]);

						return false;
					}

					return true;
				});
			} else
			{
				self.material.from_string(self.data.data, self.width, self.height, function(material, x, y, index)
				{
					if (index == RESPAWN_INDEX)
					{
						self.respawn = [ x, y ];

						return false;
					} else if (index == EXIT_INDEX)
					{
						self.exit = [ x, y ];

						return false;
					} else if (index == GOLD_INDEX)
					{
						self.gold.push([ x, y ]);

						return false;
					}

					return true;
				});
			}

			if (self.respawn != null)
			{
				player.respawn(self.respawn[0], self.respawn[1]);
			}

			if (self.exit != null)
			{
				particles[particle_count] = new Particle
				({
					type: PARTICLE_EXIT,
					x: self.exit[0],
					y: self.exit[1]
				});

				particle_count++;
			}

			for (var i = 0; i < self.gold.length; i++)
			{
				particles[particle_count] = new Particle
				({
					type: PARTICLE_GOLD,
					x: self.gold[i][0],
					y: self.gold[i][1]
				});

				particle_count++;
			}

			var material_image = self.material.to_image
			([
				BACKGROUND_COLOR,
			 	SOLID_COLOR,
			 	DIRT_COLOR,
			 	WATER_COLOR,
			 	LAVA_COLOR,
			 	ICE_COLOR,
			 	OIL_COLOR,
			 	RESPAWN_COLOR,
			 	EXIT_COLOR,
			 	GOLD_COLOR
			]);

			self.foreground = new Bitmap({ image: material_image });
			self.foreground.noise(0.1);

			self.fluids = [];

			self.fluids.push(new Fluid({ level: self, foreground: self.foreground, material: self.material, material_index: WATER_INDEX }));
			self.fluids.push(new Fluid({ level: self, foreground: self.foreground, material: self.material, material_index: OIL_INDEX }));
			self.fluids.push(new Fluid({ level: self, foreground: self.foreground, material: self.material, material_index: LAVA_INDEX }));
		};

		return self;
	}(window.Level || {}));

	window.Particle = (function(self)
	{
		self = function(options)
		{
			var self = this;

			self.x = options.x || 0;
			self.y = options.y || 0;
			self.vx = options.vx || 0;
			self.vy = options.vy || 0;
			self.type = options.type || 0;
			self.alive = true;
			self.death_time = options.death_time || 0;
			self.death_time_var = Math.floor(Math.random() * options.death_time_var) || 0;
			self.timer = 0;

			return self;
		};

		self.prototype.shoot = function(type, amount, amount_var, speed, speed_var, motion, distribution, angle_offs, distance_offs)
		{
			var self = this;
			var x = self.x;
			var y = self.y;
			var vx = self.vx;
			var vy = self.vy;
			var angle = -Math.atan2(-vx, -vy) / Math.PI * 180;

			var _amount = amount + (amount_var > 0 ? Math.floor(Math.random() * amount_var) : 0);
			var _distribution = distribution / (amount + 0.0);

			for (var i = 0; i < _amount; i++)
			{
				var _speed = speed + (speed_var > 0 ? (Math.floor(Math.random() * (speed_var * 1000)) / 1000.0) : 0);
				var _angle = angle + angle_offs - 90;
				_angle = _angle - (distribution / 2.0) + (_distribution * i);
				_angle = _angle / 180 * Math.PI;

				var dx = Math.cos(_angle);
				var dy = Math.sin(_angle);

				particles[particle_count] = new Particle(
				{
					x: x + dx * distance_offs,
					y: y + dy * distance_offs,
					vx: (dx * _speed) + (vx * motion),
					vy: (dy * _speed) + (vy * motion),
					type: type
				});

				particle_count++;
			}
		}

		self.prototype.update = function(level)
		{
			var self = this;

			var x = Math.floor(self.x + self.vx);
			var y = Math.floor(self.y + self.vy);

			if (x < 0 || y < 0 || x > level.width - 1 || y > level.height - 1)
			{
				self.alive = false;

				return;
			}

			if (self.type == PARTICLE_BULLET)
			{
				if (self.timer % 5 == 0)
				{
					self.shoot(PARTICLE_SMOKE, 3, 2, 0.3, 0.5, 0, 30, 180, 4);
				}

				var m = level.material.get(x, y);

				if (m == SOLID_INDEX || m == DIRT_INDEX || m == ICE_INDEX)
				{
					self.alive = false;

					particles[particle_count] = new Particle
					({
						type: PARTICLE_EXPLOSION,
						x: self.x,
						y: self.y,
						death_time: 2,
					});

					particle_count++;

					shake_time = shake_time_max;

					level.hole(x, y, 40, DIRT_INDEX, BACKGROUND_INDEX);
				}
			} else if (self.type == PARTICLE_GOLD)
			{
				if (distance(x, y, player.x + player.vx, player.y + player.vy) < 6)
				{
					self.alive = false;
					player.gold++;
				}
			} else if (self.type == PARTICLE_EXIT)
			{

			} else if (self.type == PARTICLE_BLOOD)
			{
				var m = level.material.get(x, y);

				if (m == SOLID_INDEX || m == DIRT_INDEX || m == ICE_INDEX)
				{
					self.alive = false;
					level.foreground.set(x, y, 214, 0, 0, 255);
				}

				self.vy += 0.013;
			} else if (self.type == PARTICLE_EXPLOSION)
			{
				/*if (distance(player.x + player.vx, player.y + player.vy, x, y) <= 15)
				{
					player.die();

					self.alive = false
				}*/
			}

			self.x += self.vx;
			self.y += self.vy;

			self.timer++;

			if (self.type == PARTICLE_SMOKE && self.timer > 25)
			{
				self.alive = false;
			}

			if (self.death_time > 0 && self.timer >= self.death_time + self.death_time_var)
			{
				self.alive = false;
			}
		};

		self.prototype.render = function(layer)
		{
			var self = this;
			var x = Math.floor(self.x + self.vx);
			var y = Math.floor(self.y + self.vy);

			if (self.type == PARTICLE_BULLET)
			{
				layer.stroke('#ffff00');
				layer.line(self.x, self.y, self.x - self.vx / 2, self.y - self.vy / 2, 2);

				layer.stroke('#727272');
				layer.line(self.x, self.y, self.x + self.vx, self.y + self.vy, 2);
			} else if (self.type == PARTICLE_EXPLOSION)
			{
				layer.color('#f1e99d');
				layer.circle(x, y, 15);
			} else if (self.type == PARTICLE_TRAIL)
			{
				layer.fill('#ffff00');
				layer.rect(x, y, 1, 1);
			} else if (self.type == PARTICLE_SMOKE)
			{
				layer.fill('#ccc');
				layer.rect(x, y, 1, 1);
			} else if (self.type == PARTICLE_GOLD)
			{
				layer.color('#ffff00');
				layer.rect(x - 2, y - 2, 4, 4);
			} else if (self.type == PARTICLE_EXIT)
			{
				layer.color('#262626');
				layer.rect(x - 8, y - 10, 16, 20);
			} else if (self.type == PARTICLE_BLOOD)
			{
				layer.color('#d60000');
				layer.rect(x, y, 1, 1);
			}
		};

		return self;
	}(window.Particle || {}));
}());

var PARTICLE_BULLET = 0;
var PARTICLE_EXPLOSION = 1;
var PARTICLE_TRAIL = 2;
var PARTICLE_SMOKE = 3;
var PARTICLE_GOLD = 4;
var PARTICLE_EXIT = 5;
var PARTICLE_BLOOD = 6;

var BACKGROUND_INDEX = 0;
var SOLID_INDEX = 1;
var DIRT_INDEX = 2;
var WATER_INDEX = 3;
var LAVA_INDEX = 4;
var ICE_INDEX = 5;
var OIL_INDEX = 6;
var RESPAWN_INDEX = 7;
var EXIT_INDEX = 8;
var GOLD_INDEX = 9;

var BACKGROUND_COLOR = '0,0,0,0';
var SOLID_COLOR = '93,56,11,255';
//var SOLID_COLOR = '79,47,9,255';
var DIRT_COLOR = '156,93,18,255';
var WATER_COLOR = '38,160,199,100';
var LAVA_COLOR = '207,69,19,200';
var ICE_COLOR = '196,246,255,128';
var OIL_COLOR = '30,30,30,255';
var RESPAWN_COLOR = '0,255,0,255';
var EXIT_COLOR = '0,0,255,255';
var GOLD_COLOR = '255,255,0,255';

var MATERIAL_COLOR =
[
	[ 0, 0, 0, 0 ],
	[ 93, 56, 11, 255 ],
	[ 156, 93, 18, 255 ],
	[ 38, 160, 199, 100 ],
	[ 207, 69, 19, 200 ],
	[ 196, 246, 255, 128 ],
	[ 30, 30, 30, 255 ]
];

var LEVEL_COUNT = 2;
var LEVELS = [];

for (var i = 0; i < LEVEL_COUNT; i++)
{
	var img = new Image();
	img.src = 'level' + (i + 1) + '.png';

	LEVELS.push(img);
}

var parallax = new Image();

var torso = new Image();
torso.src = 'torso.png';
var legs = new Image();
legs.src = 'legs.png';

var state = 'menu';

var intro =
[
	'You are going on a expedition',
	'Collect all the gold you can find and come back',
	'',
	'Use W/S to aim',
	'You can walk using A/D',
	'In case of any need press G to shoot',
	'Hold H to get high',
	'Press R to restart the mission',
	'',
	'Good luck...'
];

var outro =
[
	'Unfortunately that is all...',
	'I could not fit sounds or more levels',
	'However it was fun to code',
	'',
	'Made for js13k compo',
	'',
	'Cheers',
	'wesz'
];

var intro_output = [];
var intro_line = 0;
var intro_delay = 30;
var loop = new Loop();
var particles = [];
var particle_count = 0;
var message = '';
var message_timer = 0;
var shake_ = 0;
var shake_max = 3;
var shake_time = 0;
var shake_time_max = 5;
var level;
var game_layer;
var final_layer;
var input;
var DOWN = 0;
var LEFT = 1;
var UP = 2;
var RIGHT = 3;
var player =
{
	x: 50,
	y: 114,
	vx: 0,
	vy: 0,
	dir: 1,
	frame: 0,
	reacts: [],
	move_left: false,
	move_right: false,
	aim_up: false,
	aim_down: false,
	aim_speed: 0,
	aim_angle: 90,
	jetpack: false,
	jetpack_trail_timer: 0,
	gold: 0,
	alive: true,
	death_timer: 0,
	debug: [],
	check_collision: function(x, y, dir)
	{
		var len = 0;
		var stepx = 0;
		var stepy = 0;
		var bottom = 5;
		var top = -5;
		var left = -5;
		var right = 5;

		var weaponheight = 4;
		var height = 10;
		var width = 6;

		var bottom = weaponheight;
		var top = bottom - height + 1;
		var left = (-width) / 2;
		var right = (width) / 2;

		switch (dir)
		{
			case DOWN:
				x += left;
				y += top;
				stepx = 1;
				stepy = 0;
				len = width;
			break;

			case LEFT:
				x += right;
				y += top + 1;
				stepx = 0;
				stepy = 1;
				len = height - 2;
			break;

			case UP:
				x += left;
				y += bottom;
				stepx = 1;
				stepy = 0;
				len = width;
			break;

			case RIGHT:
				x += left;
				y += top + 1;
				stepx = 0;
				stepy = 1;
				len = height - 2;
			break;

			default:
				return;
			break;
		}

		var mat;

		for (this.reacts[dir] = 0; len > 0; --len)
		{
			mat = level.material.get(x, y);

			if (mat == SOLID_INDEX || mat == DIRT_INDEX || mat == ICE_INDEX)
			{
				++this.reacts[dir];
			}

			if (mat == LAVA_INDEX || mat == OIL_INDEX)
			{
				this.die();
			}

			x += stepx;
			y += stepy;
		}
	},
	update: function()
	{
		if ( ! this.alive || level.next_delay > 0)
		{
			return;
		}

		var bouncelimit = 0.1;
		var gravity = 0.0152;
		var jumpforce = 0.9;
		var maxspeed = 0.8;
		var friction = 0.89;
		var acceleration = 0.065;
		var bouncequotient = 0.1;
		var airfriction = 1;
		var airaccelerationfactor = 0.2;
		var aimfriction = 0.7216648070352077;
		var aimacceleration = 0.5;

		var nextx = this.x + this.vx;
		var nexty = this.y + this.vy;
		var inextx = parseInt(nextx);
		var inexty = parseInt(nexty);

		this.check_collision(inextx, inexty, DOWN);
		this.check_collision(inextx, inexty, LEFT);
		this.check_collision(inextx, inexty, UP);
		this.check_collision(inextx, inexty, RIGHT);

		if (inextx < 5)
		{
			this.reacts[RIGHT] += 5;
		} else if (inextx > level.width - 5)
		{
			this.reacts[LEFT] += 5;
		}

		if (inexty < 5)
		{
			this.reacts[DOWN] += 5;
		} else if (inexty > level.height - 5)
		{
			this.reacts[UP] += 5;
		}

		if (this.reacts[DOWN] < 2 && this.reacts[UP] > 0 && (this.reacts[LEFT] > 0 || this.reacts[RIGHT] > 0))
		{
			this.y -= 1.0;
			nexty -= 1.0;
			inexty = parseInt(nexty);

			this.check_collision(inextx, inexty, LEFT);
			this.check_collision(inextx, inexty, RIGHT);
		}

		if (this.reacts[UP] < 2 && this.reacts[DOWN] > 0 && (this.reacts[LEFT] > 0 || this.reacts[RIGHT] > 0))
		{
			this.y += 1.0;
			nexty += 1.0;
			inexty = parseInt(nexty);

			this.check_collision(inextx, inexty, LEFT);
			this.check_collision(inextx, inexty, RIGHT);
		}

		if ((this.reacts[UP] == 1 || this.reacts[DOWN] == 1) && (this.reacts[LEFT] > 0 || this.reacts[RIGHT] > 0))
		{
			this.reacts[UP] = 0;
			this.reacts[DOWN] = 0;
		}

		var m = level.material.get(this.x, this.y);

		if (m == WATER_INDEX)
		{
			this.vx *= 0.96;
			this.vy *= 0.9;

			var i = 0;
			var g = 0;

			for (var o = 0; o < 10; o++)
			{
				m = level.material.get(this.x, this.y + o);

				if (m == SOLID_INDEX || m == DIRT_INDEX || m == ICE_INDEX)
				{
					break;
				}

				if (m == BACKGROUND_INDEX)
				{
					i = o;
					break;
				}
			}

			if (i > 0)
			{
				this.vy += 0.1;
			}
		}

		if (this.reacts[UP] > 0)
		{
			this.vx *= friction;
		}

		this.vx *= airfriction;
		this.vy *= airfriction;

		if (this.vx > 0.0)
		{
			if (this.reacts[LEFT] > 0)
			{
				if (this.vx > bouncelimit)
				{
					this.vx *= -bouncequotient;
				} else
				{
					this.vx = 0.0;
				}

			}
		} else if (this.vx < 0.0)
		{
			if (this.reacts[RIGHT] > 0)
			{
				if (this.vx < -bouncelimit)
				{
					this.vx *= -bouncequotient;
				} else
				{
					this.vx = 0.0;
				}
			}
		}

		if (this.vy > 0.0)
		{
			if (this.reacts[UP] > 0)
			{
				if (this.vy > bouncelimit)
				{
					this.vy *= -bouncequotient;
				} else
				{
					this.vy = 0.0;
				}
			}
		} else if (this.vy < 0.0)
		{
			if (this.reacts[DOWN] > 0)
			{
				if (this.vy < -bouncelimit)
				{
					this.vy *= -bouncequotient;
				} else
				{
					this.vy = 0.0;
				}
			}
		}

		if (this.reacts[UP] == 0)
		{
			this.vy += gravity;
		}

		if (this.vx >= 0.0)
		{
			if (this.reacts[LEFT] < 2)
			{
				this.x += this.vx;
			}
		} else
		{
			if (this.reacts[RIGHT] < 2)
			{
				this.x += this.vx;
			}
		}

		if (this.vy >= 0.0)
		{
			if (this.reacts[UP] < 2)
			{
				this.y += this.vy;
			}
		} else
		{
			if (this.reacts[DOWN] < 2)
			{
				this.y += this.vy;
			}
		}

		var acc = acceleration;

		if (this.reacts[UP] <= 0)
		{
			acc *= airaccelerationfactor;
		}

		if (this.jetpack)
		{
			this.vy -= 0.05;
			this.jetpack_trail_timer++;

			if (this.jetpack_trail_timer > 3)
			{
				for (var i = 0; i < 2; i++)
				{
					particles[particle_count] = new Particle
					({
						type: PARTICLE_TRAIL,
						x: this.x + this.vx + (this.dir * -4),
						y: this.y + this.vy + 2,
						vx: Math.random(),
						vy: 0.8,
						death_time: 5
					});

					particle_count++;
				}

				this.jetpack_trail_timer = 0;
			}
		} else
		{
			this.jetpack_trail_timer = 0;
		}

		if (this.move_left && ! this.move_right)
		{
			if (this.vx > -maxspeed)
			{
				this.vx -= acc;
			}

			if (this.dir > 0)
			{
				this.dir = -1;
			}

			this.animate = true;
		} else if (this.move_right && ! this.move_left)
		{
			if (this.vx < maxspeed)
			{
				this.vx += acc;
			}

			if (this.dir < 0)
			{
				this.dir = 1;
			}

			this.animate = true;
		} else
		{
			this.animate = false;
		}

		this.aim_speed *= aimfriction;

		if (this.aim_up)
		{
			this.aim_speed -= aimacceleration;
		}

		if (this.aim_down)
		{
			this.aim_speed += aimacceleration;
		}

		this.aim_angle += this.aim_speed;

		if (this.aim_angle < 0)
		{
			this.aim_angle = 0;
			this.aim_speed = 0;
		}

		if (this.aim_angle > 180)
		{
			this.aim_angle = 180;
			this.aim_speed = 0;
		}
	},
	render: function(layer)
	{
		if ( ! this.alive || level.next_delay > 0)
		{
			return;
		}

		var flip = this.dir == -1 ? true : false;
		var aim_frame = this.aim_angle / 20;

		if (aim_frame > 8)
		{
			aim_frame = 8;
		}

		var angle = player.aim_angle / 180 * Math.PI + Math.PI;
		var distance = 15;

		var ax = Math.floor(this.x + this.vx + Math.sin(angle) * (distance * this.dir * -1));
		var ay = Math.floor(this.y + this.vy + Math.cos(angle) * distance);

		layer.frame(torso, this.x - 4, this.y - 6, parseInt(aim_frame), 0, 9, 1, flip);
		layer.frame(legs, this.x - (flip ? 0 : 3), this.y + 1, this.frame, 0, 3, 1, flip);

		game_layer.fill('#fff');
		game_layer.rect(ax, ay, 1, 1);
	},
	shoot: function(type, amount, amount_var, speed, speed_var, motion, distribution, angle_offs, distance_offs)
	{
		if ( ! this.alive)
		{
			return;
		}

		var x = this.x;
		var y = this.y;
		var vx = this.vx;
		var vy = this.vy;
		var angle = this.aim_angle;

		var _amount = amount + (amount_var > 0 ? Math.floor(Math.random() * amount_var) : 0);
		var _distribution = distribution / (_amount + 0.0);

		for (var i = 0; i < _amount; i++)
		{
			var _speed = speed + (speed_var > 0 ? (Math.floor(Math.random() * (speed_var * 1000)) / 1000.0) : 0);
			var _angle = angle + angle_offs - 90;
			_angle = _angle - (distribution / 2.0) + (_distribution * i);
			_angle = _angle / 180 * Math.PI;

			var dx = Math.cos(_angle) * this.dir;
			var dy = Math.sin(_angle);

			particles[particle_count] = new Particle(
			{
				x: x + dx * distance_offs,
				y: y + dy * distance_offs,
				vx: (dx * _speed) + (vx * motion),
				vy: (dy * _speed) + (vy * motion),
				type: type
			});

			particle_count++;
		}
	},
	respawn: function(x, y)
	{
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		this.frame = 0;
		this.reacts = [];
		this.move_left = false;
		this.move_right = false;
		this.aim_up = false;
		this.aim_down = false;
		this.aim_speed = 0;
		this.aim_angle = 90;
		this.jetpack = false;
		this.jetpack_trail_timer = 0;
		this.gold = 0;
		this.alive = true;
		this.death_timer = 0;
	},
	die: function()
	{
		if ( ! this.alive)
		{
			return;
		}

		particles[particle_count] = new Particle
		({
			type: PARTICLE_EXPLOSION,
			x: this.x,
			y: this.y,
			death_time: 3,
		});

		particle_count++;

		this.shoot(PARTICLE_BLOOD, 30, 20, 0.4, 0.3, 0, 360, 0, 2);

		shake_time = shake_time_max;

		this.alive = false;
		this.death_timer = 180;
	}
};

window.onload = function()
{
	//level = new Level(LEVELS[1]);
	//level = new Level({ image: material_image });
	level = new Level(LEVELS);
	var min_width = 320;
	var min_height = 240;
	var max_width = 320;
	var max_height = 240;

	for (var i = 4; i >= 1; i--)
	{
		if (document.width >= i * min_width && document.height >= i * min_height)
		{
			max_width = min_width * i;
			max_height = min_height * i;

			break;
		}
	}

	max_width = 640;
	max_height = 480;

	game_layer = new Layer({ width: 320, height: 240, context2d: true });
	final_layer = new Layer({ width: max_width, height: max_height, canvas: document.getElementById('main'), context2d: false });

	input = new Input({ canvas: final_layer.get_canvas() });

	game_layer.fill('#ff0000');

	var camera = { x: 0, y: 0 };

	var timer = 0;

	loop.init( function()
	{
		if (state == 'menu')
		{
		} else if (state == 'game')
		{
			if (input.keypressed('a'))
			{
				player.move_left = true;
				player.move_right = false;

				if (timer % 5 == 0)
				{
					player.frame++;

					if (player.frame > 2)
					{
						player.frame = 0;
					}
				}
			} else if (input.keypressed('d'))
			{
				player.move_left = false;
				player.move_right = true;

				if (timer % 5 == 0)
				{
					player.frame++;

					if (player.frame > 2)
					{
						player.frame = 0;
					}
				}
			} else
			{
				player.move_left = false;
				player.move_right = false;
				player.frame = 1;

			}

			if (input.keypressed('w'))
			{
				player.aim_up = true;
			} else
			{
				player.aim_up = false;
			}

			if (input.keypressed('s'))
			{
				player.aim_down = true;
			} else
			{
				player.aim_down = false;
			}

			if (input.keydown('g'))
			{
				player.shoot(PARTICLE_BULLET, 1, 0, 3.3, 0.0, 0.3, 20, 0, 5);
			}

			if (input.keypressed('h'))
			{
				player.jetpack = true;
			} else
			{
				player.jetpack = false;
			}

			if (input.keydown('r'))
			{
				level.restart();
			}

			if (player.x < 0)
			{
				player.x = 0;
			}

			if (player.y < 0)
			{
				player.y = 0;
			}

			if (player.x > level.width - 1)
			{
				player.x = level.width - 1;
			}

			if (player.y > level.height - 1)
			{
				player.y = level.height - 1;
			}

			level.update();

			player.update();

			for (var i = particle_count - 1; i >= 0; i--)
			{
				particles[i].update(level);

				if ( ! particles[i].alive)
				{
					particles[i] = particles[particle_count - 1];
					particle_count--;
				}
			}

			input.update();
			timer++;
		}
	}, function()
	{
		game_layer.clear();

		if (level.end && state != 'menu')
		{
			state = 'menu';
			intro_line = 0;
			intro_delay = 30;
			intro = outro;
			intro_output = [];
		}

		if (state == 'menu')
		{
			game_layer.color('#000000');
			game_layer.rect(0, 0, 320, 240);

			if (intro_delay > 0)
			{
				intro_delay--;

				if (intro_delay == 0)
				{
					if (intro_line >= intro.length)
					{
						state = 'game';
						intro_delay = -1;
					} else
					{
						if (typeof intro_output[intro_line] == 'undefined')
						{
							typeof intro_output.push('');
						}

						intro_output[intro_line] = intro[intro_line].substring(0, intro_output[intro_line].length + 1);

						if (intro_output[intro_line].length == intro[intro_line].length)
						{
							intro_line++;
							intro_delay = 30;
						} else
						{
							intro_delay = 2;
						}

						if (intro_line >= intro.length)
						{
							intro_delay = 120;
						}
					}
				}
			}

			game_layer.color('#ffffff');

			for (var i = 0; i < intro_output.length; i++)
			{
				if (intro_output[i].length > 0)
				{
					game_layer.write(10, 10 + (10 * i), intro_output[i]);
				}
			}

			if (loop.ticks % 5 == 0)
			{
				if (intro_output[intro_line])
				{
					game_layer.write(10 + (6 * intro_output[intro_line].length), (10 * intro_output.length), '_');
				}
			}
		} else if (state == 'game')
		{
			camera.x = clamp(player.x, game_layer.width / 2, level.width - game_layer.width / 2);
			camera.y = clamp(player.y, game_layer.height / 2, level.height - game_layer.height / 2);

			if (shake_time > 0)
			{
				var shake = (shake_time / shake_time_max) * shake_max;
				var shake_x = -shake + Math.floor(Math.random() * (shake * 2));
				var shake_y = -shake + Math.floor(Math.random() * (shake * 2));

				shake_time--;

				camera.x += shake_x;
				camera.y += shake_y;
			}

			game_layer.push();

			game_layer.draw(parallax, ((-camera.x + game_layer.width / 2) / (parallax.width - game_layer.width)) * (level.width - game_layer.width), ((-camera.y + game_layer.height / 2) * (parallax.height - game_layer.height)) / (level.height - game_layer.height));
			game_layer.translate(-camera.x + game_layer.width / 2, -camera.y + game_layer.height / 2);

			for (var i = particle_count - 1; i >= 0; i--)
			{
				particles[i].render(game_layer);
			}

			player.render(game_layer);
			level.render(game_layer);

			game_layer.pop();

			game_layer.color('#ffff00');
			game_layer.write(5, 5, player.gold + '/' + level.gold.length);
			game_layer.color('#ffffff');

			if (message_timer > 0)
			{
				game_layer.write(160, 117, message, 1, 1);

				message_timer--;
			}
		}

		final_layer.draw(game_layer.get_canvas());
	});
};
