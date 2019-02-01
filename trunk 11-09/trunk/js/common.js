/**
 * 工具类，命名空间为Mom
 * @see 使用方法：basePath()
 * @type {Mom|*|Function}
 * @Auth Qiyh
 * @Data 2017-12-01
 */
var Mom = window.Mom || (function() {

    //获取上下文路径
    var basePath = function(){
        var obj=window.location;
        var contextPath=obj.pathname.split("/")[1];
        // var path=obj.protocol+"//"+obj.host+"/"+contextPath;
        var path=obj.protocol+"//"+obj.host;
        return path;
    };

    var refresh = function(){
        location.href=location.href;
    };
    /**
	 * 拼接参数到url中
	 * params:参数，支持字符串、字符串数组、json对象
	 */
    var extractUrl = function(url, param){
        if(!param){
			return url;
		}
		var paramStr = '';
		if (typeof param == "string") {
			if(param.indexOf('?')==0){
				param = param.substr(1);
			}
			if(param.indexOf('&')!=0){
				param = '&'+param;
			}
			paramStr = param;
		}
		else if(Object.prototype.toString.call(param) === '[object Array]'){
			//数组参数
			var paramArr = typeof(param) == "string" ? [param] : param;
			for(var i=0; i<paramArr.length; i++){
				paramStr += '&'+paramArr[i];
			}
		}
		else{
			//对象参数
			for(var key in param){
				var value = param[key];
				paramStr += '&'+key+'='+value;
			}
		}
		var index = url.indexOf('?');
		if(0<paramStr.length && 0>index){
		  paramStr = '?'+paramStr.substr(1);
		}
        return encodeURI(url+paramStr);
    };
    /**
     * 解析URL中的参数
     * @param {url路径} string
     * @returns {返回object<key,value>}
     */
    var getUrlParam = function(name, url) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        if (!url || url == ""){
            url = window.location.search;
        }else{
            url = url.substring(url.indexOf("?"));
        }
        r = url.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    };

    //判断浏览器是否支持html5本地存储
    var localStorageSupport = function() {
        return ('localStorage' in window) && window['localStorage'] !== null;
    };

    //获取文件后缀名
    var getFileExt = function(FileName){
        return FileName.substring(FileName.lastIndexOf('.')+1, FileName.length).toLowerCase();
    };

    var getOpener = function(){
        var callerWindowObj = window.dialogArguments;
        if(callerWindowObj != undefined){
            return callerWindowObj;
        }
        return window.parent;
    };
    //窗口返回
    var winBack = function(url){
        if(url!=undefined && url!=null){
            location.href = url;
        }
        else{
            var opener = getOpener();
            if(opener.opener == null){
                history.go(-1);
            }else{
                opener.close();
            }
        }
    };

    /**
     * 判断浏览器类型，如果要判断IE版本直接传参版本号，参数为空时返回浏览器类型
     * @param v
     * @returns {*}
     * @constructor
     */
    var BrowserType =  function (v) {
        var userAgent = navigator.userAgent;
        var isOpera = userAgent.indexOf("Opera") > -1;
        var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera;
        var isEdge = userAgent.indexOf("Trident/7.0;") > -1 && userAgent.indexOf("Windows NT 6.1") > -1 && !isIE;
        var isFF = userAgent.indexOf("Firefox") > -1;
        var isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1;
        var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1;
        var isIE11  = userAgent.toLowerCase().indexOf("trident") > -1 && userAgent.indexOf("rv") > -1;
        if(isIE && v) {
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
            reIE.test(userAgent);
            var fIEVersion = parseFloat(RegExp["$1"]);
            return v == fIEVersion ? true:false;
        }
        if(isIE11){
            return "ie11";
        }
        if(isFF) { return "FF"; }
        if(isOpera) { return "Opera"; }
        if(isSafari) { return "Safari"; }
        if(isChrome) { return "Chrome"; }
        if(isEdge) { return "Edge"; }
    };

    /***** 判断是否为移动设备 ******/
    var isMobileAgent = function() {
        var sUserAgent = navigator.userAgent.toLowerCase();
        var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
        var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
        var bIsMidp = sUserAgent.match(/midp/i) == "midp";
        var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
        var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
        var bIsAndroid = sUserAgent.match(/android/i) == "android";
        var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
        var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
        if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
            return true;
        }
        return false;
    };


    /*
     *添加到收藏夹
     */
    var AddFavorite = function(sURL, sTitle){
        sURL = sURL!=undefined?sURL:window.location;
        sTitle = sTitle!=undefined?sTitle:document.title;
        try {
            if (document.all) {
                window.external.addFavorite(sURL, sTitle);
            }
            else if (window.sidebar) {
                window.sidebar.addPanel(sTitle, sURL, "");
            }
        }catch(e){
            window.alert("加入收藏失败，请使用Ctrl+D进行添加!");
        }
    };
    // Find the right method, call on correct element
    var launchFullscreen = function(element) {
        element = element||document.documentElement;
        if (!$("body").hasClass("full-screen")) {
            $("body").addClass("full-screen");
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            $("body").removeClass("full-screen");
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };

    /*
     * 根据身份证号获取信息：出生日期、性别、年龄
     */
    var getInfoByCardId = function(iIdNo){
        var info = {};
        //出生日期、性别、年龄
        var birthday='', sex='', age=0;
        if(undefined != iIdNo && iIdNo.length>14){
            iIdNo = iIdNo.trim();
            var last = iIdNo[iIdNo.length - 2];
            sex = last%2!=0 ? '男' : '女';
            if(iIdNo.length == 15){
                birthday = iIdNo.substring(6, 12);
                birthday = "19" + birthday;
                birthday = birthday.substring(0, 4) + "-" + birthday.substring(4, 6) + "-" + birthday.substring(6);
            }else if(iIdNo.length > 15){
                birthday = iIdNo.substring(6, 14);
                birthday = birthday.substring(0, 4) + "-" + birthday.substring(4, 6) + "-" + birthday.substring(6);
            }
            if(birthday.length > 3){
                var yy = new Date().getYear();
                if (yy < 1900) yy = yy + 1900;
                age = yy-birthday.substring(0,4);
            }
        }
        info['sex']=sex;
        info['birthday']=birthday;
        info['age']=age;
        return info;
    };

    //清空form（也可以是容器）的值
    var clearForm = function(theForm,clearHidden){
        if(theForm==undefined || theForm==null)
            theForm = document.forms[0];
        var el = theForm.elements;
        if(!el){
            el = $(theForm).find("input,textarea,select");
        }
        for(var i=0, m=el.length; i<m; i++){
            if(el[i].type=="hidden"){
                if(clearHidden == true) el[i].value = "";
            }
            else if(el[i].type=="text" || el[i].type=="textarea" || el[i].type=="select-one")
                el[i].value = "";
            else if(el[i].type=="checkbox" && el[i].checked)
                el[i].checked=false;
        }
    };

    //获取当前日期
    function getShortDate(){
        return getLocalDate().replace('年','-').replace('月','-').replace('日','');
    }
    function getLocalDate(){
        var objD = new Date();
        var yy = objD.getFullYear();
        if (yy < 1900) yy = yy + 1900;
        var MM = objD.getMonth() + 1;
        if (MM < 10) MM = '0' + MM;
        var dd = objD.getDate();
        if (dd < 10) dd = '0' + dd;
        return yy + "年" + MM + "月" + dd + "日";
    }
    function getLocalTime(){
        var objD = new Date();
        var hh = objD.getHours();
        if (hh < 10) hh = '0' + hh;
        var mm = objD.getMinutes();
        if (mm < 10) mm = '0' + mm;
        var ss = objD.getSeconds();
        if (ss < 10) ss = '0' + ss;
        return hh + ":" + mm + ":" + ss;
    }
    function getLocalWeek(){
        var objD = new Date();
        var ww = objD.getDay();
        if (ww == 0) ww = "星期日";
        if (ww == 1) ww = "星期一";
        if (ww == 2) ww = "星期二";
        if (ww == 3) ww = "星期三";
        if (ww == 4) ww = "星期四";
        if (ww == 5) ww = "星期五";
        if (ww == 6) ww = "星期六";
        return ww;
    }

    //前后日期比较
    var dateCompare = function(smallDate,bigDate) {
        if(smallDate!="" && bigDate!="") {
            if(typeof(smallDate) == "string"){
                smallDate = parseStrToDate(smallDate);
            }
            if(typeof(bigDate) == "string"){
                bigDate = parseStrToDate(bigDate);
            }
            if(bigDate > smallDate) {
                return true;
            }
        }
        return false;
    };

    // 日期是否有交集
    var isDateCross = function(startDate1, endDate1, startDate2, endDate2){
        if(typeof(startDate1) == "string")startDate1=parseStrToDate(startDate1);
        if(typeof(endDate1) == "string")endDate1=parseStrToDate(endDate1);
        if(typeof(startDate2) == "string")startDate2=parseStrToDate(startDate2);
        if(typeof(endDate2) == "string")endDate2=parseStrToDate(endDate2);
        if(startDate1<=startDate2 && endDate1>=startDate2){
            return true;
        }
        if(startDate1>=startDate2 && startDate1<=endDate2){
            return true;
        }
        return false;
    };

    //日期加上指定的天数
    var dateAddDay = function(sdate, days) {
        if(sdate=="")return "";
        var dt = sdate.replace('-', '/');//js不认2011-11-10,只认2011/11/10
        var t1 = new Date(new Date(dt).valueOf() + days*24*60*60*1000);
        var month;
        var day;
        if((t1.getMonth() + 1)<10) {
            month="0"+(t1.getMonth() + 1);
        }
        else {
            month=t1.getMonth() + 1;
        }
        if(t1.getDate()<10) {
            day="0"+t1.getDate();
        }
        else {
            day=t1.getDate();
        }
        return t1.getFullYear() + "-" + month + "-" + day;
    };

    // 日期加年
    var dateAddYear = function(beginDate, y){
        var a = beginDate;//parseStrToDate(beginDate);
        var b = new Date(a.getYear()+y, a.getMonth(), a.getDate());     //转换为10-18-2004格式
        return b;
    };

    //给对象添加事件
    var addEvent = function(obj, evType, fn) {
        if (obj.addEventListener) {
            obj.addEventListener(evType, fn, false);
            return true;
        } else if (obj.attachEvent) {
            var r = obj.attachEvent("on" + evType, fn);
            return r;
        } else {
            return false;
        }
    };

    /**
     * json对象转字符串形式
     */
    var json2str = function(o) {
        var arr = [];
        var fmt = function (s) {
            if (typeof s == 'object' && s != null)
                return json2str(s);
            return /^(string|number)$/.test(typeof s) ? "'" + s + "'" : s;
        };
        for (var i in o) {
            arr.push("'" + i + "':" + fmt(o[i]));
        }
        return '{' + arr.join(',') + '}';
    };

    /*********** cookie ************/
    var setCookie = function(name,value,path) {
        var Days = 30;//30天
        var exp = new Date();
        exp.setTime(exp.getTime() + Days*24*60*60*1000);
        var pathTmp = path!=undefined?path:'/';
        document.cookie=name+"="+encodeURI(value)+";expires="+exp.toGMTString()+";path="+pathTmp;
    };
    //读取cookies
    var getCookie = function(name) {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
            return (decodeURI(arr[2]));
        else
            return '';
    };
    //删除cookies
    var delCookie = function(name,path) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval=getCookie(name);
        if(cval!=null){
            var pathTmp = path!=undefined?path:'/';
            document.cookie=name+"="+cval+";expires="+exp.toGMTString()+";path="+pathTmp;
        }
    };

    //加载css/js
    var include = function(id, path, file){
        if(path.lastIndexOf('/') != path.length-1){
            path += '/';
        }
        if(document.getElementById(id)==null){
            var files = typeof file == "string" ? [file] : file;
            for (var i = 0; i < files.length; i++){
                var name = files[i].replace(/^\s|\s$/g, "");
                var ext = getFileExt(files[i]).toLowerCase();
                var fileref;
                var fullName = extractUrl(path + name, 'r='+(new Date()).getTime());
                if(ext == "css"){
                    fileref = document.createElement('link');
                    fileref.setAttribute("rel", "stylesheet");
                    fileref.setAttribute("type", "text/css");
                    fileref.setAttribute("href", fullName);
                }else{
                    fileref = document.createElement('script');
                    fileref.setAttribute("type", "text/javascript");
                    fileref.setAttribute("src", fullName);
                }
                if(fileref){
                    fileref.setAttribute("id", id);
                    // document.getElementsByTagName("head")[0].appendChild(fileref);
                    $(fileref).insertBefore("title");
                }
            }
        }
    };


    /**
     * 弹出通知
     * type: success|info|warning|error
     */
    var notify = function(msg, type, title, options){
        toastr.options = options || {
            "closeButton": true,
            "debug": false,
            "progressBar": true,
            "preventDuplicates": false,
            "positionClass": "toast-top-center",
            "onclick": null,
            "showDuration": "400",
            "hideDuration": "1000",
            "timeOut": "7000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };
        if(type==undefined || type==''){
            if(msg.indexOf('失败')>-1 || msg.indexOf('异常')>-1 || msg.indexOf('错误')>-1){
                type = 'error';
            }else{
                type = 'success';
            }
        }
        if(title==undefined || title==''){
            title = '系统提示:';
        }
        var $toast = toastr[type](msg, title); // Wire up an event handler to a button in the toast, if it exists
        if ($toast.find('#okBtn').length) {
            $toast.delegate('#okBtn', 'click', function () {
                $toast.remove();
            });
        }
        if ($toast.find('#surpriseBtn').length) {
            $toast.delegate('#surpriseBtn', 'click', function () {

            });
        }
    };
    //弹出信息框，自动关闭（icon:16为加载中）
    var layMsg = function(info, time, icon){
        var cfg = {time:time||1800, shade:0.01};
        if(icon){
            cfg.icon = icon;
        }
        var p_ = top;//window.parent?window.parent:top;
        p_.layer.msg(info, cfg);
    };
    //弹出警告信息
    var layAlert = function(info, icon){
        icon = icon||0;
        var title = icon==0?'警告':'消息';
        var p_ = top;//window.parent?window.parent:top;
        p_.layer.alert(info, {skin:'layui-layer-lan', icon:icon, title:title});
    };
    //弹出确认框
    var layConfirm = function(info, callback){
        var p_ = top;//window.parent?window.parent:top;
        p_.layer.confirm(info, {icon:3, title:'系统提示'}, function(index, layero){
            var ret = true;
            if(callback){
                ret = callback(index, layero);
            }
            if(ret == true){
                p_.layer.close(index);
            }else{
                return false;
            }
        });
    };



    var jsGetVal = function(objectString){
        var result='', val='';
        var vals = objectString.split(".");
        for (var i=0; i<vals.length; i++){
            val += ("." + vals[i]);
            result += ("!"+(val.substring(1))+"?'':");
        }
        result += val.substring(1);
        return result;
    };


    //倒计时读秒（ss：剩余秒数；fn：回调函数）
    var countDownSecond = function(ss, fn){
        var timer = setInterval(function() {
            if (ss >= 0) {
                fn(ss);
                --ss;
            }
            else {
                clearInterval(timer);
                fn(-1);
            }
        }, 1000);
        return timer;
    };

    //时间倒计时：今天距离指定时间还有多久
    var countDownDate = function(datetime, fn){
        var maxtime = (new Date(datetime) - new Date()) / 1000;//剩余秒
        var timer = setInterval(function () {
            if (maxtime >= 0) {
                var dd = parseInt(maxtime / 60 / 60 / 24, 10);//计算剩余的天数
                var hh = parseInt(maxtime / 60 / 60 % 24, 10);//计算剩余的小时数
                var mm = parseInt(maxtime / 60 % 60, 10);//计算剩余的分钟数
                var ss = parseInt(maxtime % 60, 10);//计算剩余的秒数
                hh = hh<10?('0'+hh):hh;
                mm = mm<10?('0'+mm):mm;
                ss = ss<10?('0'+ss):ss;
                //msg = "剩余时间 " + dd + "天" + hh + "时" + mm + "分" + ss + "秒";
                fn(dd,hh,mm,ss);
                --maxtime;
            }
            else {
                clearInterval(timer);
                fn(0,0,0,0);
            }
        }, 1000);
        return time;
    };

	/**
	 * 动态创建iframe
	 * @param frameDivID
	 * @param frameId
	 * @param action
	 * @returns {Element}
	 */
	function createTagFrame(frameDivID,action,frameId){
		frameId = (frameId || action).replaceAll("\\.","\\.");
		var frameDivCont = document.getElementById(frameDivID);
		var frames=frameDivCont.getElementsByTagName("iframe");
		var tabFrame = document.getElementById(frameId);
		for(var i=0;i<frames.length;i++){
			if(frames[i].id != action){
				frames[i].style.display="none";
			}
		}
		if(tabFrame==null || tabFrame==undefined){
			tabFrame = document.createElement("iframe");
			tabFrame.id=frameId;
			tabFrame.style.width="100%";
			tabFrame.marginWidth="0";
			tabFrame.frameBorder="0";
			tabFrame.frameSpacing="0";
			tabFrame.scrolling="no";
			tabFrame.style.overflow = "hidden";
			frameDivCont.appendChild(tabFrame);
		}
		if(action!=undefined && action!='' && tabFrame.src==""){
			tabFrame.src = action;
		}
		/* if(tabFrame.attachEvent){
			 tabFrame.attachEvent("onload",setFrameHeight);
		 }else{
			 tabFrame.oncload=setFrameHeight;
		 }*/
		tabFrame.style.display="inline";
		return frameDivCont;
	}

	/**
	 * 设置iFrame高度，在iframe内部页面调用  切记使用该方法的时候不应设置body,html的高度
	 */
	function setFrameHeight(offsetHeight_){
		var frames = window.parent.document.getElementsByTagName("iframe");
		for(var i = 0; i < frames.length; i++) {
			var f = frames[i];
			if (null != f && f.style.display != "none") {
				var h = document.body.scrollHeight+50+(offsetHeight_||0);
				f.style.height = h+"px";
			}
		}
	}



    return {
        //获取上下文路径
        basePath: basePath(),
        //刷新
        refresh: refresh,
        //将参数拼接到url后边
        extractUrl: extractUrl,
        //解析URL中的参数
        getUrlParam: getUrlParam,
        //判断是否为移动设备
        isMobileAgent: isMobileAgent(),
        BrowserType: BrowserType,
        //判断浏览器是否支持html5本地存储
        localStorageSupport: localStorageSupport(),
        //获取文件后缀名
        getFileExt: getFileExt,
        //获取父窗口
        getOpener: getOpener,
        //窗口返回
        winBack: winBack,
        //添加到收藏夹
        AddFavorite: AddFavorite,
        //全屏
        launchFullscreen:launchFullscreen,
        //根据身份证号获取信息
        getInfoByCardId: getInfoByCardId,
        //清空Form表单
        clearForm: clearForm,
        //获取当前日期
        shortDate: getShortDate(),
        localDate: getLocalDate(),
        localTime: getLocalTime(),
        localWeek: getLocalWeek(),
        //前后日期比较
        dateCompare: dateCompare,
        // 日期是否有交集
        isDateCross: isDateCross,
        //日期加上指定的天数
        dateAddDay: dateAddDay,
        // 日期加年
        dateAddYear: dateAddYear,
        //给对象添加事件
        addEvent: addEvent,
        //json对象转字符串形式
        json2str: json2str,
        //cookie
        setCookie: setCookie,
        getCookie: getCookie,
        delCookie: delCookie,
        //加载js/css
        include: include,

        //弹出通知
        nofify: notify,
        //弹出框
        layMsg: layMsg,
        layAlert: layAlert,
        layConfirm: layConfirm,

        //生成三目运算字符串
        jsGetVal: jsGetVal,
        //倒计时，计时器(读秒)
        countDownSecond: countDownSecond,
        //日期倒计时
        countDownDate: countDownDate,
		//动态创建iframe
		createTagFrame: createTagFrame,
		//设置iframe高度
		setFrameHeight: setFrameHeight,

    }

})();