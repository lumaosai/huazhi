require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        init: function(){
            // tab切换功能
            $('.tab-nav').unbind('click').on('click','li',function(){
                var index = $(this).index();
                $(this).addClass('active').siblings().removeClass('active');
                $('#tables .table-item').eq(index).addClass('active').siblings().removeClass('active');
                if(index == 1){
                    PageModule.sendInit();
                }else if(index == 2){
                    PageModule.drafts();
                }else{
                    PageModule.init();
                }
            });

            $('#btn-add').click(function(){
                location.href  = '/mail/writeLetters.html';
            })
            //引入Page插件
            require(['Page'], function () {
                var page = new Page();

                window.pageLoad = function () {
                    var obj = [{
                        id:'1',
                        state:'已读',
                        sendPerson:'张三',
                        title:'过年了',
                        content:'哈哈哈哈哈哈哈',
                        time:'2019-12-12'
                    },{
                        id:'2',
                        state:'已读',
                        sendPerson:'李四',
                        title:'过年了吗',
                        content:'哈哈哈哈哈哈哈',
                        time:'2019-12-12'
                    }]

                    renderTableData(obj);
                    //修改默认每页显示条数http://localhost/json/fwork/momgongchang.json
                    //page.init(Const.mtrl + "/api/fm/Fctr/page", data, true, function (tableData) {
                    //    renderTableData(tableData);
                        $('.btn-check').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            location.href = '/mail/stationLetterView.html?id=' + id;
                            //Bus.openDialog('查看邮件', '/mail/stationLetterView.html?id=' + id, '700px', '320px');
                        });
                        $('.btn-change').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            location.href = '/mail/writeLetters.html?id=' + id;
                        });
                        //$('.btn-delete').click(function () {
                        //    var id = $(this).parents("tr").find('.i-checks').attr('id');
                        //    Bus.deleteItem('确定要删除该邮件吗', Const.mtrl + '/api/fm/Fctr/delete/', {ids:id});
                        //});
                    //});
                };
                //$("#btn-search").click(function () {
                //    pageLoad();
                //});

                pageLoad();
            });

            function renderTableData(tableData) {
                $('#treeTable').dataTable({
                    "bSort": true,
                    //"bFilter":true,
                    "aoColumnDefs": [
                        {"bSortable": false, "aTargets": [0 ]}
                    ],
                    "data": tableData,
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": "state", 'sClass': " center", "width": "8%"},
                        {"data": "sendPerson", 'sClass': "center ", "width": "12%"},
                        {"data": "title", 'sClass': "center", "width": "12%"},
                        {"data": "content", 'sClass': "center","width": "20%"},
                        {"data": "time", 'sClass': "center", "width": '8%'},
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn btn-info btn-xs  btn-check '><i class='fa fa-search-plus'></i>查看</a >" +
                                    "<a class='btn btn-success btn-xs btn-change '><i class='fa fa-edit'></i>回复</a >";
                                //return "<a class='btn-edit check-btn' title='查看'><i class='fa fa-search-plus '></i></a >" +
                                //    "<a class='btn-edit btn-reply' title='回复'><i class='fa fa-edit'></i></a >";
                            }
                        }]
                });
                renderIChecks();
            }
        },

        //已发送
        sendInit: function(){
            window.pageLoad2 = function () {
                var obj = [{
                    id:'1',
                    state:'已读',
                    sendPerson:'张三',
                    title:'过年了',
                    content:'哈哈哈哈哈哈哈',
                    time:'2019-12-12'
                },{
                    id:'2',
                    state:'已读',
                    sendPerson:'李四',
                    title:'过年了吗',
                    content:'哈哈哈哈哈哈哈',
                    time:'2019-12-12'
                }]

                renderTableData(obj);
                //修改默认每页显示条数http://localhost/json/fwork/momgongchang.json
                //page.init(Const.mtrl + "/api/fm/Fctr/page", data, true, function (tableData) {
                //    renderTableData(tableData);
                $('.btn-check').click(function () {
                    var id = $(this).parents("tr").find('.i-checks').attr('id');
                    location.href = '/mail/stationLetterView.html?id=' + id;
                    //Bus.openDialog('查看邮件', '/mail/stationLetterView.html?id=' + id, '700px', '320px');
                });
                $('.btn-change').click(function () {
                    var id = $(this).parents("tr").find('.i-checks').attr('id');
                    location.href = '/mail/writeLetters.html?id=' + id;
                });
                //    $('.btn-edit').click(function () {
                //        var id = $(this).parents("tr").find('.i-checks').attr('id');
                //        Bus.openEditDialog('修改MOM工厂', '/material/factoryModels/momFactoryView.html?id=' + id, '700px', '320px');
                //    });
                //    $('.btn-delete').click(function () {
                //        var id = $(this).parents("tr").find('.i-checks').attr('id');
                //        Bus.deleteItem('确定要删除该工厂吗', Const.mtrl + '/api/fm/Fctr/delete/', {ids:id});
                //    });
                //});
            };
            pageLoad2();

            function renderTableData(tableData) {
                $('#treeTable2').dataTable({
                    "bSort": true,
                    //"bFilter":true,
                    "aoColumnDefs": [
                        {"bSortable": false, "aTargets": [0 ]}
                    ],
                    "data": tableData,
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": "sendPerson", 'sClass': "center ", "width": "12%"},
                        {"data": "title", 'sClass': "center", "width": "12%"},
                        {"data": "content", 'sClass': "center","width": "12%"},
                        {"data": "time", 'sClass': "center", "width": '8%'},
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn btn-info btn-xs  btn-check '><i class='fa fa-search-plus'></i>查看</a >" +
                                    "<a class='btn btn-success btn-xs btn-change '><i class='fa fa-edit'></i>回复</a >";
                            }
                        }]
                });
                renderIChecks();
            }
        },
        //草稿箱
        drafts: function(){
            window.pageLoad3 = function () {
                var obj = [{
                    id:'1',
                    state:'已读',
                    sendPerson:'张三',
                    title:'过年了',
                    content:'哈哈哈哈哈哈哈',
                    time:'2019-12-12'
                },{
                    id:'2',
                    state:'已读',
                    sendPerson:'李四',
                    title:'过年了吗',
                    content:'哈哈哈哈哈哈哈',
                    time:'2019-12-12'
                }]

                renderTableData(obj);
                //修改默认每页显示条数http://localhost/json/fwork/momgongchang.json
                //page.init(Const.mtrl + "/api/fm/Fctr/page", data, true, function (tableData) {
                //    renderTableData(tableData);
                $('.btn-check').click(function () {
                    var id = $(this).parents("tr").find('.i-checks').attr('id');
                    location.href = '/mail/stationLetterView.html?id=' + id;
                    //Bus.openDialog('查看邮件', '/mail/stationLetterView.html?id=' + id, '700px', '320px');
                });
                $('.btn-change').click(function () {
                    var id = $(this).parents("tr").find('.i-checks').attr('id');
                    location.href = '/mail/writeLetters.html?id=' + id;
                });
                //    $('.btn-edit').click(function () {
                //        var id = $(this).parents("tr").find('.i-checks').attr('id');
                //        Bus.openEditDialog('修改MOM工厂', '/material/factoryModels/momFactoryView.html?id=' + id, '700px', '320px');
                //    });
                //    $('.btn-delete').click(function () {
                //        var id = $(this).parents("tr").find('.i-checks').attr('id');
                //        Bus.deleteItem('确定要删除该工厂吗', Const.mtrl + '/api/fm/Fctr/delete/', {ids:id});
                //    });
                //});
            };
            pageLoad3();
            function renderTableData(tableData) {
                $('#treeTable3').dataTable({
                    "bSort": true,
                    //"bFilter":true,
                    "aoColumnDefs": [
                        {"bSortable": false, "aTargets": [0 ]}
                    ],
                    "data": tableData,
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": "sendPerson", 'sClass': "center ", "width": "12%"},
                        {"data": "title", 'sClass': "center", "width": "12%"},
                        {"data": "content", 'sClass': "center","width": "12%"},
                        {"data": "time", 'sClass': "center", "width": '8%'},
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn btn-info btn-xs  btn-check '><i class='fa fa-search-plus'></i>查看</a >" +
                                    "<a class='btn btn-success btn-xs btn-change '><i class='fa fa-edit'></i>回复</a >";
                            }
                        }]
                });
                renderIChecks();
            }
        },
        //编辑页面
        stationLetterView: function() {
            var id =Mom.getUrlParam('id');
            $('#return').click(function(){
                history.go(-1);
            })
            $('#reply').click(function(){
                location.href  = '/mail/writeLetters.html?id=' + id;
                //Bus.openDialog('写信', '/mail/writeLetters.html?id=' + id, '700px', '320px');
            })
            //if(id){
            //    //http://localhost/json/fwork/workedit.json
            //    Api.ajaxJson(Const.mtrl + "/api/fm/Fctr/form/" + id,{},function(result){
            //        if(result.success){
            //            Bus.appendOptionsValue('#fctrType',result.fctrType,'value','label');
            //            Validator.renderData(result.Fctr, $('#inputForm'));
            //        }
            //        $('#fctrNo').attr('disabled','disabled');
            //    });
            //}else{
            //    Api.ajaxJson(Const.mtrl + "/api/fm/Fctr/form/0",{},function(result){
            //        if(result.success){
            //            Bus.appendOptionsValue('#fctrType',result.fctrType,'value','label');
            //        }
            //    });
            //}

        },
    //    写信
        writeLetters:function(){
            //require(['http://127.0.0.1:80/js/plugins/utf8-jsp/ueditor.config.js','http://127.0.0.1:80/js/plugins/utf8-jsp/ueditor.all.js','http://127.0.0.1:80/js/plugins/utf8-jsp/lang/zh-cn/zh-cn.js'],function(){
            //    var ue = UE.getEditor('myEditor1');
            //})
            require(['ueditor'],function(UE){
                console.log(UE);
                var ue = UE.getEditor('myEditor1');
                ue.ready(function() {
                    /**修复 设置默认字号**/
                    ue.execCommand('fontsize', '16px');       //字号
                })
                /*上传头像*/
                require([cdnDomain+'/js/plugins/webUpLoader/js/webuploader.js'],function(WebUploader){
                    //ue.commands['luimgupload'] = {
                    //    execCommand : function(){
                    //
                    //    },
                    //    queryCommandState:function(){
                    //    }
                    //}
                    initWebuploader(WebUploader,'/img/sys/SysUpload/upimg?imgPath=img',
                        '#filePicker',
                        "#nameImagePreview",
                        null
                    );


                });
                //上传头像
                function initWebuploader(WebUploader,url,filePicker, ImagePreview,ImgUrl) {
                    var uploader = WebUploader.create({
                        // 选完文件后，是否自动上传。
                        auto: true,
                        // // swf文件路径
                        swf: Const.admin+'/js/plugins/webUploader/Uploader.swf',

                        // 文件接收服务端。
                        server: Const.admin+url,
                        // 选择文件的按钮。可选。
                        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                        pick: {
                            id: '#edui3',
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
                            console.log(src,6666666);
                            $('#img').attr('src',src);
                            //ue.setContent('<img src="'+src+'">');
                            ue.execCommand('insertHtml','<img src="https://cccc-test.oss-cn-beijing.aliyuncs.com/home/upload/0ab2f071-7d59-4f1e-8d22-8dc5f4e54c4c.jpg">');

                            //if (error) {
                            //    $img.replaceWith('<span>不能预览</span>');
                            //    return;
                            //}
                            //$img.attr('src', src);//设置预览图
                        }, 100, 100); //100x100为缩略图尺寸

                    });
                    uploader.on( 'uploadSuccess', function( file,response) {
                        $('#nameImage').val(response.saveName);
                    });
                }
            });
            var id =Mom.getUrlParam('id');
            $('#return').click(function(){
                history.go(-1);
            });
            $('#reply').click(function(){
                location.href  = '/mail/stataionLetter.html' ;
            });

            $('#receiverButton').unbind('click').on('click',function(){
                Bus.openEditDialog('选择用户', '/mail/selectUser.html', '365px', '385px',saveCallback);
            });

            function saveCallback(layerIdx,layero){
                var iframeWin = layero.find('iframe')[0].contentWindow;
                var formData = iframeWin.getFormData();
                if(formData){
                    var str = formData.join(',');
                    $('#receiverName').val(str);
                    top.layer.close(layerIdx);
                }

            }
        },

    //    选择用户
        selectUser: function(){
            require(['ztree_my'], function (ZTree) {
                var treeObj;
                var ztree = new ZTree();
                //调取接口拿到ztree数据
                Api.ajaxJson(Const.admin+'/api/sys/SysOrg/orgTree', {}, function (result) {
                    if (result.success) {
                        //配置ztree参数
                        var ztreeSetting = {
                            data: {
                                keep: {
                                    parent: false,
                                    leaf: true
                                },
                                simpleData: {
                                    enable: true,
                                    idKey: "id",
                                    pIdKey: "pId"
                                },
                                key: {
                                    name: "name"
                                }

                            },
                            check:{
                                chkboxType:{"Y":"ps","N":"ps"}
                            }
                        };
                        //渲染ztree
                        treeObj = ztree.loadData($("#zTree"), result.rows, true, ztreeSetting);
                        //模糊查询
                        ztree.registerSearch(treeObj, $('#wait_searchText'), 'name');

                       window.getFormData = function(){
                           var node = treeObj.getCheckedNodes(true);
                           console.log(node);
                           if(node.length == 0){
                               Mom.layMsg('请选择用户') ;
                               return false;
                           }
                           var nodeArr = node.filter(function(item){
                               return !item.children;
                           })
                           console.log(nodeArr);
                           var nameArr = [];
                           nodeArr.forEach(function(item){
                               nameArr.push(item.name);
                           });
                           return nameArr;
                       }
                    }
                });
            });
        }
    };
    $(function () {
        if ($('#stataionLetter').length > 0) {
            PageModule.init()
        }else if($('#stationLetterView').length > 0){
            PageModule.stationLetterView();
        }else if($('#writeLetters').length > 0){
            PageModule.writeLetters();
        }else if($('#selectUser').length > 0){
            PageModule.selectUser();
        }
    });
})