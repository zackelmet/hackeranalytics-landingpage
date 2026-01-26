import fs from 'fs/promises'
import path from 'path'

// Dynamic sitemap for Next.js that enumerates markdown pages under `content/pages`
function normalizeSlug(slug) {
  if (!slug) return null
  slug = String(slug).trim()
  // strip surrounding quotes
  slug = slug.replace(/^\s*["']|["']\s*$/g, '')
  if (!slug.startsWith('/')) slug = '/' + slug
  return slug
}

async function walkDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...await walkDir(full))
    else if (e.isFile() && /\.(md|mdx)$/i.test(e.name)) files.push(full)
  }
  return files
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/xml')

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hackeranalytics.com'
  const contentDir = path.join(process.cwd(), 'content', 'pages')

  let files = []
  try {
    files = await walkDir(contentDir)
  } catch (e) {
    // If content dir is missing, fall back to a small static list
    const fallback = ['', 'cyber-threat-intelligence', 'request-a-quote', 'malware-report', 'redteam-tools', 'blog']
    const urls = fallback.map((p) => {
      const pth = p ? `/${p}` : ''
      return `  <url><loc>${baseUrl}${pth}</loc></url>`
    }).join('\n')
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
    res.status(200).send(sitemap)
    return
  }

  const urls = []
  for (const f of files) {
    try {
      const txt = await fs.readFile(f, 'utf8')
      let slug = null
      let lastmod = null
      if (txt.startsWith('---')) {
        const parts = txt.split('---')
        if (parts.length >= 3) {
          const fm = parts[1]
          // crude frontmatter parsing for slug and date
          const mSlug = fm.match(/^\s*slug:\s*(.+)$/m)
          const mDate = fm.match(/^\s*date:\s*(.+)$/m)
          if (mSlug) slug = normalizeSlug(mSlug[1])
          if (mDate) lastmod = mDate[1].trim().replace(/^['"]|['"]$/g, '')
        }
      }
      if (!slug) {
        // derive from file path under content/pages
        const rel = path.relative(contentDir, f).replace(/\\/g, '/')
        slug = '/' + rel.replace(/\.(md|mdx)$/i, '')
        // convert index to parent path
        slug = slug.replace(/\/index$/i, '')
      }
      const urlObj = { loc: `${baseUrl}${slug}`, lastmod }
      urls.push(urlObj)
    } catch (e) {
      // ignore file read/parse errors
      continue
    }
  }

  // dedupe by loc
  const seen = new Set()
  const unique = []
  for (const u of urls) {
    if (!seen.has(u.loc)) {
      unique.push(u)
      seen.add(u.loc)
    }
  }

  const xmlLines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  for (const u of unique) {
    xmlLines.push('  <url>')
    xmlLines.push(`    <loc>${u.loc}</loc>`)
    if (u.lastmod) xmlLines.push(`    <lastmod>${u.lastmod}</lastmod>`)
    xmlLines.push('  </url>')
  }
  xmlLines.push('</urlset>')

  res.status(200).send(xmlLines.join('\n'))
}
// Dynamic sitemap for Next.js
import fs from 'fs/promises'
import path from 'path'

  // List your static routes here
  const staticPages = [
    '', // home
    'cyber-threat-intelligence',
    'request-a-quote',
    'malware-report', 
    'redteam-tools', 
    'blog', 
  ];

  // Optionally, you can scan your content/pages directory for more routes
  // For demo, we use static list above

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hackeranalytics.com'
  const contentDir = path.join(process.cwd(), 'content', 'pages')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`

  res.status(200).send(sitemap);
}
}
