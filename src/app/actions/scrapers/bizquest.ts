'use server';

import * as cheerio from 'cheerio';

export interface BizQuestListing {
  businessName: string;
  askingPrice?: number;
  revenue?: number;
  cashFlow?: number;
  description?: string;
  location?: string;
  industry?: string;
  listingUrl?: string;
}

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

async function fetchWithDelay(url: string, delayMs: number = 1000): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

function parsePrice(priceStr: string | null | undefined): number | undefined {
  if (!priceStr) return undefined;
  const match = priceStr.match(/[\d,]+/);
  if (match) {
    return parseInt(match[0].replace(/,/g, ''), 10);
  }
  return undefined;
}

export async function scrapeBizQuest(state: string = 'utah', maxPages: number = 3): Promise<BizQuestListing[]> {
  const listings: BizQuestListing[] = [];

  try {
    for (let page = 1; page <= maxPages; page++) {
      try {
        const url = `https://www.bizquest.com/businesses-for-sale/${state}/?page=${page}`;
        console.log(`Scraping BizQuest page ${page}: ${url}`);

        const html = await fetchWithDelay(url);
        const $ = cheerio.load(html);

        // BizQuest listing structure - adjust selectors as needed
        const listings_on_page = $('div[class*="business-card"], div[class*="listing"], article[class*="business"]');
        
        if (listings_on_page.length === 0) {
          console.log(`No listings found on page ${page}, stopping pagination`);
          break;
        }

        listings_on_page.each((_, element) => {
          try {
            const $el = $(element);

            // Extract business information - these selectors may need adjustment
            const titleEl = $el.find('a[class*="business-name"], h2, h3, .title').first();
            const businessName = titleEl.text()?.trim();

            if (!businessName) return; // Skip if no title

            const priceEl = $el.find('span[class*="price"], [class*="asking"], [class*="asking-price"]').first();
            const askingPrice = parsePrice(priceEl.text());

            const revenueEl = $el.find('span[class*="revenue"], [class*="annual"], [class*="sales"]').first();
            const revenue = parsePrice(revenueEl.text());

            const cashFlowEl = $el.find('span[class*="cash-flow"], [class*="profit"], [class*="ebitda"]').first();
            const cashFlow = parsePrice(cashFlowEl.text());

            const descriptionEl = $el.find('p[class*="description"], [class*="summary"], .excerpt').first();
            const description = descriptionEl.text()?.trim();

            const locationEl = $el.find('span[class*="location"], [class*="city"], [class*="state"], .geo').first();
            const location = locationEl.text()?.trim();

            const industryEl = $el.find('span[class*="industry"], [class*="category"], [class*="type"]').first();
            const industry = industryEl.text()?.trim();

            const linkEl = $el.find('a').first();
            const listingUrl = linkEl.attr('href');

            listings.push({
              businessName,
              askingPrice,
              revenue,
              cashFlow,
              description: description || undefined,
              location: location || undefined,
              industry: industry || undefined,
              listingUrl: listingUrl ? (listingUrl.startsWith('http') ? listingUrl : `https://www.bizquest.com${listingUrl}`) : undefined,
            });
          } catch (error) {
            console.error('Error parsing individual listing:', error);
          }
        });

        console.log(`Found ${listings_on_page.length} listings on page ${page}`);
      } catch (pageError) {
        console.error(`Error scraping page ${page}:`, pageError);
        // Continue to next page on error
        continue;
      }
    }
  } catch (error) {
    console.error('Error in BizQuest scraper:', error);
  }

  return listings;
}
