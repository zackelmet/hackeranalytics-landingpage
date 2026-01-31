import React from 'react';
import Head from 'next/head';
import { allContent } from '../utils/local-content';
import { getComponent } from '../components/components-registry';
import { resolveStaticProps } from '../utils/static-props-resolvers';
import { resolveStaticPaths } from '../utils/static-paths-resolvers';
import { seoGenerateTitle, seoGenerateMetaTags, seoGenerateMetaDescription, seoGenerateCanonicalUrl } from '../utils/seo-utils';

function Page(props) {
    // Safety check for undefined props
    if (!props || !props.page || !props.site) {
        return null;
    }

    const { page, site } = props;

    // Safety check for page metadata
    if (!page.__metadata || !page.__metadata.modelName) {
        console.error('Page missing metadata:', props.path);
        return null;
    }

    const { modelName } = page.__metadata;
    const PageLayout = getComponent(modelName);
    if (!PageLayout) {
        throw new Error(`no page layout matching the page model: ${modelName}`);
    }
    const title = seoGenerateTitle(page, site);
    const metaTags = seoGenerateMetaTags(page, site);
    const metaDescription = seoGenerateMetaDescription(page, site);
    const canonicalUrl = seoGenerateCanonicalUrl(page, site);
    return (
        <>
            <Head>
                <title>{title}</title>
                {metaDescription && <meta name="description" content={metaDescription} />}
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
                {metaTags.map((metaTag) => {
                    if (metaTag.format === 'property') {
                        // OpenGraph meta tags (og:*) should be have the format <meta property="og:…" content="…">
                        return <meta key={metaTag.property} property={metaTag.property} content={metaTag.content} />;
                    }
                    return <meta key={metaTag.property} name={metaTag.property} content={metaTag.content} />;
                })}
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {site.favicon && (
                    <>
                        <link rel="icon" type="image/svg+xml" href={site.favicon} />
                        <link rel="shortcut icon" href={site.favicon} />
                    </>
                )}
                <link rel="icon" type="image/png" sizes="32x32" href="/images/HA-logo.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/images/HA-logo.png" />
                <link rel="shortcut icon" href="/images/HA-logo.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/images/HA-logo.png" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#0a0a23" />
            </Head>
            <PageLayout page={page} site={site} />
        </>
    );
}

export function getStaticPaths() {
    const data = allContent();
    const paths = resolveStaticPaths(data);
    // Exclude dashboard from static paths since it requires client-side auth
    const filteredPaths = paths.filter((path) => {
        const slug = path?.params?.slug;
        if (!slug) return true; // Keep paths without slug (like homepage)
        return !slug.includes('dashboard');
    });
    return { paths: filteredPaths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
    const data = allContent();
    const urlPath = '/' + (params.slug || []).join('/');
    // Fast-path: bail out for internal Next/static or API asset requests so the
    // page resolver doesn't try to treat those as CMS pages. In dev HMR will
    // request files under /_next/static/... (hot-update.json) and this catch-
    // all page would otherwise attempt to resolve them and log "Invalid props"
    // which breaks Fast Refresh. Return notFound early for those paths.
    if (urlPath.startsWith('/_next') || urlPath.startsWith('/api') || /\.[a-z0-9]+$/i.test(urlPath)) {
        return { notFound: true };
    }

    const props = await resolveStaticProps(urlPath, data);

    // Safety check - if props are invalid, return notFound
    if (!props || !props.page || !props.site) {
        console.error('Invalid props for path:', urlPath);
        return { notFound: true };
    }

    return { props };
}

export default Page;
