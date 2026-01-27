#!/usr/bin/env node
const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')
const yaml = require('js-yaml')

async function walk(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...await walk(full))
    else if (e.isFile() && /\.(md|mdx)$/i.test(e.name)) files.push(full)
  }
  return files
}

function normalizeSlug(slug) {
  if (!slug) return null
  slug = String(slug).trim()
  slug = slug.replace(/^\s*["']|["']\s*$/g, '')
  if (!slug.startsWith('/')) slug = '/' + slug
  return slug
}

async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hackeranalytics.com'
  const contentDir = path.join(process.cwd(), 'content', 'pages')
  const publicDir = path.join(process.cwd(), 'public')
  await fsp.mkdir(publicDir, { recursive: true })

  let files = []
  try {
    files = await walk(contentDir)
  } catch (e) {
    console.warn('content/pages not found, using fallback')
    files = []
  }

  const urls = []
  for (const f of files) {
    try {
      const txt = await fsp.readFile(f, 'utf8')
      let slug = null
      let lastmod = null
      if (txt.startsWith('---')) {
        const parts = txt.split('---')
        if (parts.length >= 3) {
          try {
            const fm = parts[1]
            const data = yaml.load(fm) || {}
            if (data.slug) slug = normalizeSlug(data.slug)
            if (data.date) lastmod = String(data.date)
          } catch (e) {
            // fallback to crude parsing
            const mSlug = parts[1].match(/^\s*slug:\s*(.+)$/m)
            const mDate = parts[1].match(/^\s*date:\s*(.+)$/m)
            if (mSlug) slug = normalizeSlug(mSlug[1])
            if (mDate) lastmod = mDate[1].trim().replace(/^['"]|['"]$/g, '')
          }
        }
      }
      if (!slug) {
        const rel = path.relative(contentDir, f).replace(/\\/g, '/')
        slug = '/' + rel.replace(/\.(md|mdx)$/i, '')
        slug = slug.replace(/\/index$/i, '')
      }
      urls.push({ loc: baseUrl + slug, lastmod })
    } catch (e) {
      continue
    }
  }

  // dedupe
  const seen = new Set()
  const unique = []
  for (const u of urls) {
    if (!seen.has(u.loc)) { unique.push(u); seen.add(u.loc) }
  }

  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  for (const u of unique) {
    lines.push('  <url>')
    lines.push(`    <loc>${u.loc}</loc>`)
    if (u.lastmod) lines.push(`    <lastmod>${u.lastmod}</lastmod>`)
    lines.push('  </url>')
  }
  lines.push('</urlset>')

  const out = lines.join('\n') + '\n'
  await fsp.writeFile(path.join(publicDir, 'sitemap.xml'), out, 'utf8')
  console.log('Wrote public/sitemap.xml with', unique.length, 'entries')
}

main().catch((e) => { console.error(e); process.exit(1) })
