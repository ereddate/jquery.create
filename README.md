# jquery.create
依附jQuery动态创建标签

一、写法：

1）$(selector).create([参数对象，参数对象，...]);

2）$.create(selector, [参数对象，参数对象，...]);

二、参数：

tag: 标签类型, 必写;

name: 标签伪名, 必写;

attr: 属性，{id:"a",...}，可选;

css: 样式，{display:"block",...}，可选;

html: 文本，可以是字符串也可以是方法名，可选;

handle: 事件，{click:function(){}, mouseover:方法名，init:function(done){初始化方法，最后执行done();}, ...}，可选;

items:子标签，[参数编写同父级]，可选;

注：参数也可以写到目标标签的data-item属性中，如demo.html的写法。
