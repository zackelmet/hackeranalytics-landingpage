import * as React from 'react';
import classNames from 'classnames';
import Link from '../Link';
import { iconMap } from '../../svgs';

export default function Social(props) {
    const { elementId, className, altText, url, icon = 'facebook' } = props;
    const IconComponent = iconMap[icon];
    const fieldPath = props['data-sb-field-path'];
    const annotations = fieldPath
        ? { 'data-sb-field-path': [fieldPath, `${fieldPath}.url#@href`, `${fieldPath}.altText#@aria-label`, `${fieldPath}.elementId#@id`].join(' ').trim() }
        : {};

    return (
        <Link
            id={elementId}
            className={classNames(
                'sb-component',
                'sb-component-block',
                'sb-component-social',
                'inline-flex',
                'items-center',
                'justify-center',
                'transition',
                'duration-200',
                'ease-in',
                'hover:-translate-y-1',
                'p-3',
                className
            )}
            href={url}
            aria-label={altText}
            target={props.target}
            rel={props.rel}
            {...annotations}
        >
            {IconComponent && <IconComponent className="shrink-0 fill-current w-8 h-8" {...(fieldPath && { 'data-sb-field-path': '.icon' })} />}
        </Link>
    );
}
