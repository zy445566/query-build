const assert =  require('assert')
const QueryBuild = require('./index')
const queryBuild = new QueryBuild();

const testUnit = {
    [Symbol('test.whereQueryBuild')] : async function() {
        assert.deepEqual(
            queryBuild.whereQueryBuild({a:1, b:2}),
            { sql: 'a = ? AND b = ?', bind: [ 1, 2 ] },
            'test.whereQueryBuild error'
        )
    },
    [Symbol('test.setQueryBuild')] : async function() {
        assert.deepEqual(
            queryBuild.setQueryBuild({id:1, name:'zs'}),
            { sql: 'id = ? , name = ?', bind: [ 1, 'zs' ] },
            'test.whereQueryBuild error'
        )
    },
    [Symbol('test.foreachQueryBuild')] : async function() {
        assert.deepEqual(
            queryBuild.foreachQueryBuild(
                [
                    {name:'zs',age:20},
                    {name:'ls',age:21},
                    {name:'ww',age:22},
                ],
                ['age','name']
            ),
            {
                sql: '(? , ?),(? , ?),(? , ?)',
                bind: [ 20, 'zs', 21, 'ls', 22, 'ww' ]
            },
            'test.foreachQueryBuild error'
        )
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

