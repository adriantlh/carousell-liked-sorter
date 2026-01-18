const { inferCategory, categorizeItems, getItemsByCategory } = require('./categories');

describe('inferCategory', () => {
    test('should categorize laptops correctly', () => {
        expect(inferCategory('MacBook Pro 16 inch M1')).toBe('Laptops');
        expect(inferCategory('ThinkPad T14 Gen 4')).toBe('Laptops');
        expect(inferCategory('Lenovo ThinkPad X1 Carbon')).toBe('Laptops');
    });

    test('should categorize desktops correctly', () => {
        expect(inferCategory('Apple iMac 24-inch M1')).toBe('Desktops');
        expect(inferCategory('Mac Mini M4 Pro')).toBe('Desktops');
        expect(inferCategory('Mac Studio M1 Max')).toBe('Desktops');
    });

    test('should categorize bikes correctly', () => {
        expect(inferCategory('Merida Reacto 6000')).toBe('Bikes');
        expect(inferCategory('Java Veloce Road Bike')).toBe('Bikes');
        expect(inferCategory('Polygon Bend R2 Gravel Bike')).toBe('Bikes');
        expect(inferCategory('Specialized Tarmac SL7')).toBe('Bikes');
    });

    test('should categorize watches correctly', () => {
        expect(inferCategory('Seiko Mod Day-Date')).toBe('Watches');
        expect(inferCategory('SEIKO MOD Cyan Blue Nautilus')).toBe('Watches');
    });

    test('should return Other for unrecognized items', () => {
        expect(inferCategory('Random Item XYZ')).toBe('Other');
        expect(inferCategory('Something Unknown')).toBe('Other');
    });

    test('should handle empty or null input', () => {
        expect(inferCategory('')).toBe('Other');
        expect(inferCategory(null)).toBe('Other');
        expect(inferCategory(undefined)).toBe('Other');
    });
});

describe('categorizeItems', () => {
    test('should add category to each item', () => {
        const items = [
            { name: 'MacBook Pro 16', price: '$1000' },
            { name: 'Java Veloce Bike', price: '$500' }
        ];

        const result = categorizeItems(items);

        expect(result[0].category).toBe('Laptops');
        expect(result[1].category).toBe('Bikes');
    });
});

describe('getItemsByCategory', () => {
    test('should group items by category', () => {
        const items = [
            { name: 'MacBook Pro', price: '$1000' },
            { name: 'ThinkPad X1', price: '$800' },
            { name: 'Java Bike', price: '$500' }
        ];

        const result = getItemsByCategory(items);

        expect(result['Laptops']).toHaveLength(2);
        expect(result['Bikes']).toHaveLength(1);
    });

    test('should put Other category last', () => {
        const items = [
            { name: 'Random Thing', price: '$100' },
            { name: 'MacBook Pro', price: '$1000' }
        ];

        const result = getItemsByCategory(items);
        const categories = Object.keys(result);

        expect(categories[categories.length - 1]).toBe('Other');
    });
});
