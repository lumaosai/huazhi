/**
 * Created by admin on 2018/9/24.
 */
require(['/js/zlib/app.js'], function (App) {
    var PageModel = {
        init:function () {
            //运输下拉
            Api.ajaxJson(Api.admin + "/api/sys/SysDict/type/"+"TRANSPORT_TYPE",{},function(result){
                Bus.appendOptionsValue('#transType',result.rows,'value','label');
            });
            //进出厂类型下拉
            Api.ajaxJson(Api.admin + "/api/sys/SysDict/type/"+"INOUT_TYPE",{},function(result){
                Bus.appendOptionsValue('#inputType',result.rows,'value','label');
            });
            require(["Page"],function () {
                var page = new Page();
                window.pageLoad = function () {
                    var data = {
                        nodeCode:$("#nodeNo").val(),
                        nodeName:$("#nodeName").val(),
                        transType:$("#transType option:selected").val(),
                        inoutType:$("#inputType option:selected").val()
                    };
                    page.init(Api.mtrl+"/api/fm/NodeInoutput/page",data,true,function (result) {
                        PageModel.createTable(result);
                        //编辑按钮
                        $(".btn-edit").click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改进出厂点','../material/factoryModels/turnoverInner.html?id='+id,'845px','454px');
                        });
                        //计算公式配置
                        $(".btn-formula").unbind("click").on("click",function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openDialog('计算公式配置', 'material/factoryModels/calculateFormula.html?id=' + id, '838px', '484px')
                        });
                        //新增
                        $("#btn-add").unbind("click").on("click",function () {
                            Bus.openEditDialog('新增进出厂点','../material/factoryModels/turnoverInner.html','845px', '454px')
                        });
                        //编辑
                        $("#btn-edit").unbind("click").on("click",function () {
                            Bus.editCheckedTable('修改进出厂点','../material/factoryModels/turnoverInner.html','845px','454px','#treeTable')
                        });
                        //删除
                        $(".btn-delete").click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除信息', Api.mtrl + '/api/fm/NodeInoutput/del',{ids:id});
                        });
                        //点击重置按钮
                        $('#reset-btn').unbind('click').on("click",function () {
                            $("#nodeNo").val('');
                            $("#nodeName").val('');
                            $("#transType option:first").prop("selected", 'selected');
                            $("#inputType option:first").prop("selected", 'selected');
                            page.reset(["nodeNo", "nodeName","transType","inputType"])
                        });
                    })
                }
                window.pageLoad();
            })
        },
        /**计算公式配置————lateralLComputed页*/
        //计算公式弹出页
        measuringNodeCInit: function () {
            //回显公式
            var id = Mom.getUrlParam('id');
            var type = Mom.getUrlParam('type');
            Api.ajaxJson(Api.mtrl+"/api/fm/NodeInoutput/form/"+id,{},function (result){
                $('.contentBox').find('.valbox>.context').text(result.nodeInoutput.formula);
            });
            require(['/js/module/material/factoryModels/computedCommons.js'], function (computed) {
                //只渲染一个select 之后会换成select
                computed.com_selectRead(Api.mtrl+'/api/fm/Formula/instrumentAndFunc');
                //8个切换按钮重新渲染数据// 参数1：头部切换选择了的active的大标签// 参数2：头部切换普通大标签// 参数3：头部切换小标签li
                computed.com_renderChange('.contentBox.active', '.contentBox', '.contentChange>li',Api.mtrl+'/api/fm/Formula/instrumentAndFunc', PageModel.btnComputed);
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
                var type = Mom.getUrlParam('type');
                var str = '';
                str += $(thisbox).find('.context.active').text();
                var data ='';
                if(type ==0){
                    data = {
                        "id":id,
                        "srcFormula":str,
                        "srcFormulaHtml":str
                    }
                }else{
                    data = {
                        "id":id,
                        "formula":str,
                        "formulaHtml":str
                    }
                }
                Api.ajaxJson(Api.mtrl+'/api/fm/NodeInoutput/updateFormula',JSON.stringify(data),function (result) {
                    if(result.success){
                        Mom.layMsg('保存成功')
                    }else{
                        Mom.layMsg(result.message)
                    }
                })
            })
        },
        checkInit:function () {
            var id = Mom.getUrlParam("id");
            Api.ajaxForm(Api.mtrl+"/api/fm/NodeInoutput/form/"+id,{},function (result) {
                if(result.success){
                    Bus.appendOptionsValue('#transType',result.transportTypeList,'value','label');
                    Bus.appendOptionsValue('#nodeAreaId',result.areaLoadRockList,'id','areaName');
                    Bus.appendOptionsValue('#inoutType',result.inoutTypeList,'value','label');
                    if(id){
                        Validator.renderData(result.nodeInoutput, $('#inputForm'));
                        $('#nodeNo').attr('readonly', 'readonly');
                    }
                }else{
                    Mom.layMsg(result.message);
                }
            })
        },
        createTable:function (dataTable) {
            $('#treeTable').dataTable({
                "bSort": true,
                "aoColumnDefs": [
                    {"bSortable": false, "aTargets": [0, 2, 4, 6]}
                ],
                "data": dataTable,
                "aoColumns": [
                    {"data": null, "defaultContent":"", 'sClass': "autoWidth center",
                        "render":function(data, type, row, meta) {
                            return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                        }
                    },
                    {"data": "nodeNo", 'sClass': "center "},
                    {"data": "nodeCode", 'sClass': "center"},
                    {"data": "nodename", 'sClass': "center "},
                    {"data": "nodeAlias", 'sClass': "center "},
                    {"data": "pres", 'sClass': "center "},
                    {"data": "areaName", 'sClass': "center "},
                    {"data": "transTypeLabel", 'sClass': "center "},
                    {"data": "inoutTypeLabel", 'sClass': "center "},
                    {"data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                        "render": function (data, type, row, meta) {
                            return "<i class='fa gray-check-"+row.enable+"'></i>";
                        }
                    },
                    {"data": "displayOrder", 'sClass': "center "},
                    {"data": "remark", 'sClass': "center "},
                    {
                        "data": null, "orderable": false, "defaultContent": "", 'sClass': "center autoWidth",
                        "render": function (data, type, row, meta) {
                            var html = "<a class='btn-formula' title='公式'>" +
                                "<i class='fa fa-calculator'></i>"+
                                    "</a>"+
                                "<a class='btn-edit' title='编辑'>" +
                                "<i class='fa fa-edit'></i>"+
                                "</a>"+
                            "<a class='btn-delete' title='删除'>" +
                            "<i class='fa fa-trash'></i>"+
                            "</a>";
                            return  html;
                        }
                    }
                ]
            });
            renderIChecks();
        }
    }
    $(function () {
        if($("#turnover").length>0){
            PageModel.init();
        }else if($("#turnoverInner").length>0){
            PageModel.checkInit();
        }else if($("#calculateFormula").length>0){
            PageModel.measuringNodeCInit()
        }
    })
});