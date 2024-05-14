import util from './util'
import {SqlBind, Connect} from './enumobj'
export { SqlBind, Op, Connect } from './enumobj'
export class QueryBuild {
    where(where:Object, connect:Connect=Connect.and):SqlBind {
        const builderFunc = (where:Object, key:string):SqlBind => {
            if(where[key]===null) {
                return {
                    sql:`${key} IS NULL`,
                    bind:[],
                }
            }
            if(typeof where[key]==="object") {
                return util.getOpSqlBind(where, key);
            }
            return {
                sql:`${key} = ?`,
                bind:[where[key]],
            }
        }
        const sqlBuilder = util.build(where, Object.keys(where),builderFunc);
        const connectSQL = util.getConnectSql(connect);
        const sql = sqlBuilder.builder.join(` ${connectSQL} `) || '1=1';
        return {
            sql,
            bind:sqlBuilder.bind
        }
    }

    orderBy(order:Array<[string,'asc'|'desc'|'']|[string]>):SqlBind {
        return {
            sql:order.map(e=>e.join(' ')).join(','),
            bind:[]
        }
    }

    limit(limit:[number,number]|[number]):SqlBind {
        return {
            sql:limit.join(','),
            bind:[]
        }
    }

    set(prop:Object):SqlBind {
        const builderFunc = (prop:Object, key:string):SqlBind => {
            return {
                sql:`${key} = ?`,
                bind:[prop[key]],
            }
        }
        const sqlBuilder = util.build(prop, Object.keys(prop),builderFunc);
        return {
            sql:sqlBuilder.builder.join(', '),
            bind:sqlBuilder.bind
        }
    }

    foreach(propList:Array<Object>, keys:Array<string>):SqlBind {
        const sqlBuilder = {
            builder:[],
            bind:[]
        }
        const builderFunc = (prop:Object, key:string):SqlBind => {
            return {
                sql:`?`,
                bind:[prop[key]],
            }
        }
        for(const prop of propList) {
            const sqlBuilderData = util.build(prop, keys, builderFunc);
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
    
    merge(...sqlBindList:Array<string|SqlBind>):SqlBind {
        const sqlBuilder = {
            builder:[],
            bind:[]
        }

        for(const sqlBindData of sqlBindList) {
            if(typeof sqlBindData === 'string') {
                sqlBuilder.builder.push(sqlBindData.trim());
            } else {
                util.concatBuilder(sqlBuilder, sqlBindData)
            }
        }
        const sql = sqlBuilder.builder.join(' ')
        return {
            sql,
            bind:sqlBuilder.bind
        }
    }
}
export default QueryBuild;