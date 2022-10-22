import {SqlBind, sqlBuilder} from './enumobj'
export class Util {
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