import { _getIndexesOfArgs, Indexes } from '../parseMongoArgs';

describe('_getIndexesOfArgs OK Calls', () => {

    it.each([{
        name: "works with simple arguments for where and select",
        input: "({arg1: 'value1', arg2: 'value2'}, {field:1, field2:1})",
        assertFn: (result: Indexes) => {
            expect(result).toEqual({
                firstArgFirstBrace: 1,
                commaSeparatingArgs: 33,
            });
            expect(result.error).toBeUndefined()
        }


    },
    {
        name: "works with simple arguments for where and no select",
        input: "({arg1: 'value1', arg2: 'value2'})",
        assertFn: (result: Indexes) => {
            expect(result).toEqual({
                firstArgFirstBrace: 1,
            });
            expect(result.error).toBeUndefined()
            expect(result.commaSeparatingArgs).toBeUndefined()
        }
    },
    {
        name: "works with simple arguments for where and empty select",
        input: "({arg1: 'value1', arg2: 'value2'}, {})",
        assertFn: (result: Indexes) => {
            expect(result).toEqual({
                firstArgFirstBrace: 1,
                commaSeparatingArgs: 33,
            });
            expect(result.error).toBeUndefined()
        }


    },
    {
        name: "works with simple arguments for empty where and non empty select",
        input: "({}, {field:1, field2:1})",
        assertFn: (result: Indexes) => {
            expect(result).toEqual({
                firstArgFirstBrace: 1,
                commaSeparatingArgs: 3,
            });
            expect(result.error).toBeUndefined()
        }


    },
    {
        name: "works with simple arguments for both empty where and select",
        input: "({}, {})",
        assertFn: (result: Indexes) => {
            expect(result).toEqual({
                firstArgFirstBrace: 1,
                commaSeparatingArgs: 3,
            });
            expect(result.error).toBeUndefined()
        }
    }
        ,
    {
        name: "works with simple arguments for both empty where no select",
        input: "({})",
        assertFn: (result: Indexes) => {
            expect(result).toEqual({
                firstArgFirstBrace: 1,
            });
            expect(result.error).toBeUndefined()
            expect(result.commaSeparatingArgs).toBeUndefined()
        }
    }]
    )('$name', ({ input, assertFn }: { input: string, assertFn: (result: Indexes) => void }) => {
        const result = _getIndexesOfArgs(input);
        assertFn(result)

    });




});
describe('_getIndexesOfArgs BAD Calls', () => {
    it.each([
        {
            query: "(arg1: value1, arg2: value2)"
        },
        {
            query: "(arg1: ''value1, arg2: 'value2')"
        },
        {
            query: "(x{arg1: 'value1', arg2: 'value2')"
        },
        {
            query: "({{arg1: value1, arg2: value2})"
        },
        {
            query: "(}arg1: value1, arg2: value2})"
        },
        {
            query: "(!{arg1: value1, arg2: value2})"
        },
    ])("must provide error for bad queries", ({ query }: { query: string }) => {
        const result = _getIndexesOfArgs(query);
        expect(result.error).toBeDefined();
    });

})