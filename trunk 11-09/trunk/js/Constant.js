/**
 * 静态属性类，命名空间为Const
 * @see 使用方法：Const.userName
 * @Auth Qiyh
 * @Data 2018-11-01
 */
var Const = window.Const || (function() {
    return {
        authorization: "authorization", //鉴权
        tokenType: "token_type",    //token类型
        userName: "userName",   //用户姓名
        loginName: "loginName", //登录名
        loginUserid: "loginUserid", //用户id
        enterDate:"enterDate",//进出场班量日期
    }
})();