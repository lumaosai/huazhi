require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);
    /**作者：贾旭光
     *日期：2018.10.12
     *描述：目前还有序号问题待处理*/
    var PageModule = {
        /**列表页————invManagement页*/
        //列表页
        invMListInit: function () {
            require(['datetimepicker', 'Page'], function () {
                //时间选择插件
                $("#startTime,#endTime").val("").datetimepicker({
                    bootcssVer: 3,
                    format: "yyyy-mm-dd",  //保留到日
                    showMeridian: false,     //显示上、下午
                    language: "zh-CN",   //中文显示
                    minView: "3",    //月视图
                    autoclose: true,  //选择时间后自动隐藏
                    clearBtn: true,
                    todayBtn: true

                });
                //判断日期大小
                $("#endTime,#startTime").on('change', function () {
                    if ($('#endTime').val() < $('#startTime').val() && $('#endTime').val() != '') {
                        Mom.layMsg('结束时间应大于起始时间，请重新选择');
                        $('#endTime').val('')
                    }
                });
                window.pageLoad = function () {
                    var data = {
                        startDate: $('#startTime').val(),
                        endDate: $('#endTime').val(),
                        createBy: $('#creator').val(),
                        status: $('#status option:selected').val()
                    };
                    new Page().init(Api.aps + "/api/aps/manage/page", data, true, function (tableDate,result) {

                        PageModule.createTable(tableDate); //渲染表格数据
                        PageModule.btngather(result);//按钮集合
                    });
                };
                pageLoad();
            })
        },
        //创建表格
        createTable: function (tableDate) {
            $('#treeTable').dataTable({
                "data": tableDate,
                "aoColumns": [
                    {
                        "data": null,
                        "orderable": false,
                        "defaultContent": "",
                        'sClass': "yearName center autoWidth",
                        "render": ''
                    },
                    {"data": "stocktakeDate", 'sClass': "invDate center autoWidth"},
                    {
                        "data": 'status',
                        "orderable": false,
                        "defaultContent": "",
                        'sClass': "status center autoWidth",
                        "render": function (data, type, row, meta) {
                            var classSet = "", setText;
                            if (row.status == "0") {
                                setText = "未封存";
                                classSet = "col-1ab394";
                            } else if (row.status == "1") {
                                setText = "已封存";
                                classSet = "col-62b5e9";
                            } else if (row.status == "2") {
                                setText = "已解封";
                                classSet = "col-ffa82d";
                            }
                            return "<span class='" + classSet + "' data-status='" + row.status + "'>" + setText + "</span >";
                        }
                    },
                    {"data": "createBy", 'sClass': "center autoWidth"},
                    {"data": "createDate", 'sClass': "center autoWidth"},
                    {
                        "data": null, "orderable": false, "defaultContent": "", 'sClass': "center autoWidth",
                        "render": function (data, type, row, meta) {
                            var html = "";
                            if (row.status == "0") {
                                html = "<a class='btn btn-edit btn-compile'><i class='fa fa-edit'></i>编辑</a >"  + "<a class='btn  btn-safesave   btn-change' ><i class='fa fa-lock'></i>封存</a >"+ "<a class='btn btn-delete'><i class='fa fa-trash'></i>删除</a >";
                            } else if (row.status == "1") {
                                html = "<a class='btn  btn-unsave btn-change' ><i class='fa fa-unlock-alt'></i>解封</a >";
                            } else {
                                html = "<a class='btn btn-edit btn-compile'><i class='fa fa-edit'></i>编辑</a >" + "<a class='btn  btn-safesave   btn-change' ><i class='fa fa-lock'></i>封存</a >"+ "<a class='btn btn-delete'><i class='fa fa-trash'></i>删除</a >" ;
                            }
                            return "<input type='hidden'  id=" + row.id + "  data-id='" + row.id + "'   class='invId'>" + "<a class='btn  btn-info btn-check' ><i class='fa fa-search-plus'></i>查看</a >" + html;
                        }
                    }
                ],
                "fnDrawCallback": function () {
                    this.api().column(0).nodes().each(function (cell, i) {
                        cell.innerHTML = i + 1;
                    });
                }
            });
        },
        //按钮集合
        btngather: function (result) {
            //盘存核对计算
            $('#calculate-btn').on('click', function () {

                location.href = 'invDataComputation.html?type=0';
            });
            //删除
            $('.btn-delete').on('click', function () {
                var id = $(this).parents("tr").find('.invId').attr('id');
                Bus.deleteItem('请确认是否删除？', Api.aps + '/api/aps/manage/delete', {ids:id});
            });
            //封存
            $('.btn-safesave').on('click', function () {
                var id = $(this).parents("tr").find('.invId').attr('id');
                var data = {
                    id: id
                };
                Api.ajaxForm(Api.aps + '/api/aps/manage/equestrationManage', data, function (result) {
                    if (result.success) {
                        Mom.layMsg('封存成功');
                        pageLoad();
                    } else {
                        Mom.layAlert(result.message)
                    }
                });
            });
            //解封
            $('.btn-unsave').on('click', function () {
                var id = $(this).parents("tr").find('.invId').attr('id');
                var data = {
                    id: id
                };
                Api.ajaxForm(Api.aps + '/api/aps/manage/equestrationManage', data, function (result) {
                    if (result.success) {
                        Mom.layMsg('解封成功');
                        pageLoad();
                    } else {
                        Mom.layMsg(result.message)
                    }
                });
            });
            //编辑
            $('.btn-edit').on('click', function () {
                var id = $(this).parents("tr").find('.invId').attr('id');
                var invDate = $(this).parents("tr").find('.invDate').text();
                var date = invDate.split(' ')[0];
                location.href = 'invDataComputation.html?id=' + id + '&type=1&invDate=' + date;
            });
            //查看
            $('.btn-check').on('click', function () {
                var id = $(this).parents("tr").find('.invId').attr('id');
                var invDate = $(this).parents("tr").find('.invDate').text();
                var date = invDate.split(' ')[0];
                location.href = 'invDataComputation.html?id=' + id + '&type=2&invDate=' + date;
            });
            /**还未调试接口*/
        },
        /**盘存数据核算（新增）、编辑————invDataComputation页*/
        //盘存数据核算页面
        invDataComInit: function () {
            //渲染盘存时间
            var url = Api.admin + "/api/sys/SysDict/type/STOCKTAKE_DATE";
            Api.ajaxForm(url, {}, function (result) {
                var date = [15, 30];
                var dateArr = [];
                var myDate = new Date();
                var year = myDate.getFullYear();//获取当前月
                var month = myDate.getMonth() + 1;//获取当前日
                var rows = result.rows;
                for (var i = 0; i < rows.length; i++) {
                    for (var c = 0; c < date.length; c++) {
                        var now = year + '-' + month + "-" + date[c] + " " + rows[i].value;
                        dateArr.push(now)
                    }
                }
                $(dateArr).each(function (i, o) {
                    $('#invDate').append("<option value='" + dateArr[i] + "'>" + dateArr[i] + "</option>");
                });

                });
            //拿到父页面参数
            var pageid = Mom.getUrlParam('id');
            var pageType = Mom.getUrlParam('type');
            //类型判断
            $.get('../../../json/invData/Configjson.json', function (json_) {
                //查看
                if (pageid != null && pageType == 2) {
                    var json = json_.checkConfigArr;
                    var invDate = Mom.getUrlParam('invDate');
                    $('#invDateinput').val(invDate).attr({'type': 'text','disabled': 'disabled', 'readonly': 'readonly'});
                    $('#invDate').remove();
                    $('#save-btn,#computed-btn,#safekeeping-btn').hide();
                    PageModule.tabChange(json, invDate, pageType);
                    $('.tabChange').find('li').eq(0).trigger('click');
                }
                //编辑
                else if (pageid != null && pageType == 1) {
                    var json = json_.editConfigArr;
                    var invDate = Mom.getUrlParam('invDate');
                    $('#invDateinput').val(invDate).attr({'type': 'text','disabled': 'disabled', 'readonly': 'readonly'});
                    $('#invDate').remove();
                    PageModule.tabChange(json, invDate, pageType);
                    $('.tabChange').find('li').eq(0).trigger('click');
                }
                //新增
                else {
                    var json = json_.editConfigArr;
                    PageModule.tabChange(json, invDate, pageType);
                    $('#safekeeping-btn').hide();
                    $('.tabChange').find('li').eq(0).trigger('click');
                }
            });

            PageModule.btnCollection();
        },
        //按钮集合
        btnCollection: function () {
            var id = Mom.getUrlParam('id');
            //返回按钮
            $('#back-btn').click(function () {
                Mom.winBack();
            });
            // //封存
            // $('#safekeeping-btn').click(function () {
            //     var data = {
            //         id: id
            //     };
            //     top.layer.confirm('是否确定要封存该核算？', {icon: 3, title: '系统提示'}, function () {
            //         Api.ajaxForm(Api.aps + '/api/aps/manage/equestrationManage', data, function (result) {
            //             if (result.success) {
            //                 Mom.layMsg('封存成功')
            //             } else {
            //                 Mom.layAlert(result.message)
            //             }
            //         })
            //     })
            //
            // })
        },
        //查看操作跳转tab
        tabChange: function (json, invDate, pageType) {
            var flagtab;
            var tabindex;//拿到上一次点击的索引值
            $('.tabChange').find('li').each(function (i) {
                $('div.active>.ui-jqgrid').find('.floatColShow').empty();
                //tab页列表跳转
                $(this).unbind('click').on('click', function () {
                    tabindex = $(this).index();
                    var statu = $(this).attr('statu');
                    if (flagtab == false) {
                        if (pageType != 2) {
                            if($('#creator').val()!=''){
                                $('#creator').attr({'disabled': 'disabled', 'readonly': 'readonly'});
                                if ($('#invDate')) {
                                    if (invDate == undefined) {
                                        invDate = $('#invDate option:selected').val() || $('#invDateinput').val()
                                    }
                                    $('#invDateinput').val(invDate).attr({'type': 'text','disabled': 'disabled', 'readonly': 'readonly'});
                                    $('#invDate').remove();
                                    $('input[type=text].editable').each(function (i, item) {
                                        $(this).parents('td').text($(this).val());
                                        $(this).remove()
                                    });
                                }
                            }
                            var urlArr2 = ['manageProcessMtrl', 'manageMineral', 'manageReport', 'manageMtrl', 'manageYield', 'manageQuota', 'manageConsume', 'manageAO'];
                            var urlArr = ['ManageProcessMtrl', 'ManageMineral', 'ManageReport', 'ManageMtrl', 'ManageYield', 'ManageQuota', 'ManageConsume', 'ManageAO'];
                            var ids = [];
                            for (var z = 0; z < $('div.tableBox.active>div.ui-jqgrid').length; z++) {
                                ids.push($('div.tableBox.active>div.ui-jqgrid').eq(z).attr('id').split('_')[1]);
                            }
                            var savebtn = PageModule.saveTable(ids);
                            var fstMan = $('#creator').val();
                            var data = {'stocktakeDate': invDate, 'fstMan': fstMan};
                            data[urlArr2[tabindex]] = JSON.stringify(savebtn);
                            if (!Validator.valid(document.forms[0], 1.3)) {
                                return false;
                            }

                            Api.ajaxForm(Api.aps + '/api/aps/' + urlArr[tabindex] + '/save', data, function (result) {
                                if (result.success) {
                                    PageModule.getData(i, json, invDate);
                                } else {
                                    Mom.layAlert(result.message)
                                }
                            });

                        }else{
                            PageModule.getData(i, json, invDate);
                        }
                    }else{
                        PageModule.getData(i, json, invDate);
                    }
                    flagtab = false;
                    $(this).addClass('active').siblings('li').removeClass('active');
                    $('.aps-create-list>div').eq(i).addClass('active').siblings('div').removeClass('active');
                });
            });
        },
        //getjson i参数传0的时候是初始化 传i的时候点击后的 带有数组去重
        getData: function (index, json_, invDate) {
            var urlArr = ['ManageProcessMtrl', 'ManageMineral', 'ManageReport', 'ManageMtrl', 'ManageYield', 'ManageQuota', 'ManageConsume', 'ManageAO'];
            if (invDate == undefined) {
                invDate = $('#invDate option:selected').val()
            }
            var url = '/api/aps/' + urlArr[index] + '/view/' + invDate;
            Api.ajaxJson(Api.aps + url, {}, function (result) {
                if (result.success) {
                    PageModule.ajaxInnerEvent(result, json_, index, invDate);
                } else {
                    Mom.layAlert(result.message)
                }
            });
        },
        /* **statuName:json表名字 **rows:后台返回的列内容 **json表的列内容：jsonItem **盘存日期：invDate*/
        //表渲染
        ajaxInnerEvent: function (result, json_, index, invDate) {
            var creatorval=$('#creator').val();
            //盘存人 提取
            if (result.fstMan != ""&&result.fstMan !=undefined) {
                $('#creator').val(result.fstMan);
                $('#creator').attr({'disabled': 'disabled', 'readonly': 'readonly'})
            }
            var rows = [];
            if (index == 1 || index == 5 || index == 7) {
                var tablehtml = '<table id="' + result.rows[0].code.split('_')[1] + '" class="tableItemBox"></table>';
                $('.tableBox').eq(index).append(tablehtml);
                rows = result.rows[0];
            } else if (index == 2 || index == 4 || index == 6) {
                var tablehtml = '<table id="' + result.code.split('_')[1] + '" class="tableItemBox"></table>';
                $('.tableBox').eq(index).append(tablehtml);
                rows = result.groupList;
                $(rows).each(function (i, item) {
                    if (item.parentId == "0") {
                        delete item['parentId']
                    }
                });
            } else if (index == 0 || index == 3) {
                for (var i = 0; i < result.rows.length; i++) {
                    var tablehtml = '<table id="' + result.rows[i].code.split('_')[1] + '" class="tableItemBox"></table>';
                    $('.tableBox').eq(index).append(tablehtml);
                }
                rows = result.rows;
                $(rows).each(function (i, item) {
                    $(rows[i].groupList).each(function (e, eitem) {
                        if (this.parentId == "0") {
                            delete this['parentId']
                        }
                    })
                });
            };
            var jsonItem = json_[index];
            var statuName = jsonItem.itemName;
            PageModule.tabledatagrid(statuName, rows, jsonItem, json_, index, invDate);
        },
        //渲染表格
        tabledatagrid: function (statuName, result, jsonItem, json_, index, invDates) {
            //保存用的参数
            var ids = [], colNameArr = [];
            //表格插入按钮所需数据
            var configjson = [
                {
                    'tableName': 'GCWLHS',
                    'colModel': [
                        {
                            name: 'gcwlhsChart', align: 'center',
                            formatter: function () {
                                var btnhtml = '<a class="btn btnChart"> <i class="fa fa-bar-chart"></i></a>';
                                return btnhtml
                            }
                        }
                    ]
                },
                {
                    'tableName': 'JCWLHS',
                    'colModel': [
                        {
                            name: 'jcwlhsChart', align: 'center',
                            formatter: function () {
                                var btnhtml = '<a class="btn btnChart"> <i class="fa fa-bar-chart"></i></a>';
                                return btnhtml
                            }
                        }
                    ]


                },
                {
                    'tableName': 'CLHS',
                    'colModel': [
                        {
                            name: 'clhsChart', align: 'center',
                            formatter: function () {
                                var btnhtml = '<a class="btn btnChart"> <i class="fa fa-bar-chart"></i></a>';
                                return btnhtml
                            }
                        }
                    ]
                },
                {
                    'tableName': 'ZBHS',
                    'colModel': [
                        {
                            name: 'zbjhChart', align: 'center',
                            formatter: function () {
                                var btnhtml = '<a class="btn btnChart"> <i class="fa fa-bar-chart"></i></a>';
                                return btnhtml
                            }
                        }
                    ]
                }
            ];
            //引入jqgrid语言包
            require(['jqGrid_my'], function (jqGridAll) {
                if (statuName == 'GCWLHS') {
                    //jqgrid自定义公共方法
                    for (var i = 0; i < result.length; i++) {
                        var tableId = result[i].code.split('_')[1];
                        var colNames = jsonItem.colNames;
                        var colModel = jsonItem.colModel;
                        if (colModel.length != colNames.length) {
                            $(configjson).each(function () {
                                //把按钮push到数据里
                                if (statuName == this.tableName) {
                                    gcwlData = this.colModel[0];
                                }
                            });
                            colModel.push(gcwlData);
                        }
                        var configData = jqGridAll.jG_configData(result[i].groupList);
                        var gridConfig = jqGridAll.jG_config(result[i].name, colNames, colModel, result[i].groupList.length);
                        var gridsum = jqGridAll.jG_conSum('#' + tableId, ['densitySolid', 'weightSolid']);
                        var ishide = {hiddengrid: true};//是否折叠
                        var lastsel;
                        var gridEdit = jqGridAll.jG_editRowFn('#' + tableId, lastsel,true);
                        //默认第一个不折叠
                        if (i == 0) {
                            $('#' + tableId).jqGrid($.extend(configData, gridConfig, gridEdit, gridsum));
                        } else {
                            $('#' + tableId).jqGrid($.extend(configData, gridConfig, gridEdit, gridsum, ishide));
                        }
                        jqGridAll.jG_Resize('#' + tableId,'div.active');

                        ids.push(tableId);

                    }
                    PageModule.isHideFn(ids, colNames);

                }
                else if (statuName == 'KSSHHS') {
                    var colNames = jsonItem.colNames;
                    var colModel = jsonItem.colModel;
                    var configData = jqGridAll.jG_configData(result.nodes);
                    var gridConfig = jqGridAll.jG_config(jsonItem.name, colNames, colModel, result.nodes.length);
                    var lastsel;
                    var gridEdit = jqGridAll.jG_editRowFn('#' + statuName, lastsel,true);
                    //默认第一个补折叠
                    $('#' + statuName).jqGrid($.extend(gridEdit, configData, gridConfig));
                    jqGridAll.jG_Resize('#' + statuName,'div.active');
                    ids = [];
                    ids.push(statuName);
                    PageModule.isHideFn(ids, colNames, statuName);
                }
                else if (statuName == 'WBCCHS') {
                    var colNames = jsonItem.colNames, colModel = jsonItem.colModel;
                    //修改折叠表要求的数据格式
                    var jsonData = {
                        rows: result
                    };
                    var configUrl = jqGridAll.jG_configUrl(JSON.stringify(jsonData));
                    var gridConfig = jqGridAll.jG_config(jsonItem.name, colNames, colModel, result.length);
                    var lastsel;
                    var gridEdit = jqGridAll.jG_editRowFn('#' + statuName, lastsel,true);
                    var treeGrid = jqGridAll.jG_istreeGrid('name');
                    //默认第一个补折叠
                    $('#' + statuName).jqGrid($.extend(configUrl, treeGrid, gridConfig, gridEdit));
                    jqGridAll.jG_Resize('#' + statuName,'div.active');
                    $('#' + statuName)[0].addJSONData(jsonData);
                    ids = [];
                    ids.push(statuName);
                    //输入的tree的数据格式
                    PageModule.isHideFn(ids, colNames, statuName);
                }
                else if (statuName == 'JCWLHS') {
                    var jcwlData = '';
                    var colNames = jsonItem.colNames;
                    var colModel = jsonItem.colModel;
                    if (colModel.length != colNames.length) {
                        $(configjson).each(function () {
                            //把按钮push到数据里
                            if (statuName == this.tableName) {
                                jcwlData = this.colModel[0];
                            }
                        });
                        colModel.push(jcwlData);
                    }

                    for (var i = 0; i < result.length; i++) {
                        var tableId = result[i].code.split('_')[1];
                        var jsonData = {
                            rows: result[i].groupList
                        };
                        var configUrl = jqGridAll.jG_configUrl();
                        var gridConfig = jqGridAll.jG_config(result[i].name, colNames, colModel, result[i].groupList.length);
                        // var gridsum = jqGridAll.jG_conSum('#' + tableId, ['monthTotal', 'monthLastTotal']);
                        var lastsel;
                        var treeGrid = jqGridAll.jG_istreeGrid('name');
                        var gridEdit = jqGridAll.jG_editRowFn('#' + tableId, lastsel,true);
                        //默认第一个补折叠
                        if (i == 0) {
                            $('#' + tableId).jqGrid($.extend(configUrl, gridConfig, gridEdit, /*gridsum,*/ treeGrid));
                        } else {
                            $('#' + tableId).jqGrid($.extend(configUrl, gridConfig, gridEdit, /*gridsum,*/ treeGrid));
                        }
                        jqGridAll.jG_Resize('#' + tableId,'div.active');
                        $('#' + tableId)[0].addJSONData(jsonData);
                        ids.push(tableId);
                    }
                    PageModule.isHideFn(ids, colNames);
                }
                else if (statuName == 'CLHS') {
                    var jcwlData = '';
                    var colNames = jsonItem.colNames;
                    var colModel = jsonItem.colModel;
                    if (colModel.length != colNames.length) {
                        $(configjson).each(function () {
                            //把按钮push到数据里
                            if (statuName == this.tableName) {
                                jcwlData = this.colModel[0];
                            }
                        });
                        colModel.push(jcwlData);
                    }
                    //修改折叠表要求的数据格式
                    var jsonData = {
                        rows: result
                    };
                    var configUrl = jqGridAll.jG_configUrl(JSON.stringify(jsonData));
                    var gridConfig = jqGridAll.jG_config(jsonItem.name, colNames, colModel, result.length);
                    var lastsel;
                    var gridEdit = jqGridAll.jG_editRowFn('#' + statuName, lastsel,true);
                    var treeGrid = jqGridAll.jG_istreeGrid('name');
                    //默认第一个补折叠
                    $('#' + statuName).jqGrid($.extend(configUrl, treeGrid, gridConfig, gridEdit));
                    jqGridAll.jG_Resize('#' + statuName,'div.active');
                    $('#' + statuName)[0].addJSONData(jsonData);
                    ids = [];
                    ids.push(statuName);
                    //输入的tree的数据格式
                    PageModule.isHideFn(ids, colNames, statuName);

                }
                else if (statuName == 'ZBHS') {
                    var jcwlData = '';
                    var colNames = jsonItem.colNames;
                    var colModel = jsonItem.colModel;
                    if (colModel.length != colNames.length) {
                        $(configjson).each(function () {
                            //把按钮push到数据里
                            if (statuName == this.tableName) {
                                jcwlData = this.colModel[0];
                            }
                        });
                        colModel.push(jcwlData);
                    }
                    var configData = jqGridAll.jG_configData(result.nodes);
                    var gridConfig = jqGridAll.jG_config(jsonItem.name, colNames, colModel, result.nodes.length);
                    var lastsel;
                    var gridEdit = jqGridAll.jG_editRowFn('#' + statuName, lastsel,true);
                    //默认第一个补折叠
                    $('#' + statuName).jqGrid($.extend(gridEdit, configData, gridConfig));
                    jqGridAll.jG_Resize('#' + statuName,'div.active');
                    ids = [];
                    ids.push(statuName);
                    PageModule.isHideFn(ids, colNames, statuName);
                }
                else if (statuName == 'ZYXHHS') {
                    var colNames = jsonItem.colNames, colModel = jsonItem.colModel;
                    //修改折叠表要求的数据格式
                    var jsonData = {
                        rows: result
                    };
                    var configUrl = jqGridAll.jG_configUrl(JSON.stringify(jsonData));
                    var gridConfig = jqGridAll.jG_config(jsonItem.name, colNames, colModel, result.length);
                    var lastsel;
                    var gridEdit = jqGridAll.jG_editRowFn('#' + statuName, lastsel,true);
                    var treeGrid = jqGridAll.jG_istreeGrid('name');
                    //默认第一个补折叠
                    $('#' + statuName).jqGrid($.extend(configUrl, treeGrid, gridConfig, gridEdit));
                    jqGridAll.jG_Resize('#' + statuName,'div.active');
                    $('#' + statuName)[0].addJSONData(jsonData);
                    ids = [];
                    ids.push(statuName);
                    PageModule.isHideFn(ids, colNames, statuName);
                }
                else if (statuName == 'AODCHS') {
                    var colNames = jsonItem.colNames;
                    var colModel = jsonItem.colModel;
                    var configData = jqGridAll.jG_configData(result.nodes);
                    var gridConfig = jqGridAll.jG_config(jsonItem.name, colNames, colModel, result.nodes.length);
                    var lastsel;
                    var gridEdit = jqGridAll.jG_editRowFn('#' + statuName, lastsel,true);
                    //默认第一个补折叠
                    $('#' + statuName).jqGrid($.extend(gridEdit, configData, gridConfig));
                    jqGridAll.jG_Resize('#' + statuName,'div.active');
                    ids = [];
                    ids.push(statuName);
                    PageModule.isHideFn(ids, colNames, statuName);
                }
                jqGridAll.jG_Resize('#' + statuName);
                //保存按钮
                $('body').off('click', '#save-btn').on('click', '#save-btn', function () {
                    $('input[type=text].editable').each(function (i, item) {
                        $(this).parents('td').text($(this).val());
                        $(this).remove()
                    });
                    //时间
                    if (invDates == undefined) {
                        invDates = $('#invDate option:selected').val();
                        $('#invDateinput').val(invDates).attr({'type': 'text','disabled': 'disabled', 'readonly': 'readonly'});
                        $('#invDate').remove();
                    }
                    var urlArr2 = ['manageProcessMtrl', 'manageMineral', 'manageReport', 'manageMtrl', 'manageYield', 'manageQuota', 'manageConsume', 'manageAO'];
                    var savebtn = PageModule.saveTable(ids);
                    var fstMan = $('#creator').val();
                    if (!Validator.valid(document.forms[0], 1.3)) {
                        return false;
                    }
                    var data = {'stocktakeDate': invDates, 'fstMan': fstMan};
                    data[urlArr2[index]] = JSON.stringify(savebtn);
                    var urlArr = ['ManageProcessMtrl', 'ManageMineral', 'ManageReport', 'ManageMtrl', 'ManageYield', 'ManageQuota', 'ManageConsume', 'ManageAO'];
                    Api.ajaxForm(Api.aps + '/api/aps/' + urlArr[index] + '/save', data, function (result) {
                        if (result.success) {
                            PageModule.getData(index, json_, invDates);
                            Mom.layMsg('保存成功')
                        } else {
                            Mom.layAlert(result.message)
                        }
                    });
                });
                //計算
                $('body').off('click', '#computed-btn').on('click', '#computed-btn', function () {
                    $('input[type=text].editable').each(function (i, item) {
                        $(this).parents('td').text($(this).val());
                        $(this).remove()
                    });
                    var urlArr2 = ['manageProcessMtrl', 'manageMineral', 'manageReport', 'manageMtrl', 'manageYield', 'manageQuota', 'manageConsume', 'manageAO'];
                    var savebtn = PageModule.saveTable(ids);
                    //时间
                    if (invDates == undefined) {
                        invDates = $('#invDate option:selected').val();
                        $('#invDateinput').val(invDates).attr({'type': 'text','disabled': 'disabled', 'readonly': 'readonly'});
                        $('#invDate').remove();
                    }
                    var data = {'stocktakeDate': invDates};
                    data[urlArr2[index]] = JSON.stringify(savebtn);
                    var urlArr = ['ManageProcessMtrl', 'ManageMineral', 'ManageReport', 'ManageMtrl', 'ManageYield', 'ManageQuota', 'ManageConsume', 'ManageAO'];
                    //重新加載數據

                    Api.ajaxForm(Api.aps + '/api/aps/' + urlArr[index] + '/analysis', data, function (result) {
                        if (result.success) {
                            Mom.layMsg('计算成功，请查看最新数据');
                            $('div.tableBox.active').empty();
                            PageModule.ajaxInnerEvent(result, json_, index, invDates);
                        } else {
                            Mom.layAlert(result.message)
                        }
                    });
                });
                //图表按钮
                $(ids).each(function (i, item) {
                    $('#' + item).off('click', 'a.btnChart').on('click', 'a.btnChart', function (event) {
                        var id = $(this).parents('tr').attr('id');
                        var code = $(this).parents('tr').find('td').eq(1).text();
                        /**以下方法可以取到表任意一个表格内的内容*/
                        var celldata = $('#' + item).jqGrid('getCell', id, 2);
                        var code_encode = encodeURIComponent(code);
                        Bus.openDialog('图表:' + celldata, 'inventoryTaking/invManaChart.html?id=' + id + '&code=' + code_encode + '&typeName=' + statuName, '830px', '520px');
                    });
                });
            });
        },
        //显示隐藏
        isHideFn: function (ids, colNames, statuName) {
            var arr = [];
            //标题行
            var $divtitle = $('div.active .ui-jqgrid-hdiv>.ui-jqgrid-hbox');
            $divtitle.find('.floatColShow').remove();
            //本页表数遍历 创建
            $(ids).each(function (ind, item) {
                var ulhtml = '<ul class="floatColShow" ></ul>';
                if ($('div.active>.ui-jqgrid').eq(ind).find('ul.floatColShow').length > 0) {
                    $('div.active>.ui-jqgrid').eq(ind).find('ul.floatColShow').remove();
                }
                $('div.active>.ui-jqgrid').eq(ind).append(ulhtml);
                for (var i = 3; i < colNames.length; i++) {
                    var lihtml = '<li ><span class="checkName">' + colNames[i] + '</span>&nbsp<input class="showH" name="showH" type="checkbox" checked="checked"></li>';
                    $('div.active>.ui-jqgrid').eq(ind).find('.floatColShow').append(lihtml);
                }
            });
            //按照表格高度调整ul absolute位置
            if (ids.length > 1) {
                $('.floatColShow').css({'top': '110px'})
            } else {
                $('.floatColShow').css({'top': '60px'})
            }
            //滑动隐藏
            $divtitle.on('mouseover', function () {
                arr = [];
                $(this).parents('.ui-jqgrid').find('.floatColShow').show();
                // 悬浮框显示/隐藏列
                var th = $(this).parents('.ui-jqgrid').find('.ui-th-ltr');
                for (var i = 3; i < th.length; i++) {
                    var val = $(th).eq(i).attr('id').split('_')[1];
                    arr.push(val);
                }
                $(this).parents('.ui-jqgrid').find('.floatColShow').find('.showH').each(function (a, aitem) {
                    var this_ = this;
                    $(ids).each(function (b, bitem) {
                        $(this_).on('click', function () {
                            var tableId = $(this).parents('.ui-jqgrid').attr('id').split('_')[1];
                            if (statuName == undefined) {
                                if (this.checked == true) {
                                    $("#" + tableId).jqGrid('showCol', arr[a]).setGridWidth($('#' + ids[b]).parents('div.active').width());
                                    //初始化修改所有表格宽度
                                } else {
                                    $("#" + tableId).jqGrid('hideCol', arr[a]).setGridWidth($('#' + ids[b]).parents('div.active').width());

                                }
                            } else {
                                if (this.checked == true) {
                                    $("#" + statuName).jqGrid('showCol', arr[a]).setGridWidth($("#" + statuName).parents('div.active').width());
                                } else {
                                    $("#" + statuName).jqGrid('hideCol', arr[a]).setGridWidth($("#" + statuName).parents('div.active').width());
                                }
                            }
                        });
                    });
                });
            });
            $('.floatColShow').on('mouseleave', function () {
                $(this).parents('.ui-jqgrid').find('.floatColShow').hide();
                arr = [];
            });
            $('div.active>.ui-jqgrid').on('mouseleave', function () {
                $('.floatColShow').parents('.ui-jqgrid').find('.floatColShow').hide();
            });
        },
        //保存
        saveTable: function (id) {
            temp = [];
            var arrAll = '', arrfjc = '';
            var contentArr = [], allObj = {};
            /**_____测试假数据保存*/
            if (id.length === 1) {
                arrAll = $('#' + id).jqGrid('getRowData');
            } else if (id.length > 1) {
                for (var i = 0; i < id.length; i++) {
                    arrfjc = $('#' + id[i]).jqGrid('getRowData');
                    for (var j = 0; j < arrfjc.length; j++) {
                        contentArr.push(arrfjc[j])
                    }

                }
                arrAll = contentArr;
            }
            return arrAll
        },
        /**图表页面方法*/
        invMChartInit: function () {
            require(['/js/plugins/echarts/js/echarts.js'], function (echarts) {
                var dom = document.getElementById('container');
                var param = Mom.getUrlParam('code');
                var statuName = Mom.getUrlParam('typeName');
                var myChart = echarts.init(dom);
                var optionLine = null;
                var data = {
                    code: param,
                    type: 2
                };
                var urlArr = ['/ManageProcessMtrl/processMtrlTrendMap', '/ManageMtrl/mtrlTrendMap', '/ManageQuota/quotaTrendMap', '/ManageYield/YieldTrendMap'];
                var index;
                if (statuName == 'JCWLHS') {
                    index = 1;
                } else if (statuName == 'GCWLHS') {
                    index = 0;
                } else if (statuName == 'CLHS') {
                    index = 3;
                } else {
                    index = 2;
                }
                Api.ajaxForm(Api.aps + '/api/aps' + urlArr[index], data, function (result) {
                    optionLine = {
                        tooltip: {
                            trigger: 'axis'
                        },
                        grid: {
                            width: '80%',
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        toolbox: {
                            feature: {
                                saveAsImage: {}
                            }
                        },
                        title: {
                            text: result.title
                        },
                        legend: {
                            right: 40,
                            top: 150,
                            orient: result.legend.orient,//横竖显示图头标示
                            data: result.legend.data
                        },
                        xAxis: result.xAxis,
                        yAxis: {
                            type: result.yAxis.type,
                            max: result.yAxis.max,
                            min: 0,
                            interval: result.yAxis.interval
                        },
                        series: result.series
                    };
                    if (optionLine && typeof optionLine === "object") {
                        myChart.setOption(optionLine, true);
                    }

                })

            });
        }
    };
    $(function () {
        //参数配置列表
        if ($('#invManagement').length > 0) {
            PageModule.invMListInit()
        }
        //盘存核算切换页
        else if ($('#invDataComputation').length > 0) {
            PageModule.invDataComInit()
        }
        //盘存核算图表页
        else if ($('#invManaChart').length > 0) {
            PageModule.invMChartInit()
        }
    });
});
