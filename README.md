# jquery.create
依附jQuery动态创建标签，会自动读取父标签的data-items属性或window["cItems"]对象的值。

一、写法：

1）$(selector).create([参数对象，参数对象，...]);

2）$.create(selector, [参数对象，参数对象，...]);

3) $(selector).create(); 

二、参数：

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

四、例子

```
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
