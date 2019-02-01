require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        /**模板列表页*/
        planTempInit: function () {
            require(['jqGrid_my'], function (jqGridAll) {


                $.ajax({
                    url:'../../json/jqgrid/jqgridajax.json',
                    type:'get',
                    dataType:'json',
                    success:function(res){
                        var obj1 = {colNames:[ 'id', '姓名', '性别', '邮箱', 'Tax','Total', '日期' ],
                            colModel:[
                            {name : 'id',index : 'id',width : 55,align : "center",editable:true,hidden:true},
                            {name : 'invdate',index : 'invdate',width : 90,align : "center",classes:'i-checkes',editrules: {edithidden:true,required:true,number:true,minValue:10,maxValue:100}},
                            {name : 'name',index : 'name',width : 100,align : "center",editable:true},
                            {name : 'amount',index : 'amount',width : 200,align : "center"},
                            {name : 'tax',index : 'tax',width : 200,align : "center",editable:true},
                            {name : 'total',index : 'total',width : 200,align : "center"},
                            {name : 'id',index : 'id',width : 150,sortable : false,align : "center",classes:'btn',formatter:function(cellvalue, options, rowObject){
                                return '<input id="btn" type="button" data-id="'+rowObject.id+'" name="Submit" value="按钮"  />'
                            }}
                        ]};
                        var obj2 = {colNames:[ 'id', '图片', '名称', '描述','操作'],
                            colModel:[

                                {
                                    name : "id",
                                    index : "id",
                                    align : "center",
                                    width : 150
                                }, {
                                    name : "picUrl",
                                    index : "picUrl",
                                    align : "center",
                                    editable:true,
                                    width : 100
                                }, {
                                    name : "name",
                                    index : "name",
                                    width : 180,
                                    editable:true,
                                    edittype:'select',
                                    editoptions:{value:{1:'在用', 2:'空闲',}},
                                    align : "center"
                                }, {
                                    name : "remark",
                                    index : "remark",
                                    width : 180,
                                    align : "center"
                                },{name : 'id',index : 'id',width : 150,sortable : false,align : "center",classes:'btn',formatter:function(cellvalue, options, rowObject){
                                    console.log(cellvalue,11,options,22,rowObject);
                                    return '<input id="btn2" data-id="'+rowObject.id+'"  type="button" name="Submit" value="删除"  />'
                                }},
                            ]};
                        console.log(res,888);
                        var lastsel;
                        var tabId =[];//保存子表table的id
                        var obj = {
                            tableId:'#list11',
                            data:res,
                            title1:'主子表',
                            tableObj1:obj1,
                            url:'http://localhost/json/jqgrid/jqson.json',
                            tableObj2:obj2,
                            multiselect1:true,
                            multiselect2:false,
                            title2:'',
                            params:{} //子表需要传递的参数
                        }

                        var setting1 =  {
                            data:res,
                            multiselect:true,
                            subGrid : true,
                            colNames:[ 'id', '姓名', '性别', '邮箱', 'Tax','Total', '日期' ],
                            colModel:[
                                {name : 'id',index : 'id',width : 55,align : "center",editable:true,hidden:true},
                                {name : 'invdate',index : 'invdate',width : 90,align : "center",classes:'i-checkes',editrules: {edithidden:true,required:true,number:true,minValue:10,maxValue:100}},
                                {name : 'name',index : 'name',width : 100,align : "center",editable:true},
                                {name : 'amount',index : 'amount',width : 200,align : "center"},
                                {name : 'tax',index : 'tax',width : 200,align : "center",editable:true},
                                {name : 'total',index : 'total',width : 200,align : "center",formatter:function(cellvalue, options, rowObject){
                                    return '<div>'+rowObject.total.name+'</div>'
                                }},
                                {name : 'id',index : 'id',width : 150,sortable : false,align : "center",classes:'btn',formatter:function(cellvalue, options, rowObject){
                                    return '<input id="btn" type="button" data-id="'+rowObject.id+'" name="Submit" value="按钮"  />'
                                }}
                            ]
                        };
                        var setting2 = {colNames:[ 'id', '图片', '名称', '描述','操作'],
                            colModel:[

                                {
                                    name : "id",
                                    index : "id",
                                    align : "center",
                                    width : 150
                                }, {
                                    name : "picUrl",
                                    index : "picUrl",
                                    align : "center",
                                    editable:true,
                                    width : 100
                                }, {
                                    name : "name",
                                    index : "name",
                                    width : 180,
                                    editable:true,
                                    edittype:'select',
                                    editoptions:{value:{1:'在用', 2:'空闲',}},
                                    align : "center"
                                }, {
                                    name : "remark",
                                    index : "remark",
                                    width : 180,
                                    align : "center"
                                },{name : 'id',index : 'id',width : 150,sortable : false,align : "center",classes:'btn',formatter:function(cellvalue, options, rowObject){
                                    console.log(cellvalue,11,options,22,rowObject);
                                    return '<input id="btn2" data-id="'+rowObject.id+'"  type="button" name="Submit" value="删除"  />'
                                }},
                            ]};
                        var config = {
                            url:'http://localhost/json/jqgrid/jqson.json',
                        }
                        //主子表
                        var subtable =[];
                        jqGridAll.jG_jqGridTableLevel('#table',setting1,setting2,config,subtable,function(res){
                            console.log(res,888585858);
                        });//新封装的

                        //jqGridAll.jG_configTableLevel(obj,tabId,lastsel,function(tabId){
                        //    //获取子表的id
                        //    console.log(tabId,565656);
                        //    for(var i=0;i<tabId.length;i++){
                        //        console.log(tabId[i],767676);
                        //        $('#'+tabId[i]).off('click', '#btn2').on('click', '#btn2', function (event) {
                        //            var id = $(this).attr('data-id');
                        //            alert(id);
                        //        });
                        //    }
                        //
                        //});

                       // 普通表
                        var aaa = {
                            tableId:'#table',
                            data:res,
                            title:'普通表',
                            tableObj:obj1,
                            multiselect:false
                        }
                       var bbb = {
                           data:res,
                           colNames:[ 'id', '姓名', '性别', '邮箱', 'Tax','Total', '日期' ],
                           colModel:[
                               {name : 'id',index : 'id',width : 55,align : "center",editable:true,hidden:true},
                               {name : 'invdate',index : 'invdate',width : 90,align : "center",classes:'i-checkes',editrules: {edithidden:true,required:true,number:true,minValue:10,maxValue:100}},
                               {name : 'name',index : 'name',width : 100,align : "center",editable:true},
                               {name : 'amount',index : 'amount',width : 200,align : "center"},
                               {name : 'tax',index : 'tax',width : 200,align : "center",editable:true},
                               {name : 'total',index : 'total',width : 200,align : "center"},
                               {name : 'id',index : 'id',width : 150,sortable : false,align : "center",classes:'btn',formatter:function(cellvalue, options, rowObject){
                                   return '<input id="btn" type="button" data-id="'+rowObject.id+'" name="Submit" value="按钮"  />'
                               }}
                           ]};
                        //jqGridAll.jG_jqgridTable(aaa);
                        //jqGridAll.jG_jqGridTable('#table',bbb);


                        //var configData = jqGridAll.jG_configData(res);
                        //var gridConfig = jqGridAll.jG_config('qwqewqe', aaa.tableObj.colNames, aaa.tableObj.colModel);
                        //var lastsel;
                        //var gridEdit = jqGridAll.jG_editRowFn('#table' , lastsel);
                        //$('#table').jqGrid($.extend(gridEdit, configData, gridConfig));
                        //jqGridAll.jG_configTableLevel('#list11',res,'主子表',obj1,'../../json/jqgrid/jqson.json',obj2,true,false,lastsel,'',tabId,function(tabId){
                        //    //获取子表的id
                        //    console.log(tabId,565656);
                        //    for(var i=0;i<tabId.length;i++){
                        //        console.log(tabId[i],767676);
                        //        $('#'+tabId[i]).off('click', '#btn2').on('click', '#btn2', function (event) {
                        //            var id = $(this).attr('data-id');
                        //            alert(id);
                        //        });
                        //    }
                        //
                        //});
                        //pageInit(res);
                        $('#list11').off('click', '#btn').on('click', '#btn', function (event) {
                            var id = $(this).attr('data-id');
                            /**以下方法可以取到表任意一个表格内的内容*/
                            alert(id);
                            console.log(tabId);
                        });
                    }
                });
                $('button').click(function(){
                    var arr = [];
                    $('table').each(function(i,o){
                        arr =arr.concat($(this).jqGrid('getRowData'));
                    })
                    console.log(arr,666);
//        arrAll = $('#list11_1222_t').jqGrid('getRowData');

//        var arrAll = getJQAllData();
//        console.log(arrAll,22);
                });

                // 获取选中的checkbox 的id
                $('#getid').click(function(){
                    var id =jqGridAll.jG_getCheckId('#list11');
                    var ids =jqGridAll.jG_getCheckAllIds('#list11');

                    //var id=$('#list11').jqGrid('getGridParam','selrow');//获取单个选中的行id
                    //var ids = $("#list11").jqGrid('getGridParam','selarrrow');//获取所有选中的行的id 返回类型array
                    console.log(id,ids);
                })



                //获取当前表格的所有数据

                function getJQAllData() {
                    var o = jQuery("#list11");
                    //获取当前显示的数据
                    var rows = o.jqGrid('getRowData');
                    var rowNum = o.jqGrid('getGridParam', 'rowNum'); //获取显示配置记录数量
                    var total = o.jqGrid('getGridParam', 'records'); //获取查询得到的总记录数量
                    //设置rowNum为总记录数量并且刷新jqGrid，使所有记录现出来调用getRowData方法才能获取到所有数据
                    o.jqGrid('setGridParam', { rowNum: total }).trigger('reloadGrid');
                    var rows = o.jqGrid('getRowData');  //此时获取表格所有匹配的
                    o.jqGrid('setGridParam', { rowNum: rowNum }).trigger('reloadGrid'); //还原原来显示的记录数量
                    return rows;
                }

            });




        },


    };

    $(function () {
        //模板列表页
        if ($('#jqgrid').length > 0) {
            PageModule.planTempInit();
        }

    });
})
;/**
 * Created by lumaosai on 2018/10/12.
 */
