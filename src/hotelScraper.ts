import { chromium } from 'playwright';

async function scrapeLowestPrice(city: string) {
    // Launch a headless browser
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log(`Searching for the highest-rated 5-star hotels in ${city}...`);
        
        // Navigate to a hotel booking website (Example: Booking.com)
        await page.goto(`https://www.booking.com`, { waitUntil: 'domcontentloaded' });

        // Accept Cookies if any popup appears (Modify selector if needed)
        const acceptCookies = await page.$('button:has-text("Accept")');
        if (acceptCookies) {
            await acceptCookies.click();
        }

        // Search for hotels in the given city
        await page.fill('[name="ss"]', city);
        await page.press('[name="ss"]', 'Enter');
        await page.waitForTimeout(3000); // Wait for results to load

        // Apply filter for 5-star hotels
        const fiveStarFilter = await page.$('input[name="class=5"]');
        if (fiveStarFilter) {
            await fiveStarFilter.click();
            await page.waitForTimeout(3000);
        }

        // Sort by highest rating
        const sortByRating = await page.$('button:has-text("Highest Rating")');
        if (sortByRating) {
            await sortByRating.click();
            await page.waitForTimeout(3000);
        }

        // Get the highest-rated 5-star hotel
        const hotelName = await page.textContent('.sr-hotel__name');

        // Click on the first hotel result
        const firstHotel = await page.$('.sr-hotel__name');
        if (firstHotel) {
            await firstHotel.click();
            await page.waitForTimeout(5000);
        }

        // Switch to the new tab with hotel details
        const context = await browser.newContext();
        const pages = context.pages();
        const hotelPage = pages[pages.length - 1]; // Get the latest opened page

        // Select a 5-night stay (Modify date pickers based on the website)
        await hotelPage.click('.date-picker-class'); // Modify as per the actual website
        await hotelPage.fill('.check-in-selector', '2025-04-10'); // Change dates dynamically
        await hotelPage.fill('.check-out-selector', '2025-04-15');
        await hotelPage.click('.confirm-dates');

        // Select 2 adults + 1 infant
        await hotelPage.click('.guest-selector'); // Modify as per website
        await hotelPage.selectOption('.adult-selector', '2');
        await hotelPage.selectOption('.child-selector', '1');
        await hotelPage.fill('.infant-age-selector', '1');
        await hotelPage.click('.confirm-guests');

        // Wait for price to load
        await hotelPage.waitForTimeout(5000);

        // Get the lowest price in INR
        const lowestPrice = await hotelPage.textContent('.price-tag-selector'); // Modify selector

        console.log(`Hotel: ${hotelName}`);
        console.log(`Lowest price for 5 nights: ${lowestPrice}`);

    } catch (error) {
        console.error('Error scraping hotel prices:', error);
    } finally {
        await browser.close();
    }
}

// Example usage
scrapeLowestPrice('Mumbai');
