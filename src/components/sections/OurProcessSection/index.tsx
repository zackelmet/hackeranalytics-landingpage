import * as React from 'react';
import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';

import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import { getDataAttrs } from '../../../utils/get-data-attrs';
import Section from '../Section';
import TitleBlock from '../../blocks/TitleBlock';
import { Action, Badge } from '../../atoms';

/**
 * OurProcessSection
 * A fresh, blank-slate section that renders a centered title + subtitle and
 * a responsive 1/2/4-up grid of dark cards with cyan text and hover-floating.
 * Designed for process steps: numbered badge, icon slot, title, short copy.
 */
export default function OurProcessSection(props) {
    const { elementId, colors, backgroundImage, badge, title, subtitle, plans = [], styles = {}, enableAnnotations } = props;

    // Default content when none provided from CMS/content files
    const defaultPlans = [
        {
            title: 'Instant Deployment & Zero Setup',
            description: 'Start scanning immediately without the hassle of installing or maintaining dedicated infrastructure.'
        },
        {
            title: 'Slash Infrastructure Costs',
            description: 'Eliminate the need to purchase, power, and patch your own scanning hardware and software licenses.'
        },
        {
            title: 'Effortless Scalability',
            description: 'Easily scale your scanning capacity up or down to cover one asset or a thousand, without managing physical resources.'
        },
        {
            title: 'Scan From Anywhere',
            description: 'Perform external and internal network scans against public-facing assets, no matter your physical location.'
        },
        {
            title: 'Always Up-to-Date',
            description: 'The scanner is automatically updated with the latest vulnerability feeds and zero-day patches, ensuring comprehensive coverage.'
        },
        {
            title: 'Focus on Remediation',
            description: 'Free up your security team to focus solely on fixing vulnerabilities, not managing scanner uptime and maintenance.'
        }
    ];

    const contentPlans = (plans && plans.length > 0) ? plans : defaultPlans;

    const icons = [
        '/images/icons/rocket.svg',
        '/images/icons/cost.svg',
        '/images/icons/cloud.svg',
        '/images/icons/globe.svg',
        '/images/icons/update.svg',
        '/images/icons/target.svg'
    ];

    return (
        <Section elementId={elementId} className="sb-component-our-process" colors={colors} backgroundImage={backgroundImage} styles={styles?.self} {...getDataAttrs(props)}>
            <div className={classNames('w-full', 'flex', 'flex-col', 'items-center', 'gap-y-6')}>
                {badge && <Badge {...badge} {...(enableAnnotations && { 'data-sb-field-path': '.badge' })} />}
                {title && (
                    <TitleBlock {...title} className={classNames('w-full', 'max-w-4xl', 'mx-auto', 'mb-2', 'text-center')} {...(enableAnnotations && { 'data-sb-field-path': '.title' })} />
                )}
                {subtitle && (
                    <p className={classNames('w-full', 'max-w-4xl', 'mx-auto', 'text-lg', 'sm:text-xl', 'text-center', 'mb-6')} {...(enableAnnotations && { 'data-sb-field-path': '.subtitle' })}>
                        {subtitle}
                    </p>
                )}

                <div className="w-full max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" {...(enableAnnotations && { 'data-sb-field-path': '.plans' })}>
                        {contentPlans && contentPlans.length > 0 ? (
                            contentPlans.map((plan, idx) => (
                                <div
                                    key={idx}
                                    className="fade-in bg-slate-900/70 text-slate-50 rounded-xl p-6 shadow-lg border border-slate-800 transform-gpu hover:-translate-y-1 hover:shadow-xl hover:border-primary/60 transition-all"
                                >
                                    <div className="relative h-full flex flex-col">
                                        <div className="absolute -top-5 left-6">
                                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-dark font-bold">{idx + 1}</div>
                                        </div>
                                        <div className="flex-1 pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center text-primary">
                                                    <img src={icons[idx % icons.length]} alt="icon" className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold leading-tight mb-2 text-white">{plan.title}</h3>
                                                    {plan.description && (
                                                        <p className="text-sm mb-3 text-slate-200">
                                                            {plan.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-sm text-slate-400">No steps defined.</div>
                        )}
                    </div>
                </div>
            </div>
        </Section>
    );
}
