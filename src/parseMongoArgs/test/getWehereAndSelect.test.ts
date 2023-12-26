import * as parseMongoArgs from '../parseMongoArgs';

describe('getWhereAndSelect', () => {
    it.each([
        {
            input: "({arg1: 'value1', arg2: 'value2'}, {field:1, field2:1})",
            expectedWhere: { arg1: "value1", arg2: "value2" },
            expectedSelect: { field: 1, field2: 1 },
            expectedError: false
        },
        {
            input: "({}, {field:1, field2:1})",
            expectedWhere: {},
            expectedSelect: { field: 1, field2: 1 },
            expectedError: false
        },
        {
            input: "({arg1: 'value1', arg2: 'value2'}, {})",
            expectedWhere: { arg1: "value1", arg2: "value2" },
            expectedSelect: {},
            expectedError: false
        },
        {
            input: "({arg1: 'value1', arg2: 'value2'})",
            expectedWhere: { arg1: "value1", arg2: "value2" },
            expectedSelect: undefined,
            expectedError: false
        },
        {
            input: "({}, {})",
            expectedWhere: {},
            expectedSelect: {},
            expectedError: false
        },
        {
            input: "({})",
            expectedWhere: {},
            expectedSelect: undefined,
            expectedError: false
        },
        {
            input: "({arg1: 'value1', arg2: { $gte: 'value2'}}, {arg1: 1})",
            expectedWhere: { arg1: "value1", arg2: { $gte: 'value2' } },
            expectedSelect: { arg1: 1 },
            expectedError: false
        },
        {
            input: "(x{arg1: 'value1', arg2: { $gte: 'value2'}}, {arg1: 1})",
            expectedWhere: undefined,
            expectedSelect: undefined,
            expectedError: true
        },
        {
            input: "(arg1: 'value1', arg2: { $gte: 'value2'}}, {arg1: 1})",
            expectedWhere: undefined,
            expectedSelect: undefined,
            expectedError: true
        },
        {
            input: "({)arg1: 'value1', arg2: { $gte: 'value2'}}, {arg1: 1})",
            expectedWhere: undefined,
            expectedSelect: undefined,
            expectedError: true
        },
        {
            input: "({}arg1: 'value1', arg2: { $gte: 'value2'}}, {arg1: 1})",
            expectedWhere: undefined,
            expectedSelect: undefined,
            expectedError: true
        },
        {
            input: "(,, {arg1: 1})",
            expectedWhere: undefined,
            expectedSelect: undefined,
            expectedError: true
        },
        {
            input: "(,, }{arg1: 1})",
            expectedWhere: undefined,
            expectedSelect: undefined,
            expectedError: true
        },
        {
            input: "()",
            expectedWhere: undefined,
            expectedSelect: undefined,
            expectedError: true
        }


    ]
    )('$input', ({
        input,
        expectedWhere,
        expectedSelect,
        expectedError }) => {
        let where;
        let select;
        let error;
        try {
            const result = parseMongoArgs.getWhereAndSelect(input)
            where = result.where
            select = result.select
        } catch (e) {
            error = e
        }

        if (!expectedWhere) {
            expect(where).toBeUndefined()
        } else {
            expect(where).toMatchObject(expectedWhere)
        }

        if (!expectedSelect) {
            expect(select).toBeUndefined()
        } else {
            expect(select).toMatchObject(expectedSelect)
        }

        if (expectedError) {
            expect(error).toBeDefined()
        } else {
            expect(error).toBeUndefined()
        }
    })

})
