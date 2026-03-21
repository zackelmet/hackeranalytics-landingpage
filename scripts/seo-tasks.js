/**
 * SEO Tasks Generator for Hacker Analytics
 *
 * Reads seo-audit.json and generates seo-tasks.md -
 * a structured, prioritized task list for OpenClaw to act on.
 *
 * Usage:
 *   npm run seo:tasks
 */

const fs = require('fs');
const path = require('path');

const AUDIT_FILE = path.join(__dirname, '..', 'seo-audit.json');
const TASKS_FILE = path.join(__dirname, '..', 'seo-tasks.md');

if (!fs.existsSync(AUDIT_FILE)) {
    console.error('❌ seo-audit.json not found. Run `npm run seo:audit` first.');
    process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
const { meta, pages } = audit;

// ---------------------------------------------------------------------------
// Task templates - human + AI readable instructions per issue type
// ---------------------------------------------------------------------------
const TASK_TEMPLATES = {
    missing_title: {
        priority: 'P0',
        action: 'Add a <title> tag',
        instruction: (page) =>
            `Add a concise, keyword-rich <title> to the frontmatter \`metaTitle\` field of \`${page.file}\`. Target 50-60 characters. The page is about: "${page.title || page.slug}".`
    },
    missing_meta_description: {
        priority: 'P0',
        action: 'Add meta description',
        instruction: (page) =>
            `Add a \`metaDescription\` to \`${page.file}\`. Write 140-160 characters summarizing the page for search results. Include the primary keyword naturally. Page topic: "${page.title || page.slug}".`
    },
    thin_content: {
        priority: 'P1',
        action: 'Expand content',
        instruction: (page) =>
            `\`${page.file}\` has only ${page.wordCount} words. Expand to 600+ words. Add sections covering: use cases, how it works, FAQs, and relevant cybersecurity context. Maintain the existing tone and keyword focus.`
    },
    title_too_short: {
        priority: 'P1',
        action: 'Lengthen title',
        instruction: (page) =>
            `The title in \`${page.file}\` is too short. Update \`metaTitle\` to 50-60 characters. Current title: "${page.metaTitle || page.title}". Add a keyword modifier or brand suffix like "| Hacker Analytics".`
    },
    title_too_long: {
        priority: 'P1',
        action: 'Shorten title',
        instruction: (page) =>
            `The title in \`${page.file}\` exceeds 60 characters and will be truncated in SERPs. Update \`metaTitle\` to 50-60 characters. Current: "${page.metaTitle || page.title}".`
    },
    meta_description_too_short: {
        priority: 'P1',
        action: 'Lengthen meta description',
        instruction: (page) =>
            `Meta description in \`${page.file}\` is too short. Expand \`metaDescription\` to 140-160 characters. Include a clear value proposition and call to action. Current: "${page.metaDescription}".`
    },
    meta_description_too_long: {
        priority: 'P1',
        action: 'Shorten meta description',
        instruction: (page) =>
            `Meta description in \`${page.file}\` exceeds 160 characters and will be truncated. Trim \`metaDescription\` to under 160 characters while preserving the key message.`
    },
    missing_h1: {
        priority: 'P1',
        action: 'Add H1 heading',
        instruction: (page) =>
            `\`${page.file}\` has no H1. Ensure the first heading in the content is an H1 (single # in markdown) that matches or closely relates to the page title: "${page.title}".`
    },
    images_missing_alt: {
        priority: 'P2',
        action: 'Add image alt text',
        instruction: (page) =>
            `${page.htmlMeta?.imgsMissingAlt || 'Some'} image(s) in \`${page.file}\` are missing alt text. Add descriptive alt attributes to all images for accessibility and image SEO.`
    },
    no_h2_headings: {
        priority: 'P2',
        action: 'Add H2 section headings',
        instruction: (page) =>
            `\`${page.file}\` has no H2 headings. Break content into logical sections with H2 headings (## in markdown) to improve readability and keyword coverage.`
    },
    missing_og_title: {
        priority: 'P2',
        action: 'Add og:title',
        instruction: (page) => `Add \`seo.ogTitle\` or \`socialImage\` metadata to \`${page.file}\` for better social sharing appearance.`
    },
    missing_og_image: {
        priority: 'P2',
        action: 'Add og:image',
        instruction: (page) =>
            `\`${page.file}\` has no og:image. Set \`socialImage\` in frontmatter to a relevant image path (e.g. \`/images/Hacker Analytics.png\`) for better social sharing previews.`
    },
    low_lighthouse_seo: {
        priority: 'P1',
        action: 'Fix Lighthouse SEO issues',
        instruction: (page) =>
            `Lighthouse SEO score for \`${page.file}\` is below 80. Run \`npx lighthouse ${page.url}\` locally to see specific failing audits and fix them.`
    },
    low_lighthouse_performance: {
        priority: 'P1',
        action: 'Fix performance issues',
        instruction: (page) =>
            `Lighthouse Performance score for \`${page.file}\` is low. Check for large images, render-blocking scripts, or missing caching headers.`
    },
    broken_page: {
        priority: 'P0',
        action: 'Fix broken page',
        instruction: (page) => `\`${page.file}\` returned a non-200 HTTP status. Investigate the slug, routing, and page content immediately.`
    }
};

// ---------------------------------------------------------------------------
// Build task list
// ---------------------------------------------------------------------------
function buildTasks() {
    const tasks = [];

    for (const page of pages) {
        for (const issue of page.issues) {
            const template = TASK_TEMPLATES[issue.type];
            if (!template) continue;

            tasks.push({
                priority: template.priority,
                file: page.file,
                url: page.url,
                type: issue.type,
                severity: issue.severity,
                action: template.action,
                instruction: template.instruction(page),
                issue: issue.message,
                pageScore: page.score,
                pageType: page.type
            });
        }
    }

    // Sort by priority then page score (worst first)
    const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
    tasks.sort((a, b) => {
        const pd = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (pd !== 0) return pd;
        return a.pageScore - b.pageScore;
    });

    return tasks;
}

// ---------------------------------------------------------------------------
// Generate blog post ideas for thin/missing content
// ---------------------------------------------------------------------------
function generateBlogIdeas() {
    const thinPages = pages.filter((p) => p.type === 'blog' && p.wordCount < 300);

    if (thinPages.length === 0) return '';

    let section = `\n## 📝 Blog Posts Needing Full Content\n\n`;
    section += `The following blog posts exist as stubs and need to be written in full.\n`;
    section += `Each should target 800-1200 words with clear sections, practical examples, and internal links.\n\n`;

    for (const page of thinPages) {
        section += `### ${page.title || page.slug}\n`;
        section += `- **File:** \`${page.file}\`\n`;
        section += `- **Current word count:** ${page.wordCount}\n`;
        section += `- **Target keyword:** ${page.metaTitle || page.title || 'Unknown'}\n`;
        section += `- **Tags:** ${(page.tags || []).join(', ') || 'none'}\n`;
        section += `- **Action:** Write a complete 800-1200 word blog post. Include:\n`;
        section += `  1. Introduction explaining the topic\n`;
        section += `  2. Step-by-step or conceptual breakdown\n`;
        section += `  3. Why it matters for security teams\n`;
        section += `  4. How Hacker Analytics helps (natural CTA, not pushy)\n`;
        section += `  5. FAQ section (3-5 questions)\n`;
        section += `  6. Conclusion with internal link to a relevant service page\n\n`;
    }

    return section;
}

// ---------------------------------------------------------------------------
// Render markdown
// ---------------------------------------------------------------------------
function renderMarkdown(tasks) {
    const now = new Date().toISOString();
    const p0 = tasks.filter((t) => t.priority === 'P0');
    const p1 = tasks.filter((t) => t.priority === 'P1');
    const p2 = tasks.filter((t) => t.priority === 'P2');

    let md = `# Hacker Analytics — SEO Task List\n\n`;
    md += `> Generated: ${now}  \n`;
    md += `> Based on audit of **${meta.totalPages} pages**  \n`;
    md += `> Average SEO score: **${meta.avgSeoScore}/100**  \n`;
    md += `> Pages needing work: **${meta.pagesNeedingWork}**\n\n`;
    md += `---\n\n`;

    md += `## 📊 Summary\n\n`;
    md += `| Priority | Count | Description |\n`;
    md += `|----------|-------|-------------|\n`;
    md += `| 🔴 P0 | ${p0.length} | Critical — fix immediately |\n`;
    md += `| 🟠 P1 | ${p1.length} | High — fix this sprint |\n`;
    md += `| 🟡 P2 | ${p2.length} | Medium — fix when possible |\n\n`;

    md += `---\n\n`;

    const renderGroup = (label, emoji, group) => {
        if (group.length === 0) return '';
        let s = `## ${emoji} ${label} (${group.length} tasks)\n\n`;
        for (let i = 0; i < group.length; i++) {
            const t = group[i];
            s += `### ${i + 1}. ${t.action}\n\n`;
            s += `- **File:** \`${t.file}\`\n`;
            s += `- **URL:** ${t.url}\n`;
            s += `- **Issue:** ${t.issue}\n`;
            s += `- **Page score:** ${t.pageScore}/100\n\n`;
            s += `**What to do:**\n\n${t.instruction}\n\n`;
            s += `---\n\n`;
        }
        return s;
    };

    md += renderGroup('P0 — Critical Issues', '🔴', p0);
    md += renderGroup('P1 — High Priority', '🟠', p1);
    md += renderGroup('P2 — Medium Priority', '🟡', p2);
    md += generateBlogIdeas();

    md += `\n---\n\n`;
    md += `## 🤖 Instructions for OpenClaw\n\n`;
    md += `1. Work through tasks in priority order (P0 → P1 → P2)\n`;
    md += `2. Edit the specified \`.md\` files in \`content/pages/\` or \`content/pages/blog/\`\n`;
    md += `3. For frontmatter SEO fields, use the \`seo:\` block:\n`;
    md += `   \`\`\`yaml\n`;
    md += `   seo:\n`;
    md += `     metaTitle: Your title here (50-60 chars)\n`;
    md += `     metaDescription: Your description here (140-160 chars)\n`;
    md += `   \`\`\`\n`;
    md += `4. After completing tasks, commit with message: \`fix(seo): <description of changes>\`\n`;
    md += `5. Re-run \`npm run seo:audit && npm run seo:tasks\` to verify improvements\n\n`;
    md += `**Do not modify:** \`src/\` components, \`tailwind.config.js\`, or any \`.tsx\`/\`.ts\` files\n`;

    return md;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const tasks = buildTasks();
const markdown = renderMarkdown(tasks);
fs.writeFileSync(TASKS_FILE, markdown);

console.log(`\n✅ SEO task list generated: ${TASKS_FILE}`);
console.log(`   Total tasks: ${tasks.length}`);
console.log(`   P0 critical: ${tasks.filter((t) => t.priority === 'P0').length}`);
console.log(`   P1 high:     ${tasks.filter((t) => t.priority === 'P1').length}`);
console.log(`   P2 medium:   ${tasks.filter((t) => t.priority === 'P2').length}\n`);
