import { composeSQLQuery } from "../SQLGenerator"


describe("composeSQLQuery", () => {
    const tests: { input: string, error: boolean, expectedOutput: string }[] = [
        {
            input: "db.users.find({})",
            expectedOutput: "SELECT * FROM users;",
            error: false
        },
        {
            input: "db.users.find({},{})",
            expectedOutput: "SELECT * FROM users;",
            error: false
        },
        {
            input: "db.users.find({},{age: 1})",
            expectedOutput: "SELECT age FROM users;",
            error: false
        },
        {
            input: "db.users.find({},{age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users;",
            error: false
        },
        {
            input: "db.users.find({}, {name: 1, age: 1, lastName: 1})",
            expectedOutput: "SELECT age, lastName, name FROM users;",
            error: false
        },
        {
            input: "db.users.find({},    {age: 1})",
            expectedOutput: "SELECT age FROM users;",
            error: false
        },
        {
            input: "db.users.find({name: 'john'}, {age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users WHERE name = 'john';",
            error: false
        },
        {
            input: "db.users.find({name: 'john', age: 25}, {age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users WHERE age = 25 AND name = 'john';",
            error: false
        },
        {
            input: "db.users.find({name: 'john', age: {$ne: 25}}, {age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users WHERE age != 25 AND name = 'john';",
            error: false
        },
        {
            input: "db.users.find({name: 'john', age: {$lte: 25}}, {age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users WHERE age =< 25 AND name = 'john';",
            error: false
        },
        {
            input: "db.users.find({name: 'john', age: { $lt: 25 } }, {age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users WHERE age < 25 AND name = 'john';",
            error: false
        },
        {
            input: "db.users.find({name: 'john', age: { $gte: 25 } }, {age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users WHERE age >= 25 AND name = 'john';",
            error: false
        },
        {
            input: "db.users.find({name: 'john', age: { $gt: 25 } }, {age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users WHERE age > 25 AND name = 'john';",
            error: false
        },
        {
            input: "db.users.find({name: 'john', age: { $gt: 25 }, salary: {$lt: 150000} }, {age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users WHERE age > 25 AND name = 'john' AND salary < 150000;",
            error: false
        },
        {
            input: "db.users.find({name: 'john', age: { $gt: 25 }, married: true }, {age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users WHERE age > 25 AND married = TRUE AND name = 'john';",
            error: false
        },
        {
            input: "db.users.find({name: 'john', age: { $gt: 25 }, married: false }, {age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users WHERE age > 25 AND married = FALSE AND name = 'john';",
            error: false
        },
        {
            input: "db.users.find({name: 'john', age: { $in: [25] }, married: true }, {age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users WHERE age IN ( 25 ) AND married = TRUE AND name = 'john';",
            error: false
        },
        {
            input: "db.users.find({name: 'john', surname: { $in: ['clark', 'smith'] }, married: true }, {age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users WHERE married = TRUE AND name = 'john' AND surname IN ( 'clark', 'smith' );",
            error: false
        },

        {
            input: "db.users.find({name: 'john', age: { $in: [25] }, married: true }, {age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users WHERE age IN ( 25 ) AND married = TRUE AND name = 'john';",
            error: false
        },
        {
            input: "db.users.find({ $or: [{name: 'john'}, {age: { $in: [25, 15] } }, {married: true} ]}, {age: 1, name: 1})",
            expectedOutput: "SELECT age, name FROM users WHERE ( name = 'john' OR age IN ( 25, 15 ) OR married = TRUE );",
            error: false
        },
        {
            input: "db.users.find({$or: [{ $and: [{ name: 'john' }, { age: { $in: [25, 15] } }] }, { married: true }]})",
            expectedOutput: "SELECT * FROM users WHERE ( ( name = 'john' AND age IN ( 25, 15 ) ) OR married = TRUE );",
            error: false
        },
        {
            input: "db.users.find({$or: [{ $and: [{ name: 'john' }, { age: { $in: [25, 15] } }] }, { married: true }]})",
            expectedOutput: "SELECT * FROM users WHERE ( ( name = 'john' AND age IN ( 25, 15 ) ) OR married = TRUE );",
            error: false
        },
        {
            input: "db.users.find({}, { married: true, id:1 })",
            expectedOutput: "",
            error: true
        },
        {
            input: "db.users.find({}, { married: 0, id: 0 })",
            expectedOutput: "",
            error: true
        },
        {
            input: "db.users.find({}, { married: 'true', id: 'true' })",
            expectedOutput: "",
            error: true
        },
        {
            input: "db.users.find()",
            expectedOutput: "",
            error: true
        },
        {
            input: "db.users.find(x{}, {})",
            expectedOutput: "",
            error: true
        },
        {
            input: "users.find({}]})",
            expectedOutput: "",
            error: true
        },
        {
            input: "db.users.find(,{})",
            expectedOutput: "",
            error: true
        },
        {
            input: "db.users.find({id: {$or: [{$gte: 15}]}},{})",
            expectedOutput: "",
            error: true
        },
        {
            input: "db.users.findOne({})",
            expectedOutput: "",
            error: true
        },
        {
            input: "db.users.findTwo({})",
            expectedOutput: "",
            error: true
        },
        {
            input: "db.users.insert({name: 'smith'})",
            expectedOutput: "",
            error: true
        },
    ]
    test.each(tests)("in:  $input\n      out: $expectedOutput\n      err: $error", (
        { input, expectedOutput, error }) => {
        let result;
        let err;
        try {
            result = composeSQLQuery(input)
        } catch (error) {
            //console.error(error)
            err = error
        }
        if (error) {
            expect(err).toBeDefined()
        } else {
            expect(result).toBe(expectedOutput)
            expect(err).toBeUndefined()
        }
    })
})

