require(['/js/zlib/app.js', ''], function (App) {

    var PageModule = {
        init: function () {
            // 引入插件
            require(['Page'], function () {
                require(['datetimepicker'], function () {

                    //时间选择插件
                    $("#startDate,#endDate").val("").datetimepicker({
                        bootcssVer: 3,          //显示箭头，部分如不显示箭头要加这个
                        format: "yyyy-mm-dd",  //保留到日
                        showMeridian: true,     //显示上、下午
                        language: "zh-CN",   //中文显示
                        minView: "4",    //月视图
                        autoclose: true,  //选择时间后自动隐藏
                        clearBtn: true,
                        todayBtn: true
                    });
                    //判断日期大小
                    $("#endDate,#startDate").on('change', function () {
                        if ($('#endDate').val() < $('#startDate').val() && $('#endDate').val() != '') {
                            Mom.layMsg('结束时间应大于起始时间，请重新选择');
                            $('#endDate').val('')
                        }
                    });
                });
                window.pageLoad = function () {
                    var data = {
                        oreNameParam: $("#oreName").val(),
                        startDate: $("#startDate").val(),
                        createDate2: $("#endDate").val(),
                        heap: $("#heap").val(),
                        status: $("#status ").val()
                    };
                    //修改默认每页显示条数
                    new Page().init(Api.aps + "/api/ob/OreBlendingCase/page", data, true, function (result) {
                        PageModule.createTable(result);
                    });
                    //查询
                    $("#search-btn").unbind("click").on("click", function () {
                        pageLoad();
                    });
                };
                pageLoad()
            });

        },
        createTable: function (tableDate) {
            $("#treeTable").dataTable({
                "data": tableDate,
                "aoColumns": [
                    {
                        "data": "id", "defaultContent": "", 'sClass': "autoWidth center",
                        "render": function (data, type, row, meta) {
                            return data = "<input type='checkbox' id=" + row.id + "  class='i-checks'>"
                        }
                    },
                    {"data": "oreName", 'sClass': "center "},
                    {"data": "heapNum", 'sClass': "center "},
                    {"data": "heap", 'sClass': "center"},
                    {
                        "data": "null", 'sClass': "center status",
                        "render": function (data, type, row, meta) {
                            var html = "";
                            var classSet = "";
                            if (row.status == "1") {
                                html = "已封存";
                                classSet = "Sequestration";
                            } else {
                                html = "配矿中";
                                classSet = "distribution";
                            }
                            return "<span class="+classSet+">"+html+"</span>";
                        }
                    },
                    {"data": "createDate", 'sClass': "center"},
                    {"data": "createUser", 'sClass': "center"},
                    {
                        "data": "sio2Value", 'sClass': "center",
                        "render": function (data, type, row, meta) {
                            var html = "<a class='btn  btn-info btn-check' ><i class='fa fa-search-plus'></i>查看</a >" +
                                "<a class='btn btn-Ledger btn-allotApp'><i class='fa fa fa-newspaper-o'></i>台账</a >";
                            return html;
                        }
                    }
                ],
            });
            renderIChecks();
            //台账按钮
            $(".btn-Ledger").unbind('click').on("click", function () {
                var id = $(this).parents('tr').find('input:checkbox').attr('id');
                var name = $(this).parents('tr').find('td:nth-of-type(2)').text();
                var datetime = $(this).parents('tr').find('td:nth-of-type(6)').text();
                window.location.href = '../oreDistribution/Ledger.html?caseId=' + id + '&caseName=' + escape(name) + '&dateTime=' + datetime;
            });
            //查看按钮
            $(".btn-check").unbind('click').on('click', function () {
                var id = $(this).parents('tr').find('input:checkbox').attr('id')
                Bus.openDialog('查看配矿方案', 'oreDistribution/checkprogramme.html?caseId=' + id, '800px', '600px');
            });
            //封存按钮
            $("#Sequestration").unbind('click').on("click", function () {
                var arr = [];
                var str = "";
                var trLength = $("#datainner tr");
                for (var i = 0; i < trLength.length; i++) {
                    if ($(trLength[i]).find("input.i-checks:checkbox").is(":checked")) {
                        arr.push($(trLength[i]).find(".status").text());
                        str += "," + $(trLength[i]).find("input.i-checks:checkbox").attr("id");
                    }
                }
                ;
                if (str.length > 0) {
                    for (var j = 0; j < arr.length; j++) {
                        if (arr[j] == "已封存") {
                            Mom.layMsg("当前选择已封存");
                            return;
                        } else {
                            var data = {
                                ids: str.substr(1)
                            };
                            //
                            Api.ajaxForm(Api.aps + "/api/ob/OreBlendingCase/updateStatus", data, function (result) {
                                if (result.success) {
                                    PageModule.init();
                                } else {
                                    Mom.layMsg(result.message);
                                }
                            })
                            return;
                        }
                    }
                } else {
                    Mom.layMsg("请选择至少一条数据！");
                }
            });
            //删除按钮
            $("#delete-btn").unbind('click').on("click", function () {
                top.layer.confirm('请您确认是否要删除勾选数据', {icon: 3, title: '系统提示'}, function (index) {
                    var bol = false;
                    var str = ''  //用于拼接str
                    $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                        if ($(this).is(":checked")) {
                            var id = $(this).attr('id');

                            if (id == undefined) {
                                $(this).parent().parent().parent().remove();
                                    bol = true;
                            } else {
                                str += "," + $(this).attr("id");
                                bol = true;
                            }
                        }
                    });
                    if (bol) {
                        if (str.length > 0) {
                                var data = {
                                    ids: str.substr(1)
                                };
                                var url = Api.aps + '/api/ob/OreBlendingCase/delete';
                                Api.ajaxForm(url, data, function (result) {
                                    if (result.success) {
                                        $('tbody tr td input.i-checks:checkbox').each(function (index, item) {
                                            if (true == $(this).is(':checked')) {
                                                $(this).parent().parent().parent().remove();
                                            }
                                        });
                                        Mom.layMsg('删除成功！');
                                    } else {
                                        Mom.layMsg(result.message);
                                    }
                                })
                        }
                    } else {
                        Mom.layMsg("请选择至少一条数据！");
                        return;
                    }
                    top.layer.close(index);
                });

            });
            //创建方案
            $("#add-btn").unbind('click').on("click", function () {
                var id = $(this).parents('tr').find('input:checkbox').attr('id');
                var name = $(this).parents('tr').find('td:nth-of-type(3)').text();
                window.location.href = '../oreDistribution/createdistribution.html?caseId=' + id + '&name=' + escape(name);
            });
            //重置按钮
            $("#refresh-btn").unbind('click').on("click", function () {
                $('#startDate,#endDate,#oreName,#heap,#status').val('');
                $('#search-btn').trigger('click');
            });
        }
    };
    $(function () {
        PageModule.init();
    });

});

