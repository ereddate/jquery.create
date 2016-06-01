typeof jQuery != "undefined" && (function(win, $) {
	var api = {
		match: "http://localhost:80/"
	};
	win.testClick = function(){
		console.log('testClick')
	};
	win.testInit = function(done){
		console.log('testInit')
		done();
	};
	win.gettestHtml = function(){
		return "test111"
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
				html: "description"
			}]
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
