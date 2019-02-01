require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        init: function(){
            //引入Page插件
            require(['artTemplate'],function(template){
                require(['mock'],function(Mock){
                    var data1 = Mock.mock({
                        'id':'1233',
                        // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
                        'list|1-10': [{
                                'id|+1': 1, // 属性 id 是一个自增数，起始值为 1，每次增 1
                                'name':'zs',
                            'num|1-100':100, //生成一个大于等于 1、小于等于 100 的整数，属性值 100 只用来确定类型。
                            'flag|1':true, //随机生成一个布尔值，值为 true 的概率是 1/2，值为 false 的概率是 1/2。
                            'obj|2':{a:1,b:2,c:3,d:4}, //从属性值 {} 中随机选取 count 个属性
                            'email': '@EMAIL',  //用 @ 来标识其后的字符串是 占位符。
                        }]
                    })
                    var htmlTmp = template('template2', data1);
                    $('#app').html(htmlTmp);


                    var data = {
                        title: '模板',
                        name:'aaa',
                        id:'1111',
                        isAdmin: false,
                        num: 4,
                        list: ['文艺', '博客', '摄影', '电影', '民谣', '旅行', '吉他'],
                        obj:{
                            name: '张三',
                            age: 18,
                            gender: "男"
                        }
                    };
                    var html = template('template1', data);
                    $('#root').html(html);

                    /*
                    *  下面是引入外部模板
                    *  先定义一个外部模板，参考 otherTemp.html 直接定义模板
                    * 由于模板是单独写在一个页面的，所以我们需要ajax的get方法获取到模板页，然后在进行模板替换
                    * 这里，我使用的是jquery的get方法获取模板页，然后再利用template.compile()获取渲染内容，然后将数据渲染进去，最后添加到页面里即可。
                    * 注意：这时候就不能使用template()方法进行模板替换了，必须使用template.compile()及render()进行模板替换才行
                    * */
                    $.get('otherTemp.html',function (da) {
                        var render = template.compile(da);
                        var str = render(data);
                        $('#otherTemp').html(str);
                    })
                })
            })
        },

    };
    $(function () {
        if ($('#artTemplate').length > 0) {
            PageModule.init();
        }
    });
})
