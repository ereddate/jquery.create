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
					$.each($.c.filterIndex, function(i, name) {
						var value = item[name];
						if (value) {
							elem = $.c.filter[name](elem, item, prefix, target);
						}
					});
					elem && $.isElement(elem) && fragment.append(elem.addClass(prefix + (item.name || item.tag)));
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
	$.c.adaptiveIndex = [],
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
		name: "viewport",
		fn: function(args, done) {
			var content = [];
			$.each(args, function(name, val) {
				content.push(name + "=" + val);
			});
			var viewport = $(this).find("[name=viewport]");
			if (viewport.length > 0) {
				viewport.attr("content", content.join(','));
				done();
				return;
			}
			$(this).append($("meta").attr({
				name: "viewport",
				content: content.join(',')
			}));
			done();
		}
	}, {
		index: 1,
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

	var domID = 0;

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
				$.each(this, function(i, elem) {
					var self = $(this);
					self[0].selector = self.selector === "" ? self[0].selector || !/body/.test(self[0].tagName.toLowerCase()) && self[0].tagName.toLowerCase() + (domID++) || self[0].tagName.toLowerCase() || undefined : self.selector.replace(".", "");
					var prefix = self[0].selector,
						fragment = $('<div class="' + prefix + '"></div>'),
						customAttrsObject = [];
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
				});
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
})(this, jQuery);
