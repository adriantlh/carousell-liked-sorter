const { filterAndSortItems } = require('./logic');

describe('filterAndSortItems', () => {
    test('should filter out Sold and Reserved items', () => {
        const input = [
            { name: 'Item 1', status: 'Available', category: 'Cat A' },
            { name: 'Item 2', status: 'Sold', category: 'Cat A' },
            { name: 'Item 3', status: 'Reserved', category: 'Cat B' },
            { name: 'Item 4', status: 'Something Else', category: 'Cat B' }
        ];

        const result = filterAndSortItems(input);

        // Expect Cat A to have only Item 1
        expect(result['Cat A']).toHaveLength(1);
        expect(result['Cat A'][0].name).toBe('Item 1');

        // Expect Cat B to have only Item 4
        expect(result['Cat B']).toHaveLength(1);
        expect(result['Cat B'][0].name).toBe('Item 4');
    });

    test('should group items by category', () => {
        const input = [
            { name: 'Item 1', status: 'Available', category: 'Electronics' },
            { name: 'Item 2', status: 'Available', category: 'Fashion' },
            { name: 'Item 3', status: 'Available', category: 'Electronics' }
        ];

        const result = filterAndSortItems(input);

        expect(result['Electronics']).toHaveLength(2);
        expect(result['Fashion']).toHaveLength(1);
    });

    test('should handle items with missing category/condition', () => {
        const input = [
            { name: 'Item 1', status: 'Available' } // No category or condition
        ];

        const result = filterAndSortItems(input);

        expect(result['Unknown']).toBeDefined();
        expect(result['Unknown']).toHaveLength(1);
    });

    test('should return empty object if all items are filtered out', () => {
        const input = [
            { name: 'Item 1', status: 'Sold' },
            { name: 'Item 2', status: 'Reserved' }
        ];

        const result = filterAndSortItems(input);

        expect(result).toEqual({});
    });
});