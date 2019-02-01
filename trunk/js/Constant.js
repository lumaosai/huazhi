/**
 * 静态属性类，命名空间为Const
 * @see 使用方法：Const.userName
 * @Auth Qiyh
 * @Data 2018-11-01
 */
var Const = window.Const || (function() {
    return {
        //正式地址
        /*aps:"http://192.168.102.47:8083/aps-api",
        admin:"http://192.168.102.47:8080/admin-api",
        pi:"http://192.168.102.47:8082/pi-api",
        mtrl:"http://192.168.102.47:8085/mtrl-api",*/
        //测试地址
        aps:"http://114.115.165.184:8083/aps-api",
        //aps:"http://192.168.42.84:8083/aps-api",


        admin:"http://114.115.165.184:8080/admin-api",
        //admin:"http://192.168.39.83:8080/admin-api",

        pi:"http://www.sxfsly.com:9013/pi-api",

        mtrl:"http://114.115.165.184:8085/mtrl-api",
        //mtrl:"http://192.168.39.83:8085/mtrl-api",

        //mtrl:"http://192.168.39.83:8085/mtrl-api",//海涛



        authorization: "authorization", //鉴权
        tokenType: "token_type",    //token类型
        userName: "userName",   //用户姓名
        loginName: "loginName", //登录名
        loginUserid: "loginUserid", //用户id
        enterDate:"enterDate",//进出场班量日期
        unitDate:"unitDate",//装置日期
        tankDate:"tankDate", //槽/罐日期
        ticketDate:"ticketDate",//进出厂仪表计量日期
        gaugeDate:"gaugeDate",//进出厂计量单日期日期
    }
})();