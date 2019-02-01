require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        listInit: function(){
            //加载easyui依赖
            require(['easyui_my'],function(easyuiObj){
                //添加
                $('#add-btn').click(function(){
                    Bus.openEditDialog('修改菜单','systemSettings/menuInner.html','800px','456px', saveCallback);
                });
                // 点击修改按钮
                $('#edit-btn').click(function(){
                    var nodes = $('#tt').treegrid('getChecked');
                    if(nodes.length != 1 ){
                        Mom.layAlert('请选择一条数据!');
                        return;
                    }
                    var id =  nodes[0].id;
                    Bus.openEditDialog('修改菜单','systemSettings/menuInner.html?id='+id,'600px','450px', saveCallback);
                });
                // 删除checkbox选中的
                $('#delete-btn').click(function(){
                    var idArr=[];
                    var nodes = $('#tt').treegrid('getChecked');
                    nodes.forEach(function(item){
                        idArr.push(item.id);
                    });
                    if(idArr.length>0){
                        Mom.layConfirm('要删除该菜单及所有子菜单项吗？',function(layerIdx, layero){
                            Api.ajaxForm(Api.admin + '/api/sys/SysMenu/ajaxDel', {ids:idArr.join(',')}, function(result){
                                if(result.success == true){
                                    $.each(idArr,function(i,o){
                                        easyuiObj.tg_removeTreegridNode('#tt',o);
                                    });
                                    top.layer.close(layerIdx);
                                }else{
                                    Mom.layAlert(result.message);
                                }
                            });
                            return false;
                        });
                    }else{
                        Mom.layAlert('请至少选择一条数据!');
                    }
                });
                // 保存排序按钮
                $('#updateSort-btn').unbind().click(function(){
                    var ids="",sorts="";
                    $("input[name='sort']").each(function(ind,item){
                        var id = $(item).attr('data-id');
                        var itemDVal= $(item).attr("data-val");
                        var itemVal = $(item).val();
                        if(itemDVal !== itemVal){
                            ids+= ","+id;
                            sorts+= ","+itemVal;
                        }
                    });
                    if(ids.length>0){
                        ids = ids.substring(1);
                        sorts = sorts.substring(1);
                        var data = {
                            ids: ids,
                            sorts: sorts
                        };
                        Api.ajaxForm(Api.admin + "/api/sys/SysMenu/ajaxSort",data,function(result){
                            if(result.success){
                                pageLoad();
                            }else{
                                Mom.layAlert(result.message);
                            }
                        })
                    }else{
                        Mom.layMsg("没有修改任何排序！")
                    }
                });

                function btncilck(){
                    // 查看
                    $('.btn-check').unbind().click(function () {
                        var id = $(this).attr('id');
                        Bus.openDialog('查看菜单','systemSettings/menuInner.html?id='+id,'800px','456px')
                    });
                    // 添加下级菜单
                    $('.btn-target').unbind().click(function(){
                        var id = $(this).attr('id');
                        Bus.openEditDialog('添加下级菜单','systemSettings/menuInner.html?pid='+id,'800px','456px', addSonCallback);
                    });
                }

                //保存回调函数
                function saveCallback(layerIdx, layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var formData = iframeWin.getFormData();
                    if(formData){
                        var data = formData.data;
                        Api.ajaxJson(formData.url, JSON.stringify(data), function(result){
                            if(result.success == true){
                                Mom.layMsg('操作成功', 1000);
                                easyuiObj.tg_editTreegridNode('#tt',data.id, data);
                                btncilck();
                                //关闭弹出层
                                top.layer.close(layerIdx);
                            }else{
                                Mom.layAlert(result.message);
                            }
                        });
                    }
                    return false;
                }
                //添加下级菜单回调函数
                function addSonCallback(layerIdx, layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var formData = iframeWin.getFormData();
                    if(formData){
                        var data = formData.data;
                        Api.ajaxJson(formData.url, JSON.stringify(data), function(result){
                            if(result.success == true){
                                Mom.layMsg('操作成功', 1000);
                                easyuiObj.tg_appendTreegridNode('#tt',result.SysMenu.parentId, result.SysMenu);
                                btncilck();
                                //关闭弹出层
                                top.layer.close(layerIdx);
                            }else{
                                Mom.layAlert(result.message);
                            }
                        });
                    }
                    return false;
                }

                function pageLoad(node) {
                    Api.ajaxJson(Api.admin+"/api/sys/SysMenu/getTreeGraidJson",{},function(result){
                        if(result.success){
                            $('#tt').treegrid({
                                idField:'id',
                                treeField:'name',
                                rownumbers: false,
                                collapsible: true,
                                fitColumns: true,
                                striped: true,
                                singleSelect : false,
                                checkOnSelect : false,
                                selectOnCheck : true,
                                data:result.rows
                            });
                            btncilck();
                            renderIChecks();//
                        }else{
                            Mom.layMsg(result.message);
                        }
                    });
                }

                pageLoad();

            });

            window.operFmt = function(value, row){
                return "<a class='btn btn-check' id='"+ row.id+"'><i class='fa fa-search-plus'></i>查看</a>" +
                    " <a class='btn btn-target' id='"+ row.id+"'><i class='fa fa-plus'></i>添加下级菜单</a>";
            };
            window.nameFmt = function(value, row){
                if(row.icon){
                    return "<i class='fa "+row.icon+"'></i>&nbsp;"+value;
                }else{
                    return value;
                }
            };
            window.sortFmt=function(value, row){
                return "<input type='number' name='sort' value='"+value+"' data-id='"+row.id+"' data-val='"+value+"' class='form-control center' style='width:100px;margin:0 auto; '>";
            };

            //同步属性
            $("#sync-btn").click(function(){
                Mom.layConfirm('确定继续吗?',function(){
                    Api.ajaxForm(Api.admin+"/api/sys/SysMenu/ajaxSys",{},function(result){
                        Mom.layAlert(result.message);
                    });
                });
            });
        },

        menuInner: function(){
            var id =Mom.getUrlParam('id')||'',
                pid = Mom.getUrlParam('pid') || '';
            if( id != "" || pid != "" ){
                var data = {
                    "id":id,
                    "parent":{ "id":pid }
                };
                var url = Api.admin+"/api/sys/SysMenu/form";
                Api.ajaxJson(url,JSON.stringify(data),function(result){
                    if(result.success){
                        var SysMenu = result.SysMenu;
                        Validator.renderData(SysMenu,$('#inputForm'));
                        $("#menuId").val(SysMenu.parentId);
                        $("#menuName").val(result.parentName);
                        $("#iconIconLabel").text(SysMenu.icon?SysMenu.icon:"无");
                    }else{
                        Mom.layMsg(result.message);
                    }
                });
            }
            //选择上级菜单
            $("#menuButton").click(function(){
                var apiCfg = { url: Api.admin+'/api/sys/SysMenu/openTree', data:{} };
                var options = {defaultVals: $('#menuId').val() };
                Bus.openTreeSelect('选择上级菜单', apiCfg, options, function(selResult, layIdx, layero){
                    if(selResult.success){
                        $("#menuName").val(selResult.name);
                        $("#menuId").val(selResult.id);
                        return true;
                    }
                },function(){
                    $("#menuName,#menuId").val('');
                });
            });
            // 选择图标icon
            $("#iconButton").click(function(){
                var selVal = $('#icon').val();
                Bus.openIconSelect(selVal,function(icon){
                    $("#iconIcon").attr("class", "fa "+icon);
                    $("#iconIconLabel").text(icon);
                    $("#icon").val(icon);
                    return true;
                });
            });
            //清除图标
            $("#iconclear").click(function(){
                $("#iconIcon").attr("class", "icon- hide");
                $("#iconIconLabel").text("无");
                $("#icon").val("");
            });

            window.getFormData = function(){
                if(!Validator.valid(document.forms[0],1.3)){
                    return;
                }
                var formObj = $('#inputForm');
                return {
                    url: formObj.attr('action'),
                    data: formObj.serializeJSON()
                }
            };
        }
    };

    $(function(){
        //菜单管理列表
        if($('#menu-content').length > 0){
            PageModule.listInit();
        }
        //菜单子页(新增，修改，查看)
        else if($('#menuInner').length > 0){
            PageModule.menuInner();
        }


    });

});