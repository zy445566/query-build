// [Connect.and]: {a: 5}           // AND (a = 5)
// [Connect.or]: [{a: 5}, {a: 6}]  // (a = 5 OR a = 6)
const Connect = {
    and:Symbol('and'),
    or:Symbol('or'),
}
module.exports.Connect = Connect;

const ConnectMap = {
    [Connect.and]:'AND',
    [Connect.or]:'OR',
};
module.exports.ConnectMap = ConnectMap;

module.exports.getConnectSql = function (connect) {
    return ConnectMap[connect]?ConnectMap[connect]:ConnectMap[Connect.and];
}
// [Op.gt]: 6,                // > 6
// [Op.gte]: 6,               // >= 6
// [Op.lt]: 10,               // < 10
// [Op.lte]: 10,              // <= 10
// [Op.ne]: 20,               // != 20
// [Op.eq]: 3,                // = 3
// [Op.not]: true,            // IS NOT TRUE
// [Op.between]: [6, 10],     // BETWEEN 6 AND 10
// [Op.notBetween]: [11, 15], // NOT BETWEEN 11 AND 15
// [Op.in]: [1, 2],           // IN (1, 2)
// [Op.notIn]: [1, 2],        // NOT IN (1, 2)
// [Op.like]: '%hat',         // LIKE '%hat'
// [Op.notLike]: '%hat'       // NOT LIKE '%hat'
// [Op.regexp]: '^[h|a|t]'    // REGEXP/~ '^[h|a|t]' (MySQL/PG only)
// [Op.notRegexp]: '^[h|a|t]' // NOT REGEXP/!~ '^[h|a|t]' (MySQL/PG only)
const Op = {
    gt:Symbol('gt'), // > 6
    gte:Symbol('gte'), // >= 6
    lt:Symbol('lt'), // < 10
    lte:Symbol('lte'), // <= 10
    ne:Symbol('ne'), // != 20
    eq:Symbol('eq'), // = 3
    not:Symbol('not'), // IS NOT TRUE
    between:Symbol('between'), // BETWEEN 6 AND 10
    notBetween:Symbol('notBetween'), // NOT BETWEEN 11 AND 15
    in:Symbol('in'), // IN (1, 2)
    notIn:Symbol('notIn'), // NOT IN (1, 2)
    like:Symbol('like'), // LIKE '%hat'
    notLike:Symbol('notLike'), // NOT LIKE '%hat'
    regexp:Symbol('regexp'), // REGEXP/~ '^[h|a|t]' (MySQL/PG only)
    notRegexp:Symbol('notRegexp'), // NOT REGEXP/!~ '^[h|a|t]' (MySQL/PG only)
};
module.exports.Op = Op;
const OpKeys = Object.keys(Op);
const OpMap = {
    [Op.gt]:(data, key, value) => {
        return {
            sql:`${key} > ?`,
            bind:[value],
        }
    },
    [Op.gte]:(key, value) => {
        return {
            sql:`${key} >= ?`,
            bind:[value],
        }
    },
    [Op.lt]:(key, value) => {
        return {
            sql:`${key} < ?`,
            bind:[value],
        }
    },
    [Op.lte]:(key, value) => {
        return {
            sql:`${key} <= ?`,
            bind:[value],
        }
    },
    [Op.ne]:(key, value) => {
        if(value===null) {
            return {
                sql:`${key} IS NOT NULL`,
                bind:[],
            }
        }
        return {
            sql:`${key} != ?`,
            bind:[value],
        }
    },
    [Op.eq]:(key, value) => {
        if(value===null) {
            return {
                sql:`${key} IS NULL`,
                bind:[],
            }
        }
        return {
            sql:`${key} = ?`,
            bind:[value],
        }
    },
    [Op.not]:(key, value) => {
        if(value) {
            return {
                sql:`${key} IS NOT TRUE`,
                bind:[],
            }
        } else {
            return {
                sql:`${key} IS NOT FALSE`,
                bind:[],
            }
        }
        
    }, // only TRUE or FALSE
    [Op.between]:(key, value) => {
        if(!(value instanceof Array)){throw new Error('between need Array')}
        if(value.length!==2){throw new Error('between need Array length is 2')}
        return {
            sql:`${key} BETWEEN ? AND ?`,
            bind:value,
        }
    },
    [Op.notBetween]:(key, value) => {
        if(!(value instanceof Array)){throw new Error('between need Array')}
        if(value.length!==2){throw new Error('between need Array length is 2')}
        return {
            sql:`${key} NOT BETWEEN ? AND ?`,
            bind:value,
        }
    },
    [Op.in]:(key, value) => {
        if(!(value instanceof Array)){throw new Error('IN need Array')}
        if(value.length<=0){throw new Error('IN need Array length gt 0')}
        return {
            sql:`${key} IN (${new Array(value.length).fill('?').join(', ')})`,
            bind:value,
        }
    },
    [Op.notIn]:(key, value) => {
        if(!(value instanceof Array)){throw new Error('NOT IN need Array')}
        if(value.length<=0){throw new Error('NOT IN need Array length gt 0')}
        return {
            sql:`${key} NOT IN (${new Array(value.length).fill('?').join(', ')})`,
            bind:value,
        }
    },
    [Op.like]:(key, value) => {
        return {
            sql:`${key} LIKE ?`,
            bind:[value],
        }
    },
    [Op.notLike]:(key, value) => {
        return {
            sql:`${key} NOT LIKE ?`,
            bind:[value],
        }
    },
    [Op.regexp]:(key, value) => {
        return {
            sql:`${key} REGEXP/~ ?`,
            bind:[value],
        }
    },
    [Op.notRegexp]:(key, value) => {
        return {
            sql:`${key} NOT REGEXP/!~ ?`,
            bind:[value],
        }
    },
}
module.exports.OpMap = OpMap;

module.exports.getOpSqlBind = function (data, key) {
    const opObj = data[key];
    for(const opKey of OpKeys) {
        if(opObj.hasOwnProperty(Op[opKey])) {
            const value = opObj[Op[opKey]];
            return OpMap[Op[opKey]](key, value);
        }
    }
    return {
        sql:'',
        bind:[]
    }
}