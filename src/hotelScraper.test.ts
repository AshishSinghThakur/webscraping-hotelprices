import { test, Page } from '@playwright/test';

import dotenv from 'dotenv';
dotenv.config();
let page: Page;


test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
      await page.close();
  });

async function scrapeLowestPrice(city: string) {

    try {
        console.log(`Searching for the highest-rated 5-star hotels in ${city}...`);
        await page.goto("https://www.booking.com", { waitUntil: "domcontentloaded" });
        console.log(`landed on booking.com`);

        // Accept Cookies
        const acceptCookies = await page.$('button:has-text("Accept")');
        if (acceptCookies) await acceptCookies.click();
        console.log(`cookie step cleared`);

        // Search for hotels
        await page.fill('[name="ss"]', city);
        await page.press('[name="ss"]', 'Enter');
        await page.waitForSelector('[data-testid="property-card"]', { timeout: 15000 });
        console.log(`Entered city name`);
        await page.waitForTimeout(3000);
        await page.waitForLoadState("networkidle");

        // Select a 5-night stay
        await page.waitForSelector('[data-testid="date-display-field-start"]', { timeout: 15000 });
        await page.click('[data-date="2025-03-05"]');
        await page.click('[data-date="2025-03-10"]');
        await page.click('[data-testid="date-display-field-end"]');
        console.log(`Selected 5 night stay`);

        // Select 2 adults + 1 infant
        await page.click('[data-testid="occupancy-config"]');
        await page.click('(//input[@id="group_children"]/..//button)[2]');
        await page.click('[name="age"]');
        await page.selectOption('[name="age"]', '1');
        await page.click('//button[@type="submit"]');
        console.log(`Submitted request for occupancy`);

        // Filter 5-star hotels
        await page.waitForTimeout(2000);
        await page.waitForLoadState("networkidle");
        await page.waitForSelector('input[name="class=5"]', { timeout: 15000 });

        const fiveStarFilter = await page.$('input[name="class=5"]');
        if (fiveStarFilter) {
            await fiveStarFilter.click();
            console.log(`filtered 5 star hotels`);
        }

        // Sort by "Highest Rating"
        await page.waitForTimeout(2000);
        await page.waitForLoadState("networkidle");

        const sortByRating = await page.$('button:has-text("Highest Rating")');
        if (sortByRating) {
            await sortByRating.click();
            console.log(`sorted highest rating`);
        }

        // Get the highest-rated 5-star hotel
        await page.waitForTimeout(2000);
        await page.waitForLoadState("networkidle");
        const hotelCard = await page.$('[data-testid="property-card"]');
        if (!hotelCard) {
            console.log("No 5-star hotels found.");
            return;
        }

        const hotelName = await hotelCard.$eval('[data-testid="title"]', el => (el as HTMLElement).innerText);
        const hotelLink = await hotelCard.$eval('[data-testid="title-link"]', el => (el as HTMLAnchorElement).href);

        console.log(`Highest Rated 5-Star Hotel: ${hotelName}`);
        console.log(`Hotel Link: ${hotelLink}`);

        // Extract lowest price in INR
        await page.waitForLoadState("networkidle");
        const priceSelector = '(//span[@data-testid="price-and-discounted-price"])[1]';
        await page.waitForSelector(priceSelector, { timeout: 15000 });
       const innertext =  await page.locator(priceSelector).innerText()
       console.log(`Lowest price for 5 nights: ${innertext}`);
    } catch (error) {
        console.error("Error scraping hotel prices:", error);
        throw error;
    } finally {
        await page.close();
    }
}

test("Fetch lowest price for 5 star hotel with highest rating in a city", async () => {
    await scrapeLowestPrice("Mumbai");
});
