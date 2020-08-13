const util = require('./util')
const {Connect,getConnectSql,Op,getOpSqlBind} = require('./enumobj')
class QueryBuild {
    constructor(table='') {
        this.table = table;
        this.Connect = Connect;
        this.Op = Op;
    }
    where(data, connect=Connect.and) {
        const builderFunc = (data, key) => {
            if(data[key]===null) {
                return {
                    sql:`${key} IS NULL`,
                    bind:[],
                }
            }
            if(typeof data[key]==="object") {
                return getOpSqlBind(data, key);
            }
            return {
                sql:`${key} = ?`,
                bind:[data[key]],
            }
        }
        const sqlBuilder = util.build(data, Object.keys(data),builderFunc);
        const connectSQL = getConnectSql(connect);
        return {
            sql:sqlBuilder.builder.join(` ${connectSQL} `),
            bind:sqlBuilder.bind
        }
    }

    set(data) {
        const builderFunc = (data, key) => {
            return {
                sql:`${key} = ?`,
                bind:[data[key]],
            }
        }
        const sqlBuilder = util.build(data, Object.keys(data),builderFunc);
        return {
            sql:sqlBuilder.builder.join(', '),
            bind:sqlBuilder.bind
        }
    }

    foreach(dataList, keys) {
        const sqlBuilder = {
            builder:[],
            bind:[]
        }
        const builderFunc = (data, key) => {
            return {
                sql:`?`,
                bind:[data[key]],
            }
        }
        for(const data of dataList) {
            const sqlBuilderData = util.build(data, keys, builderFunc);
            // 请不要使用push(...sqlBuilderData.bind) 数组过大会爆栈
            sqlBuilder.bind = sqlBuilder.bind.concat(sqlBuilderData.bind);
            sqlBuilder.builder.push(`(${sqlBuilderData.builder.join(', ')})`)
        }
        const sql = sqlBuilder.builder.join(',')
        return {
            sql,
            bind:sqlBuilder.bind
        }
    }
    
    merge(...builderDataList) {
        const sqlBuilder = {
            builder:[],
            bind:[]
        }

        for(const builderData of builderDataList) {
            if(typeof builderData === 'string') {
                sqlBuilder.builder.push(builderData.trim());
            } else {
                util.concatBuilder(sqlBuilder, builderData)
            }
        }
        const sql = sqlBuilder.builder.join(' ')
        return {
            sql,
            bind:sqlBuilder.bind
        }
    }
}
module.exports = QueryBuild.default = QueryBuild;