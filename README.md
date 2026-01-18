# Carousell Liked Items Sorter

A Chrome extension to manage and organize your liked items on Carousell.

## Features

- **Auto-navigate** - automatically redirects to your likes page if not already there
- **Load All** - automatically clicks "Load more" at random intervals to load all your liked items
- **Scan liked items** from your Carousell likes page
- **Filter sold/reserved items** - see them separately and quickly unlike them
- **Sort items** by price (low/high) or name (A-Z)
- **Group by category** - automatically categorizes items (Laptops, Bikes, Watches, etc.)
- **Export to CSV** - download your liked items list with all details
- **Persistent storage** - your scanned data is saved between sessions

## Installation

### From source (Developer mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/adriantlh/carousell-liked-sorter.git
   ```

2. Open Chrome and go to `chrome://extensions`

3. Enable **Developer mode** (toggle in top right)

4. Click **Load unpacked** and select the cloned folder

5. The extension icon will appear in your toolbar

## Usage

1. Click the extension icon in your toolbar (from any page)

2. Click **Scan Liked Items** - you'll be auto-redirected to your likes page if needed

3. If you have many liked items, click **Load All** to automatically load all items:
   - The extension clicks "Load more" at random intervals (1.5-4 seconds)
   - This avoids detection as a bot
   - Wait for it to finish, then click **Scan** again

4. Your items will be displayed:
   - **Sold/Reserved items** appear at the top with unlike buttons
   - **Available items** are shown below, sorted by your preference

5. Use the controls to:
   - **Sort** by price or name
   - **Group by category** to organize items
   - **Export CSV** to download the list
   - **Unlike** sold items individually or all at once

## Category Inference

Items are automatically categorized based on keywords in their names:

| Category | Example Keywords |
|----------|-----------------|
| Laptops | MacBook, ThinkPad, laptop, notebook |
| Desktops | iMac, Mac Mini, Mac Studio, desktop |
| Tablets & Handhelds | iPad, GPD, OneXPlayer, tablet |
| Bikes | bike, bicycle, Merida, Java, Polygon, Specialized |
| Cycling Gear | helmet, Shimano, groupset, crankset |
| Watches | watch, Seiko, Rolex, Omega |
| Cameras | camera, DSLR, Canon, Nikon, Fujifilm |
| Gaming | gaming laptop, PS5, Xbox, Nintendo |
| Collectibles | Pokemon, TCG, PSA, card |
| Audio | headphone, speaker, AirPods |

Items that don't match any category are labeled as "Other".

## Development

### Run tests

```bash
npm install
npm test
```

### Project structure

```
├── manifest.json       # Chrome extension config
├── popup.html/js/css   # Extension popup UI
├── content.js          # Page scraping script
├── categories.js       # Category inference logic
├── logic.js            # Filtering logic
├── scraperLogic.js     # DOM scraping utilities
└── *.test.js           # Jest tests
```

## Permissions

The extension requires:
- `activeTab` - to access the current Carousell page
- `scripting` - to run the scraping script
- `storage` - to save your liked items list
- Host access to `carousell.sg`

## License

MIT
