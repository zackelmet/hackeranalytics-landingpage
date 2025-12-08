import { Model } from '@stackbit/types';

export const AccordionSection: Model = {
    type: 'object',
    name: 'AccordionSection',
    label: 'Accordion Section',
    labelField: 'title',
    fields: [
        {
            type: 'model',
            name: 'title',
            label: 'Title',
            models: ['TitleBlock'],
            required: false
        },
        {
            type: 'string',
            name: 'subtitle',
            label: 'Subtitle',
            required: false
        },
        {
            type: 'list',
            name: 'items',
            label: 'Items',
            items: {
                type: 'object',
                fields: [
                    { type: 'string', name: 'question', label: 'Question', required: true },
                    { type: 'text', name: 'answer', label: 'Answer', required: true }
                ]
            }
        },
        {
            type: 'string',
            name: 'elementId',
            label: 'Element ID'
        },
        {
            type: 'string',
            name: 'colors',
            label: 'Colors',
            default: 'bg-neutral-fg-dark'
        },
        {
            type: 'style',
            name: 'styles',
            styles: {
                self: {
                    padding: ['*'],
                    margin: ['*'],
                    textAlign: ['*']
                }
            }
        }
    ]
};
