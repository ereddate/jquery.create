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
			elem && $.isElement(elem) && elem["html"]((value in win ? win[value]() : value));
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
						obj.value["init"].call($("." + obj.elem[0].selector), done);
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
					var elem, prefix = parentName + "_";
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
	$.fn.create = function(args) {
		var self = this,
			prefix = self.selector === "" ? self[0].selector || "" : self.selector.replace(".", ""),
			fragment = $('<div class="' + prefix + '"></div>'),
			dataitems;
		try {
			dataitems = self.attr("data-items") != "" && (new Function("return " + self.attr("data-items"))()) || {};
		} catch (e) {
			console.log(e.message, self.attr("data-items"))
		}
		args ? ($.each(dataitems, function(i, item) {
			args.push(item)
		})) : dataitems && (args = dataitems);
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
