require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);
    /**作者：贾旭光
     *日期：2018.9.20
     *描述：
     *接口问题 界区类型 回显参数与加载参数完全不对应nodeAreaId 和nodeAreaType下的id
     *接口问题 新增保存的时候报错 和计算精度与显示顺序 的数据有关
     *接口问题 修改保存的时候同样有问题
     */
    var PageModule = {
        /**列表页————lateralLineListPage页*/
        //列表页
        measuringNodeInit: function () {
            Api.ajaxJson(Api.mtrl+'/api/fm/NodeMeasure/getNodeAreaList',{},function (result) {

                Bus.appendOptionsValue('#nodeAreaId',result,'id','areaName')
            });




            Mom.include('computed_css', '/css/', ['computedCommons.css']);
            require(['Page'], function () {
                var page = new Page();
                window.pageLoad = function () {
                    var data = {
                        nodeNo: $('#nodeNo').val(),
                        nodeName: $('#nodeName').val(),
                        nodeAreaId: $('#nodeAreaId option:selected').val(),
                        enable: $('#enable option:selected').val()
                    };
                    page.init(Api.mtrl+"/api/fm/NodeMeasure/page", data, true, function (tableData,result) {
                        PageModule.createTable(tableData);
                        PageModule.btngather(page);
                    })



                };
                pageLoad();

            })


        },
        //创建表格
        createTable: function (tableDate) {
            $('#treeTable').dataTable({
                "bSort": true,
                "aoColumnDefs": [
                    {"bSortable": false, "aTargets": [0]}
                ],
                "data": tableDate,
                "aoColumns": [
                    {
                        "data": null, "defaultContent": "", 'sClass': " center",
                        "render": function (data, type, row, meta) {
                            return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                        }
                    },
                    {"data": "nodeNo",      'sClass': "center "},
                    {"data": "nodeCode",    'sClass': "center "},
                    {"data": "nodename",    'sClass': "center "},
                    {"data": "nodeAlias",   'sClass': "center "},
                    {"data": "areaName",   'sClass': "center "},
                    {"data": "pres",        'sClass': "center "},
                    {"data": "enable", 'sClass': "center ",
                        "render": function (data, type, row, meta) {
                        return "<i class='fa gray-check-"+row.enable+"'></i>"

                        }
                    },
                    {"data": "displayOrder",'sClass': "center "},
                    {"data": "remark",      'sClass': "center "},
                    {
                        "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center ","width":"12%",
                        "render": function (data, type, row, meta) {
                            return "<a class='btn-computed' title='计算'><i class='fa fa-calculator'></i></a>" +
                                "<a class='btn-edit' title='编辑'><i class='fa fa-edit '></i></a >" +
                                "<a class='btn-delete' title='删除'><i class='fa fa-trash-o '></i></a >";
                        }
                    }

                ]
            });
            renderIChecks();
        },
        //按钮集合
        btngather: function (page) {
            //新增
            $('#btn-add').unbind('click').click(function () {
                Bus.openEditDialog('新增计量节点', 'material/factoryModels/measuringNodeForm.html', '755px', '380px');
            });
            //头部修改
            $('#btn-edit').unbind('click').click(function () {
                Bus.editCheckedTable('新增计量节点', 'material/factoryModels/measuringNodeForm.html', '755px', '380px','#treeTable');
            });
            //计算
            $('.btn-computed').unbind('click').on('click', function () {
                var id = $(this).parents("tr").find('.i-checks').attr('id');
                Bus.openDialog('计算公式配置', 'material/factoryModels/measuringNodeCom.html?id=' + id, '643px', '480px')
            });
            //编辑
            $('.btn-edit').unbind('click').click(function () {
                var id = $(this).parents("tr").find('.i-checks').attr('id');
                Bus.openEditDialog('修改计量节点', 'material/factoryModels/measuringNodeForm.html?id=' + id, '755px', '380px');
            });
            //删除
            $('.btn-delete').unbind('click').click(function () {
                var id = $(this).parents("tr").find('.i-checks').attr('id');
                Bus.deleteItem('确定要删除该计量节点吗', Api.mtrl + '/api/fm/NodeMeasure/del', {ids:id});
            });
            //点击重置按钮
            $('#reset-btn').unbind('click').click(function () {
                $("#nodeAreaId option:first").prop("selected", 'selected');
                $("#enable option:first").prop("selected", 'selected');
                $("#nodeNo").val("");
                $("#nodeName").val("");
                page.reset(["nodeAreaId", "enable","nodeNo","nodeName"]);
            });
            $("#search-btn").unbind('click').click(function () {
                pageLoad();
            });
        },
        /**计算公式配置————lateralLComputed页*/
        //计算公式弹出页
        measuringNodeCInit: function () {
            //回显公式
            var id = Mom.getUrlParam('id');
            Api.ajaxJson(Api.mtrl+"/api/fm/NodeMeasure/form/"+id,{},function (result){
                $('.contentBox').find('.valbox>.context').text(result.nodeMeasure.formula);
            });




            require(['/js/module/material/factoryModels/computedCommons.js'], function (computed) {
                //只渲染一个select 之后会换成select
                computed.com_selectRead(Api.mtrl+'/api/fm/Formula/instrumentAndFunc');
                //8个切换按钮重新渲染数据// 参数1：头部切换选择了的active的大标签// 参数2：头部切换普通大标签// 参数3：头部切换小标签li
                computed.com_renderChange('.contentBox.active', '.contentBox', '.contentChange>li',Api.mtrl+'/api/fm/Formula/instrumentAndFunc', PageModule.btnComputed);
            })
        },
        //计算公式按钮区
        btnComputed: function () {
            var id = Mom.getUrlParam('id');
            var thisbox = '.contentBox.active';
            //搜索按钮
            $(thisbox).find('.btn-search').click(function () {
                var text = $(thisbox).find('.searchinput').val();
                //获取文本框输入
                if ($.trim(text)!= "") {
                    $('.searchUl>li').hide().filter(":contains('" + text + "')").show();
                }else if($.trim(text)=="") {
                    $('.searchUl>li').show()
                }
            });


            //公式匹配
            $(thisbox).find('.btn-matching').unbind('click').on('click', function () {
                var materialValue = $(thisbox).find('ul.searchUl>li.active').text();
                if (materialValue == '') {
                    Mom.layMsg('公式未选择,请选择公式后再点击匹配!')
                } else {
                    var selectval = $(thisbox).find('.selFn option:selected').val();
                    $('#Fninput').val(selectval);
                    $(thisbox).find('.context>br').each(function (i, item) {
                        $(item).remove();
                    });
                    $('.contentBox.active').find('.contentInner div.context.active').append(selectval + '(' + materialValue + ')')
                }

            });
            //四则运算等符号
            for (var i = 0; i < $(thisbox).find('fieldset button').length - 2; i++) {
                $(thisbox).find('fieldset button').eq(i).unbind('click').on('click', function () {
                    $(thisbox).find('.context>br').each(function (i, item) {
                        $(item).remove();
                    });
                    $(thisbox).find('.contentInner div.context.active').append('<span>' + $(this).text() + '</span>')
                })
            }
            //清除
            $(thisbox).find('fieldset .empty').unbind('click').on('click', function () {
                $(thisbox).find('.contentInner div.context.active').empty();

            });
            //退格
            $(thisbox).find('fieldset .backOne').unbind('click').on('click', function () {
                var strback = $(thisbox).find('.contentInner div.context.active').text();

                var newstr = strback.substr(0, strback.length - 1);
                $(thisbox).find('.contentInner div.context.active').text(newstr)
            });

            //匹配
            require(['/js/module/material/factoryModels/computedCommons.js'], function (computed) {
                $(thisbox).find('.btn-verify').unbind('click').on('click', function () {
                    var str = '';
                    str += $(thisbox).find('.context.active').text();
                    computed.com_regularFn(str)
                })
            });
            //保存
            $(thisbox).find('.btn-save').unbind('click').on('click', function () {
                var str = '';
                str += $(thisbox).find('.context.active').text();
                var data = {
                    "id":id
                };
                data['formula']=str;
                Api.ajaxJson(Api.mtrl+'/api/fm/NodeMeasure/updateFormula',JSON.stringify(data),function (result) {
                    if(result.success){
                        Mom.layMsg('保存成功')
                    }else{
                        Mom.layMsg(result.message)
                    }
                })

            })

        },
        /**弹出新增、修改页*/
        measuringNodeFormInit: function () {
            var id = Mom.getUrlParam('id'),
                api = Mom.getUrlParam('api') || 'form';
            Api.ajaxJson(Api.mtrl+'/api/fm/NodeMeasure/form/'+id, {}, function (result) {
                if (result.success) {
                    Bus.appendOptionsValue('#nodeAreaId',result.nodeAreaList,'id','areaName');
                    Bus.appendOptionsValue('#nodeAreaType',result.nodeAreaType);
                    if (id) {

                        Validator.renderData(result.nodeMeasure, $('#inputForm'));
                        PageModule.selectRender('#nodeAreaType',result.nodeMeasure.nodeAreaId);
                    }

                } else {
                    Mom.layMsg(result.message);
                }
            });

        },
        //select 写select的选择器 dataval写返回值的id路径
        selectRender: function (select, dataval) {
            $(select + ">option").each(function () {
                if (dataval == $(this).attr('value')) {
                    $(this).attr("selected", true);
                }
            });
        }


    };
    $(function () {
        //参数配置列表
        if ($('#measuringNodeList').length > 0) {
            PageModule.measuringNodeInit()
        }
        else if ($('#measuringNodeCom').length > 0) {
            PageModule.measuringNodeCInit()
        }
        else if ($('#measuringNodeForm').length > 0) {
            PageModule.measuringNodeFormInit()
        }

    });

});