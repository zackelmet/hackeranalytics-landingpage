import { Model } from '@stackbit/types';

export const SpinningSphereBlock: Model = {
    type: 'object',
    name: 'SpinningSphereBlock',
    label: 'Spinning Sphere Block',
    description: 'Simple Three.js spinning sphere for hero media.',
    fields: [
        {
            type: 'string',
            name: 'elementId',
            label: 'Element ID',
            required: false
        }
    ]
};
