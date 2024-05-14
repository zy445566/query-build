import {SqlBind, sqlBuilder, Op, OpMap, Connect, ConnectMap} from './enumobj'
export class Util {
    static getConnectSql (connect:Connect) {
        return ConnectMap[connect]?ConnectMap[connect]:ConnectMap[Connect.and];
    }
    static getOpSqlBind (data:Object, key:string):SqlBind {
        const opObj = data[key];
        const sqlBuilder:sqlBuilder = {
            builder:[],
            bind:[]
        }
        for(const opKey in Op) {
            if(opObj.hasOwnProperty(Op[opKey])) {
                const value = opObj[Op[opKey]];
                Util.concatBuilder(sqlBuilder, OpMap[Op[opKey]](key, value))
            }
        }
        const connectSQL = Util.getConnectSql(Connect.and);
        return {
            sql:sqlBuilder.builder.join(` ${connectSQL} `),
            bind:sqlBuilder.bind
        }
    }

    static concatBuilder (sqlBuilder:sqlBuilder, builderData:SqlBind):sqlBuilder {
        if(!builderData.sql){return sqlBuilder;}
        sqlBuilder.builder.push(builderData.sql.trim());
        sqlBuilder.bind = sqlBuilder.bind.concat(builderData.bind);
        return sqlBuilder;
    }

    static build (data:Object, keys:Array<string>, builderFunc:(data:Object, key:string)=>SqlBind):sqlBuilder {
        const sqlBuilder:sqlBuilder = {
            builder:[],
            bind:[]
        }
        for(const key of keys) {
            const builderData = builderFunc(data, key)
            Util.concatBuilder(sqlBuilder, builderData)
        }
        return sqlBuilder;
    }
}
export default Util;