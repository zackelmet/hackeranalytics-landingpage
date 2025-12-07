import * as React from 'react';
import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';

import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import { getDataAttrs } from '../../../utils/get-data-attrs';
import { getComponent } from '../../components-registry';
import Section from '../Section';
import TitleBlock from '../../blocks/TitleBlock';
import ImageBlock from '../../blocks/ImageBlock';
import { Action, Badge } from '../../atoms';

export default function PricingSection(props) {
    const { elementId, colors, backgroundImage, badge, title, subtitle, plans = [], styles = {}, enableAnnotations } = props;

    return (
        <Section
            elementId={elementId}
            className="sb-component-pricing-section"
            colors={colors}
            backgroundImage={backgroundImage}
            styles={styles?.self}
            {...getDataAttrs(props)}
        >
            <div className={classNames('w-full', 'flex', 'flex-col', mapStyles({ alignItems: styles?.self?.justifyContent ?? 'flex-start' }))}>
                {badge && <Badge {...badge} className="w-full max-w-sectionBody" {...(enableAnnotations && { 'data-sb-field-path': '.badge' })} />}
                {title && (
                    <TitleBlock
                        {...title}
                        className={classNames('w-full', 'max-w-6xl', 'mx-auto', { 'mt-4': badge?.label })}
                        {...(enableAnnotations && { 'data-sb-field-path': '.title' })}
                    />
                )}
                {subtitle && (
                    <p
                        className={classNames(
                            'w-full',
                            'max-w-6xl',
                            'mx-auto',
                            'text-lg',
                            'sm:text-2xl',
                            styles?.subtitle ? mapStyles(styles?.subtitle) : undefined,
                            {
                                'mt-4': badge?.label || title?.text
                            }
                        )}
                        {...(enableAnnotations && { 'data-sb-field-path': '.subtitle' })}
                    >
                        {subtitle}
                    </p>
                )}
                {plans.length > 0 && (
                    <div className={classNames('w-full', 'overflow-x-hidden', { 'mt-12': !!(badge?.label || title?.text || subtitle) })}>
                        <div className="w-full max-w-6xl mx-auto">
                            <div
                                className={classNames('flex', 'flex-wrap', 'items-stretch', mapStyles({ justifyContent: styles?.self?.justifyContent ?? 'flex-start' }), 'gap-y-10', '-mx-5')}
                                {...(enableAnnotations && { 'data-sb-field-path': '.plans' })}
                            >
                                {plans.map((plan, index) => (
                                    <div key={index} className="px-5 basis-full max-w-full sm:basis-5/6 sm:max-w-[83.33333%] md:basis-2/3 md:max-w-[66.66667%] lg:basis-1/4 lg:max-w-[25%]">
                                        <PricingPlan
                                            {...plan}
                                            stepIndex={index + 1}
                                            hasSectionTitle={!!title?.text}
                                            {...(enableAnnotations && { 'data-sb-field-path': `.${index}` })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Section>
    );
}

function PricingPlan(props) {
    const {
        elementId,
        title,
        price,
        details,
        description,
        features = [],
        image,
        actions = [],
        colors = 'bg-light-fg-dark',
        styles = {},
        hasSectionTitle
    } = props;
    const fieldPath = props['data-sb-field-path'];
    const TitleTag = hasSectionTitle ? 'h3' : 'h2';

    return (
        <div
            id={elementId}
            className={classNames(
                'h-full',
                'bg-[#1e293b]',
                'border',
                'border-slate-700',
                'rounded-lg',
                'overflow-hidden',
                'relative',
                'flex',
                'flex-col',
                'transition-all',
                'duration-300',
                'hover:border-cyan-500',
                'hover:shadow-lg',
                'hover:shadow-cyan-500/20',
                styles?.self?.margin ? mapStyles({ margin: styles?.self?.margin }) : undefined,
                styles?.self?.textAlign ? mapStyles({ textAlign: styles?.self?.textAlign }) : undefined
            )}
            data-sb-field-path={fieldPath}
        >
            {(title || price || details || description || features.length > 0 || actions.length > 0) && (
                <div className={classNames('grow', 'flex', 'flex-col', 'p-8', styles?.self?.padding ? mapStyles({ padding: styles?.self?.padding }) : undefined)}>
                    {title && (
                        <TitleTag className="text-2xl font-bold text-white mb-2" {...(fieldPath && { 'data-sb-field-path': '.title' })}>
                            {title}
                        </TitleTag>
                    )}
                    {(price || details) && (
                        <div className="mb-6">
                            {price && (
                                <div className="text-5xl font-bold text-white" {...(fieldPath && { 'data-sb-field-path': '.price' })}>
                                    {price}
                                </div>
                            )}
                            {details && (
                                <div className="text-sm text-slate-400 mt-1" {...(fieldPath && { 'data-sb-field-path': '.details' })}>
                                    {details}
                                </div>
                            )}
                        </div>
                    )}
                    {description && (
                        <Markdown
                            options={{ forceBlock: true, forceWrapper: true }}
                            className={classNames('text-slate-300 mb-6', { 'mt-4': !price && !details })}
                            {...(fieldPath && { 'data-sb-field-path': '.description' })}
                        >
                            {description}
                        </Markdown>
                    )}
                    {features.length > 0 && (
                        <ul
                            className="space-y-3 mb-8 flex-grow"
                            {...(fieldPath && { 'data-sb-field-path': '.features' })}
                        >
                            {features.map((bullet, index) => (
                                <li key={index} className="flex items-start text-slate-300" {...(fieldPath && { 'data-sb-field-path': `.${index}` })}>
                                    <svg className="w-5 h-5 text-cyan-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {actions.length > 0 && (
                        <div
                            className="flex flex-wrap gap-4 mt-auto"
                            {...(fieldPath && { 'data-sb-field-path': '.actions' })}
                        >
                                {actions.map((action, index) => {
                                    // CheckoutButton has a 'tier' prop, regular buttons/links don't
                                    if (action.tier) {
                                        const CheckoutButton = getComponent('CheckoutButton');
                                        // Prevent SSR for client-only component
                                        if (typeof window === 'undefined') {
                                            return (
                                                <button
                                                    key={index}
                                                    className="sb-component sb-component-block sb-component-button sb-component-button-primary"
                                                    disabled
                                                >
                                                    {action.label || 'Get Started'}
                                                </button>
                                            );
                                        }
                                        return <CheckoutButton key={index} {...action} {...(fieldPath && { 'data-sb-field-path': `.${index}` })} />;
                                    }
                                    return <Action key={index} {...action} className="lg:whitespace-nowrap" {...(fieldPath && { 'data-sb-field-path': `.${index}` })} />;
                                })}
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}
