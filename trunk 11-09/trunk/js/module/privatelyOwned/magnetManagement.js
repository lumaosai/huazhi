require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);
    var PageModule = {
        listInit: function(){
            Api.ajaxForm(Api.admin+'/api/workbench/WorkbenchTileTemplate/typeList',{},rendertitle);
            $('#refresh-btn').click(function () {
                var ifr=$('#iframeCon').find('iframe');
                window.location.reload();
            });
            function rendertitle(result) {
                var typelist = result.typeList;
                for (var i = 0; i < typelist.length; i++) {
                    var html = '<li id="' + typelist[i].id + '">' +
                        '<a>' + typelist[i].name + '<span></span></a>'
                        + '</li>';
                    $('.apsType-linkage').append(html);
                }
                rendercontent();
            }

            function rendercontent() {
                var $ifrTab = $('#titleName').find('li');
                $ifrTab.click(function () {
                    var typeId = $(this).attr('id');/*ind = $(this).index(),*/
                    $(this).addClass('active').siblings("li").removeClass('active');
                    Mom.createTagFrame("iframeCon", "../privatelyOwned/mMInit.html?typeid=" + typeId);
                });
            }
        },

        mMInit: function(){
            var typeId=Mom.getUrlParam('typeid');
            if(null==typeId || ''==typeId){
                Api.ajaxJson(Api.admin+'/api/workbench/WorkbenchTileTemplate/tileList/',{'typeId':''},function (result) {
                    btnclick(result);
                    renderul(result);
                });
            }else {
                Api.ajaxForm(Api.admin+'/api/workbench/WorkbenchTileTemplate/tileList',{typeId:typeId},function (result) {
                    btnclick(result);
                    renderul(result);
                });
            };
            function btnclick() {
                /*右上角查看框*/
                $('.notapproval').on('click','.checkView',function () {
                    var typeid=$(this).parents('li').attr('id'),typecode=$(this).parents('li').find('.typecode').val();
                    var winOptons = {
                        title:false, maxmin:false, btn:[]
                    };
                    Bus.openDialogCfg('', '/privatelyOwned/mMCheckView.html?typeId='+typeid+'&type='+typecode, '643px', '365px', winOptons);
                });
                /*修改*/
                $('.notapproval').on('click','div.btn-change',function () {
                    var typeid=$(this).parents('.typeid').attr('id'),typecode=$(this).parents('.typeid').find('.typecode').val();
                    Bus.openEditDialog('磁贴修改','./privatelyOwned/mMUpdate.html?typeId='+typeid+'&type='+typecode,'564px','405px');
                });
                /*删除*/
                $('.notapproval').on('click','div.btn-delete',function () {
                    var id=$(this).parents('.typeid').attr('id'),type=$(this).parents('.typeid').find('.typecode').val();
                    var data={
                        type:type,
                        id:id
                    };
                    console.log(id,type);
                    Bus.deleteItem('是否确定删除？',Api.admin+'/api/workbench/WorkbenchTileTemplate/delete',data,function(result, layerIndex, data){
                        if(result.success== true){
                            top.layer.closeAll();
                            location.reload();
                        }else{
                            Mom.layAlert(result.message);
                        }
                    });
                });
            };
            /*渲染磁贴列表*/
            function renderul(result) {
                var tileList=result.tileList;
                if(result.success){
                    if(tileList.length>0){
                        for(var i=0;i<tileList.length;i++){
                            var imgName=tileList[i].icon.split('.')[0];
                            var list='<li class="typeid" id="'+tileList[i].id+'">'+
                                '<input type="hidden" class="typecode" value="'+tileList[i].type+'">'+
                                '<div class="topcontent">'+
                                '<div class="checkView"></div>'+
                                '<div class="iconImage"><img src="../../../images/workPlace/'+imgName+'.jpg" alt=""></div>'+
                                '<div class="typeName">'+ '<span>'+tileList[i].title+'</span>'+ '</div>'+
                                '</div>'+
                                '<ul class="contentfrom">'+
                                '<li>编码: <span>'+tileList[i].tileTemplateCode+'</span></li>'+
                                '<li>应用: <span>'+tileList[i].appName+'</span></li>'+
                                '<li>数据来源: <span title="'+tileList[i].dataSource+'">'+tileList[i].dataSource+'</span></li>'+
                                '<li>' +
                                '<div class="btn btn-delete"><i class="fa fa-trash"></i>删除</div>' +
                                '<div class="btn btn-change"><i class="fa icon-change"></i>修改</div>'+
                                '</li>'+
                                '</ul>'+
                                '</li>';
                            $('.notapproval').append(list);
                        }
                        Mom.setFrameHeight(100);
                    }else{
                        Mom.layAlert('无相关数据，请注册磁贴后再进行查看！');
                    }
                }else{
                    Mom.layMsg(result.message);
                }
            };
        },

        viewDetails: function(){
            var Id = Mom.getUrlParam('typeId'), type = Mom.getUrlParam('type');
            var data = {
                "type": type,
                "id": Id
            };
            Api.ajaxForm(Api.admin+'/api/workbench/WorkbenchTileTemplate/view', data, function (result) {
                if(result.success){
                    var datain = result.workbenchTileTemplate;
                    Validator.renderData(datain, $('#tileDetail'));
                    $('#size').html(datain.sizex+' x '+datain.sizey);
                    var type=result.workbenchTileTemplate.type;
                    var imgUrl=result.workbenchTileTemplate.icon.split('.')[0];
                    if(type==8){
                        var id=result.workbenchTileTemplate.id;
                        var imgName='<img src="'+Api.admin+'/img/sys/SysUpload/showTileImg?id='+id+'&type='+type+'"  alt="">';
                        $('.iconImage').append(imgName)
                    }else if(type==1||type==2){
                        var imgName='<i id="iconImg" class="icon iconfont  '+result.workbenchTileTemplate.icon+'"></i>';
                        $('.iconImage').append(imgName)
                    }else{
                        var imgName='<img src="../../../images/workPlace/'+imgUrl+'.jpg" alt="">';
                        $('.iconImage').append(imgName)
                    }
                }else{
                    Mom.layMsg(result.massage)
                }

            });
        }
    };

    $(function(){
        //磁铁管理列表
        if($('#magnetManagement').length > 0){
            PageModule.listInit();
        }
        //渲染iframe
        else if($('#mMInit').length > 0){
            PageModule.mMInit();
        }
        //查看详情
        else if($('#mMCheckView').length > 0){
            PageModule.viewDetails();
        }
    });
});