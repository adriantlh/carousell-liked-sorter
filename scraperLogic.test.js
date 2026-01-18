/**
 * @jest-environment jsdom
 */

const { scrapeItems } = require('./scraperLogic');

describe('scrapeItems', () => {
    // Setup generic selectors for testing
    const SELECTORS = {
        itemName: '.name',
        itemPrice: '.price',
        itemCategory: '.category',
        itemStatusIndicator: '.status'
    };

    test('should scrape basic item details', () => {
        document.body.innerHTML = `
            <div class="item">
                <div class="name">Camera</div>
                <div class="price">$100</div>
                <div class="category">Electronics</div>
            </div>
            <div class="item">
                <div class="name">Shirt</div>
                <div class="price">$20</div>
                <div class="category">Fashion</div>
            </div>
        `;

        const containers = document.querySelectorAll('.item');
        const items = scrapeItems(containers, SELECTORS);

        expect(items).toHaveLength(2);
        expect(items[0]).toEqual({
            name: 'Camera',
            price: '$100',
            category: 'Electronics',
            status: 'Available'
        });
        expect(items[1]).toEqual({
            name: 'Shirt',
            price: '$20',
            category: 'Fashion',
            status: 'Available'
        });
    });

    test('should detect status from indicator element', () => {
        document.body.innerHTML = `
            <div class="item">
                <div class="name">Item 1</div>
                <div class="status">Sold</div>
            </div>
            <div class="item">
                <div class="name">Item 2</div>
                <div class="status">Reserved</div>
            </div>
        `;

        const containers = document.querySelectorAll('.item');
        const items = scrapeItems(containers, SELECTORS);

        expect(items[0].status).toBe('Sold');
        expect(items[1].status).toBe('Reserved');
    });

    test('should detect status from container text fallback', () => {
        document.body.innerHTML = `
            <div class="item">
                <div class="name">Item 1</div>
                Item is Sold out
            </div>
        `;

        const containers = document.querySelectorAll('.item');
        const items = scrapeItems(containers, SELECTORS);

        expect(items[0].status).toBe('Sold');
    });

    test('should handle missing elements gracefully', () => {
        document.body.innerHTML = `
            <div class="item">
                <!-- Missing name, price, category -->
            </div>
        `;

        const containers = document.querySelectorAll('.item');
        const items = scrapeItems(containers, SELECTORS);

        expect(items[0]).toEqual({
            name: 'N/A',
            price: 'N/A',
            category: 'Uncategorized',
            status: 'Available'
        });
    });
});