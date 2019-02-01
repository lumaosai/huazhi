/**
 * Created by lumaosai on 2018/9/21.
 */
require(['/js/zlib/app.js'], function (App) {
    require(['checkUser']);
    Mom.include('_myCss_insert','/css/',[
        'defaultFormula.css'
    ]);
    var PageModule = {
        init: function () {
            var treeTankId;//
            require(['ztree_my'], function (ZTree) {
                var orgTree, curClickTreeNode;
                var orgZtreeSetting = $.extend(true, {}, {
                    callback: {onClick: orgOnClick}
                }, {});
                var orgApiCfg = $.extend(true, {}, {
                    url: Api.mtrl+"/api/mv/Tank/getTankTree",
                    data: {},
                    contentType: 'json'
                }, {});
                var orgConType = orgApiCfg.contentType || 'json';
                loadOrgData();
                function loadOrgData() {
                    if (orgConType == 'json') {
                        //json的方式调用接口
                        Api.ajaxJson(orgApiCfg.url, JSON.stringify(orgApiCfg.data || {}), function (result) {
                            if (result.success) {
                                loadOrgTree(result.rows);
                            } else {
                                Mom.layMsg(result.message);
                            }
                        });
                    }
                }
                function loadOrgTree(rows) {
                    var ztree1 = new ZTree();
                    orgTree = ztree1.loadData($("#zTree"), rows, false, orgZtreeSetting);
                    ztree1.registerSearch(orgTree, $('#wait_searchText'), 'name');
                }
                function orgOnClick(event, treeId, treeNode, clickFlag) {
                    if (orgTree) {
                        curClickTreeNode = treeNode;
                        orgTree.expandNode(treeNode);
                        if(treeNode.pId!=null){
                            pageLoad(treeNode.id);
                            treeTankId=treeNode.id;
                        }else{
                            Mom.layAlert('请选择槽罐类数据，槽/罐区无公式可操作')
                        }
                        // loadWaitUserData();
                    }
                }
            });
            //加载右侧表 Api.mtrl + /api/mv/FormulaDef/formType
            Api.ajaxJson(Api.mtrl +"/api/mv/FormulaDef/formType", {}, function (res) {
                if (res.success) {
                    renderRightTableData(res.rows);
                }
                // 表格双击时编辑公式
                $('#treeTable2 tbody tr').dblclick(function () {
                    $(this).addClass('selected').siblings().removeClass('selected');
                    var val = $(this).find('td').eq(0).text();
                    $('.valbox').append('<span>' + val + '</span>');
                })
            });
            function renderRightTableData(tableData) {
                $('#treeTable2').dataTable({
                    "bFilter": true,
                    "data": tableData,
                    "aoColumns": [
                        {"data": "value", 'sClass': " center", "width": "50%"},
                        {"data": "label", 'sClass': "center"}
                    ]
                });
                renderIChecks();
            };

            //加载左侧表
            window.pageLoad = function (treeId) {
                var data = {
                    formulaName: $('#name').val(),
                    tankId:treeId
                };
                console.log(data);
                //Api.mtrl + "/api/mv/FormulaDef/form"
                Api.ajaxJson(Api.mtrl + "/api/mv/TankFormula/form", JSON.stringify(data), function (res) {
                    if (res.success) {
                        renderTableData(res.rows);

                        //保存按钮
                        $('#save-btn').unbind('click').on('click',function () {
                            //提交
                            if (!Validator.valid($("#inputForm"), '1.2')) {
                                return;
                            }
                            var arr = [];
                            $("#treeTable tbody tr").each(function (index, item) {
                                if($(this).find('div').hasClass('checked')){
                                    var obj = {};
                                    obj.id = $(this).find('input.i-checks').attr('id');
                                    obj.tankId=treeId;
                                    obj.formula = $(this).find('td').eq(3).text();
                                    obj.formulaId=res.rows[index].formulaId;
                                    arr.push(obj);
                                }
                                console.log(arr);

                            });
                            if(arr.length==0){
                                Mom.layAlert('请至少勾选一项再进行保存')
                            }else{
                                var data = {
                                    tankFormulaList:JSON.stringify(arr)
                                };

                                Api.ajaxForm(Api.mtrl + "/api/mv/TankFormula/save",data, function (result) {
                                    if (result.success) {
                                        Mom.layAlert('勾选数据已保存成功！');
                                        $('#name').val(''); //清空input
                                    } else {
                                        Mom.layAlert(result.message);
                                    }
                                });
                            };

                        });
                    }

                });
            };
            $("#btn-search").click(function () {
                pageLoad(treeTankId);
            });

            function renderTableData(tableData) {
                dt = $('#treeTable').dataTable({
                    //"bFilter":true,
                    "data": tableData,
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "center","width":"60px",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' name='id' attr-new='" + (row.id ? '0' : '1') + "' class='i-checks' value='" + row.id + "' id=" + row.id + ">"
                            }
                        },
                        {"data": "formulaName", 'sClass': " center", "width": "12%"},
                        {"data": "formulaShortName", 'sClass': "center ", "width": "12%"},
                        {"data": "formula", 'sClass': "center"},
                        {"data": "remark", 'sClass': "center", "width": "12%"}
                    ]
                });
                rowClick();
                renderIChecks();
            };
            function rowClick() {
                //双击tr获取当前行数据
                $('#treeTable tbody').on('dblclick', 'tr', function () {
                    var dtApi = dt.api();
                    var selectTr = dt.$('tr.selected');
                    selectTr.removeClass('selected');
                    $(this).addClass('selected');
                    var data = dtApi.row(this).data();
                    //获取id、公式
                    var id = data.id;
                    var formula = data.formula;
                    $('.valbox').html('<span>' + formula + '</span>');
                    $('.content-input').val(id);
                });
            }



            //四则运算等符号
            var thisbox = '.content-right';
            for (var i = 0; i < $(thisbox).find('fieldset button').length - 2; i++) {
                $(thisbox).find('fieldset button').eq(i).unbind('click').on('click', function () {
                    $(thisbox).find('.valbox>br').each(function (i, item) {
                        $(item).remove();
                    });
                    $(thisbox).find('.valbox').append('<span>' + $(this).text() + '</span>')
                })
            }
            //清除
            $(thisbox).find('fieldset .empty').unbind('click').on('click', function () {
                $(thisbox).find('.valbox').empty();

            });
            //退格
            $(thisbox).find('fieldset .backOne').unbind('click').on('click', function () {
                var strback = $(thisbox).find('.valbox').text();

                var newstr = strback.substr(0, strback.length - 1);
                $(thisbox).find('.valbox').text(newstr)
            });
            //检查
            $(thisbox).find('#btn-verify').unbind('click').on('click', function () {
                var str=$(thisbox).find('.valbox').text();
                PageModule.regularFn(str);
            });

            //确定按钮
            $(thisbox).find('#btn-save').unbind('click').on('click', function () {
                var str = '';
                str += $(thisbox).find('.valbox').text();
                $("#treeTable tbody tr").each(function (index, item) {
                    if ($(this).hasClass('selected')) {
                        $(this).addClass('newrow');
                        $(this).find('td').eq(3).text(str);
                    }
                })
            });






        },
        /**正则验证方法  val为要验证符号以及括号的值字符串*/
        regularFn: function (val) {
            var regFourSymbols = /^\+|^\-|^\*|^\/|(\+|\-|\*|\/)\1{1}|(\+\-)|(\-\+)|(\+\*)|(\*\+)|(\/\+)|(\+\/)|(\-\*)|(\*\-)|(\-\/)|(\/\-)|(\*\/)|(\/\*)|(\+|\-|\*|\/)+$/;
            var regBracket = /[(][^()]*[)]/;
            if (val == null || val == '') {
                Mom.layMsg('匹配项内容为空,请输入信息后再进行操作')
            } else if (regFourSymbols.test(val)) {
                Mom.layMsg('符号不匹配,请检查运算符号!')
            } else if (regBracket.test(val)) {
                str = val.replace(/[(][^()]*[)]/g,'');
                if (/[()]/.test(str)) {
                    Mom.layMsg('括号不匹配,请检查小括号!')
                } else {
                    Mom.layMsg('公式正确，可进行保存')
                }
            } else {
                Mom.layMsg('公式正确，可进行保存')
            }
        }

    };
    $(function () {
        if ($('#tankFormula').length > 0) {
            PageModule.init();
        }
    });
});
