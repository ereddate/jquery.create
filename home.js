typeof jQuery != "undefined" && (function(win, $) {
	define("api", function(require, exports, module) {
		return {
			match: "url"
		}
	});
	//模块A
	define("moduleA", function(require, exports, module) {
		return function(elem, callback) {
			var a = [],
				b = [],
				i;
			for (i = 0; i < 2; i++)(a.push({
				["button" + i + ":a"]: {
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
				}
			}), b.push({
				["panel" + i + ":div"]: {
					html: "panel" + i,
					attr: {
						cls: "tab_panel"
					},
					css: {
						display: "none"
					}
				}
			}));
			$(elem).create([{
				"control:header": {
					items: a
				},
				"panel:div": {
					items: b
				}
			}]);
			$(".tab_button").eq(0).trigger('click');
			callback();
		};
	});
	//模块B
	define("moduleB", function(require, exports, module) {
		return function(elem, callback) {
			$.require(require("api").match, false, {
				callback: "callback"
			})._jsonp(function(result) {
				if (result.fh == 1) {
					$(elem).create([{
						"f:div": {
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
						}
					}]);
					callback();
				}
			}, function() {
				callback();
			});
		};
	});

	define(function(require, exports, module) {
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
				"citems:a": {
					html: "citems"
				}
			}]
		};

		$("head").create({
			font: {
				size: 16,
				resize: true
			}
		});

		$("body").create([{
			"a:article": {
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
						require("moduleB")(this, done);
					},
					click: function(e) {
						e.preventDefault();
						console.log("a");
					}
				},
				//子标签创建
				items: [{
					"header:header": {
						css: {
							display: "inline-block"
						},
						items: [{
							"title:h1": {
								html: "title"
							},
							"desc:p": {
								html: function(tmpl) {
									return tmpl($("#tmpl").html(), {
										a: "description"
									});
								}
							},
							"logo:img": {
								attr: {
									src: "url",
									alt: "img test",
									style: "width:100%;height:100px;"
								},
								handle: {
									load: function(e) {
										console.log("img loaded!")
									}
								}
							}
						}]
					},
					"table:table": {
						handle: {
							init: function(done) {
								var list = [];
								for (i = 0; i < 5; i++) list.push({
									["td" + i + ":td"]: {
										html: i + ""
									}
								});
								$(this).create([{
									"tr:tr": {
										items: list
									}
								}]);
								done();
							}
						}
					},
					"b:p": {
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
							"c:a": {
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
							},
							"d:a": {
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
							}
						}]
					}
				}]
			}
		}, {
			"tab:article": {
				attr: {
					cls: "tab"
				},
				handle: {
					init: function(done) {
						//模块A的使用
						require("moduleA")(this, done);
					}
				}
			}
		}]).find(".loading").hide();
	});

})(this, jQuery);
