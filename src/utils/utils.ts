import { $OR, $AND, $LT, $LTE, $GT, $GTE, $NE, $IN } from "../constants";

export const checkForNonAlphaNumeric = /[^a-z0-9_]/i;
export const checkForNumber = /\d/;
export const matchObjectKeys = /([$a-z0-9-_]+):/gi;

const operatorList = [$OR, $AND, $LT, $LTE, $GT, $GTE, $NE, $IN];

export function isOperator(key: string): boolean {
    return operatorList.includes(key);
}

export function arrayOperator(op: string): boolean {
    return [$AND, $OR, $IN].includes(op)

}

export function translateOperator(op: string): string {
    switch (op) {
        case $OR:
            return "OR";
        case $AND:
            return "AND";
        case $LT:
            return "<";
        case $LTE:
            return "=<";
        case $GT:
            return ">";
        case $GTE:
            return ">=";
        case $NE:
            return "!=";
        case $IN:
            return "IN";
        default:
            throw new Error(`unrecognized operator: ${op}`);
    }
}
