require(['/js/zlib/app.js'], function(App) {

	 var PageModule = {
	 	init:function(){
		 	//获取级别
	        PageModule.loadRank();
	        //获取工序
        	PageModule.loadProcess();
        	//获取事件数据
        	PageModule.loadREvent();
        	//获取原因数据
        	PageModule.loadRCause();

			$("#endDateParam,#startDateParam").on('change', function () {
				if ($('#endDateParam').val() < $('#startDateParam').val() && $('#endDateParam').val() != '') {
					Mom.layMsg('结束时间应大于起始时间，请重新选择');
					$('#endDateParam').val('')
				}
			});

			//加载分页js
			require(['Page'], function () {
				window.pageLoad = function(){
					var data = {
						type:$("#type option:selected").val(),  //事件类型
						proc:$("#proc option:selected").val(), //工序
						event:$("#event option:selected").val(),  //事件
						grade:$("#grade option:selected").val(),   //等级
						cause:$("#cause option:selected").val(),   //原因
						startTime:$("#startDateParam").val(),      //开始时间
						endTime:$("#endDateParam").val()     //结束时间
					};
					new Page().init(Api.aps+"/api/oper/ManageControl/page",data,true,function(tableData, result){
						PageModule.createTable(tableData, result);
					});
				};
				window.pageLoad();
			})

	 	},
	 	//等级
	 	loadRank:function(){
            Bus.createSelect(Api.admin+'/api/sys/SysDict/type/directiveLeaveyType',$('#grade'));
	 	},
	 	//工序
	 	loadProcess:function(){
	 		var userId = Mom.getCookie("loginUserid");
            Bus.createSelect(Api.admin+'/api/sys/SysAuthProperty/getAttributeValue/'+userId+'/GXJQ/syswp',$('#proc'),'value','name');
	 	},
	 	//事件
	 	loadREvent:function(){
            Bus.createSelect(Api.admin+'/api/sys/SysDict/type/accidentEventType',$('#event'));
	 	},
	 	//原因
	 	loadRCause:function(){
            Bus.createSelect(Api.admin+'/api/sys/SysDict/type/accidentCauseType',$('#cause'));
	 	},
	 	//创建table
	 	createTable:function(tableData){
			 $("#treeTable").dataTable({
					"data": tableData,
					"aoColumns": [
						{"data": "id", 'sClass': "center id"},
						{"data": null, 'sClass': "center "},
						{"data": "event", 'sClass': "center"},
						{"data": "cause", 'sClass': "center"},
						{"data": "reportUser", 'sClass': "center"},
						{"data": "reportTime", 'sClass': "center"},
						{"data": "status", 'sClass': "center",
							"render":function (data,type,row,meta) {
								if(row.status == "0"){
									var setText = "上报";
									var  html = "<span class='newspapers'>"+setText+"</span>"
								}else if(row.status == "1"){
									var setText = "处理中";
									var html = "<span class='dispose'>"+setText+"</span>"
								}else{
									var setText = "关闭";
									var  html = "<span class='closes'>"+setText+"</span>"
								};
							return html
							}
						},
						{"data": null, 'sClass': "center",
							"render":function (data,type,row,meta) {
								   var html ;
								   if(row.status == "0" || row.status == "1"){
										html =  "<a class='btn btn-info btn-xs btn-check' ><i class='fa fa-search-plus'></i>查看</a >" +
												"<a class='btn btn-success btn-xs btn-change' ><i class='fa icon-change'></i>修改</a >"+
												"<a class='btn btn-success btn-xs btn-delete' ><i class='fa fa-trash-o'></i>删除</a >"
									}else{
										html =  "<a class='btn btn-info btn-xs btn-check' ><i class='fa fa-search-plus'></i>查看</a >" +
												"<a class='btn btn-success btn-xs btn-delete' ><i class='fa fa-trash-o'></i>删除</a >"
									}
									return html;
							}
						},
					],
					"fnDrawCallback" : function(){
						this.api().column(1).nodes().each(function(cell, i) {
						cell.innerHTML =  i + 1;
					});
					},
				});
				renderIChecks();
				PageModule.btneventHandler();
			},
			//列表按钮加载事件
			btneventHandler:function(){
				//创建
				$("#btn-add").unbind("click").on("click",function(){
					location.href = "./productioncontrolInner.html";
				});
				//查看
				$(".btn-check").unbind("click").on("click",function(){
					var id = $(this).parents('tr').find('.id').text();
					location.href = "./productioncontrilCheck.html?id="+id;
				});
				//修改
				$(".btn-change").unbind("click").on("click",function(){
					var id = $(this).parents('tr').find('.id').text();
					location.href = "./productioncontrolInner.html?id="+id;
				});
				//删除
				$(".btn-delete").unbind("click").on("click",function(){
					var id = $(this).parents('tr').find('.id').text();
					Bus.deleteItem("确定要删除",Api.aps+"/api/oper/ManageControl/deleteBatch",{ids:id});
				});
			},
			//查看
			checkInit:function(){
				PageModule.getDatamsg();
				//获取级别
				PageModule.loadRank();
				//获取工序
				PageModule.loadProcess();
				//获取事件数据
				PageModule.loadREvent();
				//获取原因数据
				PageModule.loadRCause();
				//返回按钮
				$("#back-btn").unbind("click").on("click",function(){
					location.href = "./chattelsControl.html";
				});
				//渲染下拉，以及内容
				PageModule.getDatamsg();
				$("select").each(function (index,item) {
					$(item).attr("disabled",true)
				})
			},
		//修改  新增
		createNew:function(){
			var id = Mom.getUrlParam("id");
			//PageModule.getDatamsg();

			//获取级别
	        PageModule.loadRank();
	        //获取工序
        	PageModule.loadProcess();
        	//获取事件数据
        	PageModule.loadREvent();
        	//获取原因数据
        	PageModule.loadRCause();


			//页面创建的时候
			function createNew() {
				//用于事故描述以及解决方案
				var str =  "<div class='newbox'>" +
					"<textarea class='textarea'></textarea>"+
					"<input type='button' class='btn bg-1ab394 btnaddr' value='+'>" +
					"<input type='button' class='btn btnremove' value='-'>" +
					"</div>";
				$("#SGMS").append($(str));
				$("#JJFA").append($(str));
				$("#ZXGZ").append($(str));
			}
			//如果有数据就渲染
			function msgCreact(data) {
				var ShiftMainMap  = data.groupMap;
				var keyarrs = ["SGMS","JJFA","ZXGZ"];
				for(var i=0;i<keyarrs.length;i++){
					for(var item in ShiftMainMap){
						if(item == keyarrs[i]){
							for(var j=0;j<ShiftMainMap[item].length;j++){
								//var str = "<div>" +
								//	"<i class='fa fa-quote-left'></i>"+
								//	"<span class='context'>"+ShiftMainMap[item][j].content+"</span>" + "<span class='time'>" + ShiftMainMap[item][j].createDate + "</span>" +
								//	"<i class='fa fa-quote-right'></i>";
								//"</div>"

								var str = "<div>"+
									"<i class='fa fa-quote-left'></i>"+
									"<input type='text' class='context inputc' value="+ShiftMainMap[item][j].content+" disabled='disabled' >"+
									"<i class='fa fa-quote-right'></i>"+
									"</div>"
								$("#"+keyarrs[i]).append(str)
							}
						}
					}
				}
			}

			//点击创建
			function clickNew() {
				var str = "<div class='newbox'>" +
					"<textarea name='safe' class='context'></textarea>"+
					"<input type='button' class='btn bg-1ab394 btnaddr btnadd4' value='+'>" +
					"<input type='button' class='btn btnremove btnadd4' value='-'>" +
					"</div>";
				$(".addbtn1").click(function () {
					$("#SGMS").append(str)
				});
				$(".addbtn2").click(function () {
					$("#JJFA").append(str);
				});
				$(".addbtn3").click(function () {
					$("#ZXGZ").append(str)
				});
			}
			$('.big').on('click', '.btnaddr', function () {
				var str = "<div class='newbox'>" +
					"<textarea name='safe' class='context'></textarea>" +
					"<input type='button' class='btn bg-1ab394 btnaddr btnadd4' value='+'>" +
					"<input type='button' class='btn btnremove btnadd4' value='-'>" +
					"</div>";
				$(this).parents('.newbox').after(str);
			});
			//减号按钮
			$('.big').on('click', '.btnremove', function () {
				//var len = $(this).parents(".big").find("textarea").length;
				//if(len<=1){
				//	top.layer.alert("至少填写一条");
				//}else{
				//	$(this).parents('.newbox').remove();
				//}
				$(this).parents('.newbox').remove();

			});

			//ajax获取数据
			function loadData(id) {
				var data = {
					id:id
				};
				Api.ajaxJson(Api.aps+ "/api/oper/ManageControl/form",JSON.stringify(data),function (result) {
					if(result.success==true){
						changeselect(result);
						msgCreact(result);
					}else{
						Mom.layAlert(result.message);
					}
				})
			}



			//查看和修改时select的显示
			function changeselect(data) {
				var selecteds = data.manageControl;
				$("#event option").each(function () {
					if(selecteds.event == $(this).attr('value')){
						$(this).attr("selected",true);
					}
				});
				$("#type option").each(function () {
					if(selecteds.type == $(this).attr('value')){
						$(this).attr("selected",true);
					}
				});
				$("#proc option").each(function () {
					if(selecteds.proc == $(this).attr('value')){
						$(this).attr("selected",true);
					}
				});
				$("#cause option").each(function () {
					if(selecteds.cause == $(this).attr('value')){
						$(this).attr("selected",true);
					}
				});
				$("#grade option").each(function () {
					if(selecteds.grade == $(this).attr('value')){
						$(this).attr("selected",true);
					}
				})
			}







			if(id == null){
				createNew();  //页面加载时创建页面
				clickNew();

			}else{
				loadData(id); //ajax得到数据
				clickNew();
			}
			//返回
			$("#back-btn").on("click",function(){
				location.href = "./chattelsControl.html";
			});
			//保存
			$("#add-btn").unbind("click").on("click",function(){
				var arr = ["type","event","proc","cause","grade"];
				for(var i=0;i<arr.length;i++){
					if($("#"+arr[i]).find("option:selected").val() == ""){
						var titleTexe = $("#"+arr[i]).prev(".title").text()
                        Mom.layMsg('请选择'+titleTexe+'信息再进行保存');
						return;
					}
				}
                if($(".SGMS .context").val() == ""){
                    Mom.layMsg('请填写事故描述信息');
                    return;
                }
                var data = PageModule.getmsgdata();
               	Api.ajaxForm(Api.aps+"/api/oper/ManageControl/save",data,function (result) {
					if(result.success){
                        Mom.layMsg("保存成功");
					}else{
                        Mom.layAlert(result.message);
					}
                })
			});
			//关闭事故单
			$("#close-btn").unbind("click").on("click",function () {
                var arr = ["type","event","proc","cause","grade"];
                for(var i=0;i<arr.length;i++){
                    if($("#"+arr[i]).find("option:selected").val() == ""){
                        var titleTexe = $("#"+arr[i]).prev(".title").text()
                        Mom.layMsg('请选择'+titleTexe+'信息再进行保存');
                        return;
                    }
                }
                if($(".SGMS .context").val() == ""){
                    Mom.layMsg('请填写事故描述信息');
                    return;
                }
                var data = PageModule.getmsgdata();
                data.status = "2";
                Api.ajaxForm(Api.aps+"/api/oper/ManageControl/save",data,function (result) {
                    if(result.success){
                        Mom.layMsg("操作成功");
                    }
                })
            })
		},
		//渲染下拉框
		selectedmsg:function(datamsg){
			var arr = [];
			$("select").each(function(index,item){
				arr.push($(item).attr("id"))
			});
			for(var items in datamsg){
				for(var i=0;i<arr.length;i++){
					if(items == arr[i]){
						$("#"+arr[i]).find("option").each(function (index,item) {
	            			if((datamsg[items]) == $(item).attr('value')){
	                			$(this).attr("selected",true);
	            			}
        				});
					}
				}
			}
		},
		//渲染信息
		eventmsg:function(groupMap){
			for(var item in groupMap){
				var content;
				for(var i=0;i<groupMap[item].length;i++){ 
					content = "<div class='datamsg'>"+
								"<i class='fa fa-quote-left'></i>"+
									"<input type='text' class='context inputc' value="+groupMap[item][i].content+" disabled='disabled' >"+
								"<i class='fa fa-quote-right'></i>"+
								"</div>"
				}
				$("."+item).append(content);
			}
		},
		//通过id获取数据信息
		getDatamsg:function(){
				var id = Mom.getUrlParam("id");
				var data = {
					id:id
				};
				Api.ajaxJson(Api.aps+"/api/oper/ManageControl/form",JSON.stringify(data),function(result){
					if(result.success){
						PageModule.selectedmsg(result.manageControl);
						PageModule.eventmsg(result.groupMap);
					}
				})
		},
		//保存获取关闭事故单获取到事件信息
		getmsgdata:function(){
			var SGMS=[];
			var JJFA = [];
			var ZXGZ = [];
			//事故描述
			$(".SGMS .context").each(function(index,item){
				var obj = {
					content:$(item).val(),
					id:Mom.getUrlParam("id") || '',
					controlId:Mom.getUrlParam("id") || '',
					eventFlag:"SGMS"
				}
                SGMS.push(obj)
			});
			//解决方案
			$(".JJFA .context").each(function (index,item) {
                var obj = {
                    content:$(item).val(),
                    id:Mom.getUrlParam("id") || '',
                    controlId:Mom.getUrlParam("id") || '',
                    eventFlag:"JJFA"
                }
                JJFA.push(obj)
            });
			//执行跟踪
            $(".ZXGZ .context").each(function (index,item) {
                var obj = {
                    content:$(item).val(),
                    id:Mom.getUrlParam("id") || '',
                    controlId:Mom.getUrlParam("id") || '',
                    eventFlag:"ZXGZ"
                }
                ZXGZ.push(obj)
            });
			var data = {
				id:Mom.getUrlParam("id") || '',
                event:$("#event option:selected").val(),
                cause:$("#cause option:selected").val(),
                grade:$("#grade option:selected").val(),
                proc:$("#proc option:selected").val(),
				type:$("#type option:selected").val(),
                SGMS_dataArr:JSON.stringify(SGMS),
                JJFA_dataArr:JSON.stringify(JJFA),
                ZXGZ_dataArr:JSON.stringify(ZXGZ),
			};
            return data;
		},

	};
	//初始化加载
	$(function(){
		if($('#productioncontrol').length > 0){
			PageModule.init();
		//查看
		}else if($("#productioncontrilCheck").length>0){
			PageModule.checkInit();
		//修改  新增
		}else if($("#productioncontrolInner").length>0){
			PageModule.createNew()
		}
	})
});

