'use server';

import * as cheerio from 'cheerio';

export interface BizBuySellListing {
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

export async function scrapeBizBuySell(state: string = 'utah', maxPages: number = 3): Promise<BizBuySellListing[]> {
  const listings: BizBuySellListing[] = [];

  try {
    for (let page = 1; page <= maxPages; page++) {
      try {
        const url = `https://www.bizbuysell.com/${state}-businesses-for-sale/?page=${page}`;
        console.log(`Scraping BizBuySell page ${page}: ${url}`);

        const html = await fetchWithDelay(url);
        const $ = cheerio.load(html);

        // BizBuySell listing structure - adjust selectors as needed
        const listings_on_page = $('div[class*="listing"]');
        
        if (listings_on_page.length === 0) {
          console.log(`No listings found on page ${page}, stopping pagination`);
          break;
        }

        listings_on_page.each((_, element) => {
          try {
            const $el = $(element);

            // Extract business information - these selectors may need adjustment based on actual HTML
            const titleEl = $el.find('a[class*="listing-title"], h2, h3').first();
            const businessName = titleEl.text()?.trim();

            if (!businessName) return; // Skip if no title

            const priceEl = $el.find('span[class*="price"], [class*="asking"]').first();
            const askingPrice = parsePrice(priceEl.text());

            const revenueEl = $el.find('span[class*="revenue"], [class*="annual"]').first();
            const revenue = parsePrice(revenueEl.text());

            const cashFlowEl = $el.find('span[class*="cash-flow"], [class*="profit"]').first();
            const cashFlow = parsePrice(cashFlowEl.text());

            const descriptionEl = $el.find('p[class*="description"], [class*="summary"]').first();
            const description = descriptionEl.text()?.trim();

            const locationEl = $el.find('span[class*="location"], [class*="city"]').first();
            const location = locationEl.text()?.trim();

            const industryEl = $el.find('span[class*="industry"], [class*="category"]').first();
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
              listingUrl: listingUrl ? (listingUrl.startsWith('http') ? listingUrl : `https://www.bizbuysell.com${listingUrl}`) : undefined,
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
    console.error('Error in BizBuySell scraper:', error);
  }

  return listings;
}
