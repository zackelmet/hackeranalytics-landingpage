import * as React from 'react';
import classNames from 'classnames';

import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';

export default function ImageBlock(props) {
    const { elementId, className, imageClassName, url, altText = '', link, styles = {} } = props;
    if (!url) {
        return null;
    }
    const fieldPath = props['data-sb-field-path'];
    const annotations = fieldPath
        ? { 'data-sb-field-path': [fieldPath, `${fieldPath}.url#@src`, `${fieldPath}.altText#@alt`, `${fieldPath}.elementId#@id`].join(' ').trim() }
        : {};

    const imageElement = (
        <img
            id={elementId}
            className={classNames(
                imageClassName,
                styles?.self?.padding ? mapStyles({ padding: styles?.self?.padding }) : undefined,
                styles?.self?.borderWidth && styles?.self?.borderWidth !== 0 && styles?.self?.borderStyle !== 'none'
                    ? mapStyles({
                          borderWidth: styles?.self?.borderWidth,
                          borderStyle: styles?.self?.borderStyle,
                          borderColor: styles?.self?.borderColor ?? 'border-primary'
                      })
                    : undefined,
                styles?.self?.borderRadius ? mapStyles({ borderRadius: styles?.self?.borderRadius }) : undefined
            )}
            style={styles?.self?.maxWidth ? { maxWidth: styles.self.maxWidth, width: '100%' } : undefined}
            src={url}
            alt={altText}
        />
    );

    return (
        <div
            className={classNames(
                'sb-component',
                'sb-component-block',
                'sb-component-image-block',
                className,
                styles?.self?.margin ? mapStyles({ margin: styles?.self?.margin }) : undefined
            )}
            {...annotations}
        >
            {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center' }}>
                    {imageElement}
                    <p style={{ color: 'white', marginTop: '8px', fontSize: '16px' }}>MSP Pentesting</p>
                </a>
            ) : (
                imageElement
            )}
        </div>
    );
}
