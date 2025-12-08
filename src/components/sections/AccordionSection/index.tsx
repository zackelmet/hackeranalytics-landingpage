import * as React from 'react';
import classNames from 'classnames';
import Section from '../Section';
import TitleBlock from '../../blocks/TitleBlock';
import { getDataAttrs } from '../../../utils/get-data-attrs';

interface AccordionItem {
    question: string;
    answer: string;
}

interface AccordionSectionProps {
    elementId?: string;
    colors?: string;
    title?: any;
    subtitle?: string;
    items?: AccordionItem[];
    styles?: any;
    enableAnnotations?: boolean;
}

export default function AccordionSection(props: AccordionSectionProps) {
    const { elementId, colors = 'bg-neutral-fg-dark', title, subtitle, items = [], styles = {}, enableAnnotations } = props;

    const defaultItems: AccordionItem[] = [
        {
            question: 'How often are your vulnerability databases updated?',
            answer:
                'Our threat intelligence is updated continuously—multiple times per day—not weekly or monthly. This means you are always scanning against the absolute latest CVEs and zero-day threat intelligence, eliminating the risk of operating with an outdated vulnerability definition file.'
        },
        {
            question: 'What kind of integrations do you offer with existing security tools?',
            answer:
                'We offer seamless integration with your existing workflow. This includes native hooks for CI/CD pipelines (like GitHub Actions and Jenkins), ticketing systems (Jira, ServiceNow), and communication tools (Slack) to automatically turn findings into trackable, prioritized remediation tickets.'
        }
    ];

    const contentItems = items.length ? items : defaultItems;
    const [openIndex, setOpenIndex] = React.useState<number | null>(0);

    const toggle = (idx: number) => {
        setOpenIndex((current) => (current === idx ? null : idx));
    };

    return (
        <Section elementId={elementId} className="sb-component-accordion" colors={colors} styles={styles?.self} {...getDataAttrs(props)}>
            <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 md:gap-6">
                {title && (
                    <TitleBlock
                        {...title}
                        className={classNames('w-full', 'text-center')}
                        {...(enableAnnotations && { 'data-sb-field-path': '.title' })}
                    />
                )}
                {subtitle && (
                    <p
                        className="text-center text-lg text-slate-200/90 max-w-3xl mx-auto"
                        {...(enableAnnotations && { 'data-sb-field-path': '.subtitle' })}
                    >
                        {subtitle}
                    </p>
                )}

                <div className="grid gap-4 md:gap-5" {...(enableAnnotations && { 'data-sb-field-path': '.items' })}>
                    {contentItems.map((item, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div key={idx} className={classNames('accordion-card', { 'is-open': isOpen })}>
                                <button
                                    type="button"
                                    className="w-full flex items-start gap-3 text-left"
                                    onClick={() => toggle(idx)}
                                    aria-expanded={isOpen}
                                >
                                    <div className={classNames('accordion-icon', { 'rotate-45': isOpen })} aria-hidden />
                                    <div>
                                        <div className="text-sm uppercase tracking-[0.12em] text-primary/80 mb-1">Question</div>
                                        <h3 className="text-xl font-semibold text-slate-50 leading-snug">{item.question}</h3>
                                    </div>
                                </button>
                                <div className={classNames('accordion-answer', { 'is-open': isOpen })}>
                                    <p className="text-sm md:text-base text-slate-200/90 leading-relaxed">{item.answer}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Section>
    );
}
