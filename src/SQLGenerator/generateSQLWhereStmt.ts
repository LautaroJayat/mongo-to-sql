import { AND, EQ, SPACE, WHERE } from "../constants";
import { Operator, Value, RightPart, LeftPart, BinaryExpression, RawValue, SQlBuilder, ArrayExpression, } from "./types";


type Expression = Value | RightPart | BinaryExpression | ArrayExpression

class ExpressionFactory {
    defaultOperator: string;

    constructor(defaultOperator: string) {
        this.defaultOperator = defaultOperator;
    }

    createExpression(rawValue: RawValue): Expression {
        switch (rawValue.type) {
            case 'primitive':
                return this.createValue(rawValue);

            case 'object':
                if (rawValue.leftNotOperator()) {
                    // raw value is {identity: expression|value}
                    // like {identity: {$operator: expression|value } } or {identity: value}
                    return this.createBinExpression(rawValue.getLeft(), rawValue.getRight());
                }

                // raw value is { $operator: expression|value}
                const operator = new Operator(rawValue.getLeft().toPrimitive())
                return this.createRightPartOfExpression(operator, rawValue.getRight());

            default:
                throw new Error(`expected string | number | object as raw value, got: ${rawValue}`);
        }
    }

    private createValue(rawValue: RawValue): Value {
        return new Value(rawValue);
    }

    private createDefaultRightPart(rawValue: RawValue): RightPart {
        return new RightPart(new Operator(this.defaultOperator), new Value(rawValue));
    }

    private createRightPartOfExpression(operator: Operator, rawRight: RawValue): RightPart | ArrayExpression {
        if (!rawRight.isArray()) {
            return new RightPart(operator, this.createExpression(rawRight));
        }
        if (operator.isIn()) {
            // because we need to prepend "IN" -> "IN (exp, exp, exp)"
            // createArrayExpression wont prepend anything.
            return new RightPart(operator, this.createArrayExpression(operator, rawRight));
        }
        // at this point this is just $and | $or
        // is just "(exp + operator + exp + operator)"
        return this.createArrayExpression(operator, rawRight)
    }

    private createBinExpression(rawLeft: RawValue, rawRight: RawValue): BinaryExpression {
        if (`${rawLeft.toPrimitive()}` === "") {
            throw new Error("bad identifier or operator. Please check your syntax")
        }

        const identifier = new LeftPart(`${rawLeft.toPrimitive()}`)

        if (rawRight.isObject()) {
            // this means we received {something: {$operator: expression | value} }
            if (rawRight.leftIsAndOr()) {
                throw new Error("$and | $or cant be used as value expressions, they must be used at top level")
            }
            return new BinaryExpression(identifier, this.createExpression(rawRight));
        }
        // this means we received {something: value}
        return new BinaryExpression(identifier, this.createDefaultRightPart(rawRight));
    }

    /** Knows how to parse each element as expression. */
    private createArrayExpression(operator: Operator, rawValue: RawValue) {
        const expressions: SQlBuilder[] = []
        if (!rawValue.isArray()) {
            throw new Error("expected array, but got something else")
        }
        for (const e of rawValue.toPrimitive()) {
            const v = new RawValue(e)
            expressions.push(this.createExpression(v))
        }
        return new ArrayExpression(operator, expressions)
    }
}

export function generateSQLWhereStmt(where: Record<string, any> | undefined): string {
    if (!where) {
        return "";
    }

    const expressionsFactory = new ExpressionFactory(EQ);
    const expressions: SQlBuilder[] = [];
    const sortedKeys = Object.keys(where).sort();

    for (const k of sortedKeys) {
        expressions.push(expressionsFactory.createExpression(new RawValue({ [k]: where[k] })));
    }
    if (sortedKeys.length === 0) {
        return "";
    }
    let SQL = `${SPACE}${WHERE}`;

    for (let i = 0; i < expressions.length; i++) {
        SQL = SQL.concat(` ${expressions[i].toSQL()}`);
        if (i + 1 < expressions.length) {
            SQL = SQL.concat(`${SPACE}${AND}`);
        }
    }

    return SQL;
}
