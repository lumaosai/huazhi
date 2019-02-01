require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        listInit: function(){
            renderclass();//写入班信息
            var cz={
                "bigKind":"CZ"
            };
            Api.ajaxJson(Api.aps+'/api/ctrl/ShiftMain/form/CZ',JSON.stringify(cz),function (result) {
                if(result.success==true){
                    renderleft(result);//判断有没有数据 没有数据自动创建textarea
                    btnonclick(result);//所有按钮操作
                    renderTableData(result);//渲染隐藏表
                    renderclass(result);//写入班信息
                    $('.giveworker').text(result.lastShiftMain.overUserName);
                    $('.shiftworker').text(result.lastShiftMain.reciveUserName);
                    if(result.shiftMain.overStatus=="0"){
                        $('.apsType-box').append('<input type="button" class="giveWork btn bg-1ab394" value="交班">');
                        $('.apsType-box').append('<input type="button" class="save_btn btn " value="保存">');
                    }else if(result.lastShiftMain.reciveStatus=="0"){
                        $('.btnaddr, .btnremove').addClass('hidden');
                        $('.giveworker').text(result.lastShiftMain.overUserName);
                        $('.shiftworker').text(result.lastShiftMain.reciveUserName);
                        $('textarea').attr('readonly','readonly');
                        $('.apsType-box').append('<input type="button"  class="joinWork btn bg-ffa82d" value="接班" >');

                    }else{
                        $('.btnaddr, .btnremove').addClass('hidden');
                        $('textarea').attr('readonly','readonly');
                    }
                }else{
                    renderleft(result);
                    Mom.layMsg(result.message);
                    $('textarea').attr('readonly','readonly');
                    $('.btnaddr, .btnremove').addClass('hidden');
                }
            });

            /*判断有没有数据 没有数据自动创建textarea*/
            function renderleft(data) {
                var ShiftMainMap = data.ShiftMainMap;
                var keyArr = ["AQ","SC","QT","JBJS"];
                if(data.ShiftMainMap==null){
                    for (var i=0;i<keyArr.length;i++) {
                        var str = "<div class='newbox'>" +
                            "<i class='smallimg'></i>" +
                            "<textarea name='safe'></textarea>" +
                            "<input type='button' class='btn bg-1ab394 btnaddr' value='+'>" +
                            "<input class='btn btnremove' value='-'>" +
                            "</div>";
                        $('#'+keyArr[i]+'').append(str);
                    }
                    btnonclick();
                }else{
                    NewNodeRow(keyArr,ShiftMainMap);
                }
            }
            /*有数据的时候渲染到textarea里*/
            function NewNodeRow(keyArr,ShiftMainMap) {
                for (var i=0;i<keyArr.length;i++) {
                    var shiftLogList = ShiftMainMap[keyArr[i]];
                    if(shiftLogList==null){
                        var _html = "<div class='newbox'>" +
                            "<i class='smallimg'></i>" +
                            "<textarea name='safe'></textarea>" +
                            "<input type='button' class='btn bg-1ab394 btnaddr' value='+'>" +
                            "<input class='btn btnremove' value='-'>" +
                            "</div>"
                        $("#" + keyArr[i]).append($(_html));

                    }else{
                        for (var j = 0; j < shiftLogList.length; j++) {
                            var _html = "<div class='newbox'>" +
                                "<i class='smallimg'></i>" +
                                "<textarea name='safe'>"+shiftLogList[j].content+"</textarea>" +
                                "<input type='button' class='btn bg-1ab394 btnaddr' value='+'>" +
                                "<input class='btn btnremove' value='-'>" +
                                "</div>"
                            $("#" + keyArr[i]).append($(_html));
                        }
                    }
                }
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
                $('.parentbox').on('click','.btnaddr',function () {
                    var str = "<div class='newbox active'>" +
                        "<i class='smallimg'></i>" +
                        "<textarea name='safe'></textarea>" +
                        "<input type='button' class='btn bg-1ab394 btnaddr' value='+'>" +
                        "<input class='btn btnremove' value='-'>" +
                        "</div>";
                    $(this).parents('.parentbox').find('.newbox').removeClass('active').find('textarea').blur();
                    $(this).parents('.newbox').after(str).next().find('textarea').focus();
                });
                $('.parentbox').on('click','.btnremove',function () {
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

                /*交班*/
                var keyArr = ["AQ","SC","QT","JBJS"];
                $('.apsType-box').on('click','.giveWork',function () {
                    if(banName==result.shiftMain.groupName&&banId==result.shiftMain.shift.id){
                        top.layer.confirm('是否确定交班',{
                                btn:['确定', '取消'],
                                icon: 3},function () {
                                var data={
                                    bigKind:"CZ",
                                    shiftId:result.shiftMain.shift.id,
                                    shiftMainId:result.shiftMain.id,
                                    overStatus:"1",
                                    groupName:result.shiftMain.groupName,
                                    shiftDate:result.shiftMain.shiftDate
                                };
                                $("#reciveStatus").val("1");
                                for (var i=0;i<keyArr.length;i++) {
                                    data[keyArr[i]+"_dataArr"] = JSON.stringify(getItemArrJson($('#'+keyArr[i]+''),keyArr[i],result));
                                }
                                Api.ajaxForm(Api.aps+'/api/ctrl/ShiftMain/over',data,function (result) {
                                    if(result.success){
                                        top.layer.closeAll();
                                        window.location.reload();
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
                                    bigKind: "CZ",
                                    shiftId: result.shiftMain.shift.id,
                                    shiftMainId: result.shiftMain.id,
                                    overStatus: "0",
                                    groupName: result.shiftMain.groupName,
                                    shiftDate: result.shiftMain.shiftDate

                                };
                                $("#reciveStatus").val("1");
                                for (var i = 0; i < keyArr.length; i++) {
                                    data[keyArr[i] + "_dataArr"] = JSON.stringify(getItemArrJson($('#' + keyArr[i] + ''), keyArr[i], result));
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
                /*接班*/
                $('.apsType-box').on('click','.joinWork',function () {
                    if(banName==result.shiftMain.groupName&&banId==result.shiftMain.shift.id){
                        top.layer.confirm('是否确定接班',{
                                btn:['确定', '取消'],
                                icon: 3},function () {
                                var data={
                                    bigKind:"CZ",
                                    reciveStatus:"1",
                                    lastShiftMainId:result.lastShiftMain.id
                                };
                                for (var i=0;i<keyArr.length;i++) {
                                    data[keyArr[i]+"_dataArr"] = JSON.stringify(getItemArrJson1($('#'+keyArr[i]+''),keyArr[i],result));
                                }
                                Api.ajaxForm(Api.aps+'/api/ctrl/ShiftMain/recive',data,function (result) {
                                    Mom.layMsg(result.massage)
                                });
                                top.layer.closeAll();
                                window.location.reload()

                            }
                        )
                    }else{
                        Mom.layAlert('用户信息不匹配')
                    }
                })
            }

            /*用于交班*/
            function getItemArrJson(obj,keyArr,result){
                var jsonArr = new Array();
                $(obj).find('textarea').each(function(i, r){
                    jsonArr.push({
                        middleKing:keyArr,
                        main:{"id":result.shiftMain.id},
                        content:$(r).val()
                    });
                });
                return jsonArr;
            }
            /*接班*/
            function getItemArrJson1(obj,keyArr,result){
                var jsonArr = new Array();
                $(obj).find('textarea').each(function(i, r){
                    jsonArr.push({
                        middleKing:keyArr,
                        main:{"id":result.lastShiftMain.id},
                        content:$(r).val()
                    });
                });
                return jsonArr;
            }
            //写入班信息
            function renderclass() {
                $('.date').text(getNowFormatDate());
                var data = {};
                Api.ajaxForm(Api.aps+'/api/ctrl/DirectiveIssued/goupList',data, function (data) {
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
            //获得当前日期
            function getNowFormatDate() {
                var date = new Date();
                var seperator1 = "-";
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var strDate = date.getDate();
                if (month >= 1 && month <= 9) {
                    month = "0" + month;
                }
                if (strDate >= 0 && strDate <= 9) {
                    strDate = "0" + strDate;
                }
                var currentdate = year + seperator1 + month + seperator1 + strDate;
                return currentdate;
            }
            /*渲染隐藏表*/
            function renderTableData(data) {
                if(data.lastShiftMainMap==null){
                    var keyArr = ["AQ","SC","QT","JBJS"];
                    NewNodeRow(keyArr,data)
                }else{
                    var aq=data.lastShiftMainMap.AQ,sc=data.lastShiftMainMap.SC,qt=data.lastShiftMainMap.QT,jbjs=data.lastShiftMainMap.JBJS;
                    renders(aq,"htmlaq","安全","#treeTableBody1");
                    renders(sc,"htmlsc","生产","#treeTableBody1");
                    renders(qt,"htmlqt","其他","#treeTableBody1");
                    renders(jbjs,"htmljbjs","交班记事","#treeTableBody2");
                    rowspanadd('#treeTableBody1',1);
                    rowspanadd('#treeTableBody2',1);
                }
            }
            //渲染表
            function renders(item,htmlname,content,innerid) {
                $(item).each(function (i) {
                    if(item[i].content!==''){
                        htmlname = "<tr>" +
                            "<td class='firsttd' width='50%'>"+content+"</td>"
                            +"<td class='twotd' width='50%'>"+item[i].content+"</td>"
                            +"</tr>";
                        $(innerid).append(htmlname);
                    }
                });
            }
            //合并单元格 参数从1开始
            function rowspanadd(table_id,table_colnum) {
                table_firsttd = "";
                table_currenttd = "";
                table_SpanNum = 0;
                table_Obj = $(table_id + " tr td:nth-child(" + table_colnum + ")");
                table_Obj.each(function (i) {
                    if (i == 0) {
                        table_firsttd = $(this);
                        table_SpanNum = 1;
                    } else {
                        table_currenttd = $(this);
                        if (table_firsttd.text() == table_currenttd.text()) { //这边注意不是val（）属性，而是text（）属性
                            //td内容为空的不合并
                            if(table_firsttd.text() !=""){
                                table_SpanNum++;
                                table_currenttd.hide(); //remove();
                                table_firsttd.attr("rowSpan", table_SpanNum);
                            }
                        } else {
                            table_firsttd = $(this);
                            table_SpanNum = 1;
                        }
                    }
                });
            }


        },

    };

    $(function(){
        //操作交接班日志
        if($('#opeShiftLogIndex').length > 0){
            PageModule.listInit();
        }

    });
});