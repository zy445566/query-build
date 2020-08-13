class Util {
    static concatBuilder (sqlBuilder, builderData) {
        sqlBuilder.builder.push(builderData.sql.trim());
        sqlBuilder.bind = sqlBuilder.bind.concat(builderData.bind);
        return sqlBuilder;
    }

    static build (data, keys, builderFunc) {
        const sqlBuilder = {
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
module.exports = Util;