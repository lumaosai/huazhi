require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {

        /*——————磁贴修改——————*/
        //初始化
        updateinit: function () {
            var Id = Mom.getUrlParam('typeId'), type = Mom.getUrlParam('type');
            var data = {
                "type": type,
                "id": Id
            };
            Api.ajaxForm(Api.admin + '/api/workbench/WorkbenchTileTemplate/form', data, function (result) {
                PageModule.renderRContent(type, Id, result);
                if (result.workbenchTileTemplate.bgColor != '') {
                    $('.bgColor .color-picker>a .fa-circle').css('color', result.workbenchTileTemplate.bgColor)
                }
                PageModule.colorChange();
            });
        },
        //渲染表单
        renderRContent: function (data, id, results) {
            /*所有数据对应html*/
            var dataMmhtml = {
                /*编码-----*/
                tileTemplateCode: '<tr><td class="active require width-25" >编码:</td>' +
                '<td class="width-75"><input id="tileTemplateCode" name="tileTemplateCode" type="text" require="true" value="" class="form-control valid" ></td></tr>',
                /*应用-----*/
                appCode: '<tr><td class="require active">应用:</td><td ><select class="form-control valid" name="appCode" id="appCode" require="true"><option value="">请选择</option></select></td></tr>',
                /*标题-----*/
                title: '<tr><td class="require active">标题:</td><td class=""><input id="title" name="title" type="text" require="true" value="" class="form-control valid"></td></tr>',
                /*数据源----*/
                dataSource: '<tr><td class="require active">数据源:</td><td><select id="dataSource"  name="dataSource" type="text"  style="width:80%;" class="form-control select2 valid1" ></select></td></tr>',
                /*磁贴大小--*/
                size: '<tr class="sizexy"><td class="active">磁贴大小:</td>' +
                '<td class="" >' +
                '<select id="sizex" name="sizex"  class="form-control valid"></select>' +
                '<i class="iconx">×</i>' +
                '<select id="sizey" name="sizey"  class="form-control "></select>' +
                '</td>' +
                '</tr>',
                /*描述*/
                des: '<tr><td class="active">描述:</td>' +
                '<td>' +
                '<textarea name="des" rows="4" id="des" class="form-control valid"></textarea></td></tr>',
                /*字段配置*/
                displayName: '<tr><td class="require active">字段配置:</td>' +
                '<td class=""><input id="displayName" name="displayName" type="text" require="true" value="" class="form-control valid">' + '</td></tr>',
                /*间隔时间*/
                timeInterval: '<tr><td class="active">刷新间隔:</td>' +
                '<td class=""><input id="timeInterval" name="timeInterval" type="text"  value="" class="form-control valid">（秒）' +
                '</td></tr>',
                /*列名*/
                columnName: '<tr><td class="require active">列名:</td>' +
                '<td class="" colspan="3"><textarea id="columnName" name="columnName" rows="4" require="true" class="form-control valid"></textarea>' +
                '</td></tr>',
                /*每页条数*/
                pageSize: '<tr><td class="require active">每页条数:</td>' +
                '<td class=""><input id="pageSize" name="pageSize" type="text" require="true" value="" class="form-control valid">' +
                '</td></tr>',
                /*图片*/
                icon: '<tr><td class="require active">图标:</td><td class=" "><a href="javascript:" class="" id="filePicker" >选择</a><input id="nameImage" name="icon" maxlength="255"  require="true" class="input-xlarge form-control valid" type="text" value="0"/></td></tr>',
                /*打开方式*/
                targer: '<tr><td class="require active">打开方式:</td>' +
                '<td class=""><select class="form-control valid" require="true" name="targer" id="targer"><option value="">请选择</option><option value="0">Tab选项卡</option><option value="1">页签</option></select>' +
                '</td></tr>',
                /*文本内容*/
                content: '<tr><td class="require active">文本内容:</td>' +
                '<td class=""><textarea name="content" rows="4" id="content" require="true" class="form-control valid"></textarea>' +
                '</td></tr>',
                /*背景颜色*/
                bgColor: '<tr class="bgColor "><td class="active">背景颜色:</td>' +
                '<td class="width-80"><input class="valid1" type="hidden" id="bgColor" name="bgColor" >' + '<div class="dropdown color-picker">' +
                '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="true">' +
                '<span><i class="fa fa-circle"></i></span>' +
                '</a>' +
                '<ul class="dropdown-menu pull-right animated fadeIn" role="menu">' +
                '<li class="padder-h-xs">' +
                '	<table class="table color-swatches-table text-center no-m-b">' +
                '		<tbody>' +
                '           <tr>' +
                '				<td class="text-center colorr">' +
                '				    <a  data-theme="blue" class="theme-picker">' +
                '					<i class="fa fa-circle blue-base"></i>' +
                '				    </a>' +
                '				</td>' +
                '				<td class="text-center colorr">' +
                '					<a  data-theme="green" class="theme-picker">' +
                '						<i class="fa fa-circle green-base"></i>' +
                '					</a>' +
                '				</td>' +
                '				<td class="text-center colorr">' +
                '					<a   data-theme="red" class="theme-picker">' +
                '						<i class="fa fa-circle red-base"></i>' +
                '					</a>' +
                '				</td>' +
                '			</tr>' +
                '			<tr>' +
                '			   <td class="text-center colorr">' +
                '		   	   	<a  data-theme="purple" class="theme-picker">' +
                '			   		<i class="fa fa-circle purple-base"></i>' +
                '			   	</a>' +
                '			   </td>' +
                '			   <td class="text-center colorr">' +
                '			   <a  data-theme="midnight-blue" class="theme-picker">' +
                '			   	<i class="fa fa-circle midnight-blue-base"></i>' +
                '		   	   </a>' +
                '			   </td>' +
                '				<td class="text-center colorr">' +
                '					<a  data-theme="lynch" class="theme-picker">' +
                '						<i class="fa fa-circle lynch-base"></i>' +
                '					</a>' +
                '				</td>' +
                '			</tr>' +
                '       </tbody></table>' +
                '</li>' +
                '</ul>' +
                '</div>' +
                '</td></tr>',
                /*图片*/
                icon1: '<tr><td class="require active">图片:</td><td class=" "><a href="javascript:" class="" id="filePicker" >选择</a><input id="nameImage" name="icon" maxlength="255" require = "true" class="input-xlarge form-control valid" type="text" value="0"/></td></tr>',
                /*开放类型*/
                isPublic: '<tr><td class="require active">开放类型:</td>' +
                '<td>' +
                '<select class="form-control valid1" name="isPublic" id="isPublic" require="true">' +
                '<option value=0>私有磁贴</option>' +
                '<option value=1>公用磁贴</option>' +
                '</select>' +
                '</td></tr>',
                /*是否在手机端显示*/
                displayMobile: '<tr><td class="require active">手机端显示:</td>' +
                '<td>' +
                '<select class="form-control valid1" name="displayMobile" id="displayMobile" require="true">' +
                '<option value=0>不显示</option>' +
                '<option class="isMobile" value=1>显示</option>' +
                '</select>' +
                '</td></tr>',
                /*图标icon选择*/
                icons: '<tr class="icons "><td class="require active">图标:</td><td><i id="iconIcon" class="icon iconfont"></i>&nbsp;&nbsp;<input id="icon" name="icon" type="text" class="  valid1" require="true" value><a id="iconButton" href="javascript:" class="btn btn-primary color">选择</a>&nbsp;&nbsp;<input id="iconclear" class="btn btn-default" type="button" value="清除"></td></tr>'
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
                PageModule.iconClear();
            } else if (data == 2) {
                html = dataMmhtml.tileTemplateCode +
                    dataMmhtml.appCode +
                    dataMmhtml.title +
                    dataMmhtml.dataSource +
                    dataMmhtml.displayMobile +
                    dataMmhtml.isPublic +
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
                    dataMmhtml.displayMobile +
                    dataMmhtml.isPublic +
                    dataMmhtml.size +
                    dataMmhtml.timeInterval +
                    dataMmhtml.des;
                $('.formtbody').html(html);
                $('#sizex').append(opXcommon);
                $('#sizey').append(opYcommon);
                var tpid = results.workbenchTileTemplate.templateId;
                if (tpid == 3) {
                    PageModule.dsRender('chart_line');
                } else if (tpid == 4) {
                    PageModule.dsRender('chart_bar');
                } else if (tpid == 5) {
                    PageModule.dsRender('chart_pie');
                } else if (tpid == 6) {
                    PageModule.dsRender('chart_gauge');
                }

            } else if (data == 4) {
                html = dataMmhtml.tileTemplateCode +
                    dataMmhtml.appCode +
                    dataMmhtml.title +
                    dataMmhtml.dataSource +
                    dataMmhtml.isPublic +
                    dataMmhtml.size +
                    dataMmhtml.pageSize +
                    dataMmhtml.timeInterval +
                    dataMmhtml.columnName +
                    dataMmhtml.des;
                $('.formtbody').html(html);
                $('#sizex').append(opXcommon);
                $('#sizey').append(opYcommon);
                PageModule.dsRender('list');


            }
            /**作者：贾旭光
             *日期：2018.6.7
             *描述：根据与产品沟通卡片类型磁贴目前不体现
             */
            /*else if(data==5){
             html=dataMmhtml.tileTemplateCode+
             dataMmhtml.appCode+
             dataMmhtml.title+
             dataMmhtml.dataSource+
             dataMmhtml.size+
             dataMmhtml.displayName+
             dataMmhtml.des;
             $('.formtbody').html(html);
             $('#sizex').append(opXcommon);
             $('#sizey').append(opYcommon);*/
            else if (data == 6) {
                html =
                    dataMmhtml.tileTemplateCode +
                    dataMmhtml.title +
                    dataMmhtml.appCode +
                    dataMmhtml.isPublic +
                    dataMmhtml.size +
                    dataMmhtml.content +
                    dataMmhtml.des
                ;
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

            PageModule.rendered(data, id, results);


        },
        //选然后要执行的一些方法
        rendered: function (data, id, results) {
            $('#mMtype').val(data);
            $('#mMid').val(id);
            $('#isPublic').change(function () {
                PageModule.isPM(this);
            });
            Api.ajaxJson(Api.admin + '/api/workbench/WorkbenchTileTemplate/selectAppName', {}, function (result) {
                PageModule.renderSelect(result);
                Validator.renderData(results.workbenchTileTemplate, '#inputForm');
                $('#iconIcon').addClass(results.workbenchTileTemplate.icon);
                PageModule.isPM('#isPublic');

            });
            //头像插件激活
            if ($('#nameImagePreview')) {
                PageModule.initWebuploader('/img/sys/SysUpload/upimg?imgPath=img', '#filePicker');
            }
            //规范时间间隔格式
            $('#timeInterval').on('keyup', function () {
                PageModule.clearNoNum(this);
            });
            //选择颜色 点击执行改变颜色方法
            $('a.theme-picker').each(function () {
                $(this).on('click', function () {
                    PageModule.col(this);
                })
            })

        },
        //时间间隔判断只能输入数字
        clearNoNum: function (obj) {
            obj.value = obj.value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
            obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
            obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
            obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d).*$/, '$1$2.$3');//只能输入两个小数
            if (obj.value.indexOf(".") < 0 && obj.value != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
                obj.value = parseFloat(obj.value);
            }
        },
        //得到请求惧后渲染下拉框
        renderSelect: function (data) {
            var appList = data.appList;
            $(appList).each(function () {
                var option = '<option value="' + this.appCode + '">' + this.appName + '</option>';
                $('#appCode').append(option);
            })

        },
        //判断是否是公有磁贴
        isPM: function (doc) {
            if ($(doc).val() == '1') {
                $('.isMobile').hide();
                $('#displayMobile').val(0)
            } else {
                $('.isMobile').show();
            }
        },
        //渲染下拉框
        dsRender: function (type) {
            Api.ajaxJson(Api.admin + '/api/sys/SysDict/type/workbench_datasource_' + type, {}, function (result) {
                if (result.success) {
                    Bus.appendOptionsValue($('#dataSource'), result.rows, 'value', 'label');
                }
            });
        },
        //修改图片
        initWebuploader: function (url, filePicker) {
            require(['/js/plugins/webUpLoader/webuploader.js'], function (webuploader) {
                var uploader = webuploader.create({
                    // 选完文件后，是否自动上传。
                    auto: true,
                    // // swf文件路径
                    swf: Api.admin + '/js/plugins/webUploader/Uploader.swf',

                    // 文件接收服务端。
                    server: Api.admin + url,
                    // 选择文件的按钮。可选。
                    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                    pick: {
                        id: filePicker,
                        multiple: false
                    },

                    // 只允许选择图片文件。
                    accept: {
                        title: 'Images',
                        extensions: 'gif,jpg,jpeg,bmp,png',
                        mimeTypes: 'image/*'
                    },
                    fileNumLimit: 1

                });
                uploader.on('uploadSuccess', function (file, response) {
                    $('#nameImage').val(response.saveName);
                });
            })

        },
        //调色版
        colorChange: function () {
            var colorBoxArr = ['blue-base', 'green-base', 'red-base', 'purple-base', 'midnight-blue-base', 'lynch-base'];
            Api.ajaxJson(Api.admin + '/api/sys/SysDict/type/workbench_bgcolor_num', {}, function (result) {
                for (var i = 0; i < colorBoxArr.length; i++) {
                    $('.' + colorBoxArr[i]).css({'color': result.rows[i].value});
                }
            });
        },
        //rgb转换成16进制
        col: function (this_) {
            function colorRGB2Hex(color) {
                if (color == undefined) {
                    Mom.layAlert('未选定颜色请重新选择')
                } else {
                    var rgb = color.split(',');
                    var r = parseInt(rgb[0].split('(')[1]);
                    var g = parseInt(rgb[1]);
                    var b = parseInt(rgb[2].split(')')[0]);

                    var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                    return hex;
                }
            }


            var val = $(this_).children('i.fa-circle').css('color')
            val = val.substring(3)
            var itemColor = colorRGB2Hex(val);
            console.log(itemColor)
            $('.bgColor .color-picker>a .fa-circle').css({'color': itemColor});
            $('#bgColor').val(itemColor)
        },
        //图标选择方法
        iconChange: function (data) {
            $('#iconButton').on('click', function () {
                var icon = $('#iconIcon').attr('class')
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
                        var body = _top.layer.getChildFrame('body', index),
                            classes = body.find('.active>i').attr('class'),
                            classActive = classes.split(' ');
                        $('#icon').val(classActive[2]);
                        $('#iconIcon').removeClass().addClass(classes);
                        $('#icon-error').hide();
                        top.layer.close(index);
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

        /*———————图标选择页面方法———————*/
        //初始化
        fontinit: function () {
            var type = parseInt(Mom.getUrlParam('data'));
            var classOne = Mom.getUrlParam('class');
            switch (type) {
                case 1:
                    Api.ajaxJson(Api.admin + '/api/sys/SysDict/type/tile_shortcut_icon', {}, function (result) {
                        $('.title').text('快捷入口:');
                        var res = result.rows;
                        $('dl.numberBox').hide();
                        $(res).each(function (i, item) {
                            if(this.label.split('_')[0]=='生产计划'){
                                $('dl.plan').append('<dd><i class="icon iconfont ' + this.value + '"></i><div>' + this.label.split('_')[1] + '</div></dd>')
                            }else if(this.label.split('_')[0]=='生产调度'){
                                $('dl.dis').append('<dd><i class="icon iconfont ' + this.value + '"></i><div>' + this.label.split('_')[1] + '</div></dd>');}
                            else{
                                $('dl.ope').append('<dd><i class="icon iconfont ' + this.value + '"></i><div>' + this.label.split('_')[1] + '</div></dd>')
                            }
                        });
                        PageModule.eachLi(classOne);
                    });
                    break;
                case 2:
                    Api.ajaxJson(Api.admin + '/api/sys/SysDict/type/tile_num_icon', {}, function (result) {
                        var res = result.rows;
                        $('.title').text('数字类:');
                        $('dl.plan,dl.dis,dl.ope').hide();
                        $(res).each(function (i, item) {
                            $('dl.number').append('<dd><i class="icon iconfont ' + item.value + '"></i><div>' + item.label.split('_')[1] + '</div></dd>')
                        });
                        PageModule.eachLi(classOne);

                    });
                    break;

            }


        },
        //添加选中class
        eachLi: function (classOne) {
            $('dl dd').each(function () {
                /*if($(this).find('i').attr('class')==classOne){
                    $(this).addClass('active').siblings('dd').removeClass('active');
                    $(this).parents('dl').siblings('dl').find('dd').removeClass('active');
                }*/
                $(this).on('click',function () {
                    $(this).addClass('active').siblings('dd').removeClass('active');
                    $(this).parents('dl').siblings('dl').find('dd').removeClass('active');
                })
            })
        }

    };

    $(function () {
        //修改
        if ($('#mMUpdate').length > 0) {
            PageModule.updateinit();
        } else if ($('#fontInit').length > 0) {
            PageModule.fontinit()
        }

    });
});