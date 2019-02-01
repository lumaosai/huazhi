require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        //列表页
        monthPlanListInit: function () {
            var $year, $month, $status;
            loadStatus();
            function getDataFn() {
                $year = $('.datePicker').val();
                $month = $("#getMonth").val();
                $status = $("#apsState").val();
            }

            window.pageLoad = function () {
                getDataFn();
                var arr_ = [
                    {selector: '#btn-add', code: 'PPMMPP_ADO'},  //新增
                    {selector: '.btn-delete', code: 'PPMMPP_DLO'}, //删除
                    {selector: '.btn-edit', code: 'PPMMPP_YMODO'}, //编辑
                    {selector: '.btn-review', code: 'PPMMPP_YTEO'}, //审核
                    {selector: '.btn-issue', code: 'PPMMPP_REO'}  //发布
                ];
                var data = {
                    adYear: $year,
                    adMonth: $month,
                    status: $status
                };
                require(['Page'], function () {
                    new Page().init(Api.aps + "/api/aps/ApsMonthAdjust/page", data, true, function(tableData, result) {
                        renderTableData(tableData);
                        Bus.permissionContorl('PPMMPP_PAC', arr_);  //根据用户权限显示对应的操作按钮
                        //审核
                        $(".btn-review").click(function () {
                            var attrArr = getAttr($(this));
                            location.href = "../producePlan/reviewPlans.html?id=" + attrArr.id + "&adYear=" + attrArr.year + "&adMonth=" + attrArr.month + "&status=" + attrArr.status;
                        });
                        //查看
                        $(".btn-check").click(function () {
                            var attrArr = getAttr($(this));
                            Bus.openDialog(attrArr.year + "年" + attrArr.month + "月计划", 'producePlan/proTargetPlan.html?id=' + attrArr.id + '&year=' + attrArr.year + '&month=' + attrArr.month, '1080px', '500px');
                        });
                        //删除
                        $(".btn-delete").click(function () {
                            var id = getAttr($(this)).id;
                            Bus.deleteItem('确定要删除该计划', Api.aps+'/api/aps/ApsMonthAdjust/delete', {ids:id});
                        });
                        //编辑
                        $(".btn-edit").click(function () {
                            var attrArr = getAttr($(this));
                            location.href = '../producePlan/proTargetPlanEdit.html?id=' + attrArr.id + '&year=' + escape(attrArr.year) + '&yearid=' + attrArr.yearId + '&month=' + escape(attrArr.month) + '&monthName=' + escape(attrArr.monthName) + '&yearname=' + escape(attrArr.yearName) + '&param=1';
                        });
                        //发布
                        $(".btn-issue").click(function () {
                            var attrArr = getAttr($(this));
                            var data = {
                                id: attrArr.id,
                                status: parseInt(attrArr.status) + 1
                            };
                            top.layer.confirm("确定要发布吗?", {icon: 3, title: '系统提示'}, function (index) {

                                Api.ajaxJson(Api.aps + "/api/aps/ApsMonthAdjust/update", JSON.stringify(data), function (result) {
                                    if (result.success) {
                                        window.pageLoad();
                                    }
                                });
                                top.layer.close(index);

                            });

                        });


                    });
                });
                function getAttr(obj) {
                    var $iChecks = obj.parents("tr").find('.i-checks');
                    var getAttrObj = {
                        "id": $iChecks.attr('data-id'),
                        "year": $iChecks.attr('data-year'),
                        "month": $iChecks.attr('data-month'),
                        "monthName": $iChecks.attr('data-name'),
                        "yearName": $iChecks.attr('data-yearname'),
                        "status": $iChecks.attr('data-status'),
                        "yearId": $iChecks.attr('data-yearId')

                    };
                    return getAttrObj;
                }
            };
            pageLoad();
            $("#btn-add").unbind('click').click(function () {
                location.href = "./proTargetPlanEdit.html";
            });

            //  渲染表内容
            function renderTableData(tableData) {
                $('#treeTable').dataTable({
                    "bSort": true,
                    "aoColumnDefs": [
                        {"bSortable": false, "aTargets": [0, 2, 4, 6]}
                    ],
                    "data": tableData,
                    "aoColumns": [
                        {"data": "yearName", 'sClass': "center "},
                        {
                            "data": name, "orderable": false, "defaultContent": "", 'sClass': " center ",
                            "render": function (data, type, row, meta) {
                                if (row.name == "") {
                                    return row.period + "计划";
                                } else {
                                    return row.name;
                                }
                            }
                        },
                        // {"data": "name",'sClass':"center "},
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
                                    // setText = "已审核";
                                } else if (row.status == "3") {
                                    // setText = "已发布";
                                    classSet = "col-62b5e9";
                                }
                                return "<span class='" + classSet + "'>" + row.statusShow + "</span >";
                            }
                        },
                        {
                            "data": null, "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                            "render": function (data, type, row, meta) {
                                var html = "";
                                if (row.status == "0" || row.status == "-1") {
                                    html = "<a class='btn btn-edit btn-compile'><i class='fa fa-edit'></i>编辑</a >" +
                                        "<a class='btn btn-delete'><i class='fa fa-trash'></i>删除</a >";
                                } else if (row.status == "1") {
                                    html = "<a class='btn btn-review' ><i class='fa fa-check'></i>审核</a >" +
                                        "<a class='btn btn-delete'><i class='fa fa-trash'></i>删除</a >";
                                } else if (row.status == "2") {
                                    html = "<a class='btn btn-issue'><i class='fa fa-check-circle'></i>发布</a >";
                                } else if (row.status == "3") {
                                    html = "";
                                }
                                return "<input type='hidden'  id=" + row.id + " data-type=" + row.tYPE + " data-id='" + row.id + "'data-yearid='" + row.yearId + "' data-year='" + row.adYear + "' data-month='" + row.adMonth + "' data-name='" + row.name + "' data-yearname='" + row.yearName + "' data-status='" + row.status + "' class='i-checks'>" +
                                    "<a class='btn btn-check btn-info' ><i class='fa fa-search-plus'></i>查看</a >" +
                                    html;

                            }
                        }

                    ]
                });
                // hidebutton();
            }

            //获取状态数据
            function loadStatus() {
                var url_ = Api.admin + '/api/sys/SysDict/type/monthPlanStatus';
                Api.ajaxJson(url_, {}, function (result) {
                    if (result.success) {
                        var rows = result.rows;
                        Bus.appendOptionsValue($('#apsState'), rows, 'value', 'label');
                    } else {
                        Mom.layMsg(result.message);
                    }
                });
            }

        },
        //审核
        reviewPlanInit: function () {
            var id = Mom.getUrlParam("id"),
                adYear = Mom.getUrlParam("adYear"),
                adMonth = Mom.getUrlParam("adMonth"),
                status = Mom.getUrlParam("status");
            //进到该页面之后请求数据、渲染数据
            Api.ajaxForm(Api.aps + "/api/aps/WorkFlow/view/" + id, {}, function (result) {
                if (result.success) {
                    console.log(result);
                    //渲染数据
                    //流程图
                    var workFlowUser = result.workFlowUser, //流程发起人
                        workFlowNode = result.workFlowNode, //当前节点
                        workFlowNodeList = result.workFlowNodeList; //审批流程节点
                    $(".appUser").html(workFlowUser.userName);  //申请人
                    $(".appTime").html(workFlowUser.createDate);  //申请时间
                    $(".currentApp").html(workFlowNode.userName).attr("data-id", workFlowNode.id); //当前流程节点标识
                    function htmlFragFn(reviewName) {
                        var htmlFrag = "<div class='flow-item'>" +
                            " <cite class='flow-item-icon flow-icon1'></cite>" +
                            "<span class='flow-item-user'>" + reviewName + "</span>"
                            + "</div>";
                        return htmlFrag;
                    }

                    var htmlFrag = htmlFragFn(workFlowUser.userName);
                    $(workFlowNodeList).each(function (index, item) {
                        var reviewName = item.userName;  //审批人名称
                        htmlFrag += htmlFragFn(reviewName);
                    });
                    $(".flow-process").append(htmlFrag);

                    /* 是否显示审核按钮*/
                    var loginUserId = Mom.getCookie("loginUserid");
                    if(loginUserId == workFlowNode.assigneeValue){
                        $(".btn-sub").css( "display","inline-block");
                    }
                }

                //审批过程
                var htmlReview = "",
                    reviewLIst = result.logList;
                $(reviewLIst).each(function (index, item) {
                    var reviewType = item.oper === "提交" ? "1" : item.oper === "通过" ? "3" : "4",
                        reviewDes = reviewType == "4" ? "flow-disagree" : "flow-agree";
                    htmlReview += "<div class='flow-item'>" +
                        " <cite class='flow-item-icon flow-icon" + reviewType + "'></cite>" +
                        "<span class='flow-item-user'>" + item.userName + "</span>" + "" +
                        "<span class='flow-item-time'>" + item.createDate + "</span>" +
                        "<span class='" + reviewDes + "'>" + item.opinion + "</span>" +
                        "</div>";

                });
                $(".flow-list").empty().html(htmlReview);
            });

            selfrun();
            function selfrun() {
                $("#monthStatus").val(status);
                var tabBox = $(".tab-box"),
                    tabTit = tabBox.find(".tab-tit").children();
                tabTit.click(function () {
                    var ind = $(this).index();
                    var $thisParent = $(this).parent().hasClass('review-box');
                    if ($thisParent == true && ind !== 0) {
                        $('#btnSub').hide();
                    } else {
                        $('#btnSub').show();
                    }
                    $(this).addClass('active').siblings().removeClass('active');
                    $(this).parent().siblings().children().eq(ind).addClass('active').siblings().removeClass('active');
                    if ($(this).text() == "表单信息") {
                        $targetPlanTabNavLi.eq(0).trigger('click');
                    }
                });
                $(".back-btn").click(function () {
                    top.TabsNav.refreshActiveTab();
                });
                $("#btnSub").click(function () { //审核事件
                    var appRadioVal = $(".app-radio input[type='radio']:checked").val(),
                        appTextval = $.trim($(".app-view textarea").val());
                    if (appTextval == "") {
                        Mom.layAlert("请填写审批意见!");
                    } else {
                        var data = {
                            dataId: id,
                            nodeId: $(".currentApp").attr('data-id'),
                            oper: appRadioVal,
                            opinion: appTextval
                        };
                        Api.ajaxJson(Api.aps + "/api/aps/WorkFlow/approval", JSON.stringify(data), function (result) {
                            if (result.success) {
                                Mom.layMsg("审核成功！", {icon: 1, time: 500});
                                setTimeout(function () {
                                    tabsNav.refreshActiveTab();
                                }, 600);

                            }
                        });
                    }
                });

                $('.targetPlanTit span').empty().html(adYear + "年" + adMonth + "月");
                var tabconUrl = [
                    "./proTechTarget.html?year=" + adYear + "&month=" + adMonth + "&id=" + id,
                    "./proCommercePurPlan.html?year=" + adYear + "&month=" + adMonth + "&id=" + id,
                    "./proSafeEnviPlan.html?year=" + adYear + "&month=" + adMonth + "&id=" + id,
                    "./keyWorkPlanView.html?year=" + adYear + "&month=" + adMonth + "&id=" + id
                ];
                var $targetPlanTab = $(".targetPlanTab"),
                    $targetPlanTabNavLi = $targetPlanTab.find(".targetPlanTab-nav").find('li'),
                    $targetPlanCon = $("#iframeCon");
                $targetPlanTabNavLi.click(function () {
                    var ind = $(this).index();
                    $targetPlanCon.children("iframe").hide();
                    $(this).addClass('active').siblings("li").removeClass('active');
                    Mom.createTagFrame("iframeCon", tabconUrl[ind], "frameId" + ind);
                });
                // setFrameHeight();
            }
        },
        //查看
        proTargetPlanInit: function () {
            var id = Mom.getUrlParam('id');
            var year = Mom.getUrlParam('year'),
                month = Mom.getUrlParam('month');
            // $('.targetPlanTit span').empty().html(year+"年"+month+"月");
            $('.btn-export').click(function () {
                window.location.href = Api.aps + '/aps/PlanExport/monthPlanExport?id=' + id;
            });
            var tabconUrl = [
                "./proTechTarget.html?year=" + year + "&month=" + month + "&id=" + id,
                "./proCommercePurPlan.html?year=" + year + "&month=" + month + "&id=" + id,
                "./proSafeEnviPlan.html?year=" + year + "&month=" + month + "&id=" + id,
                "./KeyWorkPlanView.html?year=" + year + "&month=" + month + "&id=" + id
            ];
            var $targetPlanTab = $(".targetPlanTab"),
                $targetPlanTabNavLi = $targetPlanTab.find(".targetPlanTab-nav").find('li'),
                $targetPlanCon = $("#iframeCon");
            $targetPlanTabNavLi.click(function () {
                var ind = $(this).index();
                $targetPlanCon.children("iframe").hide();
                $(this).addClass('active').siblings("li").removeClass('active');
                Mom.createTagFrame("iframeCon", tabconUrl[ind], "frameId" + ind);
            });
            $targetPlanTabNavLi.eq(0).trigger('click');
            // setFrameHeight();
        },
        //修改
        proTargetPEInit: function () {
            //权限
            var id = Mom.getUrlParam('id') || "",
                year = Mom.getUrlParam('year') || "",
                month = Mom.getUrlParam('month') || "",// 月
                monthName = Mom.getUrlParam('monthName') || "",//月计划名字
                yearId = Mom.getUrlParam('yearid') || "",//获取年id
                ind = 0;
            var editarr = [];
            var code = "PPMMPP_PAC";
            var a = b = c = "";
            var d = 'Edit';
            $('#mainId').val(id);
//通过yearid 年id判断是编辑还是新增
            if (yearId === '') {   //新增获取年计划下拉
                Api.ajaxForm(Api.aps + '/api/aps/ApsMonthAdjust/yearPlanList', {}, function (result) {
                    if (result.success) {
                        var str = '';
                        result.rows.forEach(function (item, index) {
                            str += "<option value='" + item.id + "' adYear='" + item.adYear + "'>" + item.yearName + "</option>";
                        });
                        $('#yearPlan').append(str);
                    }
                });
                //判断选取的月计划时间是否已存在。
                function renderTit(idName) {
                    $('#monthName').val('');
                    if (year != "" && month != "") {
                        var data = JSON.stringify({
                            adYear: year,
                            adMonth: month,
                            monthName: monthName
                        });
                        Api.ajaxJson(Api.aps + "/api/aps/ApsMonthAdjust/form", data, function (result) {
                            if (result.success) {
                                var rowsLen = result.rows.length;
                                if (rowsLen > 0) {
                                    //根据取出的rows的长度判断数据是否已存在
                                    //获取存在的月计划进行渲染
                                    Mom.layAlert(year + "年" + month + "月数据已经存在，请重新选择！");
                                    month = "";

                                    $("#getMonth").val("");
                                    $('.targetPlanTit span').empty().html(year + "年");
                                } else {
                                    var nameVal = year + "年" + month + "月";
                                    $('.targetPlanTit span').empty().html(nameVal);
                                    $('#monthName').val(nameVal + '生产计划');
                                }
                                $('#iframeCon').children('iframe').remove();
                                initFrame(editarr);
                            }
                        });
                    }
                }

                // 改变管理者身份
                $("#getMonth,#yearPlan").change(function (e) {
                    var idName = $(this).attr("id"),
                        adYear = $(":selected", "#yearPlan").attr("adYear") || '',
                        thisVal = $(this).val();
                    $('#whichYear').val(adYear);
                    if (idName == "yearPlan") {
                        year = adYear;
                    } else if (idName == "getMonth") {
                        month = thisVal;
                    }
                    if (year == "" || month == "") {
                        if (year == "") {
                            var month_ = month == "" ? '' : month + "月";
                            $('.targetPlanTit span').empty().html(month_);
                        } else {
                            var year_ = year == "" ? '' : year + "年";
                            $('.targetPlanTit span').empty().html(year_);
                        }
                    } else {
                        $('.targetPlanTit span').empty().html(year + "年" + month + "月");
                    }
                    monthName = $('#monthName').val();
                    yearId = $("#yearPlan").val();
                    renderTit(idName);
                });
                // 按下空格键触发
                $('#monthName').keydown(function (e) {
                    if (event.keyCode == 13) {
                        var idName = $(this).attr("id"),
                            adYear = $(":selected", "#yearPlan").attr("adYear"),
                            thisVal = $(this).val();
                        if (idName == "yearPlan") {
                            year = adYear;
                        } else if (idName == "getMonth") {
                            month = thisVal;
                        }
                        monthName = $('#monthName').val()
                        renderTit(idName);
                    }
                });
                // 失去焦点触发事件
                $('#monthName').blur(function () {
                    var idName = $(this).attr("id"),
                        adYear = $(":selected", "#yearPlan").attr("adYear"),
                        thisVal = $(this).val();
                    if (idName == "yearPlan") {
                        year = adYear;
                    } else if (idName == "getMonth") {
                        month = thisVal;
                    }
                    monthName = $('#monthName').val()
                    // renderTit(idName);
                });
            } else {
                $('#yearPlan').attr('disabled', 'disabled').css({cursor: "not-allowed"});
                $('#getMonth').val(month).attr('disabled', 'disabled').css({"cursor": "not-allowed"});
                $('#monthName').val(monthName);
                $('.targetPlanTit span').empty().html(year + "年" + month + "月");
                //  获取年计划下拉
                Api.ajaxForm(Api.aps + '/api/aps/ApsMonthAdjust/yearPlanList', {}, function (result) {
                    if (result.success) {
                        var str = '';
                        result.rows.forEach(function (item, index) {
                            if (item.id === yearId) {
                                str += "<option selected='selected' value='" + item.id + "'adYear='" + item.adYear + "'>" + item.yearName + "</option>";
                                yearId = item.id;
                            } else {
                                str += "<option value='" + item.id + "'adYear='" + item.adYear + "'>" + item.yearName + "</option>";
                            }
                        });
                        $('#yearPlan').append(str);
                        var adYear = $(":selected", "#yearPlan").attr("adYear") || '';
                        $('#whichYear').val(adYear);
                    }
                });
            }
            //初始化权限
            permitControl();

            $(".back-btn").click(function () {
                top.TabsNav.refreshActiveTab();
            });

            //提交按钮
            $('#btnSub').click(function () {
                var iframe0 = document.getElementById('iframeCon').getElementsByTagName('iframe')[0];
                iframe0.contentWindow.submitFn();
            });


            function permitControl() {
                var btnArr = [
                    {selector: '#btn-adjust', code: 'PPMMPP_SDO'},   //调整按钮
                ];
                //设置按钮权限
                Bus.permissionContorl(code, btnArr);

                //Tab页权限
                var tabEditArr = [{code: 'PPMMPP_QCJSO'}, {code: 'PPMMPP_SWCGO'}, {code: 'PPMMPP_AHSO'}, {code: 'PPMMPP_ZDGZO'}];
                Bus.getPermission(code, tabEditArr, function (limitResult, rows) {
                    if (limitResult['PPMMPP_QCJSO'].permit) {
                        a = 'Edit';
                        $('.PPMMPP_QCJSO .btn-save').show();
                        $('#btnSub').removeClass('hidden').show();//提交
                    }
                    if (limitResult['PPMMPP_SWCGO'].permit) {
                        b = 'Edit';
                        $('.PPMMPP_SWCGO .btn-save').show();
                    }
                    if (limitResult['PPMMPP_AHSO'].permit) {
                        c = 'Edit';
                        $('.PPMMPP_AHSO .btn-save').show();
                    }
                    if (limitResult['PPMMPP_ZDGZO'].permit) {
                        d = 'Edit';
                        $('.PPMMPP_ZDGZO').children('button').show();
                    }
                    editarr.push(a, b, c, d);
                    initFrame(editarr);
                });
            }
            function initFrame(pArr) {
                var tabconUrl = [
                    "./proTechTarget" + pArr[0] + ".html?id=" + id + "&year=" + year + "&month=" + month + "&yearId=" + yearId + "&monthName=" + escape(name),
                    "./proCommercePurPlan" + pArr[1] + ".html?id=" + id + "&year=" + year + "&month=" + month + "&yearId=" + yearId + "&monthName=" + escape(name),
                    "./proSafeEnviPlan" + pArr[2] + ".html?id=" + id + "&year=" + year + "&month=" + month + "&yearId=" + yearId + "&monthName=" + escape(name),
                    "./KeyWorkPlan" + pArr[3] + ".html?id=" + id + "&year=" + year + "&month=" + month + "&yearId=" + yearId + "&monthName=" + escape(name)
                ];
                var $targetPlanTab = $(".targetPlanTab"),
                    $targetPlanTabNavLi = $targetPlanTab.find(".targetPlanTab-nav").find('li'),
                    $targetPlanCon = $("#iframeCon"); //显示的ifarem
                $targetPlanTabNavLi.unbind('click').click(function () {   //移除绑定的click事件然后再绑定事件
                    ind = $(this).index();
                    $targetPlanCon.children("iframe").hide();
                    $(this).addClass('active').siblings("li").removeClass('active');
                    Mom.createTagFrame("iframeCon", tabconUrl[ind], "frameId" + ind);
                    showIframeButtons(ind);

                });
                $targetPlanTabNavLi.eq(ind).trigger('click');
            }

            function showIframeButtons(ind) {
                //获取当前激活的iframe
                var iframeWin = $("#iframeCon iframe:visible")[0];
                $('#button-group').find('.button-item').css('display', 'none').eq(ind).css('display', 'inline-block');
                $('#btn-adjust').unbind('click').click(function () {
                    $('#btn-adjust', iframeWin.contentWindow.document).trigger('click');
                });
                $('.btn-save').unbind('click').click(function () {
                    $('.btn-save', iframeWin.contentWindow.document).trigger('click');
                });
                $('.btn-delete').unbind('click').click(function () {
                    $('.btn-delete', iframeWin.contentWindow.document).trigger('click');
                });
                $('.btn-add').unbind('click').click(function () {
                    $('.btn-add', iframeWin.contentWindow.document).trigger('click');
                });
            }
        }
    };

    $(function () {
        //列表
        if ($('#monthPlanList').length > 0) {
            PageModule.monthPlanListInit()
        }
        //审核
        else if ($('#reviewPlan').length > 0) {
            PageModule.reviewPlanInit()
        }
        //查看
        else if ($('#proTargetPlan').length > 0) {
            PageModule.proTargetPlanInit()
        }
        //编辑
        else if ($('#proTargetPlanEdit').length > 0) {
            PageModule.proTargetPEInit()

        }
    });
})
;