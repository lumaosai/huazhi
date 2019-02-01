/**
 * 接口配置文件，提交svn时请勿修改
 * @auth: qiyh
 */
var Api = window.Api || (function() {
    //正式地址
    //var aps = "http://http://192.168.102.47:8083/aps-api";
    //var admin = "http://http://192.168.102.47:8080/admin-api";
    //var pi = "http://http://192.168.102.47:8082/pi-api";
    //var mtrl = "http://http://192.168.102.47:8085/mtrl-api";

    //测试地址
    var aps = "http://114.115.165.184:8083/aps-api";
        //var aps = "http://192.168.38.135:8083/aps-api";//天宝的
        //var aps = "http://192.168.45.160:8083/aps-api";//小莉的
    var admin = "http://114.115.165.184:8080/admin-api";
    var pi = "http://www.sxfsly.com:9013/pi-api";
    var mtrl = "http://114.115.165.184:8085/mtrl-api";
    //    var mtrl = "http://192.168.44.213:8084/mtrl-api";//小莉的
    //        var mtrl = "http://192.168.39.124:8084/mtrl-api";//孙艳
    //    var mtrl = "http://192.168.38.135:8084/mtrl-api"; //天宝的
    //    var mtrl = "http://192.168.39.83:8084/mtrl-api"; //海涛



        //var mtrl = "http://192.168.42.215:8085/mtrl-api";


        var devMode = false; //开发模式
    /**
     * 传参类型为：application/json
     * @param url
     * @param data
     * @param callbackFun
	 * 地址的Domain地址可以使用$Api.domain$进行定义
     *      如："$Api.admin$/api/User/save"
     */
    jQuery.support.cors = true;
    var ajaxJson = function(url, data, callbackFun){
		if(url && url.length>0){
            var substr = url.match(/\$(\S*)\$/);
            if(substr){
                url = url.replace(substr[0],eval(substr[1]));
            }
        }
        var reqType = 'post';
        if(url.toLowerCase().endWith('\\.json')){
            reqType = 'get';
        }
		if(devMode) console.log("发起ajaxJson请求：", url, '参数：',data);
		var layerIndex = layer.load(2);
        $.ajax({
            headers:{
                Accept: "application/json; charset=utf-8",
                Authorization: Mom.getCookie('token_type') + ' ' + Mom.getCookie('authorization')
            },
            type: reqType,
            url: url,
            data: data,
            dataType: 'json',
            contentType: "application/json",
            crossDomain: true,
            success: function(result){
                layer.close(layerIndex);
                if(devMode) console.log("返回：",result);
                if(callbackFun){
                    callbackFun(result);
                }
            },
            error:function(e){
                layer.close(layerIndex);
                Mom.layMsg('请求服务器异常.');
            }
        });
    };

    /**
     * 传参类型为：x-www-form-urlencoded
     * @param url
     * @param data
     * @param callbackFun
	 * 地址的Domain地址可以使用$Api.domain$进行定义
     *      如：action="$Api.admin$/api/User/save"
     */
    var ajaxForm = function(url, data, callbackFun){  //传送的参数是string时
		if(url && url.length>0){
            var substr = url.match(/\$(\S*)\$/);
            if(substr){
                url = url.replace(substr[0],eval(substr[1]));
            }
        }
        var reqType = 'post';
        if(url.toLowerCase().endWith('\\.json')){
            reqType = 'get';
        }
        if(devMode) console.log("发起ajaxForm请求：", url, '参数：',data);
		var layerIndex = layer.load(2);
        $.ajax({
            headers:{
                Accept: "application/json; charset=utf-8",
                Authorization: Mom.getCookie('token_type') + ' ' + Mom.getCookie('authorization')
            },
            type: reqType,
            url: url,
            data: data,
            dataType: 'json',
            contentType:'application/x-www-form-urlencoded',
            crossDomain: true,
            success: function(result){
                layer.close(layerIndex);
                if(devMode) console.log("返回：",result);
                if(result.success == false){
                    // if(result.retCode == "30009"){  //用户登录信息失效
                    //     alert('用户登录信息失效,请重新登录');
                    //     //$("#quit-btn",top.document).children("i").trigger("click");
                    //     top.location.href='../login.html';
                    //     return;
                    // }
                }
                if(callbackFun){
                    callbackFun(result);
                }
            },
            error:function(){
                layer.close(layerIndex);
                Mom.layMsg('请求服务器异常.');
            }
        });
    };

    return{
        aps: aps,
        admin: admin,
        pi: pi,
        mtrl:mtrl,

        //ajax请求
        ajaxJson: ajaxJson,
        ajaxForm: ajaxForm,
    }
})();