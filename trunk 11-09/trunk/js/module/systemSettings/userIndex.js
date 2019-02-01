require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        listInit: function(){
            var treeId = Mom.getUrlParam("treeId");
            $('#treeId').val(treeId);

            require(['ztree_my','Page'],function(ZTree){
                var page = new Page();
                window.pageLoad = function () {
                    var data = {
                        companyId: $("#companyId").val(),
                        loginNameParam: $('#loginName').val(),
                        deptId: $('#officeId').val(),
                        nameParam: $('#name').val(),
                        treeId: $('#treeId').val()
                    };
                    page.init(Api.admin+"/api/sys/SysUser/page", data, true, function (tableData, result) {
                        dataout(tableData);
                        clickButton();
                    });
                };
                pageLoad();

                //点击重置按钮
                $("#reset-btn").click(function () {
                    $("#companyName,#companyId,#loginName,#officeName,#officeId,#name").val("");
                    page.reset(["nameParam","deptId","loginNameParam","companyId"]);
                });

                var ztree = new ZTree();
                //加载左侧树
                Api.ajaxJson(Api.admin+'/api/sys/SysOrg/orgTree',{},function(result){
                    if(result.success){
                        var setting = {
                            callback: {
                                onClick: function (e, treeId, node){
                                    if(node.id){
                                        updatason(node);
                                    }
                                }
                            }
                        }
                        var ztreeObj = ztree.loadData($('#tree'), result.rows, false, setting);
                    }
                });

                function updatason(node){
                    var data;
                    if(node.type==1){
                        data={"companyId":node.id};
                    }else{
                        data={"deptId":node.id};
                    }
                    page.init(Api.admin+"/api/sys/SysUser/page", data, true, function (tableData, result) {
                        dataout(tableData); //创建table
                        clickButton();       //加载点击事件
                    })
                }
                function clickButton() {
                    $('.btn-check').click(function () {
                        var id = $(this).parents("tr").find('.i-checks').attr('id');
                        Bus.openDialog('查看用户信息', './systemSettings/userIndexInner.html?id=' + id, '800px','420px');
                    });
                    $('.btn-change').click(function () {
                        var id = $(this).parents("tr").find('.i-checks').attr('id');
                        Bus.openEditDialog('修改用户信息', './systemSettings/userIndexInner.html?id=' + id, '800px','420px');
                    });
                    $('.btn-delete').click(function () {
                        var id = $(this).parents("tr").find('.i-checks').attr('id');
                        Bus.deleteItem('确定要删除该用户吗',Api.admin+'/api/sys/SysUser/delete/',{ids:id});
                    });
                }
            });

            $('#companyName').on('dblclick',selCompany);
            $('#companyButton').on('click',selCompany);
            function selCompany(){
                var data = {type : '1'};
                var options = {defaultVals: $('#companyId').val() };
                Bus.openOrgSelect('选择公司',data,options,function(selResult, layIdx, layero){
                    var nodes = selResult.nodes;
                    for(var i=0; i<nodes.length; i++){
                        var type = nodes[i].type;
                        if(type!='0' && type!='1'){
                            Mom.layMsg('请选择公司');
                            return false;
                        }
                    }
                    $('#companyId').val(selResult.id);
                    $('#companyName').val(selResult.name);
                    return true;
                },function(){
                    $('#companyId').val('');
                    $('#companyName').val('');
                });
            }
            $('#officeName').on('dblclick',selOffice);
            $('#officeButton').on('click',selOffice);
            function selOffice(){
                var data = { companyId:$('#companyId').val() };
                var options = {defaultVals: $('#officeId').val() };
                Bus.openOrgSelect('选择部门',data,options,function(selResult, layIdx, layero){
                    var nodes = selResult.nodes;
                    for(var i=0; i<nodes.length; i++){
                        var type = nodes[i].type;
                        if(type != '2'){
                            Mom.layMsg('请选择部门');
                            return false;
                        }
                    }
                    $('#officeId').val(selResult.id);
                    $('#officeName').val(selResult.name);
                    return true;
                },function(){
                    $('#officeId').val('');
                    $('#officeName').val('');
                });
            }
            //   ajax请求渲染datatable数据
            function dataout(data) {
                $('#treeTable').dataTable({
                    "bSort": true,
                    "aoColumnDefs": [
                        {"bSortable": false, "aTargets": [0, 5]}
                    ],
                    "data": data,
                    "columns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": "loginName", "width": "auto",'sClass':"center"},
                        {"data": "name", "width": "auto",'sClass':"center"},
                        {"data": "phone", "width": "auto",'sClass':"center"},
                        {"data": "mobile", "width": "auto",'sClass':"center"},
                        {"data": "id", "width": "auto","orderable": false, "defaultContent": "", 'sClass':'center  autoWidth',
                            "render": function (data, type, row, meta) {
                                return data = "<a class='btn btn-info btn-xs  btn-check'><i class='fa fa-search-plus'></i>查看</a >" +
                                    "<a class='btn btn-success btn-xs btn-change'><i class='fa icon-change'></i>修改</a >" +
                                    "<a class='btn btn-danger btn-xs btn-delete'><i class='fa fa-trash-o' ></i>删除</a >"
                            }
                        }],

                });
                renderIChecks();
            }
        },

        formInit: function(){
            Mom.include('myCss', '', [
                '../css/comInnerTable.css'
            ]);
            var id = Mom.getUrlParam('id');
            $('#id').val(id);
            if (id) {
                /*此处后端接口  id为弹出窗口自带的id 通过浏览器方法传参得到*/
                var url = Api.admin+"/api/sys/SysUser/form/"+id;
                Api.ajaxJson(url, {}, function (result) {
                    if (result.success) {
                        $('#loginName').attr('readonly','readonly');
                        //先渲染下拉菜单
                        getSubmitFormId();
                        // 所属岗位
                        var jobTypeList = result.jobTypeList;
                        Bus.appendOptionsValue('#jobTypeList',jobTypeList,'value','label');
                        // $('#jobTypeList').select2().val(result.sysUser.job).trigger('change');
                        //归属部门
                        var deptArr = result.sysUser.deptList;
                        var deptHtml="";
                        if(deptArr.length>0){
                            $(deptArr).each(function(i,o){
                                if(o.type != '5'){
                                    deptHtml += "<span>"+o.name+"</span>";
                                }
                            });
                            $('.deptList').empty().append(deptHtml);
                        }

                        //用户角色
                        Bus.appendOptionsValue('#roleName',result.allRoleList,'id','name');

                        //渲染数据
                        Validator.renderData(result.sysUser, $('#inputForm'));

                        $('#companyName').val(result.company.name);

                        /*上传头像*/
                        require(['../js/plugins/webUpLoader/js/webuploader.js'],function(WebUploader){
                            initWebuploader(WebUploader,'/img/sys/SysUpload/upimg?imgPath=img',
                                '#filePicker',
                                "#nameImagePreview",
                                Api.admin+'/img/sys/SysUpload/showImg/'+id
                            );
                        });

                        $('.passwordTr').hide();
                    } else {
                        Mom.layMsg(result.message);
                    }

                });

            }else{
                var url = Api.admin+"/api/sys/SysUser/form/-1";
                Api.ajaxJson(url, {}, function (result) {
                    if(result.success){
                        // 所属岗位
                        var jobTypeList = result.jobTypeList;
                        Bus.appendOptionsValue('#jobTypeList',jobTypeList,'value','label');
                        //用户角色
                        Bus.appendOptionsValue('#roleName',result.allRoleList,'id','name');
                        /*上传头像*/
                        require(['../js/plugins/webUpLoader/js/webuploader.js'],function(WebUploader){
                            initWebuploader(WebUploader,'/img/sys/SysUpload/upimg?imgPath=img',
                                '#filePicker',
                                "#nameImagePreview",
                                null
                            );
                        });
                        getSubmitFormId();
                    }else{
                        Mom.layMsg(result.message)
                    }
                })
            }

            //表单页面：绑定‘归属公司’点击事件
            $('#companyName').on('dblclick',selCompany);
            $('#companyButton').on('click',selCompany);
            function selCompany(){
                var data = {type : '1'};
                var options = {defaultVals: $('#companyId').val() };
                Bus.openOrgSelect('选择公司',data,options,function(selResult, layIdx, layero){
                    var nodes = selResult.nodes;
                    for(var i=0; i<nodes.length; i++){
                        var type = nodes[i].type;
                        if(type!='0' && type!='1'){
                            Mom.layMsg('请选择公司');
                            return false;
                        }
                    }
                    $('#companyId').val(selResult.id);
                    $('#companyName').val(selResult.name);
                    return true;
                });
            }

            /*清除头像*/
            function getSubmitFormId() {
                $('#filePicker').children('div').attr('style','');
                return "#inputForm";
            }

            //上传头像
            function initWebuploader(WebUploader,url,filePicker, ImagePreview,ImgUrl) {
                var $list = $(ImagePreview),//获取文件列表
                    $li = $(
                        '<div id="" class="file-item thumbnail">' +
                        '<img >' +
                        '</div>'
                    );
                $img = $li.find('img');
                $div =$li.find('div');
                $list.append($li);// $list为容器jQuery实例
                var cc=$('#nameImage').val();
                // if(cc==0){
                //     $img.attr('src',null);
                // }else{
                    $img.attr('src',ImgUrl);
                // }
                var uploader = WebUploader.create({
                    // 选完文件后，是否自动上传。
                    auto: true,
                    // // swf文件路径
                    swf: Api.admin+'/js/plugins/webUploader/Uploader.swf',

                    // 文件接收服务端。
                    server: Api.admin+url,
                    // 选择文件的按钮。可选。
                    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                    pick: {
                        id: filePicker,
                        multiple:false
                    },

                    // 只允许选择图片文件。
                    accept: {
                        title: 'Images',
                        extensions: 'gif,jpg,jpeg,bmp,png',
                        mimeTypes: 'image/*'
                    },
                    fileNumLimit: 1

                });
                uploader.on('fileQueued', function (file) {
                    // 创建缩略图
                    uploader.makeThumb(file, function (error, src) {
                        if (error) {
                            $img.replaceWith('<span>不能预览</span>');
                            return;
                        }
                        $img.attr('src', src);//设置预览图
                    }, 100, 100); //100x100为缩略图尺寸

                });
                uploader.on( 'uploadSuccess', function( file,response) {
                    $('#nameImage').val(response.saveName);
                });
            }
        },
    };

    $(function(){
        if($('#userIndex').length > 0){
            PageModule.listInit();
        }
        else if($('#userIndexInner').length > 0){
            PageModule.formInit();
    }
    });
});