import * as React from 'react';
import Markdown from 'markdown-to-jsx';
import classNames from 'classnames';

import Image from 'next/image';
import { getComponent } from '../../components-registry';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import { getDataAttrs } from '../../../utils/get-data-attrs';
import Section from '../Section';
import TitleBlock from '../../blocks/TitleBlock';
import { Action, Badge } from '../../atoms';

export default function BasicSection(props) {
    const { elementId, colors, backgroundImage, badge, title, subtitle, text, actions = [], media, styles = {}, enableAnnotations } = props;
    const titleTextRaw = String(title?.text ?? '');
    const titleText = titleTextRaw.toLowerCase();
    const flexDirection = styles?.self?.flexDirection ?? 'row';
    const alignItems = styles?.self?.alignItems ?? 'flex-start';
    const hasTextContent = !!(badge?.url || title?.text || subtitle || text || actions.length > 0);
    const hasMedia = !!(
        media &&
        (media?.url || (media?.fields ?? []).length > 0 || media?.type || media?.__metadata?.modelName)
    );
    const mediaInline = !!(media && media?.styles?.self?.placement === 'inline');
    const hasSeparateMedia = hasMedia && !mediaInline;
    const hasXDirection = flexDirection === 'row' || flexDirection === 'row-reverse';

    // Determine per-section decorative wrapper classes to give each CTI section a distinct "card" feel
    const textWrapperDecoration = (() => {
        if (colors === 'bg-dark-fg-light') {
            // Hero: subtle glass card to lift text off the dark background
            return 'bg-black/20 backdrop-blur-sm rounded-xl p-6 lg:p-8 shadow-xl';
        }
        if (colors === 'bg-neutral-fg-dark') {
            // Neutral sections: left accent and softer surface
            return 'bg-white/5 border-l-4 border-primary/20 pl-6 lg:pl-8 rounded-md';
        }
        if (colors === 'bg-light-fg-dark') {
            // Light sections: subtle ring
            return 'ring-1 ring-primary/5 rounded-lg p-4';
        }
        return '';
    })();

    return (
        <Section
            elementId={elementId}
            className="sb-component-basic-section"
            colors={colors}
            backgroundImage={backgroundImage}
            styles={styles?.self}
            {...getDataAttrs(props)}
        >
            <div
                className={classNames(
                    'w-full',
                    'flex',
                    mapFlexDirectionStyles(flexDirection, hasTextContent, hasSeparateMedia),
                    /* handle horizontal positioning of content on small screens or when direction is col or col-reverse, mapping justifyContent to alignItems instead since it's a flex column */
                    mapStyles({ alignItems: styles?.self?.justifyContent ?? 'flex-start' }),
                    /* handle vertical positioning of content on large screens if it's a two col layout */
                    hasSeparateMedia && hasTextContent && hasXDirection ? mapAlignItemsStyles(alignItems) : undefined,
                    'gap-x-12',
                    'gap-y-16'
                )}
            >
                {hasTextContent && (
                    <div
                        className={classNames('w-full', {
                            'lg:w-1/2': hasSeparateMedia && hasXDirection,
                            // Make these follow-up CTI sections wider on desktop so their content matches the hero's width
                            // use a larger centered max width so the content aligns with the hero container
                            'mx-auto lg:max-w-6xl': !hasSeparateMedia && (titleText.includes('turn cti') || titleText.includes('compliance alignment') || titleText.includes('request a quote')),
                            'max-w-sectionBody': !(hasSeparateMedia && hasXDirection) && !(titleText.includes('turn cti') || titleText.includes('compliance alignment') || titleText.includes('request a quote'))
                        })}
                    >
                        <div className={classNames(textWrapperDecoration)}>
                            {/* removed small 'Compliance' badge per design request */}
                            {badge && <Badge {...badge} {...(enableAnnotations && { 'data-sb-field-path': '.badge' })} />}
                            {title && (
                                <TitleBlock
                                    {...title}
                                    className={classNames('mb-4', { 'mt-4': badge?.label })}
                                    {...(enableAnnotations && { 'data-sb-field-path': '.title' })}
                                />
                            )}
                            {subtitle && (
                                <p
                                    className={classNames('text-lg', 'sm:text-2xl', styles?.subtitle ? mapStyles(styles?.subtitle) : undefined, {
                                        'mt-4': badge?.label || title?.text
                                    })}
                                    {...(enableAnnotations && { 'data-sb-field-path': '.subtitle' })}
                                >
                                    {subtitle}
                                </p>
                            )}
                            {text && (() => {
                                const titleText = String(title?.text ?? '') || '';
                                const normalized = titleText.toLowerCase();
                                const isComplianceAlignment = normalized.includes('compliance alignment') || normalized.includes('soc') || normalized.includes('pci') || normalized.includes('nist');
                                const isComplianceEvidence = normalized.includes('why it matters') || normalized.includes('turn cti') || normalized.includes('compliance evidence') || (normalized.includes('cti') && normalized.includes('compliance'));

                                if (isComplianceEvidence) {
                                    return (
                                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                                            <div className="prose max-w-none text-lg sm:text-xl lg:text-3xl leading-relaxed">
                                                {/* use the provided markdown text as the large intro */}
                                                <Markdown
                                                    options={{ forceBlock: true, forceWrapper: true }}
                                                    className={classNames('sb-markdown', styles?.text ? mapStyles(styles?.text) : undefined)}
                                                    {...(enableAnnotations && { 'data-sb-field-path': '.text' })}
                                                >
                                                    {text}
                                                </Markdown>
                                            </div>
                                            <div className="flex flex-col gap-6">
                                                <div className="bg-white/6 p-8 rounded-xl shadow-md card-hover fade-in">
                                                    <div className="flex items-start gap-4">
                                                        <span className="icon icon-doc" />
                                                        <div>
                                                            <h4 className="text-2xl font-semibold mb-1">Mapped Controls</h4>
                                                            <p className="text-sm">Verified CTI mapped to auditor controls and packaged as evidence bundles.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/6 p-8 rounded-xl shadow-md card-hover fade-in">
                                                    <div className="flex items-start gap-4">
                                                        <span className="icon icon-check" />
                                                        <div>
                                                            <h4 className="text-2xl font-semibold mb-1">Continuous Visibility</h4>
                                                            <p className="text-sm">Real-time telemetry and alerting that reduce blind spots and speed response.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/6 p-8 rounded-xl shadow-md card-hover fade-in">
                                                    <div className="flex items-start gap-4">
                                                        <span className="icon icon-shield" />
                                                        <div>
                                                            <h4 className="text-2xl font-semibold mb-1">Automated Evidence</h4>
                                                            <p className="text-sm">On-demand and scheduled reports that stand up in audits.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (isComplianceAlignment) {
                                    return (
                                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch">
                                            <div className="bg-white/6 p-8 rounded-xl shadow-md bounce-on-hover fade-in flex flex-col">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Image src="/images/soc2.jpeg" alt="SOC 2" width={80} height={80} className="rounded-full object-cover border-4 border-primary" />
                                                    <h4 className="text-2xl font-semibold mb-0">SOC 2</h4>
                                                </div>
                                                <p className="text-lg italic mb-4">“System components must be monitored to identify deviations…”</p>
                                                <p className="text-sm mt-auto">Continuous collection and retention aligned to CC6.6 &amp; CC7.2.</p>
                                            </div>
                                            <div className="bg-white/6 p-8 rounded-xl shadow-md bounce-on-hover fade-in flex flex-col">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Image src="/images/pcidss.jpeg" alt="PCI DSS" width={80} height={80} className="rounded-full object-cover border-4 border-amber-400" />
                                                    <h4 className="text-2xl font-semibold mb-0">PCI DSS</h4>
                                                </div>
                                                <p className="text-lg italic mb-4">“Track and monitor all access to network resources and cardholder data.”</p>
                                                <p className="text-sm mt-auto">Comprehensive access and event logging for Requirement 10 evidence.</p>
                                            </div>
                                            <div className="bg-white/6 p-8 rounded-xl shadow-md bounce-on-hover fade-in flex flex-col">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Image src="/images/nist-csf.jpeg" alt="NIST CSF" width={80} height={80} className="rounded-full object-cover border-4 border-teal-400" />
                                                    <h4 className="text-2xl font-semibold mb-0">NIST CSF (DE.CM)</h4>
                                                </div>
                                                <p className="text-lg italic mb-4">“Continuous monitoring of system components…”</p>
                                                <p className="text-sm mt-auto">Real-time monitoring flows and exportable documentation for DE.CM categories.</p>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <Markdown
                                        options={{ forceBlock: true, forceWrapper: true }}
                                        className={classNames('sb-markdown', 'sm:text-lg', styles?.text ? mapStyles(styles?.text) : undefined, {
                                            'mt-6': badge?.label || title?.text || subtitle
                                        })}
                                        {...(enableAnnotations && { 'data-sb-field-path': '.text' })}
                                    >
                                        {text}
                                    </Markdown>
                                );
                            })()}
                            {/* Extra feature cards for 'How It Works' section to highlight core functions */}
                            {title?.text && String(title.text).includes('How It Works') && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                    <div className="bg-white/5 p-4 rounded-md">Continuous data collection from internal & external sources</div>
                                    <div className="bg-white/5 p-4 rounded-md">IOC correlation, enrichment, and trend tracking</div>
                                    <div className="bg-white/5 p-4 rounded-md">Integration with SIEMs and ticketing systems</div>
                                    <div className="bg-white/5 p-4 rounded-md">Automated generation of compliance and audit reports</div>
                                </div>
                            )}
                            {/* Render inline media (centered) between text and actions when requested in content */}
                            {mediaInline && (
                                <div className={classNames('flex', 'justify-center', 'items-center', 'my-4')}>
                                    <Media media={media} hasAnnotations={enableAnnotations} />
                                </div>
                            )}
                            {actions.length > 0 && (
                                <div
                                    className={classNames(
                                        'flex',
                                        'flex-wrap',
                                        mapStyles({ justifyContent: styles?.self?.justifyContent ?? 'flex-start' }),
                                        'items-center',
                                        'gap-4',
                                        {
                                            'mt-8': badge?.label || title?.text || subtitle || text
                                        }
                                    )}
                                    {...(enableAnnotations && { 'data-sb-field-path': '.actions' })}
                                >
                                    {actions.map((action, index) => (
                                        <Action
                                            key={index}
                                            {...action}
                                            className="lg:whitespace-nowrap"
                                            {...(enableAnnotations && { 'data-sb-field-path': `.${index}` })}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {hasSeparateMedia && (
                    <div
                        className={classNames('w-full', 'flex', mapStyles({ justifyContent: styles?.self?.justifyContent ?? 'flex-start' }), {
                            'max-w-sectionBody': media.__metadata?.modelName === 'FormBlock',
                            'lg:w-1/2 lg:shrink-0': hasTextContent && hasXDirection,
                            'lg:mt-10': badge?.label && media.__metadata?.modelName === 'FormBlock' && hasXDirection
                        })}
                    >
                        {/* If media is a FormBlock, render it inside a highlighted card to feel like a quote request card */}
                        {media?.__metadata?.modelName === 'FormBlock' ? (
                            <div className="w-full bg-white/5 border border-white/6 rounded-lg p-6 shadow-lg">
                                <Media media={media} hasAnnotations={enableAnnotations} />
                            </div>
                        ) : (
                            <Media media={media} hasAnnotations={enableAnnotations} />
                        )}
                    </div>
                )}
            </div>
        </Section>
    );
}

function Media({ media, hasAnnotations }: { media: any; hasAnnotations: boolean }) {
    const modelName = media?.__metadata?.modelName ?? media?.type;
    if (!modelName) {
        throw new Error(`basic section media does not have a 'modelName' or 'type' property`);
    }
    const MediaComponent = getComponent(modelName);
    if (!MediaComponent) {
        throw new Error(`no component matching the basic section media model name: ${modelName}`);
    }
    return <MediaComponent {...media} {...(hasAnnotations && { 'data-sb-field-path': '.media' })} />;
}

function mapFlexDirectionStyles(flexDirection: string, hasTextContent: boolean, hasMedia: boolean) {
    switch (flexDirection) {
        case 'row':
            return hasTextContent && hasMedia ? 'flex-col lg:flex-row lg:justify-between' : 'flex-col';
        case 'row-reverse':
            return hasTextContent && hasMedia ? 'flex-col lg:flex-row-reverse lg:justify-between' : 'flex-col';
        case 'col':
            return 'flex-col';
        case 'col-reverse':
            return 'flex-col-reverse';
        default:
            return null;
    }
}

function mapAlignItemsStyles(alignItems: string) {
    switch (alignItems) {
        case 'flex-start':
            return 'lg:items-start';
        case 'flex-end':
            return 'lg:items-end';
        case 'center':
            return 'lg:items-center';
        default:
            return null;
    }
}
