/**
 * SEO Audit Script for Hacker Analytics
 *
 * Crawls all pages and blog posts, runs Lighthouse on each,
 * and outputs a structured seo-audit.json for OpenClaw to act on.
 *
 * Usage:
 *   npm run seo:audit
 *   npm run seo:audit -- --url https://hackeranalytics.com  (production)
 *   npm run seo:audit -- --url http://localhost:3000         (local, default)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const urlArgIndex = args.indexOf('--url');
const BASE_URL = urlArgIndex !== -1 ? args[urlArgIndex + 1] : 'http://localhost:3000';
const OUTPUT_FILE = path.join(__dirname, '..', 'seo-audit.json');
const CONTENT_DIR = path.join(__dirname, '..', 'content');

// Ideal SEO thresholds
const THRESHOLDS = {
    titleMinLen: 30,
    titleMaxLen: 60,
    metaDescMinLen: 120,
    metaDescMaxLen: 160,
    minWordCount: 300,
    lighthouseMinScore: 0.8 // 80
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function readFrontMatter(filePath) {
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const match = raw.match(/^---\n([\s\S]*?)\n---/);
        if (!match) return { frontmatter: {}, body: raw };
        const fm = {};
        match[1].split('\n').forEach((line) => {
            const [key, ...rest] = line.split(':');
            if (key && rest.length)
                fm[key.trim()] = rest
                    .join(':')
                    .trim()
                    .replace(/^['"]|['"]$/g, '');
        });
        const body = raw.slice(match[0].length).trim();
        return { frontmatter: fm, body };
    } catch {
        return { frontmatter: {}, body: '' };
    }
}

function countWords(text) {
    return text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/[#*`_[\]()]/g, '')
        .split(/\s+/)
        .filter(Boolean).length;
}

function slugToUrl(slug) {
    // slug may already include /blog/ etc
    const clean = slug.startsWith('/') ? slug : `/${slug}`;
    return `${BASE_URL}${clean}`;
}

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client
            .get(url, { timeout: 15000 }, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => resolve({ status: res.statusCode, body: data }));
            })
            .on('error', reject)
            .on('timeout', () => reject(new Error('timeout')));
    });
}

// Very lightweight HTML meta extractor (no cheerio dependency)
function extractMeta(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const descMatch =
        html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
    const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i);

    // Count all img tags and those missing alt
    const imgTags = html.match(/<img[^>]*>/gi) || [];
    const imgsMissingAlt = imgTags.filter((tag) => !tag.includes('alt=') || tag.includes('alt=""') || tag.includes("alt=''")).length;

    // Count h2, h3 tags
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;

    return {
        title: titleMatch ? titleMatch[1].trim() : null,
        metaDescription: descMatch ? descMatch[1].trim() : null,
        h1: h1Match ? h1Match[1].trim() : null,
        canonical: canonicalMatch ? canonicalMatch[1].trim() : null,
        ogTitle: ogTitleMatch ? ogTitleMatch[1].trim() : null,
        ogDescription: ogDescMatch ? ogDescMatch[1].trim() : null,
        ogImage: ogImageMatch ? ogImageMatch[1].trim() : null,
        imgCount: imgTags.length,
        imgsMissingAlt,
        h2Count,
        h3Count
    };
}

// Run Lighthouse via CLI if available, else skip gracefully
async function runLighthouse(url) {
    try {
        const { execSync } = require('child_process');
        const result = execSync(
            `npx lighthouse "${url}" --output=json --quiet --chrome-flags="--headless --no-sandbox --disable-gpu" --only-categories=performance,seo,accessibility,best-practices 2>/dev/null`,
            { timeout: 90000, maxBuffer: 10 * 1024 * 1024 }
        );
        const report = JSON.parse(result.toString());
        return {
            performance: report.categories.performance?.score ?? null,
            seo: report.categories.seo?.score ?? null,
            accessibility: report.categories.accessibility?.score ?? null,
            bestPractices: report.categories['best-practices']?.score ?? null,
            audits: {
                firstContentfulPaint: report.audits['first-contentful-paint']?.displayValue ?? null,
                largestContentfulPaint: report.audits['largest-contentful-paint']?.displayValue ?? null,
                totalBlockingTime: report.audits['total-blocking-time']?.displayValue ?? null,
                cumulativeLayoutShift: report.audits['cumulative-layout-shift']?.displayValue ?? null,
                speedIndex: report.audits['speed-index']?.displayValue ?? null
            }
        };
    } catch {
        return null; // Lighthouse not available or failed - non-fatal
    }
}

// ---------------------------------------------------------------------------
// Collect all content pages
// ---------------------------------------------------------------------------
function collectPages() {
    const pages = [];

    // Main pages
    const pagesDir = path.join(CONTENT_DIR, 'pages');
    const mdFiles = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.md') && !fs.statSync(path.join(pagesDir, f)).isDirectory());
    for (const file of mdFiles) {
        const filePath = path.join(pagesDir, file);
        const { frontmatter, body } = readFrontMatter(filePath);
        if (!frontmatter.slug) continue;
        pages.push({
            type: 'page',
            file: path.relative(path.join(__dirname, '..'), filePath),
            slug: frontmatter.slug,
            url: slugToUrl(frontmatter.slug === 'index' ? '/' : frontmatter.slug),
            title: frontmatter.title || null,
            metaTitle: frontmatter.metaTitle || frontmatter.seo?.metaTitle || null,
            metaDescription: frontmatter.metaDescription || frontmatter.seo?.metaDescription || null,
            wordCount: countWords(body),
            frontmatter
        });
    }

    // Blog posts
    const blogDir = path.join(CONTENT_DIR, 'pages', 'blog');
    if (fs.existsSync(blogDir)) {
        const blogFiles = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'));
        for (const file of blogFiles) {
            if (file === 'index.md') continue;
            const filePath = path.join(blogDir, file);
            const { frontmatter, body } = readFrontMatter(filePath);
            if (!frontmatter.slug) continue;
            pages.push({
                type: 'blog',
                file: path.relative(path.join(__dirname, '..'), filePath),
                slug: frontmatter.slug,
                url: slugToUrl(frontmatter.slug),
                title: frontmatter.title || null,
                metaTitle: frontmatter.metaTitle || (frontmatter.seo && frontmatter.seo.metaTitle) || null,
                metaDescription: frontmatter.metaDescription || (frontmatter.seo && frontmatter.seo.metaDescription) || null,
                wordCount: countWords(body),
                tags: frontmatter.tags || [],
                date: frontmatter.date || null,
                frontmatter
            });
        }
    }

    return pages;
}

// ---------------------------------------------------------------------------
// Audit a single page
// ---------------------------------------------------------------------------
async function auditPage(page) {
    const issues = [];
    let htmlMeta = null;
    let lighthouse = null;
    let httpStatus = null;

    // Fetch the rendered page
    try {
        const res = await fetchUrl(page.url);
        httpStatus = res.status;

        if (res.status !== 200) {
            issues.push({ severity: 'critical', type: 'broken_page', message: `Page returned HTTP ${res.status}` });
        } else {
            htmlMeta = extractMeta(res.body);

            // Title checks
            const title = htmlMeta.title || page.metaTitle || page.title;
            if (!title) {
                issues.push({ severity: 'critical', type: 'missing_title', message: 'No <title> tag found' });
            } else {
                if (title.length < THRESHOLDS.titleMinLen)
                    issues.push({
                        severity: 'warning',
                        type: 'title_too_short',
                        message: `Title is ${title.length} chars (min ${THRESHOLDS.titleMinLen}): "${title}"`
                    });
                if (title.length > THRESHOLDS.titleMaxLen)
                    issues.push({
                        severity: 'warning',
                        type: 'title_too_long',
                        message: `Title is ${title.length} chars (max ${THRESHOLDS.titleMaxLen}): "${title}"`
                    });
            }

            // Meta description checks
            const desc = htmlMeta.metaDescription || page.metaDescription;
            if (!desc) {
                issues.push({ severity: 'critical', type: 'missing_meta_description', message: 'No meta description found' });
            } else {
                if (desc.length < THRESHOLDS.metaDescMinLen)
                    issues.push({
                        severity: 'warning',
                        type: 'meta_description_too_short',
                        message: `Meta description is ${desc.length} chars (min ${THRESHOLDS.metaDescMinLen}): "${desc}"`
                    });
                if (desc.length > THRESHOLDS.metaDescMaxLen)
                    issues.push({
                        severity: 'warning',
                        type: 'meta_description_too_long',
                        message: `Meta description is ${desc.length} chars (max ${THRESHOLDS.metaDescMaxLen})`
                    });
            }

            // H1 check
            if (!htmlMeta.h1) {
                issues.push({ severity: 'warning', type: 'missing_h1', message: 'No H1 tag found on page' });
            }

            // Open Graph checks
            if (!htmlMeta.ogTitle) issues.push({ severity: 'info', type: 'missing_og_title', message: 'No og:title meta tag' });
            if (!htmlMeta.ogDescription) issues.push({ severity: 'info', type: 'missing_og_description', message: 'No og:description meta tag' });
            if (!htmlMeta.ogImage) issues.push({ severity: 'info', type: 'missing_og_image', message: 'No og:image meta tag' });

            // Image alt text
            if (htmlMeta.imgsMissingAlt > 0) {
                issues.push({ severity: 'warning', type: 'images_missing_alt', message: `${htmlMeta.imgsMissingAlt} image(s) missing alt text` });
            }

            // Heading structure
            if (htmlMeta.h2Count === 0) {
                issues.push({ severity: 'info', type: 'no_h2_headings', message: 'No H2 headings found - consider adding section headings' });
            }
        }
    } catch (err) {
        issues.push({ severity: 'critical', type: 'fetch_error', message: `Could not fetch page: ${err.message}` });
    }

    // Word count check (from source markdown)
    if (page.wordCount < THRESHOLDS.minWordCount) {
        issues.push({
            severity: page.wordCount < 100 ? 'critical' : 'warning',
            type: 'thin_content',
            message: `Only ${page.wordCount} words (min ${THRESHOLDS.minWordCount} recommended for SEO)`
        });
    }

    // Run Lighthouse (skip in CI unless explicitly enabled)
    if (process.env.RUN_LIGHTHOUSE === 'true') {
        console.log(`  🔦 Running Lighthouse on ${page.url}...`);
        lighthouse = await runLighthouse(page.url);
        if (lighthouse) {
            if (lighthouse.seo !== null && lighthouse.seo < THRESHOLDS.lighthouseMinScore) {
                issues.push({ severity: 'warning', type: 'low_lighthouse_seo', message: `Lighthouse SEO score: ${Math.round(lighthouse.seo * 100)}/100` });
            }
            if (lighthouse.performance !== null && lighthouse.performance < THRESHOLDS.lighthouseMinScore) {
                issues.push({
                    severity: 'warning',
                    type: 'low_lighthouse_performance',
                    message: `Lighthouse Performance score: ${Math.round(lighthouse.performance * 100)}/100`
                });
            }
            if (lighthouse.accessibility !== null && lighthouse.accessibility < THRESHOLDS.lighthouseMinScore) {
                issues.push({
                    severity: 'warning',
                    type: 'low_lighthouse_accessibility',
                    message: `Lighthouse Accessibility score: ${Math.round(lighthouse.accessibility * 100)}/100`
                });
            }
        }
    }

    // Score: 0-100 based on issues
    const criticalCount = issues.filter((i) => i.severity === 'critical').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    const score = Math.max(0, 100 - criticalCount * 25 - warningCount * 10);

    return {
        ...page,
        httpStatus,
        htmlMeta,
        lighthouse,
        issues,
        score,
        auditedAt: new Date().toISOString()
    };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
    console.log(`\n🔍 Hacker Analytics SEO Audit`);
    console.log(`📡 Base URL: ${BASE_URL}`);
    console.log(`📁 Output:   ${OUTPUT_FILE}\n`);

    const pages = collectPages();
    console.log(`📄 Found ${pages.length} pages to audit\n`);

    const results = [];
    for (const page of pages) {
        process.stdout.write(`  Auditing ${page.url} ... `);
        try {
            const result = await auditPage(page);
            results.push(result);
            const icon = result.score >= 80 ? '✅' : result.score >= 50 ? '⚠️ ' : '❌';
            console.log(`${icon} score=${result.score} issues=${result.issues.length}`);
        } catch (err) {
            console.log(`💥 ERROR: ${err.message}`);
            results.push({ ...page, issues: [{ severity: 'critical', type: 'audit_error', message: err.message }], score: 0 });
        }
    }

    // Summary stats
    const critical = results.flatMap((r) => r.issues).filter((i) => i.severity === 'critical').length;
    const warnings = results.flatMap((r) => r.issues).filter((i) => i.severity === 'warning').length;
    const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
    const pagesNeedingWork = results.filter((r) => r.score < 80).length;

    const output = {
        meta: {
            generatedAt: new Date().toISOString(),
            baseUrl: BASE_URL,
            totalPages: results.length,
            avgSeoScore: avgScore,
            criticalIssues: critical,
            warningIssues: warnings,
            pagesNeedingWork
        },
        pages: results.sort((a, b) => a.score - b.score) // worst first
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

    console.log(`\n📊 Audit Summary`);
    console.log(`   Pages audited:      ${results.length}`);
    console.log(`   Avg SEO score:      ${avgScore}/100`);
    console.log(`   Critical issues:    ${critical}`);
    console.log(`   Warnings:           ${warnings}`);
    console.log(`   Pages needing work: ${pagesNeedingWork}`);
    console.log(`\n✅ Report saved to ${OUTPUT_FILE}\n`);
}

main().catch((err) => {
    console.error('Audit failed:', err);
    process.exit(1);
});
