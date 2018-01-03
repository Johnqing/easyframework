/**
 * Created by Administrator on 2017/9/1.
 * 对象类帮助函数
 */
/**
 * 简单的对象继承
 * @param old
 * @param n
 * @returns {*}
 */
exports.extend = function extend(old, n) {
    for (var key in n) {
        old[key] = n[key];
    }
    return old;
};

/**
 * 拷贝对象
 * 不支持函数
 * @param obj
 * @returns {*}
 */
exports.clone = function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
};