export function checkValuesOrThrow(values: Array<unknown>) {
    if (values.length === 0) {
        return
    }
    for (const v of values) {
        if (v !== true && v !== 1) {
            throw new Error("Projection only supports 'true' and '1' as values.")
        }
    }
    const s = new Set(values)
    if (s.size !== 1) {
        throw new Error("All projected key/value needs to use the same value (1 | true)")
    }
}

import { COMMA, SELECT, SPACE, STAR } from "../constants";
export const generateSQLSelectStmt = (select: Record<string, any> | undefined): string => {

    if (!select) return `${SELECT}${SPACE}${STAR}`;

    checkValuesOrThrow(Object.values(select))

    if (Object.keys(select).length === 0) return `${SELECT}${SPACE}${STAR}`

    return `${SELECT}${SPACE}` + Object.keys(select).sort().map(k => k.trim()).join(`${COMMA}${SPACE}`);
};