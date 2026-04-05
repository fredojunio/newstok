import { NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch the URL' }, { status: response.status });
    }

    const html = await response.text();

    // Use JSDOM and Readability safely
    const doc = new JSDOM(html, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    let content = article?.textContent || '';

    // If Readability fails or doesn't find much, fallback to basic cheerio usage
    if (!content.trim() || content.length < 200) {
      const $ = cheerio.load(html);
      $('script, style, noscript, iframe, nav, footer, header').remove();
      content = $('body').text().replace(/\s+/g, ' ').trim();
    }

    return NextResponse.json({
      title: article?.title || '',
      content: content,
    });
  } catch (error: any) {
    console.error('Error scraping:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
