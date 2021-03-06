# jQuery.create
jQuery.create是依附jQuery动态创建标签，以DOM属性、参数、文件注入、自动适配等形式开放、灵活的动态创建您的项目。

一、写法：

1）$(selector).create([参数对象，参数对象，...]);

2）$.create(selector, [参数对象，参数对象，...]);

3) $(selector).create(); 

二、参数：

1) head下创建

font: 字体大小，可选;

2）body下创建

参数节点名：dom属性name + ":" + dom类型(tagName)组成，如：
```
{
  "name:tagName":{
    ...
  },
  ...
}
```
其他节点属性如下：

attr: 属性，{id:"a",...}，可选;

css: 样式，{display:"block",...}，可选;

html: 文本或function，可以是字符串也可以是方法名，可选; 
```
{
  html: function(tmpl){
    return tmpl(html, data, filter);
  },
  ...
}
```

handle: 事件，可选;
```
{
  handle: {
    click:function(){
    }, 
    mouseover:方法名，
    init:function(done){初始化方法，最后执行done();}, 
    ...
  }
  ...
}
```

items:子标签，[参数编写同父级]，可选;

三、注意

1）参数也可以写到目标标签的data-items属性中，可以多层创建。
```
<div class="header" data-items="[{...},{...},...]">
  <div class="headermain" data-items="[{...},...]"></div>
  ...
</div>
```

2）参数也可以文件形式写到目标标签的data-file属性中，可以多层创建。
```
<div data-file="../path/filename.json">
  ...
</div>
```

3）head动态创建功能，必须按 $("head").create({}) 书写。

四、例子

```
define("module", function(require, exports, module){
  return {...}
});

define(function(require, exports, module){
  var api = require("module");

  $("head").create({
    font:{
      size: 16, //html基础字体大小
      resize: true //是否自动适配
    }
  });
  
  $("body").create([{
    "main:div":{
      attr:{
        cls: "section"
      },
      css:{
        display:"none"
      },
      html: "a",
      items:[{
        "textlist:p":{
          items: ...
        }
      },{
        "username:input":{
          attr:{
            type: "hidden"
          }
        }
      }],
      handle:{
        init: function(done){
          $(this).create([...]);
          done();
        },
        click: function(e){
        }
        ...
      }
    }
  },
  ...
  ]).hide();
});
```

五、扩展

扩展类型分为filter[参数属性]、customAttrs[自定义标签后缀]两种。
```
$.cExtend([{
  index: 0,
  name: "name",
  fn: function(){
  }
}], "扩展类型");
```

主程序对数组提供了如下方法：

1）索引查找，[].find("name");

2）追加，[].add([]);

3）插入，[].insert(位置，值);

4）删除，[].delete(位置);

5）清空，[].clear();

六、define 用法如下：

```
define("d", function(require, exports, module) {
	window.a = 1;
});

define("c", function(require, exports, module) {
	exports.a = function() {
		return 2;
	};
});

define("b", ["d"], function(require, exports, module) {
	return function() {
		return window.a;
	};
});

define("a", function(require, exports, module) {
	var b = require("c");
	var a = require("b");
	exports.a = a() + b.a();
});

define(function(require, exports, module) {
	var a = require("a").a;
	console.log("define console: " + a)
});
```
