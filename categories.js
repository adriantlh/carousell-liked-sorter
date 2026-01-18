// categories.js
// Keyword-based category inference

const CATEGORY_RULES = [
    {
        category: 'Laptops',
        keywords: ['laptop', 'macbook', 'thinkpad', 'notebook', 'zenbook', 'chromebook', 'surface pro', 'surface laptop']
    },
    {
        category: 'Desktops',
        keywords: ['imac', 'mac mini', 'mac studio', 'mac pro', 'desktop', 'mini pc', 'nuc']
    },
    {
        category: 'Tablets & Handhelds',
        keywords: ['ipad', 'tablet', 'galaxy tab', 'surface go', 'gpd', 'onexplayer', 'steam deck', 'pomera', 'pocket pc', 'handheld pc', 'minebook', 'chuwi']
    },
    {
        category: 'Bikes',
        keywords: ['bike', 'bicycle', 'road bike', 'gravel', 'folding bike', 'brompton', 'java', 'merida', 'giant', 'polygon', 'specialized', 'tarmac', 'reacto', 'veloce', 'fuoco', 'siluro']
    },
    {
        category: 'Cycling Gear',
        keywords: ['helmet', 'cycling', 'shimano', 'crankset', 'groupset', 'derailleur', 'wheelset']
    },
    {
        category: 'Watches',
        keywords: ['watch', 'seiko', 'nautilus', 'aquanaut', 'rolex', 'omega', 'casio', 'g-shock']
    },
    {
        category: 'Cameras',
        keywords: ['camera', 'dslr', 'mirrorless', 'kodak', 'canon', 'nikon', 'sony a7', 'fujifilm', 'yashica', 'digimate']
    },
    {
        category: 'Gaming',
        keywords: ['gaming laptop', 'gaming pc', 'ps5', 'playstation', 'xbox', 'nintendo', 'switch', 'legion', 'rog', 'rtx', 'gpu']
    },
    {
        category: 'Collectibles',
        keywords: ['pokemon', 'tcg', 'psa', 'card', 'collectible', 'figurine', 'funko']
    },
    {
        category: 'Audio',
        keywords: ['headphone', 'earphone', 'airpods', 'speaker', 'amplifier', 'dac', 'audio']
    }
];

function inferCategory(itemName) {
    if (!itemName) return 'Other';

    const nameLower = itemName.toLowerCase();

    for (const rule of CATEGORY_RULES) {
        for (const keyword of rule.keywords) {
            if (nameLower.includes(keyword.toLowerCase())) {
                return rule.category;
            }
        }
    }

    return 'Other';
}

function categorizeItems(items) {
    return items.map(item => ({
        ...item,
        category: inferCategory(item.name)
    }));
}

function getItemsByCategory(items) {
    const categorized = categorizeItems(items);
    const byCategory = {};

    categorized.forEach(item => {
        if (!byCategory[item.category]) {
            byCategory[item.category] = [];
        }
        byCategory[item.category].push(item);
    });

    // Sort categories alphabetically, but put "Other" last
    const sortedCategories = Object.keys(byCategory).sort((a, b) => {
        if (a === 'Other') return 1;
        if (b === 'Other') return -1;
        return a.localeCompare(b);
    });

    const sorted = {};
    sortedCategories.forEach(cat => {
        sorted[cat] = byCategory[cat];
    });

    return sorted;
}

// Export for Node.js (testing) and Browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { inferCategory, categorizeItems, getItemsByCategory, CATEGORY_RULES };
} else {
    window.Categories = { inferCategory, categorizeItems, getItemsByCategory, CATEGORY_RULES };
}
