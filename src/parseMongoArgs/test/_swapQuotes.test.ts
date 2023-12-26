import { _tryMakeJsonString, } from '../parseMongoArgs';


describe('_tryMakeJsonString', () => {
    it.each([
        {
            input: "({arg1: 'value1', arg2: 'value2'})",
            expected: `({\"arg1\": \"value1\", \"arg2\": \"value2\"})`
        },
        {
            input: `({arg1: 'va "lu" e1', arg2: 'va "lu" e2'})`,
            expected: `({\"arg1\": \"va 'lu' e1\", \"arg2\": \"va 'lu' e2\"})`
        },
    ])("must swap the quotes and double quotes", ({ input, expected }) => {
        const result = _tryMakeJsonString(input);
        expect(result).toBe(expected)

    });

})