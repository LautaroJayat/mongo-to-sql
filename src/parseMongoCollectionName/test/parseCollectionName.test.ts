import {
    parseCollectionName,
    errorBadMethodChaining,
    errorNoDbFound,
    errorCollectionBadCharForCollection,
    errorCollectionMustStartWithALetter
} from '../parseCollectionName';

describe('parseCollectionName', () => {
    it('should correctly parse collection name', () => {
        const input = 'db.users.find({})';
        const result = parseCollectionName(input);

        expect(result).toEqual({ collection: 'users' });
    });

    it('should handle missing first dot', () => {
        const input = 'dbusers.find({})';
        const result = parseCollectionName(input);

        expect(result).toEqual({ error: errorBadMethodChaining });
    });

    it('should handle first dot at position 0', () => {
        const input = '.users.find({})';
        const result = parseCollectionName(input);

        expect(result).toEqual({ error: errorNoDbFound });
    });

    it('should handle missing second dot', () => {
        const input = 'db.usersfind({})';
        const result = parseCollectionName(input);

        expect(result).toEqual({ error: errorBadMethodChaining });
    });

    it('should handle collection starting with a number', () => {
        const input = 'db.123users.find({})';
        const result = parseCollectionName(input);

        expect(result).toEqual({ error: errorCollectionMustStartWithALetter });
    });

    it('should handle collection with invalid characters', () => {
        const input = 'db.us&ers.find({})';
        const result = parseCollectionName(input);

        expect(result).toEqual({ error: errorCollectionBadCharForCollection });
    });
});