require(['/js/zlib/app.js'], function(App) {
    require(['treeTable'],function() {
        var PageModule = {
            init: function () {
                window.pageLoad = function () {
                    Api.ajaxForm(Api.aps + "/api/ctrl/DirectiveIssued/goupList", {}, function (result) {
                        if (result.rows.length !== 0) {
                            var groupName = result.rows[0].name;
                            var shiftName = result.rows[0].shift.name;
                            var startTime = result.rows[0].shift.startTime;
                            var endTime = result.rows[0].shift.endTime;
                            $(".date").empty().html(Mom.shortDate);
                            $('.groupName').text(groupName + '班');//班组
                            $('.updateDate').text(shiftName + "(" + startTime + "-" + endTime + ")");//班次
                        }
                    });
                    Api.ajaxForm(Api.aps + "/api/ctrl/DirectiveDetail/getReceiveDirective", {}, function (result) {
                        if (result.success) {
                            PageModule.createTable(result.rows)
                        }

                    })
                };
                window.pageLoad()
            },
            createTable: function (dataTable) {
                var statusStr;   //状态
                var statusColor;  //状态颜色
                var statusBtn;   //完成指令按钮
                var tableStr = "";   //table
                var updataDatastr = ""; //执行时间
                for (var i = 0; i < dataTable.length; i++) {
                    if (dataTable[i].status == "wait") {
                        statusStr = "待完成";
                        statusColor = "col-ffa82d";
                        statusBtn = "<a class='btn-finish'><i class='fa fa-check-circle'></i>" + "执行完成" + "</a>"
                    } else   if (dataTable[i].status == "finish"){
                        statusStr = "已完成";
                        statusColor = "col-1ab394";
                        statusBtn = '';
                        //statusBtn = "<a class='btn-success'><i class='fa fa-check-circle'></i>" + "已完成" + "</a>"

                    }else if(dataTable[i].status == ""){
                        statusColor="setStyle"
                    };
                    if(dataTable[i].updateDate == null){
                        dataTable[i].updateDate = "";
                    }
                    if(dataTable[i].createDate == null){
                        dataTable[i].createDate = "";
                    }
                    var statusstr = "<span class='" + statusColor + "'>" + statusStr + "</span>";
                    var count = 'data-tt-id=' + dataTable[i].id;
                    if (dataTable[i].parentId && dataTable[i].parentId != '') {
                        count += ' data-tt-parent-id=' + dataTable[i].parentId;
                    };
                    tableStr+="<tr class='' " + count + ">" +
                        "<td id='" + dataTable[i].ctrlId + "'>" + dataTable[i].content + "</td>" +
                        "<td>" + dataTable[i].proc + "</td>" +
                        "<td class='center'>" + statusstr + "</td>" +
                        "<td class='center'>" + dataTable[i].createDate + "</td>" +//下达时间
                        "<td class='center'>" + dataTable[i].issuedUser + "</td>" +//下达人
                        "<td class='center'>" + dataTable[i].updateDate + "</td>" +   //执行时间
                        "<td class='center'>" + dataTable[i].execUser + "</td>" +   //执行人
                        "<td class='center'>" + statusBtn + "</td>"+
                    "</tr>"
                };
                if (tableStr.length == 0) {
                    var len = $("#treeTable thead tr").children("th").length;
                    tableStr = "<tr style='text-align: center'><td colspan='" + len + "'><font color='#cd0a0a'>暂无记录</font></td></tr>";
                }
                $('#treeTableBody').html(tableStr);
                $("#treeTable").treetable({expandable: true, column:0}, true);

                $(".btn-finish").click(function () {
                    var data = {
                        ids:$(this).parent().parent().find('td').first().attr("id")
                    };
                    Api.ajaxForm(Api.aps + "/api/ctrl/DirectiveIssued/directiveFinish", data ,function (result) {
                        if(result.success){
                            Mom.layMsg("执行成功");
                            Mom.refresh();
                        }else {
                            Mom.layMsg(result.message);
                        }
                    })
                })
            },
        };
        $(function () {
            if ($("#instructOperation").length > 0) {
                PageModule.init()
            }
        })
    })
});

