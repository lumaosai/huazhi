require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);
    var PageModule = {
        //注册页面初始化
        regInit: function () {
            Api.ajaxJson(Api.admin + '/api/workbench/WorkbenchTileTemplate/tileTypeList', {}, function (result) {
                if (result.success) {
                    PageModule.renderleftlist(result);
                    PageModule.btnclick();
                } else {
                    Mom.layMsg(result.message)
                }
            });
            $('.rCsave').hide();
            // $('.rCsubmit').css({opacity:0});


        },
        //渲染左侧磁贴列表*/
        renderleftlist: function (result) {
            var $tileTypeList = result.tileTypeList;
            $($tileTypeList).each(function (i) {
                var imgdata = "../../images/workPlace/" + $tileTypeList[i].icon;
                if ($tileTypeList[i].type == 5) {
                    var leftlistMm = '';
                } else {
                    var leftlistMm = '<li>' +
                        '<img src="' + imgdata + '" alt="">' +
                        '<span>' + $tileTypeList[i].templateName + '</span>' +
                        '<input type="hidden" class="leftype" value="' + $tileTypeList[i].type + '">' +
                        '<input type="hidden" class="leftid" value="' + $tileTypeList[i].id + '">' +
                        '</li>';
                }
                $('.rCchange').find('.leftlist').append(leftlistMm);
            })
        },
        //按钮操作*/
        btnclick: function () {
            var $list = $('.rCchange').find('li');
            PageModule.ifelesleft();
            //磁贴框下一步*/
            $('#tile-choice').click(function () {
                var iconbox = $list.find('.iconbox');
                var type = $(iconbox).siblings('input.leftype').val();
                var id = $(iconbox).siblings('input.leftid').val();
                if (iconbox.length == 0) {
                    top.layer.confirm('请选择磁贴类型', {
                        btn: '继续',
                        icon: 0
                    });
                } else {
                    $('.rCsave').show();
                    PageModule.renderRContent(type, id);
                    PageModule.rendertitle('.formtbody', 'img.write', 'span.write', '../../images/reg-title_r1_c2.png', '../../images/reg-title_r2_c2.png')

                }

            });
            $(".btn-back").click(function () {
                Mom.winBack();

            });
            //磁贴信息返回磁贴类型选择*/
            $('.footbtn-back').click(function () {
                top.layer.confirm(
                    '确定返回上一步？<br>当前编辑内容将会被清空', {
                        btn: ['返回', '取消'],
                        icon: 0
                    }, function () {
                        $('.formtbody').find('tr').remove();
                        $('.rCsave').hide();
                        top.layer.closeAll()
                        PageModule.rendertitle('.formtbody', 'img.write', 'span.write', '../../images/reg-title_r1_c2.png', '../../images/reg-title_r2_c2.png')

                    }
                )

            });

            //填写信息后下一步*/
            $('#tile-submit').click(function () {
                var $appval = $('#appCode option:selected').text();
                $('#appName').val($appval);
                PageModule.doSubmit1();
            });

            //继续注册*/
            $('.regGoOn').click(function () {
                location.reload();
            });

            //管理磁贴*/
            $('.mManagement').click(function () {
                window.location.href = './magnetManageMent.html';
            });

        },
        //判断左侧已选择后不能再选磁贴
        ifelesleft: function () {
            var $list = $('.rCchange').find('li');
            var iconbox = $list.find('.iconbox');
            var icon = '<div class="iconbox"><i class="fa fa-check-circle"></i></div>';
            $list.each(function () {
                $(this).click(function () {
                    var trList = $('.formtbody').find('tr');
                    if (trList.length !== 0) {
                        top.layer.confirm('请点击返回按钮后，再重新选则磁贴', {
                            btn: '继续',
                            icon: 0
                        });
                    } else {
                        var type = $(iconbox).siblings('input').val();
                        $(this).append(icon).css('border-color', '#1ab394').siblings('li').css('border-color', '#e7e7e7').find('div.iconbox').remove();
                    }
                });
            })

        },
        //渲染右侧input*/
        renderRContent: function (data, id) {
            //所有数据对应html*/
            var dataMmhtml = {
                //编码-----*/
                tileTemplateCode: '<tr><td class="active require width-25">编码:</td>' +
                '<td class="width-75"><input id="tileTemplateCode" name="tileTemplateCode" type="text" require="true" value="" class="form-control valid1" > ' +
                '<label id="tileTemplateCode-error" class="error" for="tileTemplateCode" style="display:none"></label></td></tr>',
                //应用-----*/
                appCode: '<tr><td class="active require">应用:</td>' +
                '<td>' +
                '<select class="form-control" name="appCode" id="appCode" require="true"></select>' + '<input type="hidden" name="appName" id="appName" value="">' +
                '<input id="appCodeId"  name="appCodeId" type="hidden"  value="" class="form-control valid1" >' +
                '<label id="appCode-error" class="error" for="appCode" style="display:none"></label></td></tr>',
                //标题-----*/
                title: '<tr><td class="active require">标题:</td>' +
                '<td><input id="title" name="title" type="text" require="true" value="" class="form-control valid1">' +
                '<label id="title-error" class="error" for="title" style="display:none"></label></td></tr>',
                //数据源----*/
                dataSource: '<tr><td class="active require">数据源:</td>' +
                '<td><select id="dataSource" name="dataSource" type="text"  class="form-control select2 valid1" style="width:80%;" ></select>' +
                '</td></tr>',
                //磁贴大小--*/
                size: '<tr><td class="active">磁贴大小:</td>' +
                '<td>' +
                '<select id="sizex" name="sizex" class="form-control valid1"></select>' + '<i class="iconx">×</i>' +
                '<select id="sizey" name="sizey" class="form-control "></select>' +
                '<label id="sizex-error" class="error" for="sizex" style="display:none"></label></td></tr>',
                //描述*/
                des: '<tr><td class="active">描述:</td>' +
                '<td>' +
                '<textarea name="des" rows="4" id="des" class="form-control valid1"></textarea></td></tr>',
                //字段配置*/
                displayName: '<tr><td class="active require">字段配置:</td>' +
                '<td><input id="displayName" name="displayName" type="text" require="true" value="" class="form-control valid1">' +
                '<label id="displayName-error" class="error" for="displayName" style="display:none"></label></td></tr>',
                //间隔时间*/
                timeInterval: '<tr><td class="active">刷新频率:</td>' +
                '<td><input style="width:64%" id="timeInterval" name="timeInterval" type="number"  value="0" class="form-control valid1">（秒）' +
                '<label id="timeInterval-error" class="error" for="timeInterval" style="display:none"></label></td></tr>',
                //列名*/
                columnName: '<tr><td class="active require">列名:</td>' +
                '<td><input id="columnName" name="columnName" type="text" require="true" value="" class="form-control valid1">' +
                '<label id="columnName-error" class="error" for="columnName" style="display:none"></label></td></tr>',
                //每页条数*/
                pageSize: '<tr><td class="active require">每页条数:</td>' +
                '<td><input id="pageSize" name="pageSize" type="text" require="true" value="" class="form-control valid1">' +
                '<label id="pageSize-error" class="error" for="pageSize" style="display:none"></label></td></tr>',
                //图片*/
                icon: '<tr><td class="active">图标</td><td> <input id="nameImage" name="icon" maxlength="255" class="input-xlarge valid1" type="hidden" value=""/><ol id="nameImagePreview"></ol><a href="javascript:" id="filePicker" >+</a><label id="nameImage-error" class="error" for="nameImage" style="display:none"></label></td></tr>',
                //打开方式*/
                targer: '<tr><td class="active require">打开方式:</td>' +
                '<td><select class="form-control" require="true" name="targer" id="targer"><option value="">请选择</option><option value="0">Tab选项卡</option><option value="1">新窗口</option></select>' +
                '<input id="targerId" name="targerId" type="hidden" value="" class="form-control valid1">'
                +
                '<label id="targer-error" class="error" for="targer" style="display:none"></label></td></tr>',
                //文本内容*/
                content: '<tr><td class="active require">文本内容:</td>' +
                '<td><textarea name="content" rows="4" id="content" require="true" class="form-control valid1"></textarea>' +
                '<label id="content-error" class="error" for="content" style="display:none"></label></td></tr>',

                //——————背景颜色选择————————*/
                bgColor: '<tr><td class="active">背景颜色:</td><td><div class="bgColor">' + '<input class="valid1" type="hidden" id="bgColor" name="bgColor" >' +
                '<li class="dropdown color-picker">' +
                '   <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="true">' +
                '   <span><i class="fa fa-circle"></i></span>' +
                '   </a>' +
                '<ul class="dropdown-menu pull-right animated fadeIn" role="menu">' +
                '<li class="padder-h-xs">' +
                '	<table class="table color-swatches-table text-center no-m-b">' +
                '		<tbody>' +
                '           <tr>' +
                '				<td class="text-center colorr">' +
                '				    <a data-theme="blue" class="theme-picker">' +
                '					<i class="fa fa-circle blue-base"></i>' +
                '				    </a>' +
                '				</td>' +
                '				<td class="text-center colorr">' +
                '					<a data-theme="green" class="theme-picker">' +
                '						<i class="fa fa-circle green-base"></i>' +
                '					</a>' +
                '				</td>' +
                '				<td class="text-center colorr">' +
                '					<a data-theme="red" class="theme-picker">' +
                '						<i class="fa fa-circle red-base"></i>' +
                '					</a>' +
                '				</td>' +
                '			</tr>' +
                '			<tr>' +
                '			   <td class="text-center colorr">' +
                '		   	   	<a data-theme="purple" class="theme-picker">' +
                '			   		<i class="fa fa-circle purple-base"></i>' +
                '			   	</a>' +
                '			   </td>' +
                '			   <td class="text-center colorr">' +
                '			   <a data-theme="midnight-blue" class="theme-picker">' +
                '			   	<i class="fa fa-circle midnight-blue-base"></i>' +
                '		   	   </a>' +
                '			   </td>' +
                '				<td class="text-center colorr">' +
                '					<a data-theme="lynch" class="theme-picker">' +
                '						<i class="fa fa-circle lynch-base"></i>' +
                '					</a>' +
                '				</td>' +
                '			</tr>' +
                '       </tbody></table>' +
                '</li>' +
                '</ul>' +
                '</li>' + '</div>' + '</td></tr>',
                //图片*/
                icon1: '<tr class="picture"><td class="active require">图片上传</td><td> <input id="nameImage" name="icon" maxlength="255" class="input-xlarge valid1" type="hidden" value=""/><ol id="nameImagePreview"></ol><a href="javascript:" id="filePicker" >+</a><label id="nameImage-error" class="error" for="nameImage" ></label></td></tr>',
                //开放类型*/
                isPublic: '<tr><td class="active require">开放类型:</td>' +
                '<td>' +
                '<select class="form-control valid1" name="isPublic" id="isPublic" require="true">' +
                '<option value=0>私有磁贴</option>' +
                '<option value=1>公用磁贴</option>' +
                '</select>' + '</td></tr>',
                //是否在手机端显示*/
                displayMobile: '<tr><td class="active require">手机端显示:</td>' +
                '<td>' +
                '<select class="form-control valid1" name="displayMobile" id="displayMobile" require="ture">' +
                '<option value=0>不显示</option>' +
                '<option value=1 class="isMobile">显示</option>' +
                '</select>' +
                '</td></tr>',
                //图标icon选择*/
                icons: '<tr class="icons"><td class="active require">图标:</td><td><i id="iconIcon" class="icon iconfont"></i>&nbsp;&nbsp;<input id="icon" name="icon" type="text" class="valid1" require="true" value><a id="iconButton" href="javascript:" class="btn btn-primary color">选择</a>&nbsp;&nbsp;<input id="iconclear" class="btn btn-default" type="button" value="清除"></td></tr>'
            };
            var opXcommon = '<option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option>';
            var opYcommon = '<option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>';
            if (data == 1) {
                html = dataMmhtml.tileTemplateCode +
                    dataMmhtml.appCode +
                    dataMmhtml.title +
                    dataMmhtml.dataSource +
                    dataMmhtml.isPublic +
                    dataMmhtml.size +
                    dataMmhtml.icons +
                    dataMmhtml.bgColor +
                    dataMmhtml.targer +
                    dataMmhtml.des;
                $('.formtbody').html(html);
                var optionx = '<option value="1">1</option>';
                var optiony = '<option value="1">1</option>';
                $('#sizex').append(optionx);
                $('#sizey').append(optiony);
                PageModule.dsRender('shortcut');
                PageModule.iconChange(data);
                PageModule.iconClear()
            } else if (data == 2) {
                html = dataMmhtml.tileTemplateCode +
                    dataMmhtml.appCode +
                    dataMmhtml.title +
                    dataMmhtml.dataSource +
                    dataMmhtml.isPublic +
                    dataMmhtml.displayMobile +
                    dataMmhtml.size +
                    dataMmhtml.icons +
                    dataMmhtml.bgColor +
                    dataMmhtml.timeInterval +
                    dataMmhtml.des;
                $('.formtbody').html(html);
                var optionx = '<option value="2">2</option>';
                var optiony = '<option value="1">1</option>';
                $('#sizex').append(optionx);
                $('#sizey').append(optiony);
                PageModule.dsRender('num');
                PageModule.iconChange(data);
                PageModule.iconClear();
            } else if (data == 3) {
                html = dataMmhtml.tileTemplateCode +
                    dataMmhtml.appCode +
                    dataMmhtml.title +
                    dataMmhtml.dataSource +
                    dataMmhtml.isPublic +
                    dataMmhtml.displayMobile +
                    dataMmhtml.size +
                    dataMmhtml.timeInterval +
                    dataMmhtml.des;
                $('.formtbody').html(html);
                $('#sizex').append(opXcommon);
                $('#sizey').append(opYcommon);
                if (id == 3) {
                    PageModule.dsRender('chart_line');
                } else if (id == 4) {
                    PageModule.dsRender('chart_bar');
                } else if (id == 5) {
                    PageModule.dsRender('chart_pie');
                } else if (id == 6) {
                    PageModule.dsRender('chart_gauge');
                }

            } else if (data == 4) {
                html = dataMmhtml.tileTemplateCode +
                    dataMmhtml.appCode +
                    dataMmhtml.title +
                    dataMmhtml.dataSource +
                    dataMmhtml.isPublic +
                    dataMmhtml.size +
                    dataMmhtml.columnName +
                    dataMmhtml.pageSize +
                    dataMmhtml.timeInterval +
                    dataMmhtml.des;
                $('.formtbody').html(html);
                $('#sizex').append(opXcommon);
                $('#sizey').append(opYcommon);
                PageModule.dsRender('list');
                /*作者：贾旭光
                 *日期：2018.6.7
                 *描述：根据与产品沟通卡片类型磁贴目前不体现
                 */

                /*} else if(data==5){
                 html=dataMmhtml.tileTemplateCode+
                 dataMmhtml.appCode+
                 dataMmhtml.title+
                 dataMmhtml.dataSource+
                 dataMmhtml.displayName+
                 dataMmhtml.size+
                 dataMmhtml.des;
                 $('.formtbody').html(html);
                 $('#sizex').append(opXcommon);
                 $('#sizey').append(opYcommon);*/
            } else if (data == 6) {
                html = dataMmhtml.tileTemplateCode +
                    dataMmhtml.appCode +
                    dataMmhtml.title +
                    dataMmhtml.isPublic +
                    dataMmhtml.content +
                    dataMmhtml.size +
                    dataMmhtml.des;
                $('.formtbody').html(html);
                $('#sizex').append(opXcommon);
                $('#sizey').append(opYcommon);
            } else if (data == 7) {
                html = dataMmhtml.tileTemplateCode +
                    dataMmhtml.appCode +
                    dataMmhtml.title +
                    dataMmhtml.dataSource +
                    dataMmhtml.isPublic +
                    dataMmhtml.size +
                    dataMmhtml.des;
                $('.formtbody').html(html);
                $('#sizex').append(opXcommon);
                $('#sizey').append(opYcommon);
                PageModule.dsRender('panel');
            } else if (data == 8) {
                html = dataMmhtml.tileTemplateCode +
                    dataMmhtml.appCode +
                    dataMmhtml.title +
                    dataMmhtml.isPublic +
                    dataMmhtml.size +
                    dataMmhtml.icon1 +
                    dataMmhtml.des;
                $('.formtbody').html(html);
                $('#sizex').append(opXcommon);
                $('#sizey').append(opYcommon);
            }
            $('#mMtype').val(data);//每次点击左侧磁贴 这个参数更新
            $('#mMid').val(id);
            $('#isPublic').change(function () {
                if ($(this).val() == '1') {
                    $('.isMobile').hide();
                    $('#displayMobile').val(0)
                } else {
                    $('.isMobile').show();
                }
            });
            Api.ajaxJson(Api.admin + '/api/workbench/WorkbenchTileTemplate/selectAppName', {}, function (result) {
                PageModule.renderSelect(result)
            });
            PageModule.colorChange();
            //上传头像*/
            if ($('#nameImagePreview')) {
                PageModule.initWebuploader('/img/sys/SysUpload/upimg?imgPath=img',
                    '#filePicker',
                    '#nameImagePreview',
                    Api.admin + '/img/sys/SysUpload/showImg/' + id
                );
            };
            //选择颜色 点击执行改变颜色方法
            $('a.theme-picker').each(function () {
                $(this).on('click',function () {
                    PageModule.col(this);
                })
            });

        },
        //数据源下拉框渲染
        dsRender: function (type) {
            Api.ajaxJson(Api.admin + '/api/sys/SysDict/type/workbench_datasource_' + type, {}, function (result) {
                if (result.success) {

                    $('#dataSource').select2();
                    Bus.appendOptionsValue($('#dataSource'), result.rows, 'value', 'label');

                }
            });
        },
        //图标选择方法
        iconChange: function (data) {
            $('#iconButton').on('click', function () {
                var icon = $('#iconIcon').attr('class');
                openEdit('选择图标', 'privatelyOwned/icon-forWorkBench.html?data=' + data + '&class=' + icon, '770px', '445px');
            });
            function openEdit(title, url, width, height) {
                var _top = top;
                _top.layer.open({
                    type: 2,
                    area: [width, height],
                    title: title,
                    maxmin: false, //开启最大化最小化按钮
                    content: url,
                    btn: ['确定', '关闭'],
                    yes: function (index, layero) {
                        var body = _top.layer.getChildFrame('body', index);
                        if(body.find('.active>i').attr('class')) {
                            var classes = body.find('.active>i').attr('class'),
                                classActive = classes.split(' ');
                            $('#icon').val(classActive[2]);
                            $('#iconIcon').removeClass().addClass(classes);
                            top.layer.close(index);
                        }else{
                            Mom.layMsg('请选择图标');
                        }

                    },
                    cancel: function (index) {
                    }
                });
            }

        },
        //图标清除
        iconClear: function () {
            $('#iconclear').on('click', function () {
                $('#iconIconLabel').html('');
                $('#iconIcon').removeClass();
                $('#icon').val('');
            });
        },
        //渲染应用下拉内容
        renderSelect: function (data) {
            var appList = data.appList;
            $(appList).each(function () {
                var option = '<option value="' + this.appCode + '">' + this.appName + '</option>';
                $('#appCode').append(option);
            })

        },
        //修改图片
        initWebuploader: function (url,filePicker, ImagePreview,ImgUrl) {
            require(['/js/plugins/webUpLoader/webuploader.js'], function (webuploader) {
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
                if(cc==0){
                    $img.attr('src',null);
                }else{
                    $img.attr('src',ImgUrl)
                }
                var uploader = webuploader.create({
                    // 选完文件后，是否自动上传。
                    auto: true,
                    // // swf文件路径
                    swf: Api.admin + '/plugins/webUploader/Uploader.swf',

                    // 文件接收服务端。
                    server: Api.admin + url,
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
            })

        },
        //渲染递交内容的标题
        rendertitle: function (tbody, writeimg, span, src1, src2) {
            var trList = $(tbody).find('tr');
            if (trList.length > 0) {
                $(writeimg).attr('src', src1);
                $(span).css({'color': '#1ab394'}).parent('li').css({'border-bottom': '1px solid #1ba394'})
            } else {
                $(writeimg).attr('src', src2);
                $(span).css({'color': 'black'}).parent('li').css({'border-bottom': '1px solid #e7e7e7'})
            }

        },
        //8080端口提交数据
        doSubmit1: function () {
            if(!Validator.valid(document.forms[0],1.1)){
                return;
            }
            var formId = PageModule.getSubmitFormId();
            var formObj = $(formId);
            var url = formObj.attr('action');
            var formdata = formObj.serializeJSON();
            Api.ajaxJson(Api.admin+url,JSON.stringify(formdata),function(result){
                if (result.success == true) {
                    Mom.layMsg('已成功提交', {time: 1000});
                    $('.rCsubmit').css({opacity:1});
                    PageModule.renderRight(result);
                    $('.footbtn-back,.footbtn-go').hide();
                    $('span.subSuccess').css({'color': '#1ab394'}).parent('li').css({'border-bottom': '1px solid #1ba394'});
                    $('img.subSuccess').attr('src', '../../images/reg-title_r1_c3.png')
                } else {
                    Mom.layAlert(result.message)
                }
            });


        },
        //渲染右侧成功内容
        renderRight: function () {
            $('#targerId').val($('#targer option:selected').text());
            $('#appCodeId').val($('#appCode option:selected').text());
            var listLi = $('.iconbox').parent('li').clone();
            $('.subContent').find('ul.leftlist').html(listLi);
            var $trListtext = $('.formtbody').find('label.pull-right').clone();
            $($trListtext).find('font').remove();
            $('#nameImage').val($('.thumbnail>img').attr('src'));
            $($trListtext).each(function (i) {
                var spaninner = $('.valid1').eq(i).val();
                var $successList = '<li><div class="leftboxdiv">' + $(this).text() + '</div><span>' + spaninner + '</span></li>';
                $('.subContent').find('ul.rightlist').append($successList);
            })
            var sizey = $('#sizey').val(), sizespan = '×<span>' + sizey + '</span>';
            $('.subContent').find('div:contains("磁贴大小")').parent('li').append(sizespan)

        },
        //调色版
        colorChange: function () {
            var colorBoxArr = ['blue-base', 'green-base', 'red-base', 'purple-base', 'midnight-blue-base', 'lynch-base'];

            Api.ajaxJson(Api.admin + '/api/sys/SysDict/type/workbench_bgcolor_num', {}, function (result) {
                for (var i = 0; i < colorBoxArr.length; i++) {
                    $('.' + colorBoxArr[i]).css({'color': result.rows[i].value});
                    if(i==0){
                        $('#bgColor').val(result.rows[0].value);//添加默认颜色
                        $('.bgColor>li>a i').css({'color':result.rows[0].value});
                    }
                }
            });

        },
        //点击按钮改变颜色
        col: function (this_) {
            var itemColor = PageModule.colorRGB2Hex($(this_).children('i.fa-circle').css('color'));
            $('.bgColor>li>a i').css({'color': itemColor});
            $('#bgColor').val(PageModule.colorRGB2Hex($('.bgColor>li>a i').css('color')))
        },
        //rgb转换成16进制
        colorRGB2Hex: function (color) {
            if (color == undefined) {
                layerAlert('未选定颜色请重新选择')
            } else {
                var rgb = color.split(',');
                var r = parseInt(rgb[0].split('(')[1]);
                var g = parseInt(rgb[1]);
                var b = parseInt(rgb[2].split(')')[0]);

                var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                return hex;
            }
        },
        //提交时使用*/
        getSubmitFormId: function () {
            return "#inputForm";
        }
    };

    $(function () {
        //磁铁管理列表
        if ($('#registerMmIndex').length > 0) {
            PageModule.regInit();
        }

    });
});