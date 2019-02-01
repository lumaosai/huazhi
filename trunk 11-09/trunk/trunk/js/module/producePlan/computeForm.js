require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        //计算初始化
        computeFormInit: function () {
            //新增公式
            $('#btn-add').click(function () {
                Bus.openEditDialog('新增计算公式配置', 'producePlan/comForZtree.html', '800px', '500px')
            });
            require(['Page'], function () {
                new Page().init(Api.aps + "/api/aps/Formula/page", {}, true, function(rows, result) {
                    if (rows) {
                        PageModule.renderTableData(rows);
                        $('.btn-change').click(function () {
                            var id = $(this).parents("tr").find("td:first").text();
                            Bus.openEditDialog('修改计算公式配置', 'producePlan/comForZtree.html?id=' + id, '800px', '500px')
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find("td:first").text();
                            Bus.deleteItem('确定要删除该配置吗', Api.aps + '/api/aps/Formula/delete', {ids:id});
                        });
                    } else {
                        Mom.layMsg(result.message);
                    }
                });
            })
        },
        //  datatables使用ajax
        renderTableData: function (tableData) {
            $('#treeTable').dataTable({
                "data": tableData,
                "aoColumns": [
                    {"data": "id", 'sClass': "hide"},
                    {"data": "itemName", 'sClass': "center autoWidth"},
                    {"data": "computeFormula", 'sClass': "alignLeft  autoWidth"},//修改内容居左
                    {
                        "data": null, "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                        "render": function (data, type, row, meta) {
                            return "<a class='btn btn-change btn-compile'><i class='fa fa-edit'></i>编辑</a >" +
                                "<a class='btn  btn-delete ' ><i class='fa fa-trash' ></i>删除</a >";

                        }
                    }

                ]
            });

        },
        /**计算内页*/
        //初始化ztree页面
        computeztreeInit: function () {
            $('#inputForm').attr('action', Api.aps + '/api/aps/Formula/save');
            var id = Mom.getUrlParam('id');
            var paramRecord = $("#paramRecord"),
                html = "", htmlArr = [], inputArr = [];
            if (id) {
                $("#objId").val(id);
                Api.ajaxForm(Api.aps + "/api/aps/Formula/form/" + id, {}, function (result) {
                    if (result.success) {
                        var Formula = result.Formula,
                            str = Formula.computeFormula;
                        Validator.renderData(Formula, $('#inputForm'));
                        $("#paramRecord").html(Formula.computeFormula);
                        html = str;
                        htmlArr = str.match(/<[^>]+>([^<]+)<\/[^>]+>/g);
                        PageModule.formulaHiddenValue(inputArr, htmlArr);
                    }
                })
            }
            renderHtml(html, htmlArr, inputArr);
            $("#paramCode").on('dblclick', function () {
                PageModule.getZtreeVal("参数名称", [0.4, '#000'], "./producePlan/comForZtreeInner.html", "#paramCodeInput")
            });
            var setting = {
                data: {
                    simpleData: {
                        enable: true,   //设置是否使用简单数据模式(Array)
                        idKey: "id",    //设置节点唯一标识属性名称
                        pIdKey: "pId"      //设置父节点唯一标识属性名称
                    },
                    key: {
                        name: "name",//zTree 节点数据保存节点名称的属性名称
                        title: "name" //zTree 节点数据保存节点提示信息的属性名称
                    }

                },
                callback: {
                    onClick: zTreeOnDblClick
                }
            };

            Api.ajaxJson(Api.aps + '/api/aps/Dict/tree', {}, function (result) {
                if (result.success) {
                    require(['/js/plugins/ztree/js/jquery.ztree.core.js'], function () {
                        zTreeObj = $.fn.zTree.init($("#tree"), setting, result.rows);
                    });
                }
            });
            //ztree渲染 点击事件
            function zTreeOnDblClick(event, treeId, treeNode) {
                html += "<span>" + treeNode.name + "[" + treeNode.itemCode + "]</span>";
                htmlArr.push(treeNode.name + "[" + treeNode.itemCode + "]");
                inputArr.push(treeNode.itemCode);
                renHtmlFn(html, inputArr);
                //向数组动态push元素

            }

            function renderHtml() {
                $(".paramTag span").click(function () {
                    if ($(this).hasClass("clearAll")) {
                        html = "";
                        htmlArr = [];
                        inputArr = [];
                        renHtmlFn(html, htmlArr);
                    } else if ($(this).hasClass("clearOne")) {
                        html = "";
                        htmlArr.pop();
                        inputArr.pop();
                        var len1 = htmlArr.length;
                        for (var i = 0; i < len1; i++) {
                            html += htmlArr[i];
                        }
                        renHtmlFn(html, inputArr)
                    } else {
                        html += "<span>" + $(this).html() + "</span>";
                        htmlArr.push($(this).html());
                        inputArr.push($(this).html());
                        renHtmlFn(html, inputArr);

                    }

                });
            }

            //将htmlArr、inputArr数组中的元素遍历之后作为paramRecordHide、paramRecordShow的值插入。
            function renHtmlFn(html, inputArr) {
                $("#paramRecord").html(html);
                var inputHtml = "";
                var len = $(inputArr).length;
                if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        inputHtml += inputArr[i];
                        $("#paramRecordHide").empty().val(inputHtml);
                    }
                } else {
                    $("#paramRecordHide").empty().val("");
                }
                $("#paramRecordShow").val(html);
            }


        },
        //加载数据之后获取隐藏元素paramRecordHide的值，使用正则将匹配后的元素放入到inputArr数组中。
        formulaHiddenValue: function (inputArr, htmlArr) {
            for (var i = 0; i < htmlArr.length; i++) {
                var h = htmlArr[i].replace('<span>', '').replace('</span>', '');
                var m = h.match(/\[(.+)\]/g);
                if (m && m.length > 0) {
                    var ss = m[0];
                    ss = ss.substr(1, ss.length - 2);
                    inputArr.push(ss);
                } else {
                    inputArr.push(h);
                }
            }
        },
        //得到ztree值
        getZtreeVal: function (tit, shade, url, pushValCon) {
            top.layer.open({
                btn: ['确定', '取消'],
                shade: shade, //0.1透明度的白色背景
                type: 2,
                title: tit,
                shadeClose: true,
                maxmin: true, //开启最大化最小化按钮
                area: ['300px', '424px'],
                content: url,
                yes: function (index, layero) {
                    var iframeWin = layero.find('iframe')[0];
                    var selobj = iframeWin.contentWindow.getSelectVal();//在layer中运行当前弹出页内的getSelectVal方法
                    if (selobj) {
                        var pushCon = pushValCon.substr(1);
                        $("#itemCode").val(selobj.itemCode);
                        if (pushCon == "paramCodeInput") {
                            $("#" + pushCon).val(selobj.name);
                        }

                    }

                    top.layer.close(index);
                }
            })
        },
        /**计算弹出选择*/
        //选择参数名称页面tree
        comforZIInit: function () {
            var zTreeObj;
            var setting = {
                data: {
                    simpleData: {
                        enable: true,   //设置是否使用简单数据模式(Array)
                        idKey: "id",    //设置节点唯一标识属性名称
                        pIdKey: "pId"      //设置父节点唯一标识属性名称
                    },
                    key: {
                        name: "name",//zTree 节点数据保存节点名称的属性名称
                        title: "name" //zTree 节点数据保存节点提示信息的属性名称
                    }

                }
            };

            Api.ajaxJson(Api.aps + '/api/aps/Dict/tree', {}, function (result) {
                if (result.success) {
                    require(['/js/plugins/ztree/js/jquery.ztree.core.js'], function () {
                        zTreeObj = $.fn.zTree.init($("#tree"), setting, result.rows);
                    })
                }
            });
            // ztree处理弹出层被选中的节点
            window.getSelectVal=function () {
                var nodes = zTreeObj.getSelectedNodes();
                if (nodes.length != 1) {
                    Mom.layAlert('只能选择一项', {
                        icon: 2,
                        offset: 't',
                    })
                }
                var id = nodes[0].id;
                var name = nodes[0].name;
                var pId = nodes[0].pId;
                var itemCode = nodes[0].itemCode;
                var selObj = {'id': id, 'name': name, 'pId': pId, 'itemCode': itemCode};
                return selObj;
            }


        }
    };

    $(function () {
        //参数配置列表
        if ($('#computeFormula').length > 0) {
            PageModule.computeFormInit();
        } else if ($('#computeforZtree').length > 0) {
            PageModule.computeztreeInit();
        } else if ($('#comForZtreeInner').length > 0) {
            PageModule.comforZIInit()
        }
    })

});
