require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);
    Mom.include('my1_js','/js/plugins/',[
        'websocket/sockjs.min.js',
        "websocket/stomp.min.js"
    ]);
    var PageModule = {
        listInit: function(){
            $('#helpBtn').click(function () {
                layer.closeAll();
                layer.open({
                    title:'帮助',
                    type:2,
                    area:['176px','400px'],
                    maxmin: false,
                    content:'./opeSLIHelp.html',
                    shade: false,
                    offset:'r'
                })
            });
            renderclass();//写入班信息
            var cz = {
                "bigKind": "DD"
            };
            Api.ajaxJson(Api.aps+'/api/ctrl/ShiftMain/form/DD', JSON.stringify(cz), function (result) {
                if (result.success == true) {
                    renderleft(result);//判断有没有数据 没有数据自动创建textarea
                    btnonclick(result);
                    renderTableData(result);
                    $('.giveworker').text(result.lastShiftMain.overUserName);
                    $('.shiftworker').text(result.lastShiftMain.reciveUserName);
                    if (result.shiftMain.overStatus == "0") {  //交班情况
                        $('.apsType-box').append('<input type="button" class="giveWork btn btn-white" value="交班">');
                        $('.apsType-box').append('<input type="button" class="save_btn btn btn-white" value="保存">');
                        $('.btn-getTime').unbind('click').click(function(){
                            var str = getNowFormatDate('all');
                            var textVal = $('#SCYXQK textarea').val()==''?'':$('#SCYXQK textarea').val()+'\n';
                            $('#SCYXQK textarea').val(textVal+str+'\n').focus();
                        });
                        if($('#SCYXQK textarea').val()==''){
                            $('.btn-getTime').trigger('click');
                        }
                    } else if (result.lastShiftMain.reciveStatus == "0") { //接班情况
                        $('.btnaddr, .btnremove').addClass('hidden');
                        $('.btn-getTime').addClass('hidden');
                        $('textarea').attr('readonly','readonly');
                        $('.apsType-box').append('<input type="button"  class="joinWork btn bg-ffa82d" value="接班" >');

                    }else{ //非交班&接班情况
                        $('.btnaddr, .btnremove').addClass('hidden');
                        $('.btn-getTime').addClass('hidden');
                        $('textarea').attr('readonly','readonly');
                        $('.giveworker').text(result.shiftMain.overUserName);
                        $('.shiftworker').text(result.shiftMain.reciveUserName);
                    }
                } else {
                    renderleft(result);
                    renderTableData(result);
                    Mom.layMsg(result.message);
                    getNowFormatDate('dayEnd');
                    $('textarea').attr('readonly','readonly');
                    $('.btnaddr, .btnremove').addClass('hidden');
                    $('.btn-getTime').addClass('hidden');
                }
            });

            /*判断有没有数据 没有数据自动创建textarea*/
            function renderleft(data) {
                var ShiftMainMap = data.ShiftMainMap;
                var keyArr = ["SCYXQK", "ZBQK", "SBYXQK", "AQFM", "GQJSFWH", "WSQK", "LSGZAP"];
                var defaultArr=["","正常","","1、上下楼梯扶好扶手 2、防火、防盗、防冻、防滑","工具完好","卫生良好",""];
                if (data.ShiftMainMap == null) {
                    for (var i = 0; i < keyArr.length; i++) {
                        renderTextarea(keyArr[i],defaultArr[i]);
                    }
                    btnonclick();
                } else {
                    NewNodeRow(keyArr, ShiftMainMap,defaultArr);
                }
            }

            /*有数据的时候渲染到textarea里*/
            function NewNodeRow(keyArr, ShiftMainMap,defaultArr) {
                for (var i = 0; i < keyArr.length; i++) {
                    var shiftLogList = ShiftMainMap[keyArr[i]];
                    if (shiftLogList == null) {
                        renderTextarea(keyArr[i],defaultArr[i]);

                    } else {
                        for (var j = 0; j < shiftLogList.length; j++) {
                            renderTextarea(keyArr[i],shiftLogList[j].content);
                        }
                    }
                }
            }
            //动态创建textarea
            function renderTextarea(keyArrInd,textareaVal){
                var str = "<div class='newbox'>" +
                    "<i class='smallimg'></i>" +
                    "<textarea name='safe'>"+textareaVal+"</textarea>";
                if(keyArrInd != 'SCYXQK'){
                    str += "<input type='button' class='btn bg-1ab394 btnaddr' value='+'>" +
                        "<input class='btn btnremove' value='-'>";
                }
                str+="</div>";
                $('#' + keyArrInd).append(str);
            }

            /*所有按钮操作*/
            function btnonclick(result) {
                /*取消隐藏按钮*/
                $('.ibox-content').on('click', '.checkupclass', function () {
                    if(!$(this).hasClass('on')){ //展开状态
                        $(this).addClass('on').find('span').text('隐藏上一班');
                        $('.lefttimeline').animate({width:'60%'},500);
                        $('.tablecontent').fadeIn(500);
                    }else{ //收缩状态
                        $(this).removeClass('on').find('span').text('显示上一班');
                        $('.lefttimeline').animate({width:'100%'},500);
                        $('.tablecontent').fadeOut(500);
                    }

                });
                /*加减按钮*/
                $('.parentbox').on('click', '.btnaddr', function () {
                    var str = "<div class='newbox active'>" +
                        "<i class='smallimg'></i>" +
                        "<textarea name='safe'></textarea>" +
                        "<input type='button' class='btn bg-1ab394 btnaddr' value='+'>" +
                        "<input class='btn btnremove' value='-'>" +
                        "</div>";
                    $(this).parents('.parentbox').find('.newbox').removeClass('active').find('textarea').blur();
                    $(this).parents('.newbox').after(str).next().find('textarea').focus();

                });
                $('.parentbox').on('click', '.btnremove', function () {
                    var len = $(this).parents('.parentbox').find('textarea').length;
                    if(len<=1){
                        top.layer.alert("至少填写一条");
                    }else{
                        $(this).parents('.newbox').remove();
                    }
                });
                $('.lefttimeline').on('focus','textarea',function(){
                    $(this).parents('.lefttimeline').find('.newbox').removeClass('active');
                    $(this).parent('.newbox').addClass('active');
                });


                /*_______________交班*/
                var keyArr = ["SCYXQK", "ZBQK", "SBYXQK", "AQFM", "GQJSFWH", "WSQK", "LSGZAP"];

                $('.apsType-box').on('click', '.giveWork', function () {
                    if(banName==result.shiftMain.groupName&&banId==result.shiftMain.shift.id){
                        top.layer.confirm('是否确定交班',{
                                btn:['确定', '取消'],
                                icon: 3},function () {
                                var data = {
                                    bigKind: "DD",
                                    shiftId: result.shiftMain.shift.id,
                                    shiftMainId: result.shiftMain.id,
                                    overStatus: "1",
                                    groupName: result.shiftMain.groupName,
                                    shiftDate: result.shiftMain.shiftDate

                                };
                                $("#reciveStatus").val("1");
                                for (var i = 0; i < keyArr.length; i++) {
                                    data[keyArr[i] + "_dataArr"] = JSON.stringify(getItemArrJson($('#' + keyArr[i]), keyArr[i], result));
                                }
                                Api.ajaxForm(Api.aps+'/api/ctrl/ShiftMain/over', data, function (result) {
                                    if(result.success){
                                        top.layer.closeAll();
                                        window.location.reload()
                                    }else{
                                        Mom.layMsg(result.massage)
                                    }
                                });
                            }
                        )
                    }else{
                        Mom.layAlert('用户信息不匹配')
                    }


                });
                $('.apsType-box').on('click', '.save_btn', function () {
                    if(banName==result.shiftMain.groupName&&banId==result.shiftMain.shift.id){
                        top.layer.confirm('是否确定保存',{
                                btn:['确定', '取消'],
                                icon: 3},function () {
                                var data = {
                                    bigKind: "DD",
                                    shiftId: result.shiftMain.shift.id,
                                    shiftMainId: result.shiftMain.id,
                                    overStatus: "0",
                                    groupName: result.shiftMain.groupName,
                                    shiftDate: result.shiftMain.shiftDate

                                };
                                $("#reciveStatus").val("1");
                                for (var i = 0; i < keyArr.length; i++) {
                                    data[keyArr[i] + "_dataArr"] = JSON.stringify(getItemArrJson($('#' + keyArr[i]), keyArr[i], result));
                                }
                                Api.ajaxForm(Api.aps+'/api/ctrl/ShiftMain/over', data, function (result) {
                                    if(result.success){
                                        top.layer.closeAll();
                                        window.location.reload()
                                    }else{
                                        Mom.layMsg(result.massage)
                                    }
                                });
                            }
                        )
                    }else{
                        Mom.layAlert('用户信息不匹配')
                    }


                });
                /*_____________________接班*/
                $('.apsType-box').on('click', '.joinWork', function () {
                    if(banName==result.shiftMain.groupName&&banId==result.shiftMain.shift.id){
                        top.layer.confirm('是否确定接班',{
                                btn:['确定', '取消'],
                                icon: 3},function () {
                                var data = {
                                    bigKind: "DD",
                                    reciveStatus: "1",
                                    lastShiftMainId: result.lastShiftMain.id
                                };
                                for (var i = 0; i < keyArr.length; i++) {
                                    data[keyArr[i] + "_dataArr"] = JSON.stringify(getItemArrJson1($('#' + keyArr[i]), keyArr[i], result));
                                }
                                Api.ajaxForm(Api.aps+'/api/ctrl/ShiftMain/recive', data, function (result) {
                                    if(result.success){
                                        top.layer.closeAll();
                                        window.location.reload()
                                    }else{
                                        Mom.layMsg(result.massage)
                                    }
                                });
                            }
                        )
                    }else{
                        Mom.layAlert('用户信息不匹配')
                    }
                });
            }

            //___________________写入班信息
            function renderclass() {
                $('.date').html(getNowFormatDate('dayEnd'));
                var data = {};
                Api.ajaxForm(Api.aps+'/api/ctrl/DirectiveIssued/goupList', data, function (data) {
                    if(data.rows.length!==0) {
                        var groupName = data.rows[0].name;
                        var shiftName = data.rows[0].shift.name;
                        var startTime = data.rows[0].shift.startTime;
                        var endTime = data.rows[0].shift.endTime;
                        $('.groupName').text(groupName+'班');//班组
                        $('.shiftName').text(shiftName+"("+startTime + "-" + endTime+")");//班次
                    }
                    banName=data.rows[0].name;
                    banId=data.rows[0].shift.id;
                });
            }
            /*用于交班*/
            function getItemArrJson(obj, keyArr, result) {
                var jsonArr = new Array();
                $(obj).find('textarea').each(function (i, r) {
                    jsonArr.push({
                        middleKing: keyArr,
                        main: {"id": result.shiftMain.id},
                        content: $(r).val()
                    });
                });
                return jsonArr;
            }
            /*接班*/
            function getItemArrJson1(obj, keyArr, result) {
                var jsonArr = new Array();
                $(obj).find('textarea').each(function (i, r) {
                    jsonArr.push({
                        middleKing: keyArr,
                        main: {"id": result.lastShiftMain.id},
                        content: $(r).val()
                    });
                });
                return jsonArr;
            }
            //获得当前日期
            function getNowFormatDate(timeEnd) {
                var date = new Date();
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var strDate = date.getDate();
                var hour=date.getHours();       //获取当前小时数(0-23)
                var minutes=date.getMinutes();
                function p(s) {
                    return s < 10 ? '0' + s: s;
                }
                var currentdate =year+'-'+p(month)+"-"+p(strDate);
                if(timeEnd == 'all'){
                    currentdate += "  "+p(hour)+':'+p(minutes);
                }
                return currentdate;
            }
            /*渲染隐藏表*/
            function renderTableData(data) {
                var keyArr = ["SCYXQK", "ZBQK", "SBYXQK", "AQFM", "GQJSFWH", "WSQK", "LSGZAP"];
                var arr = ['生产运行情况', '指标情况', '设备运营情况', '安全方面', '工器具是否完好', '卫生情况', '临时工作安排'];
                for (var i = 0; i < keyArr.length; i++) {
                    var html = '<table title="岗位记事" class="table table-striped table-bordered table-hover table-condensed dataTables-example dataTable ' + keyArr[i] + '">' +
                        '<thead>' +
                        '<tr>' +
                        '<th style="text-align: left;font-weight:300; background-color: #F5F5F5 !important;color: #000000">'
                        + arr[i] + '</th>' +
                        '</tr>' +
                        '</thead>' +
                        '<tbody class="' + keyArr[i] + '">' +
                        '</tbody>' +
                        '</table>';
                    if (data.success==false) {
                        $('.tablecontent').append(html);
                    }else{
                        if(JSON.stringify(data.lastShiftMainMap)!= '{}'){
                            $('.tablecontent').append(html);
                            var lastShiftMainMap = data.lastShiftMainMap[keyArr[i]];
                            for (var j =0; j < lastShiftMainMap.length;j++) {
                                var thtml =
                                    '<tr>' +
                                    '<td style="text-align: left;background-color: transparent">' + lastShiftMainMap[j].content + '</td>' +
                                    '</tr>';
                                $('tbody.' + keyArr[i]).append(thtml);
                            }
                        }else{
                            $('.tablecontent').append(html);
                        }
                    }
                }
            }

        },
        //交接班日志帮助
        RZHelp: function(){
            function ulClick() {
                renderli(Api.admin+'/api/sys/SysDict/type/jjb_helb_symbol','.symbols');
                renderli(Api.admin+'/api/sys/SysDict/type/jjb_helb_unit','.units');
                $('label').each(function () {
                    $(this).on('click',function () {
                        if($(this).find('i.fa-caret-down').length>0){
                            $(this).find('i').removeClass('fa-caret-down').addClass('fa-caret-right');
                        }else if($(this).find('i.fa-caret-right').length>0){
                            $(this).find('i').removeClass('fa-caret-right').addClass('fa-caret-down');
                        }
                        $(this).parents('ul').find('li').each(function () {
                            $(this).toggle();
                        })
                    })
                })
            }
            ulClick();
            //数据字典请求数据渲染li
            function renderli(url,ul) {
                Api.ajaxJson(url,{},function (result) {
                    var data=result.rows;

                    $(data).each(function () {
                        var str='<li>'+this.label+'<li>';
                        $(ul).append(str);
                    })

                })
            }
        },

    };

    $(function(){
        //调度交接班日志
        if($('#disShiftLogIndex').length > 0){
            PageModule.listInit();
        }
        //交接班日志帮助
        else if($('#opeSLIHelp').length > 0){
            PageModule.RZHelp();
        }

    });
});