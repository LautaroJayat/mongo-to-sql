import { DOT } from "../constants";
import { checkForNumber, checkForNonAlphaNumeric } from "../utils/utils";

export const errorBadMethodChaining = "couldn't find collection between dots";
export const errorNoDbFound = "first dot is at position 0 so no db was specified";
export const errorCollectionBadCharForCollection = "only alphanumeric and low dashes are allowed for collection";
export const errorCollectionMustStartWithALetter = "collection names should start with a letter";

interface ParseResult {
    collection?: string;
    error?: string;
}

/**
 * 
 * @param input: a full string like 'db.users.find({})'
 * @returns 
 */
export function parseCollectionName(input: string): ParseResult {
    const firstDot = input.indexOf(DOT);

    if (firstDot === -1) {
        return { error: errorBadMethodChaining };
    }

    if (firstDot === 0) {
        return { error: errorNoDbFound };
    }

    const nextCharFromFirstDot = firstDot + 1;
    const secondDot = input.substring(nextCharFromFirstDot).indexOf(DOT);

    if (secondDot === -1) {
        return { error: errorBadMethodChaining };
    }

    const collection = input.substring(nextCharFromFirstDot, nextCharFromFirstDot + secondDot);

    if (checkForNumber.test(collection.charAt(0))) {
        return { error: errorCollectionMustStartWithALetter };
    }

    if (checkForNonAlphaNumeric.test(collection)) {
        return { error: errorCollectionBadCharForCollection };
    }

    return { collection };
}
