typeof jQuery != "undefined" && (function(win, $) {
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
	Array.prototype.mix = function(obj) {
		var i, len = obj.length;
		for (i = 0; i < len; i++) this.push(obj[i]);
		return this;
	};

	function tmpl(html, data, filter) {
		//var html = this;

		function find(html, data) {
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
		return find(html, data);
	}

	$.cFilterIndex = ["tag", "attr", "css", "html", "handle", "items"];
	$.cFilter = {
		tag: function(elem, item, prefix, target) {
			var value = item["tag"];
			elem = $('<' + value + '></' + value + '>');
			elem[0].selector = prefix + (item.name || item.tag);
			return elem;
		},
		attr: function(elem, item, prefix, target) {
			var value = item["attr"];
			elem && $.isElement(elem) && $.each(value, function(attrName, attrVal) {
				if (attrName == "cls") {
					elem.addClass(attrVal);
				} else {
					elem.attr(attrName, attrVal);
				}
			});
			return elem;
		},
		css: function(elem, item, prefix, target) {
			var value = item["css"];
			elem && $.isElement(elem) && elem["css"]((value in win ? win[value]() : value));
			return elem;
		},
		html: function(elem, item, prefix, target) {
			var value = item["html"];
			if (elem && $.isElement(elem) && value) typeof value == "string" ? elem["html"]((value in win ? win[value]() : value)) : elem["html"](value(tmpl));
			return elem;
		},
		handle: function(elem, item, prefix, target) {
			var value = item["handle"];
			if (elem && $.isElement(elem)) {
				$.each(value, function(eventName, eventFn) {
					eventName != "init" && elem.on(eventName, function(e) {
						eventFn.call(this, e);
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
		},
		items: function(elem, item, prefix, target) {
			var value = item["items"];
			elem && $.isElement(elem) && (elem = (new createElement()).done(value, elem, prefix + (item.name || item.tag), target));
			return elem;
		}
	};

	function createElement() {
		return {
			done: function(args, fragment, parentName, target) {
				$.each(args, function(i, item) {
					var elem, prefix = !parentName ? "" : parentName + "_";
					$.each($.cFilterIndex, function(i, name) {
						var value = item[name];
						if (value) {
							elem = $.cFilter[name](elem, item, prefix, target);
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

	$.fn.create = function(args) {
		if (this.length > 0) {
			var self = this,
				prefix = self.selector === "" ? self[0].selector || (self[0].className.toLowerCase().split(' ') && self[0].className.toLowerCase().split(' ')[0] || self[0].className.toLowerCase()) || undefined : self.selector.replace(".", ""),
				fragment = $('<div class="' + prefix + '"></div>'),
				dataitems,
				subject = function() {
					try {
						dataitems = self.attr("data-items") != "" ? win[self.attr("data-items")] ? win[self.attr("data-items")]() : (new Function("return " + self.attr("data-items"))()) : {};
					} catch (e) {
						console.log(e.message, self.attr("data-items"))
					}!args && (args = []);
					dataitems && $.each(dataitems, function(i, item) {
						args.push(item)
					});
					win["cItems"] && win["cItems"][prefix] && $.each(win["cItems"][prefix], function(i, item) {
						args.push(item)
					});
					//console.log(args)
					self.emi = [], fragment = (new createElement()).done(args, fragment, prefix, self);
					if ($.isElement(fragment) && fragment.children().length > 0) {
						function exec(num) {
							var obj = self.emi[num];
							obj && obj.fn(obj, function() {
								num++;
								if (num <= self.emi.length - 1) {
									exec(num);
								}
							});
						}
						self.append(fragment.children().clone(true)), exec(0);
					}
					fragment.remove();
					self.children("[data-items]").create();
				};
			self.attr("data-file") ? getFile(self.attr("data-file"), function(data) {
				data && $.each(data, function(i, item) {
					args.push(item)
				});
				subject();
			}) : subject();
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
