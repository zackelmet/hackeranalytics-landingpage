import * as React from 'react';
import classNames from 'classnames';

import Section from '../Section';
import { getDataAttrs } from '../../../utils/get-data-attrs';

export default function AsSeenInSection(props) {
    const { elementId, styles = {}, links = [], enableAnnotations } = props;

    // default entries (useable placeholders); user will provide real URLs later
    const entries = links && links.length > 0 ? links : [
        { name: 'Hacker News', href: '#', img: '/images/logos/y-combinator-news.png' },
        { name: 'Product Hunt', href: '#', img: '/images/logos/producthunt.png' },
        { name: 'X', href: '#', img: '/images/logos/x-twitter.png' },
        { name: 'G2', href: '#', img: '/images/logos/g2.png' }
    ];

    return (
        <Section elementId={elementId} className="sb-component-as-seen-in" {...getDataAttrs(props)}>
            <div className={classNames('w-full', 'flex', 'flex-col', 'items-center', 'gap-y-6')}>
                <h2 className="text-3xl font-bold text-center tracking-tight">Featured On</h2>
                <div className="w-full max-w-5xl mt-2 grid grid-cols-2 sm:grid-cols-4 gap-8 items-center justify-items-center">
                    {entries.map((e, i) => (
                        <a 
                            key={i} 
                            href={e.href} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="group relative p-6 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl w-full flex items-center justify-center"
                        >
                            <img 
                                src={e.img} 
                                alt={e.name} 
                                className="max-h-12 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300 filter grayscale group-hover:grayscale-0" 
                            />
                        </a>
                    ))}
                </div>
            </div>
        </Section>
    );
}
