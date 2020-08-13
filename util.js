module.exports.build = function (keys, conditionFunc) {
    const builder = [];
    const bind = [];
    for(const key of keys) {
        const condition = conditionFunc(key)
        builder.push(condition.sql);
        if(!condition.done) {
            bind.push(condition.value);
        }
    }
    return {
        builder,
        bind 
    }
}