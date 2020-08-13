# query-build
sql query build tools，make native SQL and ORM will be mixed to write, complement each other.

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
    queryBuild.where({name:'zs', age:20}),
    'AND','(',queryBuild.where({vip:1,group:'admin'},Connect.or),')',
    'AND',queryBuild.where({
        id:{[Op.in]:[1,2,3]}
    }),
    'GROUP BY order'
)
// OR use SqlBind Object mixed
queryBuild.merge(
    'SELECT * FROM users WHERE',
    {
        sql:'name = ? AND age = ?',
        bind:['zs', 20]
    }
    'AND','(',queryBuild.where({vip:1,group:'admin'},Connect.or),')',
    'AND',queryBuild.where({
        id:{[Op.in]:[1,2,3]}
    }),
    'GROUP BY order'
)
/**
output:
{
    sql: 'SELECT * FROM users WHERE name = ? AND age = ? AND ( vip = ? OR group = ? ) AND id IN (?, ?, ?) GROUP BY order',
    bind: [ 'zs', 20, 1, 'admin', 1, 2, 3 ]
}
 * /
```
### UPDATE
```ts
queryBuild.merge(
    'UPDATE users SET',
    queryBuild.set({name:'zs', age:20}),
    'WHERE',
    queryBuild.where({id:1, name:'ls'}),
)
// OR use SqlBind Object mixed
queryBuild.merge(
    'UPDATE users',
    {
        sql:'SET name = ?, age = ?',
        bind:['zs', 20]
    },
    'WHERE',
    queryBuild.where({id:1, name:'ls'}),
)
/**
output:
{
    sql: 'UPDATE users SET name = ?, age = ? WHERE id = ? AND name = ?',
    bind: [ 'zs', 20, 1, 'ls' ]
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
            {name:'zs',age:20},
            {name:'ls',age:21},
            {name:'ww',age:22},
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
        bind:[20, 'zs']
    },
    queryBuild.foreach(
        [
            {name:'ls',age:21},
            {name:'ww',age:22},
        ],
        ['age','name']
    )
)
/**
output:
{
    sql: 'INSERT INTO users (age, name) VALUES (?, ?),(?, ?),(?, ?)',
    bind: [ 20, 'zs', 21, 'ls', 22, 'ww' ]
}
 * /
```
### DELETE
```ts
queryBuild.merge(
    'DELETE FROM users',
    'WHERE',
    queryBuild.where({id:1, name:'zs'}),
    'OR',queryBuild.where({name:'ls'}),
)
// OR use SqlBind Object mixed
queryBuild.merge(
    'DELETE FROM users',
    'WHERE',
    {
        sql:'id = ? AND name = ?',
        bind:[ 1, 'zs' ]
    },
    'OR',queryBuild.where({name:'ls'}),
)
/**
output:
{
    sql: 'DELETE FROM users WHERE id = ? AND name = ? OR name = ?',
    bind: [ 1, 'zs', 'ls' ]
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
};

export abstract class QueryBuild {
    abstract where(where:Object, connect:Connect=Connect.and):SqlBind;

    abstract set(prop:Object):SqlBind;

    abstract foreach(propList:Array<Object>, keys:Array<string>):SqlBind;
    
    abstract merge(...sqlBindList:Array<string|SqlBind>):SqlBind;
}
```
