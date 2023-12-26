import { $AND, $IN, $OR, CLOSING_PARENTHESES, COMMA, OPEN_PARENTHESES, SPACE } from "../constants";
import { arrayOperator, isOperator, translateOperator } from "../utils/utils";

export interface SQlBuilder {
    toSQL: () => string
}

export class RawValue {
    rawValue: any;
    type: string;
    jsType: string;

    constructor(rawValue: any) {
        this.rawValue = rawValue;
        const t = typeof rawValue;

        if (t === 'number' || t === 'string') {
            this.type = 'primitive';
            this.jsType = t;
            return;
        }

        if (t === 'boolean') {
            this.type = 'primitive';
            this.jsType = 'boolean';
            return
        }

        if (this.rawValue === null) {
            throw new Error("querying for a null value is not yet supported")
        }

        if (Array.isArray(rawValue)) {
            this.type = 'array'
            this.jsType = 'array'
            return
        }

        this.type = 'object';
        this.jsType = 'object';
    }

    toPrimitive(): any {
        return this.rawValue;
    }

    getRight(): RawValue {
        if (this.isObject()) {
            const v = Object.values(this.rawValue)[0];
            return new RawValue(v);
        }
        return this;
    }

    getLeft(): RawValue {
        if (!this.isObject()) {
            throw new Error("only raw objects can have left");
        }
        return new RawValue(Object.keys(this.rawValue)[0]);
    }

    leftNotOperator(): boolean {
        if (this.isString()) {
            return !isOperator(this.rawValue);
        }
        return !isOperator(Object.keys(this.rawValue)[0]);
    }

    leftIsAndOr(): boolean {
        if (this.isString()) {
            return [$AND, $OR].includes(this.rawValue);
        }
        return [$AND, $OR].includes(Object.keys(this.rawValue)[0])
    }

    isOperator(): boolean {
        if (this.isString()) {
            return isOperator(this.rawValue);
        }
        return isOperator(Object.keys(this.rawValue)[0])
    }


    isString(): boolean {
        return this.jsType === 'string';
    }

    isNumber(): boolean {
        return this.jsType === 'number';
    }

    isBoolean(): boolean {
        return this.jsType === 'boolean';
    }

    isArray(): boolean {
        return this.type === 'array';
    }

    isObject(): boolean {
        return this.jsType === 'object';
    }
}

export class Value implements SQlBuilder {
    value: RawValue;

    constructor(value: RawValue) {
        this.value = value;
    }

    toSQL(): string {
        if (this.value.isString()) {
            return `'${this.value.toPrimitive()}'`;
        }
        if (this.value.isBoolean()) {
            return `${this.value.toPrimitive()}`.toUpperCase();
        }
        return `${this.value.toPrimitive()}`;
    }
}

/** Knows how to concatenate expressions based on the operation.*/
export class ArrayExpression implements SQlBuilder {
    content: SQlBuilder[];
    separator: string;
    operator: Operator
    constructor(operator: Operator, content: SQlBuilder[]) {
        this.content = content;

        if (![$AND, $OR, $IN].includes(operator.raw)) {
            new Error("Operation not supported for array expressions: " + operator.raw)
        }

        if (operator.isIn()) {
            this.separator = `${COMMA}${SPACE}`
        } else {
            this.separator = `${SPACE}${operator.toSQL()}${SPACE}`
        }
        this.operator = operator
    }

    toSQL(): string {
        let SQL = []
        for (let i = 0; i < this.content.length; i++) {
            if (this.content[i] instanceof RightPart) {
                throw new Error("only binary expressions or values are allowed inside an array expression")
            }
            SQL.push(this.content[i].toSQL())
        }
        return `${OPEN_PARENTHESES}${SPACE}` + SQL.join(this.separator) + `${SPACE}${CLOSING_PARENTHESES}`
    }
}

export class Operator implements SQlBuilder {
    raw: string;

    constructor(raw: string) {
        this.raw = raw;
    }

    isAnd() {
        return this.raw === $AND;
    }

    isOr() {
        return this.raw === $OR;
    }
    isIn() {
        return this.raw === $IN;

    }

    toSQL(): string {
        if (isOperator(this.raw)) {
            return translateOperator(this.raw);
        }
        return this.raw;
    }
}

export class LeftPart implements SQlBuilder {
    key: string;

    constructor(key: string) {
        this.key = key;
    }

    toSQL(): string {
        return this.key;
    }

    getRaw(): string {
        return this.key
    }
}

export class RightPart implements SQlBuilder {
    operator: Operator;
    right: SQlBuilder;

    constructor(operator: Operator, right: SQlBuilder) {
        this.operator = operator;
        this.right = right;
    }

    toSQL(): string {
        return `${SPACE}${this.operator.toSQL()}${SPACE}${this.right.toSQL()}`;
    }
}

export class BinaryExpression implements SQlBuilder {
    left: LeftPart;
    right: SQlBuilder;

    constructor(left: LeftPart, right: SQlBuilder) {
        this.left = left;
        this.right = right;
    }

    toSQL(): string {
        return `${this.left.toSQL()}${this.right.toSQL()}`;
    }
}
