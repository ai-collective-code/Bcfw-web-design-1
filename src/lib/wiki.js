/**
 * Wikipedia API helper for in-app popups and full article reader.
 * Enables live Wikipedia browsing within modal sheets without external redirects.
 */

export function cleanWikiHtml(html) {
  if (!html) return '';
  return html
    // Fix protocol-relative URLs for images and styles
    .replace(/src="\/\//g, 'src="https://')
    .replace(/srcset="\/\//g, 'srcset="https://')
    // Open internal Wikipedia cross-links safely in new tabs rather than broken local routes
    .replace(/href="\/wiki\//g, 'target="_blank" rel="noreferrer" href="https://en.wikipedia.org/wiki/')
    .replace(/href="\/w\//g, 'target="_blank" rel="noreferrer" href="https://en.wikipedia.org/w/');
}

export async function fetchWikiSummary(slug) {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch Wikipedia summary:', err);
    return null;
  }
}

export async function fetchWikiFullArticle(slugOrTitle) {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(slugOrTitle)}&prop=text|displaytitle&format=json&origin=*`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const raw = json?.parse?.text?.['*'];
    if (!raw) return null;
    return {
      title: json?.parse?.displaytitle || slugOrTitle,
      html: cleanWikiHtml(raw),
    };
  } catch (err) {
    console.error('Failed to fetch full Wikipedia article:', err);
    return null;
  }
}
