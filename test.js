const assert =  require('assert')
const QueryBuild = require('./index')
const queryBuild = new QueryBuild();

const testUnit = {
    [Symbol('test.where')] : async function() {
        assert.deepEqual(
            queryBuild.where({a:1, b:2}),
            { sql: 'a = ? AND b = ?', bind: [ 1, 2 ] },
            'test.whereQueryBuild error'
        )
    },
    [Symbol('test.set')] : async function() {
        assert.deepEqual(
            queryBuild.set({id:1, name:'zs'}),
            { sql: 'id = ?, name = ?', bind: [ 1, 'zs' ] },
            'test.whereQueryBuild error'
        )
    },
    [Symbol('test.foreach')] : async function() {
        assert.deepEqual(
            queryBuild.foreach(
                [
                    {name:'zs',age:20},
                    {name:'ls',age:21},
                    {name:'ww',age:22},
                ],
                ['age','name']
            ),
            {
                sql: '(?, ?),(?, ?),(?, ?)',
                bind: [ 20, 'zs', 21, 'ls', 22, 'ww' ]
            },
            'test.foreachQueryBuild error'
        )
    },
    [Symbol('test.mergeBuild:where')] : async function() {
        assert.deepEqual(queryBuild.merge(
            'SELECT * FROM users WHERE',
            queryBuild.where({name:'zs', age:20}),
            'AND','(',queryBuild.where({vip:1,group:'admin'},queryBuild.Connect.or),')',
            'AND',queryBuild.where({
                id:{[queryBuild.Op.in]:[1,2,3]}
            }),
            'GROUP BY order'
        ),{
            sql: 'SELECT * FROM users WHERE name = ? AND age = ? AND ( vip = ? OR group = ? ) AND id IN (?, ?, ?) GROUP BY order',
            bind: [ 'zs', 20, 1, 'admin', 1, 2, 3 ]
        })
    },
    [Symbol('test.mergeBuild:set')] : async function() {
        assert.deepEqual(queryBuild.merge(
            'UPDATE users SET',
            queryBuild.set({name:'zs', age:20}),
            'WHERE',
            queryBuild.where({id:1, name:'ls'}),
        ),{
            sql: 'UPDATE users SET name = ?, age = ? WHERE id = ? AND name = ?',
            bind: [ 'zs', 20, 1, 'ls' ]
        })
    },
    [Symbol('test.mergeBuild:set2')] : async function() {
        assert.deepEqual(queryBuild.merge(
            'UPDATE users',
            {
                sql:'SET name = ?, age = ?',
                bind:['zs', 20]
            },
            {
                sql:'WHERE id = ? AND name = ?',
                bind:[1, 'ls']
            },
        ),{
            sql: 'UPDATE users SET name = ?, age = ? WHERE id = ? AND name = ?',
            bind: [ 'zs', 20, 1, 'ls' ]
        })
    },
    [Symbol('test.mergeBuild:delete')] : async function() {
        assert.deepEqual(queryBuild.merge(
            'DELETE FROM users',
            'WHERE',
            queryBuild.where({id:1, name:'zs'}),
        ),{
            sql: 'DELETE FROM users WHERE id = ? AND name = ?',
            bind: [ 1, 'zs' ]
        })
    },
    [Symbol('test.mergeBuild:foreach')] : async function() {
        assert.deepEqual(queryBuild.merge(
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
        ),{
            sql: 'INSERT INTO users (age, name) VALUES (?, ?),(?, ?),(?, ?)',
            bind: [ 20, 'zs', 21, 'ls', 22, 'ww' ]
        })
    },
    [Symbol('test.mergeBuild:foreach')] : async function() {
        assert.deepEqual(queryBuild.merge(
            'SELECT * FROM users',
            'WHERE',
            {
                sql:'MATCH(name,total_name) AGAINST(? IN BOOLEAN MODE)',
                bind:['张三']
            },
            {
                sql: 'AND vip=? AND group=?',
                bind: [ 1, 'admin' ]
            }
        ),{
            sql: 'SELECT * FROM users WHERE MATCH(name,total_name) AGAINST(? IN BOOLEAN MODE) AND vip=? AND group=?',
            bind: [ '张三', 1, 'admin' ]
        })
    },
}


async function run(testUnitList) {
    for(let testUnitValue of testUnitList) {
        for(let testFunc of Object.getOwnPropertySymbols(testUnitValue)) {
            await testUnitValue[testFunc]();
        }
    }
}
(async function() {
    await run([testUnit]);
})();

