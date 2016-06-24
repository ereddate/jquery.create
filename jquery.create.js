typeof jQuery != "undefined" && (function(win, $) {
	var doc = win.document;
	$.isElement = function(obj) {
		return obj && !!obj[0] && obj[0].nodeType == 1;
	};
	Array.prototype.find = function(obj, callback) {
		var i, len = this.length,
			index = -1;
		for (i = 0; i < len; i++) {
			if (this[i] == obj) {
				index = i;
				break;
			}
		}
		callback && callback.call(this[index], index, this);
		return index;
	};
	Array.prototype.add = function(obj) {
		var i, len = obj.length;
		for (i = 0; i < len; i++) this.push(obj[i]);
		return this;
	};
	Array.prototype.insert = function(num, obj) {
		this.splice(num, 0, obj);
		return this;
	};
	Array.prototype.delete = function(num) {
		this.splice(num, 1);
		return this;
	};
	Array.prototype.clear = function() {
		this.length = 0;
		return this;
	};

	function tmpl(html, data, filter) {
		if ($.isEmptyObject(data)) return html;

		$.each(data, function(name, val) {
			var reg = filter && filter(name) || new RegExp("{{\\s*(" + name + ")\\s*}}", "gi"),
				result = reg.exec(html);
			if (result) {
				while (result != null && result[1]) {
					html = html.replace(result[0], val);
					result = reg.exec(html);
				}
			}
		});
		return html;
	}

	String.prototype.tmpl = function(data, filter) {
		return tmpl(this, data, filter);
	};

	var storage = function() {
		return !window.localStorage ? undefined : {
			set: function(name, v) {
				window.localStorage.setItem(name, v)
				return this;
			},
			get: function(v) {
				return window.localStorage.getItem(v);
			},
			delete: function(v) {
				v = v.split(',');
				$.each(v, function(i, name) {
					window.localStorage.removeItem(name);
				});
				return this;
			}
		}
	};
	$.storage = storage();

	function createElement() {
		return {
			done: function(args, fragment, parentName, target) {
				$.each(args, function(i, item) {
					var elem, prefix = !parentName ? "" : parentName + "_";
					$.each(item, function(itemName, itemValue) {
						var itemName = itemName.split(':');
						itemValue.name = itemName[0];
						itemValue.tag = itemName[1];
						$.each($.c.filterIndex, function(i, name) {
							var val = itemValue[name];
							if (val) {
								elem = $.c.filter[name](elem, itemValue, prefix, target);
							}
						});
						elem && $.isElement(elem) && fragment.append(elem.addClass(prefix + (itemValue.name || itemValue.tag)));
					});
				});
				return fragment;
			}
		};
	}

	function getFile(file, callback) {
		if (file)
			$.getJSON(file, function(result) {
				callback(result.data);
			}).error(function() {
				callback();
			});
		else
			callback();
	}

	var callbacks = function(array, num, callback) {
		var obj = array[num];
		obj && obj.fn(obj, function() {
			num++;
			if (num <= array.length - 1) {
				callbacks(array, num, callback);
			} else {
				callback && callback();
			}
		});
	};

	$.c = {};
	$.c.filterIndex = [];
	$.c.filter = {};
	$.c.customAttrsIndex = [];
	$.c.customAttrs = {};
	$.c.adaptiveIndex = [];
	$.c.adaptive = {};

	$.cExtend = function(arr, type) {
		$.each(arr, function(i, obj) {
			$["c"][type + "Index"].insert(obj.index, obj.name);
			$["c"][type][obj.name] = obj.fn;
		});
		return $;
	};

	$.cExtend([{
		index: 0,
		name: "tag",
		fn: function(elem, item, prefix, target) {
			var value = item["tag"];
			elem = $('<' + value + '></' + value + '>');
			elem[0].selector = prefix + (item.name || item.tag);
			return elem;
		}
	}, {
		index: 1,
		name: "attr",
		fn: function(elem, item, prefix, target) {
			var value = item["attr"];
			elem && $.isElement(elem) && $.each(value, function(attrName, attrVal) {
				if (attrName == "cls") {
					elem.addClass(attrVal);
				} else {
					elem.attr(attrName, attrVal);
				}
			});
			return elem;
		}
	}, {
		index: 2,
		name: "css",
		fn: function(elem, item, prefix, target) {
			var value = item["css"];
			elem && $.isElement(elem) && elem["css"]((value in win ? win[value]() : value));
			return elem;
		}
	}, {
		index: 3,
		name: "html",
		fn: function(elem, item, prefix, target) {
			var value = item["html"];
			if (elem && $.isElement(elem) && value) typeof value == "string" ? elem["html"]((value in win ? win[value]() : value)) : elem["html"](value(tmpl));
			return elem;
		}
	}, {
		index: 4,
		name: "handle",
		fn: function(elem, item, prefix, target) {
			var value = item["handle"];
			if (elem && $.isElement(elem)) {
				$.each(value, function(eventName, eventFn) {
					eventName != "init" && elem.on(eventName, function(e) {
						eventFn && (typeof eventFn == "string" ? win[eventFn] : eventFn).call(this, e);
					});
				});
				"init" in value && target.emi.push({
					elem: elem,
					value: value,
					fn: function(obj, done) {
						obj.value["init"] && (typeof obj.value["init"] == "string" ? win[obj.value["init"]] : obj.value["init"]).call($("." + obj.elem[0].selector), done);
					}
				});
			}
			return elem;
		}
	}, {
		index: 5,
		name: "items",
		fn: function(elem, item, prefix, target) {
			var value = item["items"];
			elem && $.isElement(elem) && (elem = (new createElement()).done(value, elem, prefix + (item.name || item.tag), target));
			return elem;
		}
	}], "filter").cExtend([{
		index: 0,
		name: "file",
		fn: function(file, done) {
			getFile(file, function(data) {
				var args = [];
				data && $.each(data, function(i, item) {
					args.push(item)
				});
				done(args);
			});
		}
	}, {
		index: 1,
		name: "items",
		fn: function(items, done) {
			try {
				items = items != "" ? win[items] ? win[items]() : (new Function("return " + items)()) : {};
			} catch (e) {
				console.log(e.message, self[0], items);
				items = [];
			}
			done(items);
		}
	}], "customAttrs").cExtend([{
		index: 0,
		name: "font",
		fn: function(args, done) {
			function setFontSize() {
				var iWidth = doc.documentElement.clientWidth;
				doc.getElementsByTagName('html')[0].style.fontSize = (iWidth / args.size).toFixed(2) + 'px';
			}
			args.size && setFontSize();
			args.resize && win.addEventListener("onorientationchange" in win ? "orientationchange" : "resize", setFontSize, false);
			done();
		}
	}], "adaptive");

	var domID = 0,
		eachDoms = function(elems, args) {
			var self = elems;
			self.selector = self.selector && self.selector === "" ? self[0].selector || !/body/.test(self.tagName.toLowerCase()) && self.tagName.toLowerCase() + (domID++) || self.tagName.toLowerCase() || undefined : self.selector && self.selector.replace(".", "");
			var prefix = self.selector,
				fragment = $('<div class="' + prefix + '"></div>'),
				customAttrsObject = [];
			self = $(self);
			$.each($.c.customAttrsIndex, function(i, name) {
				customAttrsObject.push({
					name: name,
					fn: function(obj, done) {
						$.c.customAttrs[obj.name](self.attr("data-" + obj.name), function(arr) {
							arr && (args = args.add(arr));
							done();
						});
					}
				})
			});

			callbacks(customAttrsObject, 0, function() {
				win["cItems"] && win["cItems"][prefix] && $.each(win["cItems"][prefix], function(i, item) {
					args.push(item)
				});
				//console.log(args)
				self.emi = [], fragment = (new createElement()).done(args, fragment, prefix, self);
				if ($.isElement(fragment) && fragment.children().length > 0) {
					self.append(fragment.children().clone(true)), callbacks(self.emi, 0);
				}
				fragment.remove();
				self.children("[data-items]").create();
			});
		};

	$.fn.create = function(args) {
		!args && (args = []);
		if (this.length > 0) {
			if (this.length == 1 && this.selector != "" && this.selector.toLowerCase() == "head") {
				var self = this,
					adaptiveArray = [];
				$.each($.c.adaptiveIndex, function(i, name) {
					adaptiveArray.push({
						name: name,
						fn: function(obj, done) {
							$.c.adaptive[obj.name].call(self, args[name], function(arr) {
								done();
							});
						}
					})
				});
				callbacks(adaptiveArray, 0, function() {});
			} else {
				if (this.length === 1) {
					eachDoms(this, args);
				} else {
					$.each(this, function(i, elem) {
						eachDoms($(this), args);
					});
				}
			}
		}
		return this;
	};

	$.create = function( /*selector, options*/ ) {
		var args = arguments,
			len = args.length;
		if (len === 1) {
			return $("body").create(args[0]);
		} else if (len === 2) {
			return $(args[0]).create(args[1]);
		} else {
			return $;
		}
	};

	var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
		define;
	win.define = define = function() {
		var args = arguments,
			len = args.length,
			name, dependencies, factory;
		if (len == 1) {
			factory = args[0];
		} else if (len == 2) {
			name = args[0], factory = args[1];
		} else if (len == 3) {
			name = args[0], dependencies = args[1], factory = args[2];
		}

		_analyDefine((!name && ("model_" + Math.random()) || name), dependencies, factory);
		return this;
	};
	define.amd = {};

	function isArray(v) {
		return typeof v != "undefined" && v.constructor == Array ? true : false;
	};

	function r(a) {
		var b = "length" in a && a.length,
			c = (typeof a).toLowerCase();
		return "array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a
	}

	function each(a, b, c) {
		var d, e = 0,
			f = a.length,
			g = r(a);
		if (c) {
			if (g) {
				for (; f > e; e++)
					if (d = b.apply(a[e], c), d === !1) break
			} else
				for (e in a)
					if (d = b.apply(a[e], c), d === !1) break
		} else if (g) {
			for (; f > e; e++)
				if (d = b.call(a[e], e, a[e]), d === !1) break
		} else
			for (e in a)
				if (d = b.call(a[e], e, a[e]), d === !1) break;
		return a
	};

	function trim(text) {
		return text == null ?
			"" :
			(text + "").replace(rtrim, "");
	}

	function extend(target, args, filter) {
		if (typeof args == "array" && !!args.length && args.length > 0) {
			target = target || [];
			var i, len;
			for (i = 0; i < (len = args.length); i++) {
				if (args[i] != filter)
					target.push(args[i]);
			}
		} else {
			target = target || {};
			for (name in args) {
				if (name != filter)
					target[name] = args[name];
			}
		}
		return target;
	};

	function isEmpty(v) {
		var a = function(e) {
			var t;
			for (t in e) return !1;
			return !0
		};
		return typeof v == "undefined" || v == null || typeof v == "string" && trim(v) == "" || isArray(v) && v.length == 0 || typeof v == "object" && a(v) ? true : false;
	}

	var model = function() {
		return new model.fn.init();
	};

	model.fn = model.prototype = {
		init: function() {
			define.amd = {};
			return this;
		},
		use: function(name, callback) {
			var result;
			if (isArray(name) || typeof name == "string" && name.split(' ').length > 1) {
				result = {};
				if (typeof name == "string") name = name.split(' ');
				each(name, function(i, str) {
					result[str] = _require(str);
				});
			} else {
				result = _require(name);
			}
			callback && callback(result);
			return this;
		}
	};

	model.fn.init.prototype = model.fn;

	define.require = model();

	function _analyRequire(func) {
		var funContext = func.toString(),
			fixContext = trim(funContext.replace(/(\r|\n)/gi, ""));
		var require = []
		fixContext.replace(/\s*require\s*\(\s*[\"|\'](.+?)[\"|\']\s*\)\s*/gi, function(a, b) {
			require.push(b);
		});
		return {
			dependencies: require
		};
	}

	function _require(name) {
		var require = define.require,
			options = define.amd[name] || false,
			result;
		if (name && options) {
			if (options.status == 3) {
				result = typeof options.exports == "function" && options.exports || options.exports;
			} else if (options.status < 3 && options.status > 0) {
				result = _exec(options);
			}
		}
		return result;
	}

	function _exec(options) {
		var _exprots = {},
			module = {
				exports: {}
			},
			than, result;
		if (options.status == 2) {
			each(options.dependencies, function(i, name) {
				_require(name);
			});
		}
		try {
			result = options.factory(_require, _exprots, module),
				than = result || _exprots || "exprots" in module && module.exports,
				options.exports = than,
				options.status = STATUS.executed;
		} catch (e) {
			options.exports = {},
				options.status = STATUS.error;
		}
		return result;
	}

	var STATUS = {
		loaded: 1,
		readed: 2,
		executed: 3,
		error: 4
	};

	function _analyDefine(name, dependencies, factory) {
		var options = {
			name: (!name && ("model_" + Math.random()) || name),
			dependencies: dependencies,
			factory: factory,
			exports: {},
			status: isArray(dependencies) || typeof dependencies != "undefined" ? STATUS.readed : STATUS.loaded
		};
		var ops = _analyRequire(factory);
		options = extend(options, ops);

		define.amd[options.name] = options;

		_exec(options);
	}

})(this, jQuery)
