# query-build
sql query build tootom，make native SQL and ORM will be mixed to write, complement each other.

# install
```sh
npm install query-build
```

# exmaple
```ts
import {QueryBuild,Connect,Op} from 'query-build'
// const {QueryBuild,Connect,Op} = require('query-build');
const queryBuild = new QueryBuild();
```
### SELECT
```ts
queryBuild.merge(
    'SELECT * FROM users WHERE',
    queryBuild.where({name:'jack', age:20}),
    'AND','(',queryBuild.where({vip:1,group:'admin'},Connect.or),')',
    'AND',queryBuild.where({
        id:{[Op.in]:[1,2,3]}
    }),
    'AND',queryBuild.where({
        type:{[Op.sqlBind]:{
            sql:'type=1',
            bind:[]
        }}
    }),
    'GROUP BY order'
)
// OR use SqlBind Object mixed
queryBuild.merge(
    'SELECT * FROM users WHERE',
    {
        sql:'name = ? AND age = ?',
        bind:['jack', 20]
    }
    'AND','(',queryBuild.where({vip:1,group:'admin'},Connect.or),')',
    'AND',queryBuild.where({
        id:{[Op.in]:[1,2,3]}
    }),
    'AND',queryBuild.where({
        type:{[Op.sqlBind]:{
            sql:'type=1',
            bind:[]
        }}
    }),
    'GROUP BY order'
)
/**
output:
{
    sql: 'SELECT * FROM users WHERE name = ? AND age = ? AND ( vip = ? OR group = ? ) AND id IN (?, ?, ?) AND type=1 GROUP BY order',
    bind: [ 'jack', 20, 1, 'admin', 1, 2, 3 ]
}
 * /
```
### UPDATE
```ts
queryBuild.merge(
    'UPDATE users SET',
    queryBuild.set({name:'jack', age:20}),
    'WHERE',
    queryBuild.where({id:1, name:'tom'}),
)
// OR use SqlBind Object mixed
queryBuild.merge(
    'UPDATE users',
    {
        sql:'SET name = ?, age = ?',
        bind:['jack', 20]
    },
    'WHERE',
    queryBuild.where({id:1, name:'tom'}),
)
/**
output:
{
    sql: 'UPDATE users SET name = ?, age = ? WHERE id = ? AND name = ?',
    bind: [ 'jack', 20, 1, 'tom' ]
}
 * /
```
### INSERT
```ts
queryBuild.merge(
    'INSERT INTO users (age, name)',
    'VALUES',
    queryBuild.foreach(
        [
            {name:'jack',age:20},
            {name:'tom',age:21},
            {name:'jerry',age:22},
        ],
        ['age','name']
    )
)
// OR use SqlBind Object mixed
queryBuild.merge(
    'INSERT INTO users (age, name)',
    'VALUES',
    {
        sql:'(?, ?)',
        bind:[20, 'jack']
    },
    queryBuild.foreach(
        [
            {name:'tom',age:21},
            {name:'jerry',age:22},
        ],
        ['age','name']
    )
)
/**
output:
{
    sql: 'INSERT INTO users (age, name) VALUES (?, ?),(?, ?),(?, ?)',
    bind: [ 20, 'jack', 21, 'tom', 22, 'jerry' ]
}
 * /
```
### DELETE
```ts
queryBuild.merge(
    'DELETE FROM users',
    'WHERE',
    queryBuild.where({id:1, name:'jack'}),
    'OR',queryBuild.where({name:'tom'}),
)
// OR use SqlBind Object mixed
queryBuild.merge(
    'DELETE FROM users',
    'WHERE',
    {
        sql:'id = ? AND name = ?',
        bind:[ 1, 'jack' ]
    },
    'OR',queryBuild.where({name:'tom'}),
)
/**
output:
{
    sql: 'DELETE FROM users WHERE id = ? AND name = ? OR name = ?',
    bind: [ 1, 'jack', 'tom' ]
}
 * /
```

### AOP
```js
const queryBuild = new Proxy(new QueryBuild(),{
    get: function (target, propKey, receiver) {
        if(propKey==='where'){
            return (where,...params)=>{
                where['platform_type'] = 1;
                const sqlBind = Reflect.get(target, propKey, receiver)(where,...params);
                sqlBind.sql+= 'AND deleted_timestamp IS NULL'
                return sqlBind;
            }
        }
        return Reflect.get(target, propKey, receiver);
    }
})
queryBuild.merge(
    'SELECT * FROM users WHERE',
    queryBuild.where({name:'jack'}),
)
/**
output:
{
    sql: 'SELECT * FROM users WHERE name = ? AND platform_type = ? AND deleted_timestamp IS NULL',
    bind: ['jack',1]
}
 * /
```

# Core Api
```ts
// SqlBind is anywhere,mixed anywhere
export type SqlBind = {
    sql:string;
    bind:Array<any>
}
export enum Connect {
    and,
    or,
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
    sqlBind, // use sqlBind native
};

export declare class QueryBuild {
    where(where: Object, connect?: Connect): SqlBind;
    orderBy(order: Array<[string, 'asc' | 'desc' | ''] | [string]>): SqlBind;
    limit(limit: [number, number] | [number]): SqlBind;
    set(prop: Object): SqlBind;
    foreach(propList: Array<Object>, keys: Array<string>): SqlBind;
    merge(...sqlBindList: Array<string | SqlBind>): SqlBind;
}
export default QueryBuild;
```
