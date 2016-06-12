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
				var self = this;
				$.require(api.match, false, {
					callback: "callback"
				})._jsonp(function(result) {
					if (result.fh == 1) {
						$(self).create([{
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
									alert("e");
								}
							}
						}]);
						done();
					}
				}, function() {
					done();
				});
			},
			click: function(e) {
				e.preventDefault();
				alert("a");
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
					src: "http://img10.3lian.com/d0214/file/2012/02/07/9396f24b9edca2425bd5a95198eeb328.jpg",
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
					alert("b");
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
						alert("c");
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
						alert("d");
					}
				}
			}]
		}]
	}]).find(".loading").hide();
})(this, jQuery);
