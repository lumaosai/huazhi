/**
 * Created by lumaosai on 2018/9/21.
 */
require(['/js/zlib/app.js'], function (App) {
    require(['checkUser']);
    var PageModule = {
        mutualDonorPoint: function(){
            //引入Page插件
            require(['Page'], function () {
                var page = new Page();
                Api.ajaxForm(Api.mtrl + "/api/fm/Fctr/fctrSelect",{},function(result){
                    if(result.success){
                        Bus.appendOptionsValue('#srcFctrId',result.rows,'id','fctrName');
                        Bus.appendOptionsValue('#destFctrId',result.rows,'id','fctrName');
                    }
                });

                window.pageLoad = function () {
                    var data = {
                        srcFctrId: $("#srcFctrId option:selected").val(),
                        destFctrId: $("#destFctrId option:selected").val(),
                        nodeCode: $('#nodeCode').val(),
                        nodename: $('#nodename').val()
                        };
                    //修改默认每页显示条数
                    page.init(Api.mtrl + "/api/fm/NodeInnSmt/page", data, true, function (tableData) {
                        renderTableData(tableData);
                        $('.btn-edit').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改互供点数据', '/material/factoryModels/mutualDonorPointView.html?id=' + id, '900px', '475px');
                        });
                        $('.btn-formula').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            var type = $(this).parents("tr").find('.i-checks').attr('data-num');
                            Bus.openDialog('计算公式', '/material/factoryModels/mutualDonorPointFormula.html?id=' + id +'&type=' +type, '665px', '510px');
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该互供点吗', Api.mtrl + '/api/fm/NodeInnSmt/delInnSmt', {ids:id});
                        });
                    });
                };
                $("#btn-search").click(function () {
                    pageLoad();
                });
                pageLoad();
            });
            function renderTableData(tableData) {
                $('#treeTable').dataTable({
                    "bSort": true,
                    "aoColumnDefs": [
                        {"bSortable": false, "aTargets": [0,6]}
                    ],
                    "data": tableData,
                    //定义列 宽度 以及在json中的列名
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox'  id=" + row.id + "  class='i-checks' data-num=" + row.arbiFormula +">"
                            }
                        },
                        {"data": "nodeNo", 'sClass': " center", "width": "8%"},
                        {"data": "nodeCode", 'sClass': "center ", "width": "8%"},
                        {"data": "nodename", 'sClass': "center", "width": "12%"},
                        {"data": "nodeAlias", 'sClass': "center","width": "12%"},
                        {"data": "pres", 'sClass': "center","width": "12%"},
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<div>"+ row.fctr.srcFctrName+"</div>"
                            }
                        },
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<div>"+ row.fctr.destFctrName+"</div>"
                            }
                        },
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<div>"+ row.mtrl.srcMtrlName+"</div>"
                            }
                        },
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<div>"+ row.mtrl.destMtrlName+"</div>"
                            }
                        },
                        {"data": "arbiFormulaName", 'sClass': "center", "width": '8%'},
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn-formula' title='计算公式'><i class='fa fa-calculator '></i></a >" +
                                    "<a class='btn-edit' title='编辑'><i class='fa fa-edit '></i></a >" +
                                    "<a class='btn-delete' title='删除'><i class='fa fa-trash-o ' ></i></a >";
                            }
                        }
                         ]
                });
                renderIChecks();
            };
        },


        //编辑页面
        mutualDonorPointView: function() {
            var id =Mom.getUrlParam('id');
            // 加载select
            function loadSelect(list,pId,id) {
                var val = $(pId).val();
                list.forEach(function(item){
                    if( val == item.id){
                        Bus.appendOptionsValue(id, item.children,'id','mtrlName');
                    }
                })
            }

            // select 改变事件
            function selectChange(list,pId,id) {
                $(pId).change(function(){
                    var val = $(this).val();
                    $(id).empty();
                    list.forEach(function(item){
                        if( val == item.id){
                            Bus.appendOptionsValue(id, item.children,'id','mtrlName');
                        }
                    })
                })
            }
            if(id){
                    Api.ajaxJson(Api.mtrl + "/api/fm/NodeInnSmt/form/" +id,{},function(result){
                        if(result.success){
                            var list = result.mtrlFctrSelect;
                            Bus.appendOptionsValue('#srcFctrId',result.mtrlFctrSelect,'id','fctrName');
                            Bus.appendOptionsValue('#destFctrId',result.mtrlFctrSelect,'id','fctrName');
                            Validator.renderData(result.row, $('#inputForm'));
                            loadSelect(list,'#srcFctrId','#srcMtrlId');
                            loadSelect(list,'#destFctrId','#destMtrlId');
                                $('#srcMtrlId').val(result.row.srcMtrlId);
                            $('#destMtrlId').val(result.row.destMtrlId);
                            selectChange(list,'#srcFctrId','#srcMtrlId');
                            selectChange(list,'#destFctrId','#destMtrlId');
                        }
                        $('#nodeNo').attr('readonly','readonly');

                    });

            }else{
                Api.ajaxJson(Api.mtrl + "/api/fm/NodeInnSmt/form/0",{},function(result){
                    if(result.success){
                        var list = result.mtrlFctrSelect;
                        Bus.appendOptionsValue('#srcFctrId',result.mtrlFctrSelect,'id','fctrName');
                        Bus.appendOptionsValue('#destFctrId',result.mtrlFctrSelect,'id','fctrName');
                        loadSelect(list,'#srcFctrId','#srcMtrlId');
                        loadSelect(list,'#destFctrId','#destMtrlId');
                        selectChange(list,'#srcFctrId','#srcMtrlId');
                        selectChange(list,'#destFctrId','#destMtrlId');
                    }
                });
            }

        },
        /**计算公式配置————lateralLComputed页*/
        //计算公式弹出页
        measuringNodeCInit: function () {
            //回显公式
            var id = Mom.getUrlParam('id');
            var type = Mom.getUrlParam('type');

            Api.ajaxJson(Api.mtrl+'/api/fm/NodeInnSmt/form/'+id,{},function (result){
               var num = result.row.arbiFormula;
                if(num == 0){
                    $('.contentBox').find('.valbox>.context').text(result.row.srcFormula);
                }else{
                    $('.contentBox').find('.valbox>.context').text(result.row.destFormula);
                }
                //$('.contentBox').find('.valbox>.context').text(result.row.srcFormula);
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
                        "destFormula":str,
                        "destFormulaHtml":str
                    }
                }
                //var data = {
                //    "id":id
                //};
                //data['formula']=str;
                Api.ajaxJson(Api.mtrl+'/api/fm/NodeInnSmt/updateFormula',JSON.stringify(data),function (result) {
                    if(result.success){
                        Mom.layMsg('保存成功')
                    }else{
                        Mom.layMsg(result.message)
                    }
                })

            })

        },

    }
    $(function () {
        if ($('#mutualDonorPoint').length > 0) {
            PageModule.mutualDonorPoint();
        }else if($('#mutualDonorPointView').length > 0){
            PageModule.mutualDonorPointView();
        }else if($("#mutualDonorPointFormula").length>0){
            PageModule.measuringNodeCInit()
        }
    });
})
