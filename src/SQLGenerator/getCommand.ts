import { DOT, OPEN_PARENTHESES } from "../constants";

export function getCommand(input: string) {
    const firstCharAfterFirstDot = input.indexOf(DOT) + 1
    const firstCharAfterSecondDot = input.substring(firstCharAfterFirstDot).indexOf(DOT) + firstCharAfterFirstDot + 1
    const command = input.substring(firstCharAfterSecondDot, input.indexOf(OPEN_PARENTHESES))
    return command
}