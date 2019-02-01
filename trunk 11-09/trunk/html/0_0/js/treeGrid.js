require(['/js/zlib/app.js'], function (App) {
    var PageModule = {

        dicValue:'', // 把修改计算公式配置中的计算公式保存到指标值
        formula: '', //计算公式保存带span的格式
        //字典树
        planDicInit: function () {
           page();

            function page() {
                Api.ajaxJson('http://localhost:8000/html/0_0/treeGrid.json', {}, function (tableData) {
                    if (tableData.success) {
                        require(['easyui_my'],function(easyuiObj){
                            $('#tt').treegrid({
                                idField:'id',
                                treeField:'name',
                                collapsible: true,
                                fitColumns: true,
                                singleSelect : true,
                                columns:[[
                                    {field:'name',title:'指标名称',width:150,align:'left'},
                                    {field:'code',title:'指标编码',width:150,align:'center'},
                                    {field:'val',title:'指标值',width:150,align:'center'},
                                    {field:'unit',title:'指标单位',width:80,align:'center'},
                                    {field:"text",title:"操作",align:'center',width:300,formatter: function(value,row,index){
                                            if(row.types != 'column'){
                                                return "<a class='btn  btn-info btn-check' id='"+ row.id+"' data-types='"+ row.types+"'><i class='fa fa-search-plus'></i>查看</a>" +
                                                    " <a class='btn btn-success  btn-change' id='"+ row.id+"' data-types='"+ row.types+"'><i class='fa icon-change'></i>修改</a>" +
                                                    " <a class='btn bg-f75c5c btn-delete' id='"+ row.id+"' data-types='"+ row.types+"'><i class='fa fa-trash'></i> 删除</a>"  +
                                                    " <a class='btn  btn-add btn-target' id='"+ row.id+"' data-types='"+ row.types+"'><i class='fa fa-plus'></i>添加下级指标</a>";
                                            }else{
                                                return "<a class='btn  btn-info btn-check' id='"+ row.id+"' data-types='"+ row.types+"'><i class='fa fa-search-plus'></i>查看</a>" +
                                                    " <a class='btn btn-success  btn-change' id='"+ row.id+"' data-types='"+ row.types+"'><i class='fa icon-change'></i>修改</a>" +
                                                    " <a class='btn bg-f75c5c btn-delete' id='"+ row.id+"' data-types='"+ row.types+"'><i class='fa fa-trash'></i> 删除</a>";
                                            }

                                        }},
                                ]],
                                data:tableData,
                                onBeforeExpand:function(row){
                                    var children = $("#tt").treegrid('getChildren',row.id);
                                    var url = "http://localhost:8000/html/0_0/level"+row.level+".json";
                                    if(!children || children.length==0){
                                        Api.ajaxJson(url,{},function(result){
                                            easyuiObj.tg_appendTreegridNode("#tt",row.id,result.rows[0].children);
                                            // $('#tt').treegrid("expand", row.id);

                                            // btncilck();

                                        });
                                    }
                                    if(nodeId != '0'){
                                        $('#tt').treegrid('expandAll', nodeId);//展开该节点
                                    }




                                   /* var children = $("#tt").treegrid('getChildren',row.id);
                                    if(!children || children.length==0){
                                        var url = "http://localhost:8000/html/0_0/level"+row.level+".json";  //新定义的url
                                        $("#tt").treegrid("options").url = url;  //赋值给treegrid绑定的路径
                                    }
                                    return true;*/
                                },
                            });
                            // btncilck();
                        });
                        //PageModule.dicRenderTableData(tableData.rows);
                        //clickButton();
                    } else {
                        Mom.layMsg(tableData.message)
                    }

                })
            }

        }

    };

    $(function () {
        //参数配置列表
        if ($('#treeGrid').length > 0) {
            PageModule.planDicInit()
        }
    });

})
;
