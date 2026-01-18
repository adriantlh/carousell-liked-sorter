// scraperLogic.js

/**
 * Scrapes item details from a list of container elements.
 * @param {NodeList|Array} containers - The list of DOM elements representing item cards.
 * @param {Object} selectors - object containing selectors for name, price, etc.
 */
function scrapeItems(containers, selectors) {
    const likedItems = [];

    containers.forEach(container => {
        const nameElement = container.querySelector(selectors.itemName);
        const priceElement = container.querySelector(selectors.itemPrice);
        // Category is often tricky; we'll keep the selector but it might fail
        const categoryElement = container.querySelector(selectors.itemCategory);
        const statusElement = container.querySelector(selectors.itemStatusIndicator);
        const imageElement = container.querySelector('img');

        let name = nameElement ? nameElement.textContent.trim() : 'N/A';
        
        // Fallback for name from image alt or title if name element is missing or empty
        if ((name === 'N/A' || name === '') && imageElement) {
            name = imageElement.alt || imageElement.title || 'N/A';
        }

        const price = priceElement ? priceElement.textContent.trim() : 'N/A';
        const category = categoryElement ? categoryElement.textContent.trim() : 'Uncategorized';
        let status = 'Available';

        if (statusElement) {
            const statusText = statusElement.textContent.toLowerCase();
            if (statusText.includes('sold')) {
                status = 'Sold';
            } else if (statusText.includes('reserved')) {
                status = 'Reserved';
            } else {
                status = 'Other Status';
            }
        } else if (container.textContent.toLowerCase().includes('sold')) {
            status = 'Sold';
        } else if (container.textContent.toLowerCase().includes('reserved')) {
            status = 'Reserved';
        }

        likedItems.push({ name, price, category, status });
    });

    return likedItems;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { scrapeItems };
} else {
    window.ScraperLogic = { scrapeItems };
}