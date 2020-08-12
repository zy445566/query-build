class QueryBuild {
    queryBuild(keys, conditionFunc) {
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
    whereQueryBuild(data, connect='AND') {
        const conditionFunc = (key) => {
            return {
                sql:`${key} = ?`,
                value:data[key],
            }
        }
        const sqlBuilder = this.queryBuild(Object.keys(data),conditionFunc);
        return {
            sql:sqlBuilder.builder.join(` ${connect} `),
            bind:sqlBuilder.bind
        }
    }

    setQueryBuild(data) {
        const conditionFunc = (key) => {
            return {
                sql:`${key} = ?`,
                value:data[key],
            }
        }
        const sqlBuilder = this.queryBuild(Object.keys(data),conditionFunc);
        return {
            sql:sqlBuilder.builder.join(' , '),
            bind:sqlBuilder.bind
        }
    }

    foreachQueryBuild (dataList, keys) {
        const builder = [];
        let bind = [];
        for(const data of dataList) {
            const conditionFunc = (key) => {
                return {
                    sql:`?`,
                    value:data[key],
                }
            }
            const sqlBuilder = this.queryBuild(keys, conditionFunc);
            // 请不要使用push(...sqlBuilder.bind) 数组过大会爆栈
            bind = bind.concat(sqlBuilder.bind);
            builder.push(`(${sqlBuilder.builder.join(' , ')})`)
        }
        const sql = builder.join(',')
        return {
            sql,
            bind
        }
    }
}
module.exports = QueryBuild.default = QueryBuild;