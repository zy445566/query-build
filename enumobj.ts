export type SqlBind = {
    sql:string;
    bind:Array<any>
}
export type sqlBuilder = {
    builder:Array<string>;
    bind:Array<any>
}

// [Connect.and]: {a: 5}           // AND (a = 5)
// [Connect.or]: [{a: 5}, {a: 6}]  // (a = 5 OR a = 6)
export enum Connect {
    and,
    or,
}

export const ConnectMap = {
    [Connect.and]:'AND',
    [Connect.or]:'OR',
};

export function getConnectSql (connect:Connect) {
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
export enum Op {
    gt, // > 6
    gte, // >= 6
    lt, // < 10
    lte, // <= 10
    ne, // != 20
    eq, // = 3
    not, // IS NOT TRUE
    between, // BETWEEN 6 AND 10
    notBetween, // NOT BETWEEN 11 AND 15
    in, // IN (1, 2)
    notIn, // NOT IN (1, 2)
    like, // LIKE '%hat'
    notLike, // NOT LIKE '%hat'
    regexp, // REGEXP/~ '^[h|a|t]' (MySQL/PG only)
    notRegexp, // NOT REGEXP/!~ '^[h|a|t]' (MySQL/PG only)
    sqlBind, // 直接在where中使用sqlBind
};

export const OpMap = {
    [Op.gt]:(key:string, value:any):SqlBind => {
        return {
            sql:`${key} > ?`,
            bind:[value],
        }
    },
    [Op.gte]:(key:string, value:any):SqlBind => {
        return {
            sql:`${key} >= ?`,
            bind:[value],
        }
    },
    [Op.lt]:(key:string, value:any):SqlBind => {
        return {
            sql:`${key} < ?`,
            bind:[value],
        }
    },
    [Op.lte]:(key:string, value:any):SqlBind => {
        return {
            sql:`${key} <= ?`,
            bind:[value],
        }
    },
    [Op.ne]:(key:string, value:any):SqlBind => {
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
    [Op.eq]:(key:string, value:any):SqlBind => {
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
    [Op.not]:(key:string, value:any):SqlBind => {
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
    [Op.between]:(key:string, value:any):SqlBind => {
        if(value.length===undefined){throw new Error('between need Array')}
        if(value.length!==2){throw new Error('between need Array length is 2')}
        return {
            sql:`${key} BETWEEN ? AND ?`,
            bind:value,
        }
    },
    [Op.notBetween]:(key:string, value:any):SqlBind => {
        if(value.length===undefined){throw new Error('between need Array')}
        if(value.length!==2){throw new Error('between need Array length is 2')}
        return {
            sql:`${key} NOT BETWEEN ? AND ?`,
            bind:value,
        }
    },
    [Op.in]:(key:string, value:any):SqlBind => {
        if(value.length===undefined){throw new Error('IN need Array')}
        if(value.length<=0){throw new Error('IN need Array length gt 0')}
        return {
            sql:`${key} IN (${new Array(value.length).fill('?').join(', ')})`,
            bind:value,
        }
    },
    [Op.notIn]:(key:string, value:any):SqlBind => {
        if(value.length===undefined){throw new Error('NOT IN need Array')}
        if(value.length<=0){throw new Error('NOT IN need Array length gt 0')}
        return {
            sql:`${key} NOT IN (${new Array(value.length).fill('?').join(', ')})`,
            bind:value,
        }
    },
    [Op.like]:(key:string, value:any):SqlBind => {
        return {
            sql:`${key} LIKE ?`,
            bind:[value],
        }
    },
    [Op.notLike]:(key:string, value:any):SqlBind => {
        return {
            sql:`${key} NOT LIKE ?`,
            bind:[value],
        }
    },
    [Op.regexp]:(key:string, value:any):SqlBind => {
        return {
            sql:`${key} REGEXP/~ ?`,
            bind:[value],
        }
    },
    [Op.notRegexp]:(key:string, value:any):SqlBind => {
        return {
            sql:`${key} NOT REGEXP/!~ ?`,
            bind:[value],
        }
    },
    [Op.sqlBind]:(_key:string, value:any):SqlBind => {
        return {
            sql:value.sql || '',
            bind:value.bind || [],
        };
    },
}

export  function getOpSqlBind (data:Object, key:string):SqlBind {
    const opObj = data[key];
    for(const opKey in Op) {
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