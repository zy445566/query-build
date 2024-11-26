import assert from "assert";
import { QueryBuild, Op } from "./index";
const queryBuild = new QueryBuild();

const testUnit = {
  [Symbol("test.where")]: async function () {
    assert.deepStrictEqual(
      queryBuild.where({ a: 1, b: 2 }),
      { sql: "a = ? AND b = ?", bind: [1, 2] },
      "test.where.QueryBuild error"
    );
  },
  [Symbol("test.where.op")]: async function () {
    assert.deepStrictEqual(
      queryBuild.where({ a: { [Op.gt]: 1, [Op.lt]: 9 } }),
      { sql: "a > ? AND a < ?", bind: [1, 9] },
      "test.where.op.QueryBuild error"
    );
  },
  [Symbol("test.where.op.in")]: async function () {
    assert.deepStrictEqual(
      queryBuild.where({ a: { [Op.in]: [1, 2, 3] } }),
      { sql: "a IN (?, ?, ?)", bind: [1, 2, 3] },
      "test.where.op.in.QueryBuild error"
    );
  },
  [Symbol("test.where.empty")]: async function () {
    assert.deepStrictEqual(
      queryBuild.where({ a: 1, b: {} }),
      { sql: "a = ?", bind: [1] },
      "test.where.QueryBuild error"
    );
  },
  [Symbol("test.order")]: async function () {
    assert.deepStrictEqual(
      queryBuild.orderBy([["id", "asc"], ["name"], ["code", "desc"]]),
      { sql: "id asc,name,code desc", bind: [] },
      "test.order.QueryBuild error"
    );
  },
  [Symbol("test.limit")]: async function () {
    assert.deepStrictEqual(
      queryBuild.limit([0, 15]),
      { sql: "0,15", bind: [] },
      "test.limit.QueryBuild error"
    );
  },
  [Symbol("test.set")]: async function () {
    assert.deepStrictEqual(
      queryBuild.set({ id: 1, name: "zs" }),
      { sql: "id = ?, name = ?", bind: [1, "zs"] },
      "test.where.QueryBuild error"
    );
  },
  [Symbol("test.foreach")]: async function () {
    assert.deepStrictEqual(
      queryBuild.foreach(
        [
          { name: "zs", age: 20 },
          { name: "ls", age: 21 },
          { name: "ww", age: 22 },
        ],
        ["age", "name"]
      ),
      {
        sql: "(?, ?),(?, ?),(?, ?)",
        bind: [20, "zs", 21, "ls", 22, "ww"],
      },
      "test.foreach.QueryBuild error"
    );
  },
  [Symbol("test.mergeBuild:where")]: async function () {
    assert.deepStrictEqual(
      queryBuild.merge(
        "SELECT * FROM users WHERE",
        queryBuild.where({ name: "zs", age: 20 }),
        "AND",
        "(",
        queryBuild.where({ vip: 1 }),
        " OR ",
        queryBuild.where({ group: "admin" }),
        ")",
        "AND",
        queryBuild.where({
          id: { [Op.in]: [1, 2, 3] },
        }),
        "AND",
        queryBuild.where({
          id: [1, 2, 3] ,
        }),
        "AND",
        queryBuild.where({
          type: {
            [Op.sqlBind]: {
              sql: "type=1",
              bind: [],
            },
          },
        }),
        "GROUP BY order"
      ),
      {
        sql: "SELECT * FROM users WHERE name = ? AND age = ? AND ( vip = ? OR group = ? ) AND id IN (?, ?, ?) AND id IN (?, ?, ?) AND type=1 GROUP BY order",
        bind: ["zs", 20, 1, "admin", 1, 2, 3, 1, 2, 3],
      }
    );
  },
  [Symbol("test.mergeBuild:set")]: async function () {
    assert.deepStrictEqual(
      queryBuild.merge(
        "UPDATE users SET",
        queryBuild.set({ name: "zs", age: 20 }),
        "WHERE",
        queryBuild.where({ id: 1, name: "ls" })
      ),
      {
        sql: "UPDATE users SET name = ?, age = ? WHERE id = ? AND name = ?",
        bind: ["zs", 20, 1, "ls"],
      }
    );
  },
  [Symbol("test.mergeBuild:set2")]: async function () {
    assert.deepStrictEqual(
      queryBuild.merge(
        "UPDATE users",
        {
          sql: "SET name = ?, age = ?",
          bind: ["zs", 20],
        },
        {
          sql: "WHERE id = ? AND name = ?",
          bind: [1, "ls"],
        }
      ),
      {
        sql: "UPDATE users SET name = ?, age = ? WHERE id = ? AND name = ?",
        bind: ["zs", 20, 1, "ls"],
      }
    );
  },
  [Symbol("test.mergeBuild:delete")]: async function () {
    assert.deepStrictEqual(
      queryBuild.merge(
        "DELETE FROM users",
        "WHERE",
        queryBuild.where({ id: 1, name: "zs" })
      ),
      {
        sql: "DELETE FROM users WHERE id = ? AND name = ?",
        bind: [1, "zs"],
      }
    );
  },
  [Symbol("test.mergeBuild:foreach")]: async function () {
    assert.deepStrictEqual(
      queryBuild.merge(
        "INSERT INTO users (age, name)",
        "VALUES",
        queryBuild.foreach(
          [
            { name: "zs", age: 20 },
            { name: "ls", age: 21 },
            { name: "ww", age: 22 },
          ],
          ["age", "name"]
        )
      ),
      {
        sql: "INSERT INTO users (age, name) VALUES (?, ?),(?, ?),(?, ?)",
        bind: [20, "zs", 21, "ls", 22, "ww"],
      }
    );
  },
  [Symbol("test.mergeBuild:foreach")]: async function () {
    assert.deepStrictEqual(
      queryBuild.merge(
        "SELECT * FROM users",
        "WHERE",
        {
          sql: "MATCH(name,total_name) AGAINST(? IN BOOLEAN MODE)",
          bind: ["张三"],
        },
        {
          sql: "AND vip=? AND group=?",
          bind: [1, "admin"],
        }
      ),
      {
        sql: "SELECT * FROM users WHERE MATCH(name,total_name) AGAINST(? IN BOOLEAN MODE) AND vip=? AND group=?",
        bind: ["张三", 1, "admin"],
      }
    );
  },
};

async function run(testUnitList) {
  for (let testUnitValue of testUnitList) {
    for (let testFunc of Object.getOwnPropertySymbols(testUnitValue)) {
      await testUnitValue[testFunc]();
    }
  }
}
(async function () {
  await run([testUnit]);
})().catch((error) => {
  console.error(error);
});
