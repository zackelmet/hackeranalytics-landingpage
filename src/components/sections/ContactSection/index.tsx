import * as React from 'react';
import { useState } from 'react';
import classNames from 'classnames';

import { getComponent } from '../../components-registry';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import { getDataAttrs } from '../../../utils/get-data-attrs';
import Section from '../Section';
import TitleBlock from '../../blocks/TitleBlock';
import { Badge } from '../../atoms';

export default function ContactSection(props) {
    const { elementId, colors, backgroundImage, badge, title, subtitle, text, media, styles = {}, enableAnnotations } = props;
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    return (
        <Section
            elementId={elementId}
            className="sb-component-contact-section px-4 md:px-8"
            colors={colors}
            backgroundImage={backgroundImage}
            styles={styles?.self}
            {...getDataAttrs(props)}
        >
            <div className={classNames('w-full', 'grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-8', 'items-start')}>
                <div className={classNames('w-full', 'max-w-sectionBody', 'text-left', 'text-light')}>
                    {badge && <Badge {...badge} {...(enableAnnotations && { 'data-sb-field-path': '.badge' })} />}
                    {title && (
                        <TitleBlock
                            {...title}
                            className={classNames('pt-2', 'pb-2', 'mb-4', { 'mt-4': badge?.label })}
                            {...(enableAnnotations && { 'data-sb-field-path': '.title' })}
                        />
                    )}
                    {subtitle && (
                        <p className="mt-4 text-lg sm:text-xl" {...(enableAnnotations && { 'data-sb-field-path': '.subtitle' })}>
                            {subtitle}
                        </p>
                    )}
                    {text && (
                        <a
                            href="https://www.linkedin.com/company/hacker-analytics/"
                            target="_blank"
                            rel="noopener"
                            className="block mt-12 ml-0 max-w-xs bg-blue-900 border border-blue-900 rounded-xl shadow px-5 py-4 text-left text-lg font-semibold text-white hover:bg-blue-800 transition-all flex items-center gap-2 cursor-pointer"
                            aria-label="Chat with us directly on LinkedIn"
                        >
                            Or chat with us directly on Linkedin
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={28}
                                height={28}
                                viewBox="0 0 24 24"
                                className="ml-2"
                            >
                                <path fill="#60a5fa" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.6 2.001 3.6 4.601v5.595z" />
                            </svg>
                        </a>
                    )}
                </div>

                {/* Single outline box containing the form - on wide screens the form sits right of the description */}
                {!submitted ? (
                    <form
                        className="grid gap-4"
                        data-netlify="true"
                        name="contact"
                        data-netlify-honeypot="bot-field"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setError(null);
                            const form = e.currentTarget as HTMLFormElement;
                            const fd = new FormData(form);
                            // honeypot check
                            if (fd.get('bot-field')) {
                                // silently exit if bot
                                return;
                            }
                            // Ensure Netlify sees this submission via form-name
                            fd.set('form-name', 'contact');
                            const body = new URLSearchParams();
                            for (const [k, v] of Array.from(fd.entries())) {
                                body.append(k, String(v));
                            }
                            try {
                                setSubmitting(true);
                                const res = await fetch('/', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                    body: body.toString()
                                });
                                if (res.ok) {
                                    setSubmitted(true);
                                } else {
                                    setError('Submission failed. Please try again later.');
                                }
                            } catch (err) {
                                setError('Submission failed. Please try again later.');
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        <input type="hidden" name="form-name" value="contact" />
                        <p className="hidden">
                            <label>
                                Don’t fill this out if you’re human: <input name="bot-field" />
                            </label>
                        </p>
                        <div className="flex flex-col gap-2 mb-4">
                            <label className="font-semibold text-white tracking-wide mb-1" htmlFor="name">Your Name *</label>
                            <input id="name" name="name" type="text" required className="bg-white/10 backdrop-blur border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder="Enter your name" />
                        </div>
                        <div className="flex flex-col gap-2 mb-4">
                            <label className="font-semibold text-white tracking-wide mb-1" htmlFor="email">Email Address *</label>
                            <input id="email" name="email" type="email" required className="bg-white/10 backdrop-blur border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder="Enter your email" />
                        </div>
                        <div className="flex flex-col gap-2 mb-6">
                            <label className="font-semibold text-white tracking-wide mb-1" htmlFor="message">Message *</label>
                            <textarea id="message" name="message" className="bg-white/10 backdrop-blur border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-300 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder="Type your message..." />
                        </div>
                        {error && <div className="text-red-400 mb-2">{error}</div>}
                        <button type="submit" disabled={submitting} className="w-full py-3 px-6 bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-800 hover:to-indigo-700 transition-all border border-white/20 backdrop-blur disabled:opacity-60">
                            <span className="tracking-wide">{submitting ? 'Sending...' : 'Send Message'}</span>
                        </button>
                    </form>
                ) : (
                    <div className="w-full border border-white/6 rounded-lg p-6 bg-white/5 text-white">
                        <h3 className="text-xl font-semibold mb-2">Thanks — we got your message</h3>
                        <p className="text-base">We'll get back to you shortly. If it's urgent, reach us on LinkedIn.</p>
                    </div>
                )}
            </div>
        </Section>
    );
}

function ContactMedia({ media, hasAnnotations }: { media: any; hasAnnotations: boolean }) {
    const modelName = media?.__metadata?.modelName ?? media?.type;
    if (!modelName) {
        throw new Error(`contact section media does not have the 'modelName' or 'type' property`);
    }
    const MediaComponent = getComponent(modelName);
    if (!MediaComponent) {
        throw new Error(`no component matching the contact section media model name: ${modelName}`);
    }
    return <MediaComponent {...media} {...(hasAnnotations && { 'data-sb-field-path': '.media' })} />;
}
