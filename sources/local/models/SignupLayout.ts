import { Model } from '@stackbit/types';

export const SignupLayout: Model = {
    type: 'page',
    name: 'SignupLayout',
    label: 'Signup Page',
    hideContent: true,
    filePath: 'content/pages/signup.md',
    fields: [
        {
            type: 'string',
            name: 'title',
            label: 'Title',
            required: true,
            default: 'Sign Up',
            hidden: false,
            localized: false
        }
    ]
};
