require(['/js/zlib/app.js',''], function(App) {
        var PageModule = {
            init: function () {
                window.pageLoad = function () {
                    caseId=Mom.getUrlParam('caseId');
                    var data = {
                        caseId:caseId
                    };
                    Api.ajaxForm(Api.aps+"/api/ob/OreBlendingCase/queryOreBlendingCase",data,function (result) {
                        if(result.success){
                            if(result.rows != undefined){
                                var data = result.rows;
                                var checkedStatus = [];
                                //渲染表头tbody
                                for(var j=0;j<data.length;j++){
                                    data[j].ids = (j+1).toString();
                                    PageModule.createTable(data[j].head,data[j].miniCase,data[j].checkedCase,data[j].ids)
                                }
                                PageModule.createTitle();
                            }else{
                                Mom.layMsg("当前没有返回数据")
                            }
                        }else{
                                Mom.layMsg(result.message)
                        }
                    })
                };
                pageLoad()
            },
            createTable:function(item,trArr,checkedStatus,ids) {
                /**
                 * item:表头
                 * trArr:创建方案头：方案一/方案二/方案三
                 * checkedStatus方案内容：总量，次数，单次
                 * */
                if(checkedStatus.length>0){
                    var title = checkedStatus[0][0];
                }
                //创建table  th
                var table = $("<table id="+ids+" class='table table-striped table-bordered table-hover table-condensed dataTables-example dataTable tree_table'></table>");
                // table.addClass(ids);
                var tbody = $("<tbody></tbody>");
                var tr = $("<tr></tr>");
                table.append(tr);
                $(".aps-create-list").append(table);
                for(var i=0;i<item.length;i++){
                    var th = $("<th>"+item[i]+"</th>");
                    tr.append(th);
                }
                //创建方案
                for(var j=0;j<trArr.length;j++){
                    var tr = $("<tr class='programme'></tr>");
                    tbody.append(tr);
                    for(var k=0;k<trArr[j].length;k++){
                        var td = $("<td>"+trArr[j][k]+"</td>");
                        tr.append(td);
                    }
                };
                table.append(tbody);
                //创建方案优化部分,判断是在那个方案下的;
                //1、拿到所有复方案的innhtml；
                //2、拿到table的方案
                $(".programme td").each(function (index,item) {
                    var calssName = $(this).parents("table").attr("id");
                    if($(this).text() == title && calssName == ids){
                        for(var i=0;i<checkedStatus.length;i++){   //循环优化方案
                            var tr = $("<tr></tr>");               //创建优化方案tr
                            for(var j=0;j<checkedStatus[i].length;j++){
                                var td = $("<td>"+checkedStatus[i][j]+"</td>>");   //创建优化方案td
                                    tr.append(td);
                            }
                            //判断如果当前tr的下边有tr的话，就判断这个tr下边的tr有没有class，如果有就before，如果没有就after
                            //如果没有tr的话，就在该tr下边after
                            if($(this).parent().next().text() != ""){
                                if($(this).parent().next().attr("class") != undefined){
                                    $(this).parent().next().before(tr);
                                    $(this).parents('tr').addClass('bgc-color');
                                }else{
                                    $(this).parent().next().after(tr);
                                    $(this).parents('tr').addClass('bgc-color');
                                }
                            }else{
                                $(this).parent().after(tr);
                                $(this).parents('tr').addClass('bgc-color');
                            }
                        }
                    }
                });
            },
            createTitle:function () {
                var table = $(".table");
                for(var i=1;i<table.length;i++){
                    var h1 = $("<h1 class='tit'>第"+i+"次方案优化</h1>");
                    h1.addClass("titNames");
                    $(table[i]).before(h1)
                }
            }
        };
        $(function(){
            if($("#checkprogramme").length>0){
                PageModule.init();
            }
        })
});