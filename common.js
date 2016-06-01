typeof jQuery != "undefined" && (function(win, $) {
	var device = function() {
		var ua = navigator.userAgent.toLowerCase(),
			device = {
				os: {
					version: 0,
					isiOS: ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1 || ua.indexOf("ios") > -1,
					isAndroid: ua.indexOf("android") > -1 || ua.indexOf("adr") > -1 || ua.indexOf("linux;") > -1
				},
				browser: {
					version: 0,
					isQQ: ua.indexOf("mqqbrowser/") > -1,
					isUC: ua.indexOf("ucbrowser/") > -1,
					isWechat: ua.indexOf("micromessenger/") > -1,
					isSamsung: ua.indexOf("samsungbrowser/") > -1,
					isSogou: ua.indexOf("sogoumobilebrowser/") > -1,
					isPinganWifi: ua.indexOf("pawifi") > -1
				}
			};
		device.browser.isSafari = device.os.isiOS && ua.indexOf("safari/") > -1;
		device.browser.isIApp = device.os.isiOS && !device.browser.isSafari && !device.browser.isQQ && !device.browser.isUC && !device.browser.isWechat && !device.browser.isSamsung && !device.browser.isSogou && !device.browser.isPinganWifi;
		return device;
	};
	$.device = device();
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

	var cookie = function() {
		var getsec = function(str) {
			//这是有设定过期时间的使用示例：
			//s20是代表20秒
			//h是指小时，如12小时则是：h12
			//d是天数，30天则：d30
			var str1 = str.substring(1, str.length) * 1;
			var str2 = str.substring(0, 1);
			if (str2 == "s") {
				return str1 * 1000;
			} else if (str2 == "h") {
				return str1 * 60 * 60 * 1000;
			} else if (str2 == "d") {
				return str1 * 24 * 60 * 60 * 1000;
			}
		};
		return {
			set: function(name, value, time) {
				var strsec = getsec(time);
				var exp = new Date();
				exp.setTime(exp.getTime() + strsec * 1);
				document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
				return this;
			},
			delete: function(name) {
				this.setCookie(name, '', 's-1');
				return this;
			},
			get: function(name) {
				var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
				if (arr = document.cookie.match(reg))
					return (arr[2]);
				else
					return null;
			}
		}
	};
	$.cookie = cookie();

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
	Array.prototype.find = function(obj, callback) {
		var i, len = this.length,
			index = -1;
		for (i = 0; i < len; i++) {
			if (callback) {
				var result = callback(this[i], i, obj);
				if (result) {
					index = i;
					break;
				}
			} else {
				if (this[i] == obj) {
					index = i;
					break;
				}
			}
		}
		return index;
	};
	Array.prototype.has = function(obj, callback) {
		var result = this.find(obj, callback);
		return result == -1 ? false : true;
	};
	String.prototype.tmpl = function($, data, filter) {
		var html = this;

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
	};
	String.prototype.toCN = function() {
		return new Function("return '" + this + "'")();
	};
	var ajax = function(url, data, ops) {
		if (!$) return;
		if (url == "") return;
		if (!data) data = "";

		var complete = function(result, success, error) {
				if (result && result.status === 1) {
					success && success(result.data || result, result.msg || "success.", result.code || 1, result);
				} else if (result && result.status === 0) {
					error && error(result.msg || "unknown error.", result.code || 0);
				} else {
					success && success(result);
				}
			},
			fail = function(error, msg) {
				error && error(msg || "unknown error.", 0);
				$(win).trigger('scroll');
			},
			jsonp = function(success, error) {
				var head = document.getElementsByTagName("head")[0],
					callback = "hexunapi_" + (Math.random(10000) + "").replace(".", "");
				while (win[callback]) {
					callback = "hexunapi_" + (Math.random(10000) + "").replace(".", "");
				}
				win[callback] = function(data) {
					win[callback] = null;
					$("#" + callback).remove();
					try {
						data = data || new Function('return ' + data)();
						console.log(callback)
						complete(data, success, error);
					} catch (e) {
						fail(error, e.message);
					}
				};
				try {
					var script = document.createElement("script");
					head.appendChild(script);
					script.timeout = setTimeout(function() {
						if (win[callback] != null) {
							win[callback] = null;
							head.removeChild(document.getElementById(callback));
							fail(error, "timeout " + callback);
						}
					}, ops && ops.timeout || 3000);
					script.id = callback;
					script.src = url + (/\?/.test(url) ? "&" : "?") + (ops && ops.callback || "callback") + "=" + callback;
					script.onload = function(a) {
						//console.log(arguments)
					};
					script.onerror = function() {
						head.removeChild(this);
						win[callback] = null;
						fail(error);
					};
				} catch (e) {
					fail(error, e.message);
				}
			};

		return {
			_jsonp: function(success, error) {
				setTimeout(function() {
					new jsonp(success, error);
				}, 500);
				return this;
			},
			get: function(success, error) {
				$.get(url, function(result) {
					complete(result, success, error);
				}, "json").error(function() {
					fail(error);
				});
				return this;
			},
			post: function(success, error) {
				$.post(url, data, function(result) {
					complete(result, success, error);
				}, "json").error(function() {
					fail(error);
				});
				return this;
			},
			jsonp: function(success, error) {
				$.ajax({
					type: "get",
					async: false,
					url: url,
					dataType: "jsonp",
					jsonp: "cb",
					success: function(result) {
						complete(result, success, error);
					},
					error: function() {
						fail(error);
					}
				});
				return this;
			}
		}
	};
	$.require = ajax;
})(this, jQuery);
