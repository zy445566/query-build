const util = require('./util')
class QueryBuild {
    where(data, connect='AND') {
        const conditionFunc = (key) => {
            return {
                sql:`${key} = ?`,
                value:data[key],
            }
        }
        const sqlBuilder = util.build(Object.keys(data),conditionFunc);
        return {
            sql:sqlBuilder.builder.join(` ${connect} `),
            bind:sqlBuilder.bind
        }
    }

    set(data) {
        const conditionFunc = (key) => {
            return {
                sql:`${key} = ?`,
                value:data[key],
            }
        }
        const sqlBuilder = util.build(Object.keys(data),conditionFunc);
        return {
            sql:sqlBuilder.builder.join(', '),
            bind:sqlBuilder.bind
        }
    }

    foreach(dataList, keys) {
        const builder = [];
        let bind = [];
        for(const data of dataList) {
            const conditionFunc = (key) => {
                return {
                    sql:`?`,
                    value:data[key],
                }
            }
            const sqlBuilder = util.build(keys, conditionFunc);
            // 请不要使用push(...sqlBuilder.bind) 数组过大会爆栈
            bind = bind.concat(sqlBuilder.bind);
            builder.push(`(${sqlBuilder.builder.join(', ')})`)
        }
        const sql = builder.join(',')
        return {
            sql,
            bind
        }
    }
    
    merge(...builderList) {
        let sqlList = [];
        let bind = [];
        for(const builder of builderList) {
            if(typeof builder === 'string') {
                sqlList.push(builder.trim());
            } else {
                sqlList.push(builder.sql.trim());
                bind = bind.concat(builder.bind);
            }
        }
        const sql = sqlList.join(' ')
        return {
            sql,
            bind
        }
    }
}
module.exports = QueryBuild.default = QueryBuild;