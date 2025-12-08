import * as React from 'react';
import classNames from 'classnames';
import Section from '../Section';
import TitleBlock from '../../blocks/TitleBlock';
import { Badge } from '../../atoms';
import { getDataAttrs } from '../../../utils/get-data-attrs';

interface ValueItem {
    title: string;
    subtitle?: string;
    description?: string;
    icon?: string;
    iconAlt?: string;
    badge?: string;
}

interface ValueGridSectionProps {
    elementId?: string;
    colors?: string;
    backgroundImage?: any;
    badge?: any;
    title?: any;
    subtitle?: string;
    items?: ValueItem[];
    styles?: any;
    enableAnnotations?: boolean;
}

export default function ValueGridSection(props: ValueGridSectionProps) {
    const { elementId, colors, backgroundImage, badge, title, subtitle, items = [], styles = {}, enableAnnotations } = props;

    const defaultItems: ValueItem[] = [
        {
            title: 'Instant Deployment & Zero Setup',
            subtitle: 'Start scanning immediately',
            description: 'Start scanning immediately without the hassle of installing or maintaining dedicated infrastructure.'
        },
        {
            title: 'Slash Infrastructure Costs',
            subtitle: 'Eliminate infrastructure overhead',
            description: 'Eliminate the need to purchase, power, and patch your own scanning hardware and software licenses.'
        },
        {
            title: 'Effortless Scalability',
            subtitle: 'Scale to any size',
            description: 'Easily scale your scanning capacity up or down to cover one asset or a thousand, without managing physical resources.'
        },
        {
            title: 'Scan From Anywhere',
            subtitle: 'External & internal scanning',
            description: 'Perform external and internal network scans against public-facing assets, no matter your physical location.'
        },
        {
            title: 'Always Up-to-Date',
            subtitle: 'Continuous vulnerability updates',
            description: 'The scanner is automatically updated with the latest vulnerability feeds and zero-day patches, ensuring comprehensive coverage.'
        },
        {
            title: 'Focus on Remediation',
            subtitle: 'Prioritize fixes',
            description: 'Free up your security team to focus solely on fixing vulnerabilities, not managing scanner uptime and maintenance.'
        }
    ];

    const contentItems = items.length ? items : defaultItems;

    return (
        <Section elementId={elementId} className="sb-component-value-grid" colors={colors} backgroundImage={backgroundImage} styles={styles?.self} {...getDataAttrs(props)}>
            <div className="w-full flex flex-col items-center gap-y-6">
                {badge && <Badge {...badge} {...(enableAnnotations && { 'data-sb-field-path': '.badge' })} />}
                {title && (
                    <TitleBlock
                        {...title}
                        className={classNames('w-full', 'max-w-4xl', 'mx-auto', 'mb-2', 'text-center')}
                        {...(enableAnnotations && { 'data-sb-field-path': '.title' })}
                    />
                )}
                {subtitle && (
                    <p
                        className={classNames('w-full', 'max-w-3xl', 'mx-auto', 'text-lg', 'sm:text-xl', 'text-center', 'text-slate-600', 'mb-6')}
                        {...(enableAnnotations && { 'data-sb-field-path': '.subtitle' })}
                    >
                        {subtitle}
                    </p>
                )}

                <div className="w-full max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" {...(enableAnnotations && { 'data-sb-field-path': '.items' })}>
                        {contentItems.map((item, idx) => (
                            <div key={idx} className="value-card rounded-xl p-6">
                                <div className="relative z-10 flex flex-col gap-3">
                                    {item.icon && (
                                        <img
                                            src={item.icon}
                                            alt={item.iconAlt || ''}
                                            className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(0,254,217,0.35)]"
                                        />
                                    )}
                                    <div className="value-chip">{item.subtitle}</div>
                                    <h3 className="value-title text-slate-50">{item.title}</h3>
                                    {item.description && <p className="text-sm text-slate-200 leading-relaxed opacity-90">{item.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Section>
    );
}
