/**作者：贾旭光
 *日期：2018.10.29
 *描述：
 * 1、删除接口要加日期和班次参数
 * 2、日期班次装置 每次查询和子页面保存成功的时候放到cookie里 下次重新进入的时候 这三个参数从cookie中拿
 * 3、icon整体需要按照图标库修改
 * 4、所有下拉框变成select2
 */
require(['/js/zlib/app.js'], function (App) {
    require(['jqGrid_my'], function (jqGridAll) {
            var PageModule = {
                //————————初始化————————//
                init: function () {
                    $("#tankDate").val(Mom.shortDate);
                    /*班次、日期、裝置id*/
                    pageLoad = function (shift, tankDate, unitId) {
                        PageModule.tabBtnclick('.tabBtn li', '.jqTable-item', '.tab-btns li');
                        var data = {
                            createDate: tankDate,
                            shiftDate: shift,
                            unitId: unitId
                        };
                        //是否递交
                        Api.ajaxForm(Api.mtrl + '/api/mv/UnitShiftSline/sealFlag', data, function (result) {
                            if (result.success) {
                                if (result.message == '0') {
                                    $('#unSubmit').hide();
                                    $('#submit,#delClass').show();
                                } else if (result.message == '1') {
                                    $('#unSubmit').show();
                                    $('#submit,#delClass').hide();
                                }
                            } else {
                                Mom.layAlert(result.message);
                            }

                        });
                        //方案下拉框
                        var dataSelect = {
                            "unitId": unitId
                        };
                        Api.ajaxJson(Api.mtrl + '/api/mv/UnitProcecaseSwitch/unitProcecase', JSON.stringify(dataSelect), function (result) {
                            if (result.success) {
                                $('#schemeName').empty();
                                Bus.appendOptionsValue($('#schemeName'), result.rows, 'id', 'caseName');
                            } else {
                                Mom.layAlert(result.message);
                            }

                        });
                        //列表页
                        Api.ajaxForm(Api.mtrl + "/api/mv/UnitProcecaseSwitch/unitProcecaseSwitch", {unitId: data.unitId}, function (result) {
                            if (result.success) {
                                if (result.rows != undefined) {
                                    PageModule.renderDevice(result.rows);
                                } else {
                                    var result = [];
                                    PageModule.renderDevice(result);
                                }

                                PageModule.btnCollection();

                                //切换方案
                                $('#tab-btn').unbind('click').on('click', function () {
                                    console.log($('#schemeName').val());
                                    if ($('#schemeName').val() == null) {
                                        Mom.layAlert('目前装置下未配置方案')
                                    } else {
                                        var data = {
                                            "unitId": $("#tankDate").attr('unitid'),
                                            "shiftBegDate": tankDate + ' ' + $("#tankDate").attr('shiftdate').split('-')[0],
                                            "shiftEndDate": tankDate + ' ' + $("#tankDate").attr('shiftdate').split('-')[1],
                                            "caseId": $('#schemeName').val(),
                                            "switchDate": tankDate + ' ' + $('#tabDate').val()
                                        };
                                        Api.ajaxJson(Api.mtrl + '/api/mv/UnitProcecaseSwitch/switchUnitProcecase', JSON.stringify(data), function (result) {
                                            if (result.success) {
                                                Mom.layAlert('方案切换成功！')
                                                Api.ajaxForm(Api.mtrl + "/api/mv/UnitProcecaseSwitch/unitProcecaseSwitch", {unitId: data.unitId}, function (result) {
                                                    if (result.success) {
                                                        if (result.rows != undefined) {
                                                            PageModule.renderDevice(result.rows);
                                                        } else {
                                                            var result = [];
                                                            PageModule.renderDevice(result);
                                                        }
                                                    }
                                                })
                                            } else {
                                                Mom.layAlert(result.message);
                                            }

                                        });
                                    }

                                });
                            } else {
                                Mom.layAlert(result.message)
                            }

                        });


                    };
                    PageModule.loadClass(true, '#tabDate', pageLoad);

                },
                //————————方案按钮集合————————//
                btnCollection: function () {
                    //查詢按鈕更新日期等信息
                    $('#search-btn-New').unbind('click').on('click', function () {
                        $('.tabBtn>li').eq(0).addClass('active').siblings('li').removeClass('active');
                        $('.tab-con>.jqTable-item').eq(0).addClass('active').siblings('.jqTable-item').removeClass('active');
                        //————————————————————留下可能做全局变量————————————————————————//
                        $('#tankDate').attr({
                            'createDate': $('#tankDate').val(),
                            'shiftDate': $('#shift').val(),
                            'unitId': $('#shiftHidden').attr('data-nodeid')
                        });
                        var createDate = $('#tankDate').attr('createDate');
                        var shiftDate = $('#tankDate').attr('shiftDate');
                        var unitId = $('#tankDate').attr('unitId');
                        //————————————————————留下可能做全局变量————————————————————————//
                        pageLoad(shiftDate, createDate, unitId);
                        $('#tabDate').val(shiftDate.split('-')[1]);

                    });

                    //删除
                    $('a.btn-delete').unbind('click').on('click', function () {
                        var id = $(this).parents("tr").find('.btn-delete').attr('id');
                        /**改地址*/
                        Bus.deleteItem('确定要删除该方案么', Api.mtrl + '/api/mv/UnitProcecaseSwitch/del', {id: id});
                    });
                    //数据提交
                    $('#submit').unbind('click').on('click', function () {
                        var data = {
                            createDate:$('#tankDate').attr('createDate'),
                            shiftDate:$('#tankDate').attr('shiftDate'),
                            unitId:$('#tankDate').attr('unitId')
                        };
                        Api.ajaxForm(Api.mtrl + '/api/mv/UnitShiftSline/submit',data, function (result) {
                            if (result.success) {
                                Mom.layAlert('数据提交成功');
                                PageModule.init();
                            } else {
                                Mom.layAlert(result.message);
                            }

                        });
                    });

                    //解除提交
                    $('#unSubmit').unbind('click').on('click', function () {
                        var data = {
                            createDate:$('#tankDate').attr('createDate'),
                            shiftDate:$('#tankDate').attr('shiftDate'),
                            unitId:$('#tankDate').attr('unitId')
                        };
                        Api.ajaxForm(Api.mtrl + '/api/mv/UnitShiftSline/submit', data, function (result) {
                            if (result.success) {
                                Mom.layAlert('解除提交成功');
                                PageModule.init();
                            } else {
                                Mom.layAlert(result.message);
                            }

                        });
                    });

                    //删除班次记录
                    $('#delClass').unbind('click').on('click', function () {
                        var id = $('#shiftHidden').attr('data-nodeId');
                        var data = {
                            id: id,
                            date: $('#tankDate').val(),
                            shift: $('#shift').val()
                        };
                        Api.ajaxJson(Api.aps + ''/*____待填写_____*/, JSON.stringify(data), function (result) {
                            if (result.success) {
                                console.log(result);
                            } else {
                                Mom.layAlert(result.message);
                            }

                        });
                    });
                },
                //———————— 渲染時間插件，渲染ztree————————//
                timeAndZtree: function (callback) {
                        //————————左侧装置树方法 预留点击后取到节点参数————————//
                        require(['ztree_my'], function (ZTree) {
                            var treeObj;
                            var ztree = new ZTree();
                            //调取接口拿到ztree数据
                            Api.ajaxJson(Api.mtrl + '/api/fm/Unit/unitList', {}, function (result) {
                                if (result.success) {
                                    //配置ztree参数
                                    var ztreeSetting = {
                                        data: {
                                            keep: {
                                                parent: false,
                                                leaf: true
                                            },
                                            simpleData: {
                                                enable: true,
                                                idKey: "id",
                                                pIdKey: "nodeAreaId"
                                            },
                                            key: {
                                                name: "unitName"
                                            }
                                        },
                                        callback: {
                                            onClick: function (e, treeId, node) {
                                                loadOrgTree(node)
                                            }
                                        }
                                    };
                                    //渲染ztree
                                    treeObj = ztree.loadData($("#zTree"), result.rows, false, ztreeSetting);
                                    //模糊查询
                                    ztree.registerSearch(treeObj, $('#wait_searchText'), 'name');
                                    var nodes = treeObj.getNodes();
                                    $("#shiftHidden").attr("data-nodeid", nodes[0].id);
                                    treeObj.selectNode(nodes[0]);
                                    if (callback) {
                                        callback($('#shift').val(), $("#tankDate").val(), $("#shiftHidden").attr("data-nodeId"));
                                        //————————————————————留下可能做全局变量————————————————————————//
                                        $('#tankDate').attr({
                                            'createDate': $('#tankDate').val(),
                                            'shiftDate': $('#shift').val(),
                                            'unitId': $('#shiftHidden').attr('data-nodeId')
                                        });
                                        //————————————————————留下可能做全局变量————————————————————————//

                                    }
                                }
                            });
                            function loadOrgTree(nodes) {
                                $("#shiftHidden").attr("data-nodeid", nodes.id);

                            }
                        });
                },

                /***描述：搜索url_接口用的是罐区的*/
                //————————渲染班次下拉框 参数是如果isTime是true则拿到班次时间 ————————//
                loadClass: function (isTime, sel, callback) {
                    var url_ = Api.aps + '/api/ctrl/Shift/list';
                    Api.ajaxJson(url_, {}, function (result) {
                        if (result.success) {
                            var rows = result.rows;
                            var options = new Array();
                            $(rows).each(function (i, o) {
                                var label = o['name'] + '(' + o['startTime'] + '-' + o['endTime'] + ')';
                                var value = o['startTime'] + '-' + o['endTime'];
                                options.push({'value': value, 'label': label});
                            });
                            $('#shift').empty();
                            Bus.appendOptions($('#shift'), options);
                            PageModule.timeAndZtree(callback);
                            if (isTime == true) {
                                $(sel).val($('#shift').val().split('-')[1])
                            }
                        } else {
                            Mom.layMsg(result.message);
                        }
                    });


                },

                //————————Tab切换方法————————//
                /*参数lis是li   selector是被隐藏容器集合*/
                tabBtnclick: function (lis, selector, btnSel) {
                    //tab切换
                    $(lis).each(function (index, item) {
                        $(item).unbind("click").on("click", function () {
                            $(this).addClass("active").siblings("li").removeClass("active");
                            $(selector).eq(index).addClass('active').siblings(selector).removeClass('active');
                            $(btnSel).eq(index).addClass('active').siblings(btnSel).removeClass('active');
                            if (index == 0) {
                                //方案管理
                                PageModule.pageChange('datatable');
                            }
                            if (index == 1 || index == 2 || index == 3) {
                                if (index == 1) {
                                    //班计量
                                    PageModule.pageChange('jqgrid', '.classMeasure', 'classMTable', PageModule.renderJqgrid)
                                } else if (index == 2) {
                                    //投入产出
                                    PageModule.pageChange('jqgrid','.inputOutput','treeTable',PageModule.inputOutput)
                                } else {
                                    //物料移动
                                    PageModule.pageChange('datatable', PageModule.renderMaterialM);
                                }
                            }
                            if(index==4){
                                //场景图
                                PageModule.sceneGraph()
                            }


                        });
                    });


                },

                //页面刷新重新请求数据 参数tableType渲染表的类型，tableSel表选择器，回调函数
                pageChange: function (tableType, tableSel, tableId, callBack) {
                    if (tableType == 'datatable') {
                        if (tableSel == undefined) {
                            //————————————————————留下可能做全局变量————————————————————————//
                            var createDate = $('#tankDate').attr('createDate');
                            var shiftDate =  $('#tankDate').attr('shiftDate');
                            var unitId =     $('#tankDate').attr('unitId');
                            //————————————————————留下可能做全局变量————————————————————————//
                            pageLoad(shiftDate, createDate, unitId);
                        } else {
                            //物料移动
                            tableSel();
                        }


                    } else if (tableType == 'jqgrid') {
                        $(tableSel).empty();
                        var tablehtml = '<table id="' + tableId + '"></table>';
                        $(tableSel).append(tablehtml);
                        //jqgrid清空刷新方法放入回调
                        if (callBack) {
                            callBack()
                        }
                    }

                },

                //————————渲染方案列表页方法————————//
                renderDevice: function (tableData) {
                    $('#schemeMTable').dataTable({
                        "bSort": true,
                        "aoColumnDefs": [
                            {"bSortable": false, "aTargets": [0]}
                        ],
                        "data": tableData,
                        "aoColumns": [
                            {"data": "caseName", 'sClass': "center", "width": "34%"},
                            {"data": "shiftBegDate", 'sClass': "center", "width": "34%"},
                            {
                                "data": "id",
                                "orderable": false,
                                "defaultContent": "",
                                'sClass': " center ",
                                "width": "24%",
                                "render": function (data, type, row, meta) {
                                    if (row.type != undefined && row.type == true) {
                                        return "";
                                    } else {
                                        var html = "<a class='btn-delete' id='" + row.id + "' title='删除'><i class='fa fa-trash-o'></i></a >";
                                        if (row.isUse == '1') {
                                            return;
                                        } else {
                                            return html;
                                        }

                                    }

                                }
                            }

                        ]
                    });

                },

                //————————班计量渲染jqgrid方法————————//
                renderJqgrid: function (isgather,data) {
                    require(['jqGrid_my'], function (jqGridAll) {
                        window.pageLoadclass = function () {
                            if (isgather == true) {
                                var url = Api.pi + "/api/PiApi/tagNearLocal";
                                var dataList=data;
                                Api.ajaxForm(url, dataList, function (result){
                                    var url = Api.mtrl + "/api/mv/UnitShiftInstrument/queryUnitShiftInstrumentList";
                                    //————————改为默认加载地址————————//
                                    var dataList = {
                                        unitId: $('#tankDate').attr('unitId'),
                                        date:   $('#tankDate').attr('createDate'),
                                        shift:  $('#tankDate').attr('shiftDate')
                                    };
                                    ajax(url,dataList,result.rows);
                                });
                            } else {
                                var url = Api.mtrl + "/api/mv/UnitShiftInstrument/queryUnitShiftInstrumentList";
                                //————————改为默认加载地址————————//
                                var dataList = {
                                    unitId: $('#tankDate').attr('unitId'),
                                    date:   $('#tankDate').attr('createDate'),
                                    shift:  $('#tankDate').attr('shiftDate')
                                };
                                ajax(url,dataList)
                            }
                            function ajax(url,dataList,isreset) {
                                Api.ajaxForm(url, dataList, function (res) {
                                    if(res.success){
                                        //渲染成功多少条
                                        $('#classMeasure .treeTable-num').text(res.rows.length);
                                        //配置主子表参数
                                        if(isreset!=undefined){
                                            $(res.rows).each(function(e,c){
                                                c.tagVal=isreset[e].val;
                                                c.tagDate=Mom.localDate+' '+Mom.localTime;
                                            });
                                        }
                                        var lastsel;
                                        var optionsPot = {
                                            colModel: [
                                                {
                                                    "name": "id",
                                                    "label": "id",
                                                    "align": "center",
                                                    "hidden": true
                                                },
                                                {
                                                    "name": "saveFlag",
                                                    "label": "F",
                                                    "align": "center"
                                                },
                                                {
                                                    "name": "instrument",
                                                    "label": "仪表名称",
                                                    "align": "center",
                                                    formatter: function (cellvalue, options, rowObject) {
                                                        return rowObject.instrument.instrName
                                                    }
                                                },
                                                {
                                                    "name": "tagDate",
                                                    "label": "采集时间",
                                                    "align": "center",
                                                    formatter: function (cellvalue, options, rowObject) {
                                                        var now = new Date();
                                                        var year = now.getFullYear();       //年
                                                        var month = now.getMonth() + 1;     //月
                                                        var day = now.getDate();            //日
                                                        var hh = now.getHours();            //时
                                                        var mm = now.getMinutes();          //分
                                                        var ss = now.getSeconds();
                                                        var rightNow = year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss
                                                        return rightNow
                                                    }
                                                },
                                                {
                                                    "name": "frontVal",
                                                    "label": "前读数",
                                                    "align": "center"
                                                },
                                                {
                                                    "name": "C",
                                                    "label": "C",
                                                    "align": "center",
                                                    formatter: function (cellvalue, options, rowObject) {
                                                        return '<a class="leftBtn"><i class="fa fa-table col-1ab394"></i></a> '
                                                    }
                                                },
                                                {
                                                    "name": "rtdbVal",
                                                    "label": "RTDB读数",
                                                    "align": "center"
                                                },
                                                {
                                                    "name": "C",
                                                    "label": "C",
                                                    "align": "center",
                                                    formatter: function (cellvalue, options, rowObject) {
                                                        return '<a class="rightBtn"><i class="fa fa-tachometer col-1ab394"></i></a> '
                                                    }
                                                },
                                                {
                                                    "name": "behindVal",
                                                    "label": "后读数",
                                                    "align": "center",
                                                    "editable": true
                                                },
                                                {
                                                    "name": "pureVal",
                                                    "label": "净读数",
                                                    "align": "center"
                                                },
                                                {
                                                    "name": "resetFrtVal",
                                                    "label": "回零/开工前值",
                                                    "align": "center",
                                                    "editable": true
                                                },
                                                {
                                                    "name": "resetBhdVal",
                                                    "label": "回零/开工后值",
                                                    "align": "center",
                                                    "editable": true
                                                },
                                                {
                                                    "name": "tagVal",
                                                    "label": "工位号",
                                                    "align": "center"
                                                },
                                                {
                                                    "name": "submitBy",
                                                    "label": "提交人",
                                                    "align": "center"
                                                },
                                                {
                                                    "name": "submitDate",
                                                    "label": "提交时间",
                                                    "align": "center"
                                                },
                                                {
                                                    "name": "instrId",
                                                    "label": "instrId",
                                                    "align": "center",
                                                    "hidden": true
                                                }],
                                            data: res.rows,
                                            rownumbers: true,
                                            cellEdit: false,
                                            cellsubmit: 'clientArray',
                                            editurl: 'clientArray',
                                            onSelectRow: function (id, status) {
                                                if (id && id !== lastsel) {
                                                    $('#classMTable').saveRow(lastsel, false, 'clientArray');
                                                    $('#classMTable').restoreRow(lastsel);
                                                    $('#classMTable').editRow(id, false);
                                                    lastsel = id;
                                                }

                                            }
                                        };
                                        var optionsMMove = {
                                            colModel: [
                                                {name: "id", label: "id", align: "center", hidden: true},
                                                {name: "F", label: "F", align: "center", title: false, width: "10"},
                                                {
                                                    name: "materialName",
                                                    label: "料线名称",
                                                    align: "center",
                                                    width: "100",
                                                    formatter: function (cellvalue, options, rowObject) {
                                                        return rowObject.node.nodename
                                                    }
                                                },
                                                {
                                                    name: "material",
                                                    label: "物料",
                                                    align: "center",
                                                    width: "100",
                                                    formatter: function (cellvalue, options, rowObject) {
                                                        return rowObject.mtrl.mtrlName
                                                    }
                                                },
                                                {
                                                    name: "qualityGrade",
                                                    label: "质量等级",
                                                    align: "center",
                                                    width: '100',
                                                    formatter: function (cellvalue, options, rowObject) {
                                                        return '<select class="form-control editSelect select2"></select>'
                                                    }
                                                }
                                            ]
                                        };
                                        var config = {
                                            url: Api.mtrl + "/api/mv/UnitShiftInstrument/getSlines",
                                            dataParams: {
                                                unitId:$('#tankDate').attr('unitId'),
                                                date:  $('#tankDate').attr('createDate'),
                                                shift: $('#tankDate').attr('shiftDate')
                                            },
                                            otherId: 'instrId',
                                            contentType: 'ajaxForm'
                                        };
                                        var MMovesubTable = [];
                                        //拿到子表id
                                        var resArr=[];
                                        jqGridAll.jG_jqGridTableLevel('#classMTable', optionsPot, optionsMMove, config, MMovesubTable, function (subtabIds, datajson, resdata) {
                                            $(subtabIds).each(function (i, o) {
                                                jqGridAll.jG_Resize('#' + o, '.subTableBox');
                                            });
                                            $('.editSelect').each(function () {
                                                $('.editSelect').empty();
                                                Bus.appendOptionsValue('.editSelect', resdata.quatRankType, 'value', 'label');
                                            });
                                            $(resdata.rows).each(function () {
                                                resArr.push(this.rankType)
                                            });
                                            //分别渲染 如果走一次each会出现 第一个下拉框值被改变
                                            $('.editSelect').each(function (a,b) {
                                                $(this).val(resArr[a])
                                            });
                                            //编辑下拉框的时候保存数据
                                            $('.editSelect').on('change', function () {
                                                var id = $(this).parent('td').parent('tr').find('td').eq(0).text();
                                                var data = {
                                                    id: id,
                                                    rankType: $(this).val()
                                                };
                                                Api.ajaxJson(Api.mtrl + '/api/mv/UnitShiftInstrument/saveSlines', JSON.stringify(data), function (result) {
                                                    if (result.success) {
                                                        Mom.layMsg('修改成功')
                                                    } else {
                                                        Mom.layAlert(result.message);
                                                    }

                                                });
                                            })


                                        });



                                        //重新设置宽度 跟主子表里的ibox-content冲突
                                        jqGridAll.jG_Resize('#classMTable', '.classMeasure');
                                        //采集前讀數
                                        $('.leftBtn').each(function (i, o) {
                                            $('#classMTable').off('click', 'a.leftBtn').on('click', 'a.leftBtn', function (event) {
                                                $('input[type=text].editable').each(function (i, item) {
                                                    $(this).parents('td').text($(this).val());
                                                    $(this).remove()
                                                });
                                                var arr = [];
                                                var rowId = $(this).parents('tr').attr('id');
                                                var valRow = $('#classMTable').jqGrid('getRowData', rowId);
                                                valRow.unitId=$('#tankDate').attr('unitid');
                                                valRow.currentShift = res.rows[0].currentShift;
                                                delete(valRow['C']);
                                                delete(valRow['instrument']);
                                                arr.push(valRow);
                                                var data = {
                                                    "unitShiftInstrumentList":JSON.stringify(arr)
                                                };
                                                Api.ajaxForm(Api.mtrl + '/api/mv/UnitShiftInstrument/frontVal', data, function (result) {
                                                    if (result.success) {
                                                        $(this).parents('td').prev().text(result.rows[0].behindVal)
                                                    } else {
                                                        Mom.layAlert(result.message);
                                                    }

                                                });


                                            })
                                        });
                                        //采集后讀數
                                        $('.rightBtn').each(function (i, o) {
                                            $('#classMTable').off('click', 'a.rightBtn').on('click', 'a.rightBtn', function (event) {
                                                var rtdbVal = $(this).parents('td').prev().text();
                                                if ($(this).parents('td').next().text() == '') {
                                                    $(this).parents('td').next().find('input').val(rtdbVal);
                                                } else {
                                                    $(this).parents('td').next().text(rtdbVal)
                                                }

                                            })
                                        });
                                        //自动采集按钮
                                        $('#gather').unbind('click').on('click', function () {
                                            var arrAll=[];
                                            $(res.rows).each(function (c,e) {
                                                var dateInfo={
                                                    'tagName':e.instrument.tag,
                                                    'timeStep':'3600'
                                                };
                                                arrAll.push(dateInfo);
                                            });
                                            var time=Mom.localTime;
                                            var data={
                                                cltTime:time,
                                                tagInfo: JSON.stringify(arrAll)
                                            };
                                            // console.log(data);
                                            PageModule.pageChange('jqgrid', '.classMeasure', 'classMTable', PageModule.renderJqgrid(true,data))
                                        });
                                        //保存
                                        $('#class-btn-save').unbind('click').on('click', function () {
                                            $('input[type=text].editable').each(function (i, item) {
                                                $(this).parents('td').text($(this).val());
                                                $(this).remove()
                                            });
                                            var allData = $('#classMTable').jqGrid('getRowData');
                                            $(allData).each(function (i, o) {
                                                o.unitId =$('#tankDate').attr('unitId');
                                                o.currentShift = res.rows[i].currentShift;
                                                //后端要求不要这两个字段
                                                delete(o['C']);
                                                delete(o['instrument']);
                                            });
                                            var data = {
                                                unitShiftInstrumentList: JSON.stringify(allData)
                                            };

                                            Api.ajaxForm(Api.mtrl + '/api/mv/UnitShiftInstrument/save', data, function (result) {
                                                if (result.success) {
                                                    Mom.layMsg('保存成功')
                                                } else {
                                                    Mom.layAlert(result.message);
                                                }

                                            });
                                        })
                                    }else{
                                        Mom.layAlert(res.message)
                                    }
                                });
                            }



                        };
                        pageLoadclass();

                    });
                },

                //————————投入产出jqgrid渲染————————//
                inputOutput: function(){
                    require(['jqGrid_my'], function (jqGridAll) {
                        var html = $('.inputOutput').html();
                        var resultList = '';
                        window.iOpageLoad = function (result) {
                            var  dataList = {
                                createDate:$('#tankDate').attr('createDate'),//日期
                                shiftDate:$('#tankDate').attr('shiftDate'),//班次
                                unitId: $('#tankDate').attr('unitId')
                            };
                            Api.ajaxForm(Api.mtrl +"/api/mv/UnitShiftSline/list", dataList, function (res) {
                                resultList = res;
                                if(result){
                                    res  = result;
                                }
                                if(res.success){
                                    $('.treeTable-num').text(res.count);
                                    var colModel1 = [
                                        {"name": "id","label": "id","align": "center","hidden":true},
                                        {"name": "mtrlId","label": "物料id","align": "center","hidden":true},
                                        {"name": "unitId","label": "装置id","align": "center","hidden":true},
                                        {"name": "nodeId","label": "料线id","align": "center","hidden":true},
                                        {"name": "nodename","label": "料线名称","align": "center",formatter:function(cellvalue, options, rowObject){
                                            return rowObject.node.nodename;
                                        }},
                                        {"name": "mtrlName","label": "物料名称","align": "center",formatter:function(cellvalue, options, rowObject){
                                            return rowObject.mtrl.mtrlName;
                                        }},
                                        {"name": "slineInoutType","label": "进出","align": "center",formatter:function(cellvalue, options, rowObject){
                                            if(rowObject.nodeSideline.slineInoutType == 0){
                                                return '进';
                                            }else{
                                                return '出';
                                            }
                                        }},
                                        {"name": "quatRankType","label": "质量等级","align": "center"},
                                        {"name": "sdlnOriVal","label": "料线原始值","align": "center"},
                                        {"name": "sdlnAfVal","label": "料线确认值","align": "center","editable": true},
                                        {"name": "cacheFrtVal","label": "缓存前量","align": "center"},
                                        {"name": "cacheBhdVal","label": "缓存后量","align": "center"},
                                        {"name": "cacheDiffVal","label": "差存量","align": "center"},
                                        {"name": "cacheDiffAfVal","label": "差存确认量","align": "center","editable": true},
                                        {"name": "areaOriVal","label": "界区原始量","align": "center"},
                                        {"name": "areaAfVal","label": "界区确认量","align": "center","editable": true},
                                        {"name": "asmtDiffVal","label": "评估差异量","align": "center"},
                                        {"name": "currentShift","label": "当前班次","align": "center"},
                                        {"name": "createBy","label": "保存人","align": "center"},
                                        {"name": "createDate","label": "保存时间","align": "center"},
                                        {"name": "areaForm","label": "界区公式","align": "center",formatter:function(cellvalue, options, rowObject){
                                            return rowObject.nodeSideline.areaForm;
                                        }},
                                        {"name": "slineForm","label": "料线公式","align": "center",formatter:function(cellvalue, options, rowObject){
                                            return rowObject.nodeSideline.slineForm;
                                        }},
                                    ];
                                    var lastsel;
                                    var optionsPot = {   //主表
                                        colModel: colModel1,
                                        data: res.rows,
                                        rownumbers: true,//显示行号
                                        cellEdit: false,
                                        onSelectRow: function (id,status) {
                                            if (id && id != lastsel) {
                                                $('#treeTable').saveRow(lastsel, false, 'clientArray');
                                                $('#treeTable').restoreRow(lastsel);
                                                $('#treeTable').editRow(id, false);
                                                lastsel = id;
                                            }
                                        },
                                    };
                                    var colModel2 = [
                                        {"name": "id","label": "id","align": "center","hidden":true},
                                        {"name": "type","label": "节点类型","align": "center",formatter:function(cellvalue, options, rowObject){
                                            return "料线";
                                        }},
                                        {"name": "mesTypeLabel","label": "计量方式","align": "center"},
                                        {"name": "instrName","label": "料仓名称/测量点名称","align": "center"},
                                        {"name": "frontVal","label": "前量/前读数","align": "center"},
                                        {"name": "behindVal","label": "后量/后读数","align": "center"},
                                        {"name": "tiaozheng","label": "调整量","align": "center"},
                                        {"name": "behindVal","label": "后量确认量","align": "center"}
                                    ];
                                    var optionsMMove = {   //子表
                                        colModel: colModel2,
                                        rownumbers: true,
                                    };
                                    var config = {
                                        url: Api.mtrl+'/api/mv/UnitShiftSline/view',
                                        otherId:'nodeId',
                                        dataParams:{
                                            createDate:$('#tankDate').attr('createDate'),//日期
                                            shiftDate:$('#tankDate').attr('shiftDate'),//班次
                                            unitId: $('#tankDate').attr('unitId')
                                        },
                                        contentType:'form',
                                    };

                                    var subtable =[];
                                    jqGridAll.jG_jqGridTableLevel('#treeTable',optionsPot,optionsMMove,config,subtable);
                                }else{
                                    Mom.layMsg(res.message);
                                }
                            });
                        };
                        iOpageLoad();
                        //重新计算
                        $('#btn-comAgain').unbind('click').click(function(){
                            if(resultList.saveFlag != 1){
                                Mom.layMsg('未保存不允许重新计算');
                                return ;
                            }
                            $('.inputOutput').empty().html(html);
                            var  dataList = {
                                createDate:$('#tankDate').attr('createDate'),//日期
                                shiftDate:$('#tankDate').attr('shiftDate'),//班次
                                unitId: $('#tankDate').attr('unitId')
                            };
                            Api.ajaxForm(Api.mtrl +"/api/mv/UnitShiftSline/recalculate", dataList, function (result) {
                                iOpageLoad(result);

                            });
                        });
                        //保存
                        $('#btn-save').unbind('click').click(function(){
                            $('input[type=text].editable').each(function (i, item) {
                                $(this).parents('td').text($(this).val());
                                $(this).remove();
                            });
                            var data = $('#treeTable').getRowData();
                            var da = {
                                createDate:$('#tankDate').attr('createDate'),//日期
                                shiftDate:$('#tankDate').attr('shiftDate'),//班次
                                unitId: $('#tankDate').attr('unitId'),
                                unitShiftSlineList:JSON.stringify(data)
                            }
                            Api.ajaxForm(Api.mtrl +"/api/mv/UnitShiftSline/save", da, function (res){
                                if(res.success){
                                    Mom.layMsg(res.message);
                                    $('.inputOutput').empty().html(html);
                                    iOpageLoad();
                                }else{
                                    Mom.layMsg(res.message);
                                }
                            });
                        });
                    });
                },

                //————————物料移动列表页渲染————————//
                renderMaterialM: function () {
                    var data = {
                        date: $('#tankDate').attr('createDate'),
                        shift: $('#tankDate').attr('shiftDate'),
                        id: $('#tankDate').attr('unitId')         //装置id
                    };
                    Api.ajaxForm(Api.mtrl + "/api/mv/Unit/list/" + data.id, data, function (result) {
                        if (result.success) {
                            //渲染成功多少条
                            $('#materialMove .treeTable-num').text(result.rows.length);
                            $('#materialMTable').dataTable({
                                "data": result.rows,
                                "aoColumns": [
                                    {"data": "id", 'sClass': "autoWidth center"},
                                    {
                                        "data": null, "defaultContent": "", 'sClass': "center", "width": "1%",
                                        "render": function (data, type, row, meta) {
                                            return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                                        }
                                    },
                                    {"data": "mtrlMvOprtTypeLabel", 'sClass': "autoWidth center"},
                                    {"data": "dlvNode.nodename", 'sClass': "autoWidth center"},
                                    {"data": "rcvNode.nodename", 'sClass': "autoWidth center"},
                                    {"data": "begMvDate", 'sClass': "autoWidth center"},
                                    {"data": "endMvDate", 'sClass': "autoWidth center"},
                                    {"data": "createName", 'sClass': "autoWidth center"},
                                    {"data": "createDate", 'sClass': "autoWidth center"},
                                    {"data": "clsBy", 'sClass': "autoWidth center"},
                                    {"data": "clsDate", 'sClass': "autoWidth center"}
                                ],
                                "fnDrawCallback": function () {
                                    this.api().column(0).nodes().each(function (cell, i) {
                                        cell.innerHTML = i + 1;
                                    });
                                }
                            });
                            renderIChecks();
                            //按钮集合
                            PageModule.btnCollection();

                            //删除
                            $('button.btn-delete').unbind('click').on('click', function () {
                                var id = $(this).parents("tr").find('.i-checks').attr('id');
                                //多个删除
                                var bol = false;
                                var str = '';  //用于拼接str
                                $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                                    if ($(this).is(":checked")) {
                                        var id = $(this).attr('id');
                                        if (id != undefined) {
                                            str += "," + $(this).attr("id");
                                        }
                                        bol = true;
                                    }
                                });
                                if (bol) {
                                    top.layer.confirm('请您确认是否要删除勾选数据', {icon: 3, title: '系统提示'}, function (index) {
                                        if (str.length > 0) { //新增的元素+已存在的数据 或全是已存在的数据
                                            var data = {
                                                ids: str.substr(1),
                                            };
                                            var url = Api.mtrl + '/api/mv/Unit/delete';
                                            Api.ajaxForm(url, data, function (result) {
                                                if (result.success) {
                                                    Mom.layMsg('删除成功！');
                                                    $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                                                        if ($(this).is(':checked')) {
                                                            $(this).parents('tr').remove();
                                                        }
                                                    });
                                                } else {
                                                    Mom.layMsg(result.message);
                                                }
                                            })
                                        }
                                        top.layer.close(index);
                                    });

                                } else {
                                    Mom.layMsg("请选择至少一条数据！");
                                }
                            });
                            //新建
                            $('#btn-add').unbind('click').on('click', function () {
                                var id = $(this).parents("tr").find('.i-checks').attr('id');
                                var string = [];
                                var winOptons = {
                                    btnArr: [
                                        {
                                            btn: '确定', fn: function (layerIdx, layero) {
                                            var iframeWin = layero.find('iframe')[0].contentWindow;
                                            iframeWin.Submit('submit', 'add', layerIdx, PageModule.renderMaterialM);
                                        }
                                        }
                                    ]
                                };

                                Bus.openDialogCfg("物料移动信息录入", "../material/materialMove/deviceMMAddForm.html?deviceid=" + data.id + "&Type=add&classDate=" + data.date + '&classTime=' + data.shift, "741px", '409px', winOptons)

                            });
                            //关闭
                            $('#btn-close').unbind('click').on('click', function () {
                                var string = [];
                                var id;
                                $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                                    if ($(this).is(":checked")) {
                                        id = $(this).attr('id');
                                        if (id != undefined) {
                                            string.push(id);
                                        }
                                    }
                                });

                                if (string.length > 1) {
                                    Mom.layAlert('只能选择一条数据');
                                } else if (string.length < 1) {
                                    Mom.layAlert('请选择一条数据');
                                } else {
                                    var winOptons = {
                                        btnArr: [
                                            {
                                                btn: '确定', fn: function (layerIdx, layero) {
                                                var iframeWin = layero.find('iframe')[0].contentWindow;
                                                iframeWin.Submit('', 'close', layerIdx, PageModule.renderMaterialM);
                                            }
                                            }
                                        ]
                                    };
                                    Bus.openDialogCfg("物料移动信息录入", "../material/materialMove/deviceMMAddForm.html?id=" + id + "&Type=close&classDate=" + data.date + '&classTime=' + data.shift, "741px", '409px', winOptons)
                                }

                            });
                        } else {
                            Mom.layMsg(result.message)
                        }


                    });
                },

                //————————场景图渲染————————//
                sceneGraph:function () {
                    var createDate = $('#tankDate').attr('createDate');
                    var shiftDate =  $('#tankDate').attr('shiftDate');
                    var unitId =     $('#tankDate').attr('unitId');

                    // var url=Api.mtrl+"/mv/Topo/unit/"+unitId+'/'+createDate+'/'+shiftDate;
                    // Api.ajaxJson(url, {}, function (result) {
                    //                 if (result.success) {
                    //                     console.log(result);
                    //                 } else {
                    //                     Mom.layAlert(result.message);
                    //                 }
                    //
                    //             });

                    var html='<embed src="http://114.115.165.184:8085/mtrl-api/mv/Topo/test" width="1024" height="768" type="image/svg+xml" pluginspage="" />';
                    $('#sceneGraph').append(html);
                },
                //————————装置物料移动弹窗页面方法————————//
                decMMAForm: function () {
                        var type = Mom.getUrlParam('Type'), deviceId = Mom.getUrlParam('deviceid'),
                            classDate = Mom.getUrlParam('classDate'), classTime = Mom.getUrlParam('classTime'),
                            mtrlMoveId = Mom.getUrlParam('id');

                        //新增
                        if (type == 'add') {
                            ajaxtype('in');
                            attrInit('table tr td', '#operationType,input.i-checks,#dlvNodeId,#oppositeNode,#startTime', '#startTime');
                            $('#operationType').on('change', function () {
                                if($(this).val()=='LINE_RETO_IOF'){
                                    ajaxtype('in');
                                }else{
                                    ajaxtype('out')
                                }
                                $('div.icheckbox_flat-green').addClass('checked')
                            });
                            $('#useTopo').on('ifChanged', function () {
                                changefun();
                            });
                            function ajaxtype(type) {
                                var data = {
                                    id: deviceId
                                };
                                Api.ajaxJson(Api.mtrl + '/api/mv/Unit/form/' + data.id, data, function (result) {
                                    if (result.success) {
                                        $('#operationType').empty();
                                        Bus.appendOptionsValue($('#operationType'), result.moveTypeList);
                                        if(type=='in'){
                                            var nodelist = result.nodeListByType.nodeListByIn;
                                        }else{
                                            var nodelist = result.nodeListByType.nodeListByOut;
                                        }
                                        $('#dlvNodeId').empty();
                                        $(nodelist).each(function (e, c) {
                                            var html = '<option value="' + nodelist[e].node.id + '">' + nodelist[e].node.nodename + '</option>';
                                            $('#dlvNodeId').append(html);
                                            $('#ownMaterial').val(nodelist[e].mtrl.mtrlName);
                                            $('#dlvMtrlId').val(nodelist[e].mtrlId);
                                            //本方节点变化的时候
                                            $('#dlvNodeId').on('change',function () {
                                                if(nodelist[e].node.id==$(this).val()){
                                                    $('#ownMaterial').val(nodelist[e].mtrl.mtrlName)
                                                }
                                            });
                                        });
                                        changefun();
                                    } else {
                                        Mom.layAlert(result.message);
                                    }
                                });
                            }
                            // 联动请求
                            function changefun() {
                                var val = $('.form-table').find('.checked');
                                var valUseTopo;
                                val.length > 0 ? valUseTopo = '1' : valUseTopo = '0';
                                var subdata = {
                                    mtrlMvOprtType: $('#operationType').val(),
                                    date: classDate,
                                    shift: classTime,
                                    unitId: deviceId,
                                    dlvNodeId: $('#dlvNodeId').val(),
                                    useTopo: valUseTopo
                                };
                                Api.ajaxJson(Api.mtrl + '/api/mv/Unit/getListByType', JSON.stringify(subdata), function (result) {
                                    if (result.success) {
                                        $('#oppositeNode').empty();
                                        Bus.appendOptionsValue($('#oppositeNode'), result.NodeList, 'id', 'nodename');
                                        $('#oppositeNode').val(result.NodeList[0].id);
                                        $('#oppositeMaterial').val(result.NodeList[0].mtrlList[0].mtrlName);
                                        $('#rcvMtrlId').val(result.NodeList[0].mtrlList[0].id);
//本方节点变化的时候
                                        $(result.NodeList).each(function (e,o) {
                                            $('#oppositeNode').on('change',function () {
                                                if(nodelist[e].id==$(this).val()){
                                                    $('#ownMaterial').val(nodelist[e].mtrlList[0].mtrlName)
                                                }
                                            });
                                        })


                                    } else {
                                        Mom.layAlert(result.message);
                                    }

                                });
                            }
                        }
                        //关闭 走的是自己的方法
                        else if (type == 'close') {

                            var data = {
                                id: mtrlMoveId   //列表页行数据物料移动的id
                            };
                            Api.ajaxJson(Api.mtrl + '/api/mv/Unit/view/' + data.id, data, function (result) {
                                var mtrlMvOprtType = '<input type="text" class="form-control" name="mtrlMvOprtTypeLabel" id="mtrlMvOprtTypes">';
                                var dlvNodeId = '<input type="text" class="form-control" name="dlvNode.nodename" id="dlvNodeIds">';
                                var rcvNodeId = '<input type="text" class="form-control" name="rcvNode.nodename" id="oppositeNodes">';
                                $('#operationType').parents('td').append(mtrlMvOprtType);
                                $('#dlvNodeId').parents('td').append(dlvNodeId);
                                $('#oppositeNode').parents('td').append(rcvNodeId);
                                $('.select2').remove();

                                Validator.renderData(result.NodeMtrlMove, '#inputForm');
                                attrInit('table tr td', '#endTime', '#endTime')
                            });
                        };

                        //递交方法 参数递交状态
                        window.Submit = function (substatu, moveType, layerIdx, callback) {
                            $('#date').val(classDate);
                            $('#shift').val(classTime);
                            $('#unitId').val(deviceId);
                            if (!Validator.valid(document.forms[0], 1.3)) {
                                return false;
                            }
                            //后端要求不能传这两个参数
                            if (substatu == 'submit') {
                                //自定义校验
                                $('#endTime,#closeTime').remove();
                            }
                            $('select,input:text,input:checkbox,input:hidden').removeAttr('disabled', 'disabled');
                            var formObj = $('#inputForm');
                            if (moveType == 'add') {
                                var url = Api.mtrl + '/api/mv/Unit/save';
                            } else if (moveType == 'close') {
                                var url = Api.mtrl + '/api/mv/Unit/update';
                            }
                            var formdata = formObj.serializeJSON();
                            Api.ajaxJson(url, JSON.stringify(formdata), function (result) {
                                if (result.success == true) {
                                    Mom.layMsg('操作成功');
                                    if (callback) {
                                        callback()
                                    }
                                    top.layer.close(layerIdx);

                                } else {
                                    Mom.layAlert(result.message);
                                }
                            });
                        };
                        function attrInit(selector, removeAS, timeS) {
                            $(selector).each(function () {
                                $(this).find('input:text').attr('readonly', 'readonly');
                                $(this).find('select').attr('disabled', 'disabled').addClass('dis');
                            });
                            if (removeAS) {
                                $(removeAS).removeAttr('disabled').removeAttr('readonly').removeClass('dis');
                                $(removeAS).attr('require', 'true');
                                $(removeAS).parents('td').prev().addClass('require')
                            }
                            if(timeS){
                                $(timeS).on('click',function () {
                                    WdatePicker({
                                        skin:'whyGreen',
                                        dateFmt:'yyyy-MM-dd HH:mm:ss',
                                        maxDate:classDate+' '+classTime.split('-')[1],
                                        minDate:classDate+' '+classTime.split('-')[0]
                                    });
                                });

                            }
                        }




                    // 判断input、select是否可用
                }
            };
            $(function () {
                //————————主页列表页————————//
                if ($("#deviceIndex").length > 0) {
                    PageModule.init();
                } else if ($('#deviceMMAddFrom').length > 0) {
                    PageModule.decMMAForm();
                }
            });
        }
    );
});