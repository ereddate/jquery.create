typeof jQuery != "undefined" && (function(win, $) {
	var api = {
		match: "url"
	};
	win.testClick = function() {
		console.log('testClick')
	};
	win.testInit = function(done) {
		console.log('testInit')
		done();
	};
	win.gettestHtml = function() {
		return "test111"
	};

	win.cItems = {
		body: [{
			tag: "a",
			name: "citems",
			html: "citems"
		}]
	};

	//模块A
	var moduleA = function(elem, callback) {
		var a = [],
			b = [];
		for (i = 0; i < 2; i++)(a.push({
			tag: "a",
			name: "button" + i,
			html: "tab" + i,
			attr: {
				cls: "tab_button",
				href: "javascript:;"
			},
			handle: {
				click: function(e) {
					$(this).parent().find(".tab_button").removeClass('on').parents(".tab").find(".tab_panel").hide();
					var index = $(this).addClass('on').index();
					$(this).parents(".tab").find(".tab_panel").eq(index).show();
				}
			}
		}), b.push({
			tag: "div",
			name: "panel" + i,
			html: "panel" + i,
			attr: {
				cls: "tab_panel"
			},
			css: {
				display: "none"
			}
		}));
		$(elem).create([{
			tag: "header",
			name: "control",
			items: a
		}, {
			tag: "div",
			name: "panel",
			items: b
		}]);
		$(".tab_button").eq(0).trigger('click');
		callback();
	};
	//模块B
	var moduleB = function(elem, callback) {
		$.require(api.match, false, {
			callback: "callback"
		})._jsonp(function(result) {
			if (result.fh == 1) {
				$(elem).create([{
					tag: "div",
					name: "f",
					attr: {
						cls: "f",
						id: "f"
					},
					css: {
						display: "block"
					},
					html: result.virtualData[0].FullIncomeRate,
					handle: {
						click: function(e) {
							e.preventDefault();
							console.log("e");
						}
					}
				}]);
				callback();
			}
		}, function() {
			callback();
		});
	};

	$("body").create([{
		tag: "article",
		//标签伪名，每个标签都需要有，注意不要重复
		name: "a",
		attr: {
			cls: "a",
			id: "a"
		},
		css: {
			display: "block"
		},
		//事件
		handle: {
			//标签初始化事件
			init: function(done) {
				//模块B的使用
				moduleB(this, done);
			},
			click: function(e) {
				e.preventDefault();
				console.log("a");
			}
		},
		//子标签创建
		items: [{
			tag: "header",
			name: "header",
			css: {
				display: "inline-block"
			},
			items: [{
				tag: "h1",
				name: "title",
				html: "title"
			}, {
				tag: "p",
				name: "desc",
				html: function(tmpl) {
					return tmpl($("#tmpl").html(), {
						a: "description"
					});
				}
			}, {
				tag: "img",
				name: "logo",
				attr: {
					src: "url",
					alt: "img test",
					style: "width:100px;height:100px;"
				}
			}]
		}, {
			tag: "table",
			name: "table",
			handle: {
				init: function(done) {
					var list = [];
					for (i = 0; i < 5; i++) list.push({
						tag: "td",
						name: "td" + i,
						html: i + ""
					});
					$(this).create([{
						tag: "tr",
						name: "tr",
						items: list
					}]);
					done();
				}
			}
		}, {
			tag: "p",
			name: "b",
			attr: {
				cls: "b",
				id: "b"
			},
			css: {
				display: "block"
			},
			handle: {
				click: function(e) {
					e.preventDefault();
					console.log("b");
				}
			},
			items: [{
				tag: "a",
				name: "c",
				attr: {
					cls: "c",
					id: "c"
				},
				css: {
					display: "inline-block"
				},
				html: "testc",
				handle: {
					click: function(e) {
						e.preventDefault();
						console.log("c");
					}
				}
			}, {
				tag: "a",
				name: "d",
				attr: {
					cls: "d",
					id: "d"
				},
				css: {
					display: "inline-block"
				},
				html: "testd",
				handle: {
					click: function(e) {
						e.preventDefault();
						console.log("d");
					}
				}
			}]
		}]
	}, {
		tag: "article",
		name: "tab",
		attr: {
			cls: "tab"
		},
		handle: {
			init: function(done) {
				//模块A的使用
				moduleA(this, done);
			}
		}
	}]).find(".loading").hide();
})(this, jQuery);
