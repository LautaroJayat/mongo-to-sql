import { FROM, SEMICOLON, SPACE } from "../constants";
import { generateSQLSelectStmt } from "./generateSQLSelectStmt";
import { parseCollectionName } from "../parseMongoCollectionName";
import { getWhereAndSelect } from "../parseMongoArgs/parseMongoArgs";
import { generateSQLWhereStmt } from "./generateSQLWhereStmt";
import { getCommand } from "./getCommand";

const SUPPORTED_COMMANDS = ['find']

function translateFindCommand(trimmedInput: string) {
    const { collection, error: colError } = parseCollectionName(trimmedInput);

    if (colError) {
        throw new Error(colError);
    }

    const { select, where } = getWhereAndSelect(trimmedInput);

    const query = `${generateSQLSelectStmt(select)}${SPACE}${FROM}${SPACE}${collection}${generateSQLWhereStmt(where)}${SEMICOLON}`;

    return query;
}

export const composeSQLQuery = (input: string): string => {
    const lastParen = input.lastIndexOf(")")

    const trimmedInput = input.substring(0, lastParen + 1)

    const command = getCommand(trimmedInput)

    switch (command) {
        case 'find':
            return translateFindCommand(trimmedInput)
        default:
            throw new Error(`only ${JSON.stringify(SUPPORTED_COMMANDS)} are supported. Got ${command}`)
    }

};
