// content.js
// This script runs in the context of the Carousell page.

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "scanLikedItems") {
        console.log("Content script received scan request.");

        try {
            // Find all listing cards by data-testid pattern: listing-card-{numeric-id}
            const allTestIdElements = document.querySelectorAll('[data-testid^="listing-card-"]');
            let containers = Array.from(allTestIdElements).filter(el => {
                const testId = el.getAttribute('data-testid');
                return /^listing-card-\d+$/.test(testId);
            });

            console.log(`Found ${containers.length} listing card containers.`);

            if (containers.length === 0) {
                sendResponse({ status: "failed", message: "No liked items found on this page." });
                return;
            }

            // Scrape items from containers
            const likedItems = containers.map(container => {
                // Get listing ID from data-testid
                const testId = container.getAttribute('data-testid');
                const listingId = testId.replace('listing-card-', '');

                // Get item name from image alt or title
                const img = container.querySelector('img[alt]:not([alt="Avatar"])');
                const name = img ? (img.alt || img.title || 'N/A') : 'N/A';

                // Get price from p element with title attribute containing currency
                const priceEl = container.querySelector('p[title*="$"]');
                const priceText = priceEl ? (priceEl.title || priceEl.textContent.trim()) : 'N/A';

                // Parse numeric price for sorting
                const priceMatch = priceText.match(/[\d,]+(?:\.\d+)?/);
                const priceNumeric = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;

                // Get condition (the gray text like "Like new", "Brand new", etc.)
                const grayTexts = container.querySelectorAll('p[style*="color: rgb(197, 197, 198)"]');
                let condition = 'Unknown';
                grayTexts.forEach(p => {
                    const text = p.textContent.trim();
                    if (text && !text.includes('ago') && text.length < 50) {
                        condition = text;
                    }
                });

                // Check for sold/reserved status
                let status = 'Available';
                const containerText = container.textContent.toLowerCase();
                if (containerText.includes('sold')) {
                    status = 'Sold';
                } else if (containerText.includes('reserved')) {
                    status = 'Reserved';
                }

                // Get the link to the item
                const linkEl = container.querySelector('a[href*="/p/"]');
                const link = linkEl ? linkEl.href : null;

                return { listingId, name, price: priceText, priceNumeric, condition, status, link };
            });

            console.log("Scraped items:", likedItems);
            sendResponse({ status: "success", data: likedItems });
        } catch (error) {
            console.error("Scraping error:", error);
            sendResponse({ status: "error", data: [], error: error.message });
        }
    }

    if (request.action === "unlikeItem") {
        const { listingId } = request;
        console.log(`Attempting to unlike item: ${listingId}`);

        try {
            // Find the card with this listing ID
            const card = document.querySelector(`[data-testid="listing-card-${listingId}"]`);
            if (!card) {
                sendResponse({ status: "error", message: "Item not found on page" });
                return;
            }

            // Find the like button within the card
            const likeButton = card.querySelector('[data-testid="listing-card-btn-like"]');
            if (!likeButton) {
                sendResponse({ status: "error", message: "Like button not found" });
                return;
            }

            // Click the button to unlike
            likeButton.click();
            console.log(`Unliked item: ${listingId}`);
            sendResponse({ status: "success", message: "Item unliked" });
        } catch (error) {
            console.error("Unlike error:", error);
            sendResponse({ status: "error", message: error.message });
        }
    }

    return true;
});
