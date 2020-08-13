# query-build
sql query build tools

# install
```sh
npm install query-build
```

# exmaple
```js
const QueryBuild = require('query-build');
const queryBuild = new QueryBuild();
```
## SELECT
```js
queryBuild.merge(
    'SELECT * FROM users WHERE',
    queryBuild.where({name:'zs', age:20}),
    'AND','(',queryBuild.where({vip:1,group:'admin'},queryBuild.Connect.or),')',
    'AND',queryBuild.where({
        id:{[queryBuild.Op.in]:[1,2,3]}
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
## UPDATE
```js
queryBuild.merge(
    'UPDATE users SET',
    queryBuild.set({name:'zs', age:20}),
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
## INSERT
```js
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
/**
output:
{
    sql: 'INSERT INTO users (age, name) VALUES (?, ?),(?, ?),(?, ?)',
    bind: [ 20, 'zs', 21, 'ls', 22, 'ww' ]
}
 * /
```
## DELETE
```js
queryBuild.merge(
    'DELETE FROM users',
    'WHERE',
    queryBuild.where({id:1, name:'zs'}),
)
/**
output:
{
    sql: 'DELETE FROM users WHERE id = ? AND name = ?',
    bind: [ 1, 'zs' ]
}
 * /
```

# feature
1. use typescript
