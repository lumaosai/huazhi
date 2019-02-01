require(['/js/zlib/app.js'], function (App) {

    var PageModule = {
            /*——————日计划列表——————*/
            dayPlanList: function () {
                var $year, $month, $week, $status;
                /*日计划按钮权限*/
                var arr_ = [
                    {selector: '#btn-add', code: 'PPMDPP_ADO'},  //新增
                    {selector: '.btn-delete', code: 'PPMDPP_DLO'}, //删除
                    {selector: '.btn-compile', code: 'PPMDPP_DMODO'} //编辑
                ];
                window.pageLoad = function () {
                    $year = $('#yMPicker').val().split("-")[0] || '';
                    $month = $('#yMPicker').val().split("-")[1] || '';
                    $week = $('#apsWeek').val();
                    $status = $("#apsState").val();
                    var data = {
                        dpYear: $year,
                        status: $status,
                        dpWeek: $week,
                        dpMonth: $month
                    };
                    require(['Page'], function () {
                        new Page().init(Api.aps + "/api/aps/DayPlan/page", data, true, function (tableData, result) {
                            PageModule.renderTableData(tableData);
                            //新增
                            $("#btn-add").click(function () {
                                location.href = "./dayPlanEdit.html";
                            });
                            //查看
                            $(".btn-check").click(function () {
                                var attrArr = PageModule.getAttr($(this));
                                Bus.openDialog('查看日计划', 'producePlan/dayPlanView.html?id=' + attrArr.id + '&year=' + attrArr.year + '&month=' + attrArr.month + '&week=' + attrArr.week + '&status=' + attrArr.status + '&check=0', '1080px', '500px')
                            });
                            //删除
                            $(".btn-delete").click(function () {
                                var id = PageModule.getAttr($(this)).id;
                                Bus.deleteItem('确定要删除该计划', Api.aps + '/api/aps/DayPlan/delete', {ids:id});
                            });
                            //编辑
                            $(".btn-edit").click(function () {
                                var attrArr = PageModule.getAttr($(this));
                                location.href = '../producePlan/dayPlanEdit.html?id=' + attrArr.id + '&year=' + attrArr.year + '&month=' + attrArr.month + '&week=' + attrArr.week + '&status=' + attrArr.status + '&monthName=' + attrArr.monthName + '&dayName=' + attrArr.dayName;
                            });
                            Bus.permissionContorl('PPMDPP_PAC', arr_);  //根据用户权限显示对应的操作按钮

                        });
                    });

                };
                pageLoad();

            },
            //找到ichecks显示到
            getAttr: function (obj) {
                var $iChecks = obj.parents("tr").find('.i-checks');
                var getAttrObj = {
                    "id": $iChecks.attr('data-id'),
                    'year': $iChecks.attr('data-year'),
                    "month": $iChecks.attr('data-month'),
                    "week": $iChecks.attr('data-week'),
                    "status": $iChecks.attr('data-status'),
                    "monthName": escape($iChecks.attr('data-monthName')),
                    "dayName": escape($iChecks.attr('data-dayName'))
                };
                return getAttrObj;
            },
            //得到年月周状态的值
            getDataFn: function () {
                $year = $('#yMPicker').val().split("-")[0] || '';
                $month = $('#yMPicker').val().split("-")[1] || '';
                $week = $('#apsWeek').val();
                $status = $("#apsState").val();
            },
            //渲染表内容
            renderTableData: function (tableData) {
                $('#treeTable').dataTable({
                    "bSort": true,
                    "aoColumnDefs": [
                        {"bSortable": false, "aTargets": [0, 2, 4, 6]}
                    ],
                    "data": tableData,
                    "aoColumns": [
                        {"data": "yearName", 'sClass': "center "},
                        {"data": "monthName", 'sClass': "center "},
                        {
                            "data": "dayName", "orderable": false, "defaultContent": "", 'sClass': " center ",
                            "render": function (data, type, row, meta) {
                                if (row.dayName == "") {
                                    return row.period + "计划";
                                } else {
                                    return row.dayName;
                                }
                            }
                        },
                        {"data": "typeLabel", 'sClass': "center "},
                        {"data": "period", 'sClass': "center"},
                        {"data": "createUser", 'sClass': "center "},
                        {"data": "createDate", 'sClass': "center "},
                        {
                            "data": null, "orderable": false, "defaultContent": "", 'sClass': " center ",
                            "render": function (data, type, row, meta) {
                                var classSet = "", setText;
                                if (row.status == "0") {
                                    //setText = "草稿";
                                    classSet = "col-999";
                                } else if (row.status == "1") {
                                    //setText = "已提交";
                                    classSet = "col-51cd50";
                                } else if (row.status == "2") {
                                    classSet = "col-ffa82d";
                                    //setText = "已审核";
                                } else if (row.status == "3") {
                                    //setText = "已发布";
                                    classSet = "col-62b5e9";
                                }
                                return "<span class='" + classSet + "'>" + row.statusShow + "</span >";
                            }
                        },
                        {
                            "data": null, "orderable": false, "defaultContent": "", 'sClass': "center autoWidth",
                            "render": function (data, type, row, meta) {
                                var setText = "";
                                if (row.status == "0") {
                                    setText = "<a  class='btn btn-edit btn-compile'><i class='fa fa-edit'></i>编辑</a >" + "<a  class='btn btn-delete'><i class='fa fa-trash'></i>删除</a >";
                                } else if (row.status == "1") {
                                    classSet = "col-51cd50";
                                    setText = "";
                                }
                                var html = setText;
                                return "<input type='hidden'  id='" + row.id + "' data-type=" + row.tYPE + " data-id='" + row.id + "' data-year='" + row.dpYear + "' data-month='" + row.dpMonth + "' data-week='" + row.dpWeek + "' data-status='" + row.status + "' data-dayName='" + row.dayName + "' data-monthName='" + row.monthName + "' class='i-checks'>" +
                                    "<a class='btn btn-check btn-info' ><i class='fa fa-search-plus'></i>查看</a >" + html;

                            }
                        }

                    ]
                });
            },
            /*——————日计划新增、修改——————*/
            //新增、修改

            checkDGArr: [],  //提交时验证表单必填项

            dayPlanEdit: function () {
                require(['easyui_my'], function (easyui) {
                    var id = Mom.getUrlParam('id') || "",
                        dpYear = Mom.getUrlParam('year') || "",
                        dpMonth = Mom.getUrlParam('month') || "",
                        dpWeek = Mom.getUrlParam('week') || "",
                        dayName = Mom.getUrlParam('dayName') || "",
                        monthName = Mom.getUrlParam('monthName') || "",
                        monthId = '';
                    Api.ajaxForm(Api.aps + '/api/aps/DayPlan/dayPlanMonthSelect', {}, function (result) {
                        if (result.success) {
                            var len = result.rows.length;
                            if (len) {
                                PageModule.appendOV('#monthName', result.rows, 'id', 'monthName', 'adYear', 'adMonth');
                            } else {
                                Mom.layAlert('只有月计划状态为"发布"时才可新增日计划！');
                            }
                        } else {
                            Mom.layMsg(result.message)
                        }
                    });
                    //接收url父页面参数放到input的val里
                    if (id) {
                        $('#monthName').text(monthName).attr('disabled', 'disabled').css({'cursor': 'not-allowed'});
                        $('#apsWeek').val(dpWeek).attr('disabled', 'disabled').css({'cursor': 'not-allowed'});
                        $('#dayName').val(dayName);
                    }
                    PageModule.tabledatagrid(null, null, null, easyui);
                    $("#monthName,#apsWeek").on('change', function () {
                        var idName = $(this).attr('id');
                        $('#dayName').val("");
                        PageModule.getDataFn(function (dpYear, dpMonth, dpWeek) {
                            if (dpYear != "" && dpWeek != "") {
                                monthId = $('#monthName').val();
                                var data = JSON.stringify({
                                    "dpYear": dpYear,
                                    "dpMonth": dpMonth,
                                    "dpWeek": dpWeek,
                                    "monthId": monthId
                                });
                                Api.ajaxJson(Api.aps + "/api/aps/DayPlan/form", data, function (result) {
                                    if (result.success) {
                                        if (result.signFlag) {
                                            Mom.layAlert(dpYear + "年" + dpMonth + "月第" + dpWeek + "周数据已经存在，请重新选择！");
                                            $("#" + idName).val("");
                                        } else {
                                            PageModule.tabledatagrid(dpYear, dpMonth, dpWeek, easyui);
                                            $('#dayName').val(dpYear + '年' + dpMonth + '月第' + dpWeek + '周生产计划');
                                        }
                                    } else {
                                        top.layer.confirm(result.message, function () {
                                            $("#" + idName).val("");
                                            top.layer.closeAll()
                                        }, function () {
                                            $("#" + idName).val("");
                                            top.layer.closeAll()
                                        });
                                    }
                                });
                            }
                        });
                    });
                    $(".btn-back").click(function () {
                        Mom.winBack()
                    });
                    $("#save-btn").unbind('click').click(function () {
                        PageModule.saveFn(easyui);
                    });
                    $("#submit-btn").unbind('click').click(function () {
                        PageModule.submitFn(easyui);
                    });
                });
            },
            //select渲染
            appendOV: function (obj, rows, valueField, labelFile, dpYearFile, dpMonthFile) {
                if (typeof(obj) == "string") {
                    obj = $(obj);
                }
                if (rows && rows.length > 0) {
                    var options = new Array();
                    valueField = valueField || 'value';
                    labelFile = labelFile || 'label';
                    dpMonthFile = dpMonthFile || 'dpMonth';
                    dpYearFile = dpYearFile || 'dpYear';
                    $(rows).each(function (i, o) {
                        options.push({
                            'value': o[valueField],
                            'dpMonth': o[dpMonthFile],
                            'dpYear': o[dpYearFile],
                            'label': o[labelFile]
                        });
                    });
                    PageModule.appendOptions(obj, options);
                }
            },
            // 追加select的options
            appendOptions: function (obj, options) {
                if (options) {
                    $(options).each(function (i, o) {
                        $(obj).append("<option value='" + o.value + "' dpYear='" + o.dpYear + "' dpMonth='" + o.dpMonth + "'>" + o.label + "</option>");
                    });
                }
            },
            //多表格请求数据渲染方法
            tabledatagrid: function (dpYear, dpMonth, dpWeek, easyui) {
                var id = Mom.getUrlParam('id') || '';
                var data = {
                    "id": id,
                    "dpYear": dpYear,
                    "dpMonth": dpMonth,
                    "dpWeek": dpWeek,
                    "monthId": $('#monthName option:selected').val()
                };
                Api.ajaxJson(Api.aps + "/api/aps/DayPlan/form", JSON.stringify(data), function (result) {
                    if (result.success) {
                        PageModule.checkDGArr = [];
                        var ii =0;
                        var len = result.rows.length>0?result.rows.length:0;
                        var jsonCfg = $.parseJSON(result.Template.jsonCfg);
                        for(var i=0;i<len;i++){
                            var itemData = result.rows[i];
                            var itemCode = itemData.code;
                            var columnObj = jsonCfg[itemCode];
                            if(!columnObj){
                                continue;
                            }
                            var html = $('<div class="tableItemBox"><table id="td'+ii+'" data-table="'+itemCode+'" class="tableItem" ></table></div>');
                            $('.datagridsContent').append(html);
                            var merCellArr = columnObj.mergeCell || [];
                            var dgValidator = columnObj.validator;
                            if(!($.isEmptyObject(dgValidator))){ //$.isEmptyObject(data)  判断对象的是否为空，为空是放回值为true;
                                dgValidator.dgName = itemData.name;
                                dgValidator.dgId = '#td'+ii;
                                PageModule.checkDGArr.push(dgValidator);
                            }
                            var tdCfg_ = easyui.dg_dataGridOptions('#td'+ii, itemData.name, columnObj.columnArr,merCellArr);
                            $('#td'+ii).datagrid(tdCfg_);
                            if(itemData.groupList){
                                //渲染table
                                $('#td'+ii).datagrid('loadData', itemData.groupList);
                                //设置字段可编辑
                                $('#td' + ii).datagrid('addEditor', columnObj.editArr);
                                ii ++;
                            }
                            ii ++;

                        }
                        //浏览器窗口改变时dataGrid数据宽度重置
                        easyui.dg_dataGridResize('.tableItem');
                    }
                });
            },
            //拿到年月周的参数
            getDataFn: function (callback) {
                dpYear = $('#monthName>option:selected').attr('dpYear') || '';
                dpMonth = $('#monthName>option:selected').attr('dpMonth') | '';
                dpWeek = $('#apsWeek').val() || '';
                if (callback) {
                    callback(dpYear, dpMonth, dpWeek);
                }
            },
            //保存验证
            checkSave: function () {
                // yearId = $('#monthName', window.parent.document).val();
                dpYear = $('#monthName>option:selected').attr('dpYear');
                dpMonth = $('#monthName>option:selected').attr('dpMonth');
                monthName = $('#monthName').val();
                dpWeek = $('#apsWeek').val();
                dayName = $('#dayName').val();
                if (monthName == '' && dpWeek == '') {
                    Mom.layAlert("月计划、日计划周期不能为空！");
                    return false;
                } else {
                    var str = monthName == "" ? "月计划不能为空" : dpWeek == "" ? '日计划周期不能为空！' : true;
                    if (str != true) {
                        Mom.layAlert(str);
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            //保存
            saveFn: function (easyui) {
                if (!PageModule.checkSave()) {
                    return;
                }
                PageModule.submitData("0",easyui);
            },
            //递交前验证是否为空
            submitFn: function (easyui) {
                if (!PageModule.checkSave()) {
                    return;
                }
                if (dayName == "") {
                    Mom.layAlert('日计划名称不能为空！');
                    return;
                }
                var checkFlag = easyui.dg_eachCheckDataGrid(PageModule.checkDGArr);
                if (checkFlag == false) {
                    return false;
                }
                Mom.layConfirm("确认提交吗?", function () {
                    PageModule.submitData("1", easyui);
                    return true;
                });

            },
            //保存、提交
            submitData: function (status, easyui) {
                PageModule.getDataFn();
                var editItems = easyui.dg_getSaveItemArr();
                var id = Mom.getUrlParam('id');
                var data = {
                    "dpYear": dpYear,
                    "dpMonth": dpMonth,
                    "dpWeek": dpWeek,
                    "dayName": dayName,
                    "monthId": monthName,
                    "dayPlans": JSON.stringify(editItems),
                    "status": status,
                    "id": id
                };
                Api.ajaxForm(Api.aps + '/api/aps/DayPlan/save', data, function (result) {
                    if (result.success) {
                        Mom.layMsg('提交成功');
                        Mom.winBack();
                    } else {
                        Mom.layMsg(result.message)
                    }
                    return
                });
            },

            /*——————查看——————*/
            //查看方法
            dayPlanView: function () {
                require(['easyui_my'], function (easyui) {
                    var id = Mom.getUrlParam('id') || "",
                        dpYear = Mom.getUrlParam('year') || "",
                        dpMonth = Mom.getUrlParam('month') || "",
                        dpWeek = Mom.getUrlParam('week') || "";
                    var data = {
                        "id": id,
                        "dpYear": dpYear,
                        "dpMonth": dpMonth,
                        "dpWeek": dpWeek
                    };
                    console.log(easyui);
                    //接收url父页面参数放到input的val里
                    PageModule.tabledatagridC(data, easyui);
                    $(".btn-back").click(function () {
                        window.history.back()
                    });
                    $('.btn-export').click(function () {
                        window.location.href = Api.aps + '/aps/PlanExport/dayPlanExport?id=' + id + '&dpYear=' + dpYear + '&dpMonth=' + dpMonth + '&dpWeek=' + dpWeek;
                    });
                });
            },
            //多表格请求数据渲染方法
            tabledatagridC: function (data,easyui) {
                Api.ajaxJson(Api.aps + "/api/aps/DayPlan/form", JSON.stringify(data), function (result) {
                    if (result.success) {
                        var ii =0;
                        var len = result.rows.length>0?result.rows.length:0;
                        var jsonCfg = $.parseJSON(result.Template.jsonCfg);
                        for(var i=0;i<len;i++){
                            var itemData = result.rows[i];
                            var itemCode = itemData.code;
                            var columnObj = jsonCfg[itemCode];
                            if(!columnObj){
                                continue;
                            }
                            var merCellArr = columnObj.mergeCell || [];
                            var html = $('<div class="tableItemBox"><table id="td'+ii+'" class="tableItem" ></table></div>');
                            $('.datagridsContent').append(html);
                            var tdCfg_ = easyui.dg_dataGridOptions('#td'+ii, itemData.name, columnObj.columnArr,merCellArr);
                            $('#td'+ii).datagrid(tdCfg_);
                            if(itemData.groupList){
                                //渲染table
                                $('#td'+ii).datagrid('loadData', itemData.groupList);
                            }
                            ii ++;
                        }
                        //浏览器窗口改变时dataGrid数据宽度重置
                        easyui.dg_dataGridResize('.tableItem');
                    }
                });
            }
        }
    ;

    $(function () {
        //参数配置列表
        if ($('#dayPlanList').length > 0) {
            PageModule.dayPlanList()
        }
        //修改、增加
        else if ($('#dayPlanEdit').length > 0) {
            PageModule.dayPlanEdit()
        }
        //查看
        else if ($('#dayPlanView').length > 0) {
            PageModule.dayPlanView()
        }
    });
});