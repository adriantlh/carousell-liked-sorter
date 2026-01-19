document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const scanButton = document.getElementById('scanButton');
    const loadAllButton = document.getElementById('loadAllButton');
    const exportButton = document.getElementById('exportButton');
    const sortSelect = document.getElementById('sortSelect');
    const groupByCategory = document.getElementById('groupByCategory');
    const statusMessage = document.getElementById('statusMessage');
    const lastScanEl = document.getElementById('lastScan');
    const unavailableSection = document.getElementById('unavailableSection');
    const unavailableList = document.getElementById('unavailableList');
    const unlikeAllButton = document.getElementById('unlikeAllButton');
    const availableSection = document.getElementById('availableSection');
    const availableCount = document.getElementById('availableCount');
    const resultsDiv = document.getElementById('results');

    // State
    let allItems = [];
    let currentTabId = null;

    // Load saved data on popup open
    loadSavedData();

    // Get current tab ID
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length > 0) {
            currentTabId = tabs[0].id;
        }
    });

    // Scan button click
    scanButton.addEventListener('click', function() {
        ensureOnLikesPage(function() {
            statusMessage.textContent = 'Scanning for liked items...';
            statusMessage.style.color = 'blue';
            scanButton.disabled = true;

            chrome.tabs.sendMessage(currentTabId, { action: "scanLikedItems" }, function(response) {
                scanButton.disabled = false;

                if (chrome.runtime.lastError) {
                    statusMessage.textContent = 'Error: Could not connect to Carousell page. Make sure you are on a Carousell liked items page and refresh.';
                    statusMessage.style.color = 'red';
                    return;
                }

                if (response && response.status === "failed") {
                    statusMessage.textContent = 'Scanning failed: ' + response.message;
                    statusMessage.style.color = 'red';
                    return;
                }

                if (response && response.status === "error") {
                    statusMessage.textContent = 'Error during scanning: ' + response.error;
                    statusMessage.style.color = 'red';
                    return;
                }

                if (response && response.status === "success" && response.data) {
                    allItems = response.data;
                    saveData(allItems);
                    displayAllItems();
                } else {
                    statusMessage.textContent = 'No liked items found on this page.';
                    statusMessage.style.color = 'orange';
                }
            });
        });
    });

    // Load All button click
    loadAllButton.addEventListener('click', function() {
        ensureOnLikesPage(function() {
            statusMessage.textContent = 'Loading all items... (clicking "Load more")';
            statusMessage.style.color = 'blue';
            loadAllButton.disabled = true;
            loadAllButton.textContent = 'Loading...';

            chrome.tabs.sendMessage(currentTabId, { action: "loadMore" }, function(response) {
                if (chrome.runtime.lastError) {
                    statusMessage.textContent = 'Error: Could not connect to page. Refresh and try again.';
                    statusMessage.style.color = 'red';
                    loadAllButton.disabled = false;
                    loadAllButton.textContent = 'Load All';
                }
            });
        });
    });

    // Listen for loadMore completion
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "loadMoreComplete") {
            loadAllButton.disabled = false;
            loadAllButton.textContent = 'Load All';
            statusMessage.textContent = `Finished loading (${request.clicks} clicks). Click "Scan" to refresh the list.`;
            statusMessage.style.color = 'green';

            // Show a notification popup
            showNotification(`All items loaded! (${request.clicks} "Load more" clicks). Click "Scan" to see your items.`);
        }
    });

    // Show notification popup
    function showNotification(message) {
        // Remove existing notification if any
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <p>${message}</p>
            <button class="notification-close">OK</button>
        `;
        document.body.appendChild(notification);

        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.remove();
        });

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 10000);
    }

    // Ensure we're on the likes page, redirect if not
    function ensureOnLikesPage(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs.length === 0) {
                statusMessage.textContent = 'Error: No active tab found.';
                statusMessage.style.color = 'red';
                return;
            }

            currentTabId = tabs[0].id;
            const currentUrl = tabs[0].url || '';

            if (currentUrl.includes('carousell.sg/likes')) {
                // Already on likes page
                callback();
            } else if (currentUrl.includes('carousell.sg')) {
                // On Carousell but not likes page - redirect
                statusMessage.textContent = 'Redirecting to likes page...';
                statusMessage.style.color = 'blue';
                chrome.tabs.sendMessage(currentTabId, { action: "goToLikes" }, function(response) {
                    statusMessage.textContent = 'Redirected. Please click again after the page loads.';
                    statusMessage.style.color = 'orange';
                });
            } else {
                // Not on Carousell at all
                statusMessage.textContent = 'Please go to carousell.sg first, then click again.';
                statusMessage.style.color = 'orange';
                chrome.tabs.update(currentTabId, { url: 'https://www.carousell.sg/likes/' });
            }
        });
    }

    // Sort change
    sortSelect.addEventListener('change', function() {
        if (allItems.length > 0) {
            displayAllItems();
        }
    });

    // Group by category change
    groupByCategory.addEventListener('change', function() {
        if (allItems.length > 0) {
            displayAllItems();
        }
    });

    // Export button click
    exportButton.addEventListener('click', function() {
        exportToCSV();
    });

    // Unlike all button
    unlikeAllButton.addEventListener('click', function() {
        const unavailableItems = allItems.filter(item =>
            item.status === 'Sold' || item.status === 'Reserved'
        );
        if (unavailableItems.length === 0) return;

        if (!confirm(`Unlike all ${unavailableItems.length} sold/reserved items?`)) return;

        unlikeAllButton.disabled = true;
        unlikeAllButton.textContent = 'Removing...';

        let completed = 0;
        unavailableItems.forEach((item, index) => {
            setTimeout(() => {
                unlikeItem(item.listingId, function(success) {
                    completed++;
                    if (success) {
                        removeItemFromList(item.listingId);
                    }
                    if (completed === unavailableItems.length) {
                        unlikeAllButton.disabled = false;
                        unlikeAllButton.textContent = 'Unlike All';
                        displayAllItems();
                        // Refresh the page so unliked items are removed from DOM
                        chrome.tabs.reload(currentTabId);
                    }
                });
            }, index * 300); // Stagger requests to avoid rate limiting
        });
    });

    function loadSavedData() {
        if (!chrome.storage || !chrome.storage.local) {
            console.warn('chrome.storage not available');
            return;
        }
        chrome.storage.local.get(['likedItems', 'lastScanTime'], function(result) {
            if (result.likedItems && result.likedItems.length > 0) {
                allItems = result.likedItems;
                displayAllItems();
            }
            if (result.lastScanTime) {
                const date = new Date(result.lastScanTime);
                lastScanEl.textContent = `Last scan: ${date.toLocaleString()}`;
            }
        });
    }

    function saveData(items) {
        if (!chrome.storage || !chrome.storage.local) {
            console.warn('chrome.storage not available');
            return;
        }
        chrome.storage.local.set({
            likedItems: items,
            lastScanTime: Date.now()
        }, function() {
            const date = new Date();
            lastScanEl.textContent = `Last scan: ${date.toLocaleString()}`;
        });
    }

    function displayAllItems() {
        if (allItems.length === 0) {
            unavailableSection.classList.add('hidden');
            availableSection.classList.add('hidden');
            exportButton.disabled = true;
            return;
        }

        // Separate available and unavailable items
        const unavailable = allItems.filter(item =>
            item.status === 'Sold' || item.status === 'Reserved'
        );
        const available = allItems.filter(item =>
            item.status !== 'Sold' && item.status !== 'Reserved'
        );

        // Sort available items
        const sortedAvailable = sortItems(available, sortSelect.value);

        statusMessage.textContent = `Found ${allItems.length} items (${available.length} available, ${unavailable.length} sold/reserved)`;
        statusMessage.style.color = 'green';
        exportButton.disabled = false;

        // Display unavailable items
        if (unavailable.length > 0) {
            unavailableSection.classList.remove('hidden');
            displayUnavailableItems(unavailable);
        } else {
            unavailableSection.classList.add('hidden');
        }

        // Display available items
        if (sortedAvailable.length > 0) {
            availableSection.classList.remove('hidden');
            availableCount.textContent = sortedAvailable.length;
            displayAvailableItems(sortedAvailable);
        } else {
            availableSection.classList.add('hidden');
        }
    }

    function sortItems(items, sortBy) {
        const sorted = [...items];
        switch (sortBy) {
            case 'price-asc':
                sorted.sort((a, b) => a.priceNumeric - b.priceNumeric);
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.priceNumeric - a.priceNumeric);
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }
        return sorted;
    }

    function displayUnavailableItems(items) {
        unavailableList.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'unavailable-item';
            li.dataset.listingId = item.listingId;

            const statusBadge = item.status === 'Sold' ? 'sold-badge' : 'reserved-badge';

            li.innerHTML = `
                <button class="unlike-btn" title="Remove from likes">❌</button>
                <span class="item-info">
                    <span class="item-name">${escapeHtml(truncate(item.name, 40))}</span>
                    <span class="${statusBadge}">${item.status}</span>
                </span>
                <span class="item-price">${escapeHtml(item.price)}</span>
            `;

            const unlikeBtn = li.querySelector('.unlike-btn');
            unlikeBtn.addEventListener('click', function() {
                unlikeBtn.disabled = true;
                unlikeBtn.textContent = '...';
                unlikeItem(item.listingId, function(success) {
                    if (success) {
                        removeItemFromList(item.listingId);
                        li.remove();
                        updateCounts();
                    } else {
                        unlikeBtn.disabled = false;
                        unlikeBtn.textContent = '❌';
                    }
                });
            });

            unavailableList.appendChild(li);
        });
    }

    function displayAvailableItems(items) {
        resultsDiv.innerHTML = '';

        if (groupByCategory.checked) {
            // Group by inferred category
            const categorizedItems = Categories.categorizeItems(items);
            const byCategory = Categories.getItemsByCategory(items);

            for (const category in byCategory) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'category-group';

                const categoryHeader = document.createElement('h3');
                categoryHeader.className = 'category-title';
                categoryHeader.textContent = `${category} (${byCategory[category].length})`;
                categoryDiv.appendChild(categoryHeader);

                const ul = document.createElement('ul');
                ul.className = 'available-list';

                // Sort items within category
                const sortedItems = sortItems(byCategory[category], sortSelect.value);

                sortedItems.forEach(item => {
                    ul.appendChild(createItemElement(item));
                });

                categoryDiv.appendChild(ul);
                resultsDiv.appendChild(categoryDiv);
            }
        } else {
            // Flat list
            const ul = document.createElement('ul');
            ul.className = 'available-list';

            items.forEach(item => {
                ul.appendChild(createItemElement(item));
            });

            resultsDiv.appendChild(ul);
        }
    }

    function createItemElement(item) {
        const li = document.createElement('li');
        li.className = 'item';

        const category = Categories.inferCategory(item.name);
        const categoryBadge = groupByCategory.checked ? '' : `<span class="item-category">${escapeHtml(category)}</span>`;

        const content = `
            <span class="item-name">${escapeHtml(truncate(item.name, 50))}</span>
            <span class="item-meta">
                ${categoryBadge}
                <span class="item-condition">${escapeHtml(item.condition)}</span>
                <span class="item-price">${escapeHtml(item.price)}</span>
            </span>
        `;

        if (item.link) {
            li.innerHTML = `<a href="${escapeHtml(item.link)}" target="_blank" class="item-link">${content}</a>`;
        } else {
            li.innerHTML = content;
        }

        return li;
    }

    function unlikeItem(listingId, callback) {
        if (!currentTabId) {
            callback(false);
            return;
        }

        chrome.tabs.sendMessage(currentTabId, {
            action: "unlikeItem",
            listingId: listingId
        }, function(response) {
            if (chrome.runtime.lastError) {
                console.error('Unlike error:', chrome.runtime.lastError);
                callback(false);
                return;
            }
            callback(response && response.status === 'success');
        });
    }

    function removeItemFromList(listingId) {
        allItems = allItems.filter(item => item.listingId !== listingId);
        saveData(allItems);
    }

    function updateCounts() {
        const unavailable = allItems.filter(item =>
            item.status === 'Sold' || item.status === 'Reserved'
        );
        const available = allItems.filter(item =>
            item.status !== 'Sold' && item.status !== 'Reserved'
        );

        statusMessage.textContent = `Found ${allItems.length} items (${available.length} available, ${unavailable.length} sold/reserved)`;
        availableCount.textContent = available.length;

        if (unavailable.length === 0) {
            unavailableSection.classList.add('hidden');
        }
    }

    function exportToCSV() {
        if (allItems.length === 0) return;

        const headers = ['Name', 'Price', 'Condition', 'Category', 'Status', 'Link'];
        const rows = allItems.map(item => [
            `"${item.name.replace(/"/g, '""')}"`,
            `"${item.price}"`,
            `"${item.condition}"`,
            `"${Categories.inferCategory(item.name)}"`,
            `"${item.status}"`,
            `"${item.link || ''}"`
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `carousell-likes-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function truncate(str, length) {
        if (!str) return '';
        return str.length > length ? str.substring(0, length) + '...' : str;
    }
});
