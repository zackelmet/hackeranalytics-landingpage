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
            <div className={classNames('w-full', 'flex', 'flex-col', 'items-center', 'gap-y-4')}>
                <h2 className="text-2xl font-semibold text-center">As Seen In</h2>
                <p className="text-sm text-center text-slate-400 max-w-2xl">Trusted by the security community and featured on leading sites.</p>
                <div className="w-full max-w-4xl mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-items-center">
                    {entries.map((e, i) => (
                        <a key={i} href={e.href} target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg hover:shadow-lg transition-shadow w-full flex items-center justify-center">
                            <img src={e.img} alt={e.name} className="max-h-12 object-contain" />
                        </a>
                    ))}
                </div>
            </div>
        </Section>
    );
}
