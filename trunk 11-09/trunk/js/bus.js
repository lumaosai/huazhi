/**
 * 业务工具类，命名空间为Bus
 * @see 使用方法：Bus.windowOpen()
 * @type {Function}
 * @Auth Qiyh
 * @Data 2018-6-01
 */
var Bus = window.Bus || (function() {

    // 打开一个模态窗体
    var windowOpen = function(url, name, width, height){
        var top=parseInt((window.screen.height-height)/2,10),left=parseInt((window.screen.width-width)/2,10);
        var options="location=no,menubar=no,toolbar=no,dependent=yes,minimizable=no,modal=yes,alwaysRaised=yes,"+
                "resizable=yes,scrollbars=yes,"+"width="+width+",height="+height+",top="+top+",left="+left;
        if(window.showModalDialog) {
            window.showModalDialog(url, name, options);
        }else{
            window.open(url, name, options);
        }
    };

    var windowOpenPost = function(url, params, target){
        var tempform = document.createElement("form");
        tempform.action = url;
        tempform.method = "post";
        tempform.style.display="none";
        if(target) {
            tempform.target = target;
        };
        if(params){
            for (var x in params) {
                var opt = document.createElement("input");
                opt.name = x;
                opt.value = params[x];
                tempform.appendChild(opt);
            }
        }
        var opt = document.createElement("input");
        opt.type = "submit";
        tempform.appendChild(opt);
        document.body.appendChild(tempform);
        tempform.submit();
        document.body.removeChild(tempform);
    };

    var openDialog = function(title, url, width, height, callback){
        if(undefined==width || width==''){
            width = '800px';
        }
        if(undefined==height || height==''){
            height = '500px';
        }
        var btnArr = [];
        if(callback){
            btnArr.push({ btn: '确定', fn: callback });
        }
        var options = {
            btnArr : btnArr
        };
        return openDialogCfg(title, url, width, height, options);
    };

    var openEditDialog = function(title, url, width, height, callback){
        if(title==null || title==''){
            title = '修改';
        }
        var layIndex=openDialog(title, url, width, height, callback || function(layerIdx,layero){
            var p_ = top;//window.parent?window.parent:top;
            var iframeBody = p_.layer.getChildFrame('body', layerIdx);
            var iframeWin = layero.find('iframe')[0].contentWindow; //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.method();
            //body.find('#inputForm').attr("target",Contabs.getActiveTab().attr("name"));//提交到当前激活的页签,在回调的doSubmit方法中设置
            var flag_ = false;
            //默认回调父窗口的doSubmit()方法
            try{
                flag_=iframeWin.doSubmit(layerIdx, layero);
            }catch(e){window.alert(e.message);}

            return flag_;
        });
        return layIndex;
    };

    var openDialogCfg = function(title, url, width, height, options){
        var p_ = top;//window.parent?window.parent:top;
        var config = {
            type: 2,
            area: [width, height],
            title: title,
            maxmin: true, //开启最大化最小化开关
            content: url,
            btn: []
        };
        config.success = config.success || function(layero, index){
            //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.method();
            //var iframeWin = p_.window[layero.find('iframe')[0]['name']];//外部窗口
            var iframeWin = layero.find('iframe')[0].contentWindow; //内部窗口
            //自动高度
            if(height=='auto'){
                p_.layer.iframeAuto(index);
            }
            //加载完成后设置内部的关闭按钮
            $('.closeBtn',iframeWin.document).each(function(i,o){
                var closeBtnStr = $(o).prop("outerHTML");
                var _fun = closeBtnStr.match(/\([^\)]*\)/g);
                if(_fun==null || _fun=='()'){
                    $(o).unbind("click").click(function(){p_.layer.close(index);return false;});
                }
            });
        };
        var btnArr_=[];
        if(options){
            config = $.extend(true,{},config,options);
            //获取按钮数组对象
            if(options.btnArr){
                btnArr_ = options.btnArr.concat();
            }
        }
        if(!options.btn || options.btn.length>0){
            btnArr_.push({ btn: '关闭', fn: function(){} });
        }
        $(btnArr_).each(function(i,o){
            config.btn.push(o.btn);
            if(i == btnArr_.length-1){
                config.cancel = function(index, layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow; //内部窗口
                    var fn = o.fn;
                    if(typeof fn == 'string'){
                        fn = iframeWin[fn];
                    }
                    fn(index, layero);
                };
            }
            else{
                config['btn'+(i+1)]=function(index, layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow; //内部窗口
                    var fn = o.fn;
                    if(typeof fn == 'string'){
                        fn = iframeWin[fn];
                    }
                    var flag = fn(index, layero);
                    if(flag == true){
                        setTimeout(function(){p_.layer.close(index)}, 200);//延时0.1秒，对应360 7.1版本bug
                    }else{
                        return false;
                    }
                };
            }
        });
        var layIndex=p_.layer.open(config);
        return layIndex;
    };

    /**
     * 打开选择机构窗口
     * @param title 标题
     * @param data 获取机构传参
     * @param idDom id
     * @param nameDom name
     * @param clearFlag 是否显示清除按钮（为空时不显示）
     */
    var openOrgSelect = function(title, data, options, okFn, clearFn){
        var apiCfg = { url: Api.admin+'/api/sys/SysOrg/orgTree', data: data||{} };
        return openTreeSelect(title||'选择机构', apiCfg, options, okFn, clearFn);
    };

    /**
     * 打开树选择窗口，支持弹出框选择树
     * @param title[必填]：标题
     * @param apiCfg[必填]：获取tree参数对象{url:'',data:{}}
     * @param options[必填]：树选择配置参数对象
     *      {
     *          width[非必填]：弹出框的宽度（默认300px）
     *          height[非必填]：弹出框高度（默认424px）
     *          htmlUrl[非必填]：要打开的树选择的html
     *          defaultVals[非必填]：默认值对象{value:'',prop:''}（值和字段）
     *          multiple[非必填]：是否多选（true/false）
     *          noRoot[非必填]：是否不能选择根节点（true/false）
     *          onlyLeaf[非必填]：是否只能选择叶子节点（true/false）
     *          showSearch[非必填]：是否显示搜索框（true/false）
     *          setting:[非必填]：参照ztree官方api的setting配置
     *      }
     * @param okFn[必填]：点‘确定’的回调函数，返回选中的值
     * @param clearFn[非必填]：
     */
    var openTreeSelect = function(title, apiCfg, options, okFn, clearFn){
        var btnArr = ['确定'];
        if(clearFn){
            btnArr.push('清除');
        }
        btnArr.push('关闭');
        var width = options.width||'300px', height = options.height||'424px';
        var htmlUrl = options.htmlUrl||(Mom.basePath+'/common/treeSelect.html');
        var param = {
            multiple: options.multiple==undefined?false:options.multiple,
            noRoot: options.noRoot==undefined?false:options.noRoot,
            onlyLeaf: options.onlyLeaf==undefined?false:options.onlyLeaf,
            contentType: apiCfg.contentType==undefined?'Form':apiCfg.contentType,
            showSearch: options.showSearch==undefined?true:options.showSearch
        };
        var layerCfg = {
            type: 2,
            btn: btnArr,
            maxmin: false, //开启最大化最小化按钮
            shade: [0.4, '#000'], //0.4透明度的白色背景
            title: title||'请选择',
            area: [width, height],
            content: Mom.extractUrl(htmlUrl,param),
            success: function(layero, index){
                var iframeWin = layero.find('iframe')[0].contentWindow;
                iframeWin.setConfig(apiCfg.url, apiCfg.data, options.defaultVals||'', options.setting);
            },
            yes:function (layIdx,layero) {
                var iframeWin = layero.find('iframe')[0].contentWindow;
                var selResult=iframeWin.getCheckValues();//在layer中运行当前弹出页内的getSelectVal方法
                if(selResult.success){
                    var ret = true;
                    if(okFn){
                        //如果有‘确定’的回调函数，则执行自定义回调函数
                        //其他一些自定义校验也可以放在回调函数中，不满足条件返回false即可
                        ret = okFn(selResult, layIdx, layero);
                    }
                    if(ret){
                        top.layer.close(layIdx);
                    }
                }
            }
        };
        if(clearFn){
            layerCfg.btn2 = function(layIdx, layero){
                clearFn(layIdx, layero);
                return true;//关闭
            }
        }
        return top.layer.open(layerCfg);
    };

    /**
     * 用户选择窗口（列表方式）
     * @param title：标题
     * @param apiCfg：可为空，查询用户接口对象{url:'',data:{}}，默认为:Api.admin+"/api/sys/SysUser/page"
     * @param options：可为空，配置项（宽度、高度、默认值、layer配置项可参考layer的api）
     * @param okFn：点击确定按钮回调函数，参数：selResult, layIdx, layero
     * @param clearFn：可为空，点击清除回调函数，为空时不显示清除按钮
     */
    var openSelUserWin = function(title, apiCfg, options, okFn, clearFn){
        var btnArr = ['确定'];
        if(clearFn){
            btnArr.push('清除');
        }
        btnArr.push('关闭');
        var width = options.width||'840px', height = options.height||'600px';
        var htmlUrl = options.htmlUrl||(Mom.basePath+'/common/userSelect.html');
        var param = {
            multiple: options.multiple==undefined?false:options.multiple
        };
        $.extend(apiCfg||{},{
            url:Api.admin+"/api/sys/SysUser/page", data:{}
        });
        var layerCfg = {
            type: 2,
            btn: btnArr,
            maxmin: false, //开启最大化最小化按钮
            shade: [0.4, '#000'], //0.4透明度的白色背景
            title: title||'选择用户',
            area: [width, height],
            content: Mom.extractUrl(htmlUrl, param),
            success: function(layero, index){
                var iframeWin = layero.find('iframe')[0].contentWindow;
                iframeWin.setConfig(apiCfg.url, apiCfg.data, options.defaultVals||'');
            },
            yes:function (layIdx,layero) {
                var iframeWin = layero.find('iframe')[0].contentWindow;
                var selResult=iframeWin.getCheckValues();//在layer中运行当前弹出页内的getSelectVal方法
                if(selResult.success){
                    var ret = true;
                    if(okFn){
                        //如果有‘确定’的回调函数，则执行自定义回调函数
                        //其他一些自定义校验也可以放在回调函数中，不满足条件返回false即可
                        ret = okFn(selResult, layIdx, layero);
                    }
                    if(ret){
                        top.layer.close(layIdx);
                    }
                }
            }
        };
        if(clearFn){
            layerCfg.btn2 = function(layIdx, layero){
                clearFn(layIdx, layero);
                return true;//关闭
            }
        }
        return top.layer.open(layerCfg);
    };

    /**
     * 用户选择2（机构树下方式）
     * @param title: 标题
     * @param multiple: 是否多选
     * @param checkedVals: 默认选中值
     * @param okFn：点击确定按钮回调函数，参数：selResult, layIdx, layero
     * @param clearFn：可为空，点击清除回调函数，为空时不显示清除按钮
     */
    var openSelUserWin2 = function(title, multiple, checkedVals, okFn, clearFn){
        multiple = multiple!=undefined?multiple:false;
        var options = {
            noRoot: true,
            multiple: multiple,
            defaultVals: checkedVals,
            htmlUrl: Mom.basePath+'/common/treeSelect.html?oper=user'
        };
        return openOrgSelect(title, {}, options, okFn, clearFn);
    };

    /**
     * 用户选择3（三个树选择方式）
     * @param title 标题
     * @param options: 配置项，包含以下：
     *          width：宽度，可为空，默认为800px
     *          height：高度，可为空，默认为545px
     *          multiple：是否允许多选(true/false)，默认为true
     *          showSearch：是否显示搜索框(true/false)，默认为true
     *          html：要打开的页面，可为空，默认为:userSelect3.html
     *          orgOptions:{ //部门树配置项
     *              apiCfg: {}, //接口配置对象，包含：接口url、接口参数data、接口调用方式contentType（Json/Form）
     *              settting: {} //ztree配置项，详情参考ztree的api
     *          }
     *          waitUserOptions:{ //待选用户配置项
     *              apiCfg: {}, //接口配置对象，包含：接口url、接口参数data、接口调用方式contentType（Json/Form）
     *              settting: {} //ztree配置项，详情参考ztree的api
     *          }
     *          hasUserOptions:{ //已选用户配置项
     *              apiCfg: {}, //接口配置对象，包含：接口url、接口参数data、接口调用方式contentType（Json/Form）
     *              settting: {} //ztree配置项，详情参考ztree的api,
     *              checkDefaultVal: //默认值，可为对象、数组、字符串，默认为空
     *          }
     * @param okFn 点击确定按钮回调函数，参数：selResult, layIdx, layero
     * @param clearFn：可为空，点击清除回调函数，为空时不显示清除按钮
     */
    var openSelUserWin3 = function(title, options, okFn, clearFn){
        var btnArr = ['确定'];
        if(clearFn){
            btnArr.push('清除');
        }
        btnArr.push('关闭');
        var width = options.width||'800px', height = options.height||'545px';
        var htmlUrl = options.htmlUrl||(Mom.basePath+'/common/userSelect3.html');
        var param = {
            multiple: options.multiple==undefined?true:options.multiple,
            showSearch: options.showSearch==undefined?true:options.showSearch
        };
        var layerCfg = {
            type: 2,
            btn: btnArr,
            maxmin: false, //开启最大化最小化按钮
            shade: [0.4, '#000'], //0.4透明度的白色背景
            title: title||'请选择',
            area: [width, height],
            content: Mom.extractUrl(htmlUrl,param),
            success: function(layero, index){
                var iframeWin = layero.find('iframe')[0].contentWindow;
                iframeWin.setConfig(options.orgOptions, options.waitUserOptions, options.hasUserOptions);
            },
            yes:function (layIdx,layero) {
                var iframeWin = layero.find('iframe')[0].contentWindow;
                var selResult=iframeWin.getCheckValues();//在layer中运行当前弹出页内的getSelectVal方法
                if(selResult.success){
                    var ret = true;
                    if(okFn){
                        //如果有‘确定’的回调函数，则执行自定义回调函数
                        //其他一些自定义校验也可以放在回调函数中，不满足条件返回false即可
                        ret = okFn(selResult, layIdx, layero);
                    }
                    if(ret){
                        top.layer.close(layIdx);
                    }
                }
            }
        };
        if(clearFn){
            layerCfg.btn2 = function(layIdx, layero){
                clearFn(layIdx, layero);
                return true;//关闭
            }
        }
        return top.layer.open(layerCfg);
    };

    /**
     * 选择图标
     * @param selVal
     * @param callback
     */
    var openIconSelect = function(selVal, callback){
        selVal = selVal||'';
        var layerCfg = {
            type: 2,
            maxmin: true,
            title:"选择图标",
            area: ['860px',  '70%'],
            content: Mom.basePath+'/common/iconSelect.html?selVal='+selVal,
            btn: ['确定', '关闭']
        }
        if(callback){
            layerCfg.yes = function(layerIdx, layero){
                var iframeWin = layero.find("iframe")[0].contentWindow;
                var selResult = $("#icon", iframeWin.document).val();
                var flag = false;
                if(selResult != ''){
                    flag = callback(selResult, layerIdx, layero);
                }else{
                    Mom.layMsg('请选择图标');
                }
                if(flag){
                    top.layer.close(layerIdx);
                }
            }
        }
        return top.layer.open(layerCfg);
    };

    /**
     * 回调函数，在修改和添加时，供openEditDialog调用提交表单。
     * 注意：需要在form的action中写上提交的接口地址
     *      地址的Domain地址可以使用$Api.domain$进行定义
     *      如：action="$Api.admin$/api/User/save"
     */

    window.doSubmit = function(layerIdx, layero){
        if(!Validator.valid(document.forms[0],1.3)){
            return false;
        }
        //自定义校验
        var formObj = $('#inputForm');
        var url = formObj.attr('action');
        var formdata = formObj.serializeJSON();
        Api.ajaxJson(url,JSON.stringify(formdata),function(result){
            if(result.success == true){
                Mom.layMsg('操作成功', 1000);
                setTimeout(function(){
                    //刷新父层
                    var frameActive = top.TabsNav.getActiveTab().attr("name");
                    var obj = $('#search-btn,#btn-search', top.window.frames[frameActive].document);
                    if(obj.length == 0){
                        obj = $('#refresh-btn', top.window.frames[frameActive].document);
                    }
                    if(obj.length > 0){
                        obj.trigger('click');
                    }else{
                        top.TabsNav.refreshActiveTab();
                    }
                    top.layer.close(layerIdx);
                },500);
            }else{
                Mom.layAlert(result.message);
            }
        });
        return false;
    };

    var deleteItem = function(message,url,data,callbackFn){
        top.layer.confirm(message, {icon: 3, title:'系统提示'}, function(layerIndex){
            Api.ajaxForm(url,data||{},function(result){
                if(callbackFn){
                    var flag = callbackFn(result, layerIndex, data);
                    if(flag==true){
                        top.layer.close(layerIndex);
                    }
                }else {
                    if (result.success == true) {
                        var frameActive = top.TabsNav.getActiveTab().attr("name");
                        var obj = $('#search-btn,#btn-search', top.window.frames[frameActive].document);
                        if (obj.length == 0) {
                            obj = $('#refresh-btn', top.window.frames[frameActive].document);
                            if (obj.length == 0) {
                                top.TabsNav.refreshActiveTab();
                            }
                        }
                        obj.trigger('click');
                        top.layer.close(layerIndex);
                    }else{
                        top.layer.alert(result.message);
                    }
                }
            });
        });
        return false;
    };

    /*
     * 修改数据
     */
    var editCheckedTable = function(title,url,width,height,tableId,callbackFn){
        var checkedArr = $(tableId +" tbody tr td input.i-checks:checked");
        if(checkedArr.length == 0 ){
            top.layer.alert('请选择一条数据!', {icon: 0, title:'警告'});
            return;
        }
        //bug：id数量过多导致被截取，选择多个只取最后一个
        var id =  checkedArr[checkedArr.length-1].getAttribute("id");
        var url = Mom.extractUrl(url, "id="+id);
        openEditDialog(title, url, width, height, callbackFn);
    };

    // 删除多条数据
    function delCheckTable(message,url,tableId,callbackFn){
        var idArr=[];
        $(tableId +" tbody tr td input.i-checks:checkbox").each(function(){
            if(true == $(this).is(':checked')){
                idArr.push($(this).attr("id"));
            }
        });
        if(idArr.length>0){
            var data = {
                ids:idArr.join(",")
            };
            top.layer.confirm(message,{icon: 3, title:'系统提示'}, function(layerIdx){
                Api.ajaxForm(url, data, function (result) {
                    if(callbackFn){
                        var flag = callbackFn(result, layerIdx, idArr);
                        if(flag==true){
                            top.layer.close(layerIdx);
                        }
                    }else{
                        if(result.success == true){
                            var frameActive = top.TabsNav.getActiveTab().attr("name");
                            var obj = $('#search-btn', top.window.frames[frameActive].document);
                            if(obj.length == 0){
                                obj = $('#refresh-btn', top.window.frames[frameActive].document);
                            }
                            obj.trigger('click');
                            top.layer.close(layerIdx);
                        }else{
                            top.layer.alert(result.message, {icon: 0, title:'警告'});
                        }
                    }
                });
            });
        }else{
            top.layer.alert('请至少选择一条数据!', {icon: 0, title:'警告'});
        }
    }

    //删除成功后的回调函数
    function deleteCheck(result){
        if(result.success){
            Mom.layMsg('删除成功',{time: 1000});
            setTimeout(function(){
                top.TabsNav.refreshActiveTab();
            },1000)
        }
    }

    //获取字典标签
    var getDictLabel = function(data, value, defaultValue){
        for (var i=0; i<data.length; i++){
            var row = data[i];
            if (row.value == value){
                return row.label;
            }
        }
        return defaultValue;
    };

    //动态添加Select的option
    function createSelect(url,appendEl,valueField, textFile){
        Api.ajaxJson(url,{},function(result){
            if(result.success){
                var rows = result.rows;
				$(appendEl).empty();
                $(appendEl).append('<option value="" selected="selected">--请选择--</option>');
                appendOptionsValue($(appendEl),rows,valueField,textFile);
            }else{
                Mom.layMsg(result.message);
            }
        })
    }

    function resetSelect(obj, blankLabel){
        $(obj).empty();
        blankLabel = blankLabel || '-- 全部 --';
        $(obj).append("<option value=''>"+blankLabel+"</option>");
    }
    /**
     * 动态添加Select的option
     */
    function appendOptionsValue(obj, rows, valueField, textFile){
        if(typeof(obj) == "string"){
            obj = $(obj);
        }
        if(rows && rows.length > 0){
            var options = new Array();
            valueField = valueField||'value';
            textFile = textFile||'label';
            $(rows).each(function(i,o){
                options.push({'value':o[valueField], 'label':o[textFile]});
            });
            appendOptions(obj, options);
        }
    }
    // 追加select的options
    function appendOptions(obj, options){
        if(options){
            $(options).each(function(i,o){
                $(obj).append("<option value='"+o.value+"'>"+o.label+"</option>");
            });
        }
    }

	/**权限控制通用方法，若无权限则元素被隐藏*/
	function permissionContorl(code_, arr, permitCtrlCallback) {
		getPermission(code_, arr, function(retObj,rows){
			for (var k in retObj) {
				if(retObj[k].permit){
					var eo = null;
					for(var j=0; j<arr.length; j++){
						//找到与之相匹配的元素
						if(arr[j].code == k){
							eo = arr[j];
							break;
						}
					}
					if(eo){
						$(eo.selector).removeClass('hidden').css({'display':'inline-block'});
					}
				}
			}
			if(permitCtrlCallback){
				permitCtrlCallback(retObj,rows);
			}
		});
	}

	/**获取权限工具类*/
	function getPermission(code,arr,callbackFn){
		var retObj = {};
		var url = Api.admin + "/api/sys/SysOperation/currentUserOperation/"+code;
		Api.ajaxJson(url, {} ,function (result) {
			if(result.success){
				var retCoderArr = [], operArr = [];
				$.each(arr,function(j,o){
					$(o.selector).hide();
					operArr.push(o.code);
				});
				for(var i=0;i<result.rows.length;i++){
					retCoderArr.push(result.rows[i].code);
				}

				for(var j = 0;j<operArr.length;j++){
					var o = operArr[j], permit = false;
					if(retCoderArr.contains(o)){
						permit = true;
					}
					retObj[o] = {'permit':permit};
					/*retObj[o].permit = permit;
					 retObj[o] = {'permit':permit};*/
				}
				if(callbackFn){
					callbackFn(retObj,result.rows);
				}
			}else{
				Mom.layAlert("查询权限失败！"+result.message)
			}
		});
	}


    return {
        //打开模态窗口
        windowOpen: windowOpen,
        windowOpenPost: windowOpenPost,
        //打开layer窗口
        openDialog: openDialog,
        openEditDialog: openEditDialog,
        openDialogCfg: openDialogCfg,
        //选择机构
        openOrgSelect: openOrgSelect,
        //树选择窗口
        openTreeSelect: openTreeSelect,
        //用户选择窗口
        openSelUserWin: openSelUserWin,
        openSelUserWin2: openSelUserWin2,
        openSelUserWin3: openSelUserWin3,
        //选择图标
        openIconSelect: openIconSelect,

        deleteItem: deleteItem,
        delCheckTable: delCheckTable,
        editCheckedTable: editCheckedTable,

        //获取字典的label
        getDictLabel: getDictLabel,

        //下拉框操作方法
        createSelect: createSelect,
        resetSelect: resetSelect,
        appendOptionsValue: appendOptionsValue,
        appendOptions: appendOptions,

		//权限控制
		permissionContorl: permissionContorl,
		//获取权限
		getPermission: getPermission,

    }
})();