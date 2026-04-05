import { NextResponse } from 'next/server';
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
    const $ = cheerio.load(html);

    // Remove non-content elements
    $('script, style, noscript, iframe, nav, footer, header, ads, aside').remove();

    const title = $('title').text() || $('h1').first().text();

    // Strategy: Target common article tags or the main body content
    let content = '';
    const mainContent = $('article, main, .post-content, .article-content, #article-body, .entry-content');

    if (mainContent.length > 0) {
      content = mainContent.text();
    } else {
      // Fallback: Just grab all paragraphs if No obvious container
      content = $('p').map((_, el) => $(el).text()).get().join(' ');
    }

    // Comprehensive clean up
    content = content.replace(/\s+/g, ' ').trim();

    // If still too short, just grab the body text
    if (content.length < 200) {
      content = $('body').text().replace(/\s+/g, ' ').trim();
    }

    return NextResponse.json({
      title: title || '',
      content: content,
    });
  } catch (error: any) {
    console.error('Error scraping:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
