import * as React from 'react';
import classNames from 'classnames';

import Section from '../Section';
import { getDataAttrs } from '../../../utils/get-data-attrs';

export default function ScreenshotShowcaseSection(props) {
    const { elementId, title, features = [], screenshots = [] } = props;

    return (
        <Section elementId={elementId} className="sb-component-screenshot-showcase" {...getDataAttrs(props)}>
            <div className="w-full max-w-7xl mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Screenshots Column */}
                    <div className="relative h-[600px] order-2 lg:order-1">
                        {screenshots.map((screenshot, idx) => (
                            <div
                                key={idx}
                                className={classNames(
                                    'absolute rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm transition-transform duration-300 hover:scale-105 hover:z-10',
                                    screenshot.className
                                )}
                                style={{
                                    top: screenshot.top || '0%',
                                    left: screenshot.left || '0%',
                                    width: screenshot.width || '70%',
                                    zIndex: idx
                                }}
                            >
                                <img
                                    src={screenshot.src}
                                    alt={screenshot.alt}
                                    className="w-full h-auto"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Features Column */}
                    <div className="space-y-8 order-1 lg:order-2">
                        <div>
                            <h2 className="text-4xl font-bold mb-4">{title}</h2>
                            <p className="text-lg opacity-80">
                                Trusted by Fortune 100 companies, government agencies, and IT professionals worldwide.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded bg-primary/20 border-2 border-primary flex items-center justify-center mt-0.5">
                                        <svg 
                                            className="w-4 h-4 text-primary" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={3} 
                                                d="M5 13l4 4L19 7" 
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2 text-slate-100 !opacity-100">{feature.title}</h3>
                                        <p className="leading-relaxed text-slate-100 !opacity-100">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}
