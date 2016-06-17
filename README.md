# jQuery.create
jQuery.create是依附jQuery动态创建标签，以DOM属性、参数、文件注入、自动适配等形式开放、灵活的动态创建您的项目。

一、写法：

1）$(selector).create([参数对象，参数对象，...]);

2）$.create(selector, [参数对象，参数对象，...]);

3) $(selector).create(); 

二、参数：

1) head下创建

viewport: 视窗控制，可选;

font: 字体大小，可选;

2）body下创建

tag: 标签类型, 必写;

name: 标签伪名, 必写;

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

3）参数中可能会出现两个name，分别是伪名和dom属性name。

4）head动态创建功能，必须按 $("head").create({}) 书写。

四、例子

```

$("head").create({
  viewport:{ //head标签中有将更新，没有创建
    width："device-width",
    ...
  },
  font:{
    size: 16, //html基础字体大小
    resize: true //是否自动适配
  }
});

$("body").create([{
  tag: "div",
  name: "main",
  attr:{
    cls: "section"
  },
  css:{
    display:"none"
  },
  html: "a",
  items:[{
    tag: "p",
    name: "textlist",
    items: ...
  },{
    tag: "input",
    name: "username",
    attr:{
      name: "usname",
      type: "hidden"
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
},
...
]).hide();
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
