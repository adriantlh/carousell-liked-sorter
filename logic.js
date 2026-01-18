// logic.js

function filterAndSortItems(items) {
    // Filter out "Sold" and "Reserved"
    const availableItems = items.filter(item =>
        item.status !== "Sold" && item.status !== "Reserved"
    );

    if (availableItems.length === 0) {
        return {};
    }

    // Group by condition (e.g., "Like new", "Brand new", etc.)
    const itemsByCondition = availableItems.reduce((acc, item) => {
        const condition = item.condition || item.category || 'Unknown';
        if (!acc[condition]) {
            acc[condition] = [];
        }
        acc[condition].push(item);
        return acc;
    }, {});

    return itemsByCondition;
}

// Export for Node.js (testing) and Browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { filterAndSortItems };
} else {
    window.AppLogic = { filterAndSortItems };
}