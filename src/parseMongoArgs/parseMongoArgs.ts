import { OPEN_BRACE, SPACE, COMMA, CLOSING_BRACE, CLOSING_PARENTHESES, OPEN_PARENTHESES } from "../constants";
import { matchObjectKeys } from "../utils/utils";

export const errorInvalidArgsCall = "arguments can only be valid objects objects";
export const errorBadArguments = "found unbalanced braces within the objects provided as arguments";
export const errorInvalidSyntax = "the syntax for the function call is invalid";

export interface Indexes {
    firstArgFirstBrace?: number;
    commaSeparatingArgs?: number;
    error?: string;
}

/**
 * This function is supposed to get the indexes needed to then split the string into segments.
 * Those segments should represent the arguments of the function call.
 * It expects an input starting from the first parentheses
 */
export function _getIndexesOfArgs(input: string): Indexes {
    let firstArgFirstBrace: number | undefined;
    let commaSeparatingArgs: number | undefined;
    let counter = 0;

    for (let i = 1; i < input.length; i++) {
        const currentChar = input.charAt(i);

        if (!firstArgFirstBrace) {
            if (currentChar === OPEN_BRACE) {
                firstArgFirstBrace = i;
                counter++;
                continue;
            } else if (currentChar === SPACE) {
                continue;
            } else {
                return { error: errorInvalidArgsCall };
            }
        }

        if (currentChar === OPEN_BRACE) {
            counter++;
            continue;
        }

        if (currentChar === CLOSING_BRACE) {
            counter--;
        }

        if (counter === 0) {
            if (!commaSeparatingArgs && currentChar === COMMA) {
                commaSeparatingArgs = i;
                break;
            }

            if (currentChar === CLOSING_PARENTHESES) {
                break;
            }
        }
    }

    if (counter !== 0) {
        return { error: errorBadArguments };
    }

    return {
        firstArgFirstBrace,
        commaSeparatingArgs,
    };
}

/**
 * As the main idea behind all of this package is to try to sanitize the input
 * and turn it into valid JS objects, this will attempt to add single quotes to each key.
 */
export function _tryMakeJsonString(input: string): string {
    return input.trim().replace(/\"|\'/gi, (char) => {
        if (char === "'") return '"';
        if (char === '"') return "'";
        return char;
    }).replace(matchObjectKeys, '\"$1\":');
}

/**
 * This function will get the whole query and extract the segments
 * where our candidates as JSON strings
 */
function _getArgsAsPossibleJsonString(input: string): { whereStmt?: string; selectStmt?: string; error?: string } {
    const firstParenthesis = input.indexOf(OPEN_PARENTHESES);
    const lastParenthesis = input.lastIndexOf(CLOSING_PARENTHESES);

    if (firstParenthesis < 0) {
        return { error: errorInvalidSyntax };
    }

    if (lastParenthesis < 0 || lastParenthesis < firstParenthesis) {
        return { error: errorInvalidSyntax };
    }

    const { firstArgFirstBrace, commaSeparatingArgs, error } = _getIndexesOfArgs(input.substring(firstParenthesis));

    if (error) {
        return { error };
    }

    if (!firstArgFirstBrace) {
        return {};
    }

    const firstSegment = input.substring(firstParenthesis, lastParenthesis).substring(firstArgFirstBrace, commaSeparatingArgs);
    const whereStmt = _tryMakeJsonString(firstSegment);

    if (!commaSeparatingArgs) {
        return { whereStmt };
    }

    const secondFragment = input.substring(firstParenthesis, lastParenthesis).substring(commaSeparatingArgs + 1);
    const selectStmt = _tryMakeJsonString(secondFragment);

    return { whereStmt, selectStmt };
}

/**
 * Note: this function is supposed to throw if some error occurred while parsing the query
 */
export function getWhereAndSelect(input: string): { where?: Record<string, any>; select?: Record<string, any> } {
    const result: { where?: Record<string, any>; select?: Record<string, any> } = {};
    const { whereStmt, selectStmt, error } = _getArgsAsPossibleJsonString(input);

    if (error) {
        throw new Error(error);
    }

    if (whereStmt) {
        result.where = JSON.parse(whereStmt);
    }

    if (selectStmt) {
        result.select = JSON.parse(selectStmt);
    }

    return result;
}
