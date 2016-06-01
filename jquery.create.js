typeof jQuery != "undefined" && (function(win, $) {

	$.isElement = function(obj) {
		return obj && !!obj[0] && obj[0].nodeType == 1;
	};

	function createElement() {
		return {
			done: function(args, fragment, parentName, target) {
				$.each(args, function(i, item) {
					var elem, prefix = parentName + "_";
					$.each(item, function(name, value) {
						switch (name) {
							case "tag":
								elem = $('<' + value + '></' + value + '>');
								break;
							case "attr":
								elem && $.isElement(elem) && $.each(value, function(attrName, attrVal) {
									if (attrName == "cls") {
										elem.addClass(attrVal);
									} else {
										elem.attr(attrName, attrVal);
									}
								});
								break;
							case "css":
							case "html":
								elem && $.isElement(elem) && elem[name]((value in win ? win[value]() : value));
								break;
							case "handle":
								if (elem && $.isElement(elem)) {
									$.each(value, function(eventName, eventFn) {
										elem[0].selector = prefix + (item.name || item.tag), eventName != "init" && elem.on(eventName, function(e) {
											eventFn.call(this, e);
										});
									});
									"init" in value && target.emi.push({
										elem: elem,
										value: value,
										fn: function(value, elem, done) {
											value["init"].call(elem, done);
										}
									});
								}
								break;
							case "items":
								elem && $.isElement(elem) && (elem = (new createElement()).done(value, elem, prefix + (item.name || item.tag), target));
								break;
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
			fragment = $('<div class="' + prefix + '_item"></div>'),
			dataitems;
		try {
			dataitems = self.attr("data-items") != "" && (new Function("return " + self.attr("data-items"))()) || {};
		} catch (e) {
			console.log(e.message, self.attr("data-items"))
		}
		args ? ($.each(dataitems, function(i, item) {
			args.push(item)
		})) : dataitems && (args = dataitems);
		self.emi = [], fragment = (new createElement()).done(args, fragment, prefix + "_item", self);
		if ($.isElement(fragment) && fragment.children().length > 0) {
			function exec(num) {
				var obj = self.emi[num];
				obj && obj.fn(obj.value, obj.elem, function() {
					num++;
					if (num <= self.emi.length - 1) {
						exec(num);
					}
				});
			}
			self.append(fragment), exec(0);
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
