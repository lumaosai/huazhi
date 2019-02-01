/**
 * Created by lumaosai on 2018/11/28.
 */
require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        momFactory: function(){
            //引入Page插件
            require(['Page'], function () {
                var page = new Page();

                window.pageLoad = function () {
                    var data = {
                        enable: '',
                        fctrName: ''
                    };
                    page.init(Const.mtrl + "/api/fm/Fctr/page", data, true, function (tableData) {

                        var settings = {
                            "bSort": true,
                            'colReorder': true, //交换列
                            'fixedHeader': true,
                            scrollX: true,
                            fixedColumns:   {
                                rightColumns: 1
                            },
                            "aoColumnDefs": [
                                {"bSortable": false, "aTargets": [0 ]}
                            ],
                            "data": tableData,
                            "aoColumns": [
                                {
                                    "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                                    "render": function (data, type, row, meta) {
                                        return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                                    }
                                },
                                {"data": "fctrNo", 'sClass': " center", "width": "12%"},
                                {"data": "fctrCode", 'sClass': "center ", "width": "12%"},
                                {"data": "fctrName", 'sClass': "center", "width": "12%"},
                                {"data": "fctrAlias", 'sClass': "center","width": "12%",
                                    "render": function (data, type, row, meta) {
                                    return  "<input type='text' id=" + row.id + " class='form-control' value="+row.fctrAlias+" >"
                                }},
                            ]
                        }
                        dt_renderData('#treeTable',{colReorder: true,fixedHeader: true,colResizable:true,fixedColumns:true,config:settings});
                        dt_renderVisible('#treeTable','.visibleColumn'); //渲染ul 并隐藏列。

                        $('#btn-add').unbind('click').click(function(){
                            var str = '';
                            var arr = [{
                                lable:'第1个',
                                value:'1'
                            },{
                                lable:'第2个',
                                value:'2'
                            },{
                                lable:'第3个',
                                value:'3'
                            }]
                            arr.forEach(function(item){
                                str += "<option value='"+item.value+"'>"+item.lable+"</option>";
                            });
                            var data1 = {
                                'id':"0",//必须有id
                                'fctrNo':"<input type='text' name='remark' class='form-control'>",
                                'fctrCode':"<select class='select2'>"+str+"</select>",
                                'fctrName':"<input type='text' class='Wdate form-control' onclick='WdatePicker();' >",
                                'fctrAlias':'223'
                            };
                            //向dataTable添加数据
                            dt_addRows(dt, [data1],0);
                            renderSelect2($('.select2')); //渲染select2样式
                            renderIChecks();
                        });

                        //此处删除选中的行，没有走接口。
                        $('#btn-delete').click(function () {
                            dt_deletRows('#treeTable',Const.mtrl +"/api/mv/FormulaDef/delete");
                        });

                        //获取编辑行的所有数据保存
                        $('#save-btn').click(function () {
                           var data = dt_getData('#treeTable',idArr);
                            console.log(data);
                        });
                    });
                };
                pageLoad();
            });
        },

    };
    $(function () {
        if ($('#newDataTables').length > 0) {
            PageModule.momFactory()
        }
    });
})
