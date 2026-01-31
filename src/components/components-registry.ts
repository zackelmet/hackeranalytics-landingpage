import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * The getComponent() function loads a component using dynamic import.
 *
 * Dynamic imports are useful when you wish to load a module conditionally. For example, if a home page renders the
 * "HeroSection" conditionally, then loading it with getComponent('HeroSection') will ensure that the "HeroSection"
 * is bundled only when used.
 */

export function getComponent(key: string): ComponentType {
    const comp = components[key];
    if (!comp) {
        // diagnostic: log available component keys when a lookup fails
        // (this will appear in the server console during dev)
        // eslint-disable-next-line no-console
        console.warn('components-registry: component not found for key:', key, 'available keys:', Object.keys(components));
    }
    return comp;
}

/**
 * Map of dynamically imported components.
 *
 * The mapping key of a dynamically imported component is the model name describing the props of that component.
 * And the value is the component imported via Next.js dynamic import. You should use dynamic components for large
 * components or components with heavy external dependencies that are used sparingly in your website's pages.
 * To learn more about Nextjs dynamic imports visit:
 * https://nextjs.org/docs/advanced-features/dynamic-import
 *
 * Dynamic components can be selected at run-time based on the type of their content (props). This is because
 * components are mapped by models that describe their content, and content's type always matches the model name.
 * For example, a page component can call `getComponent(section.__metadata.modelName)` function, passing it the type of section
 * data it needs to render, and get back the component that can render that type of data:
 *
 *     const Section = getComponent(section.__metadata.modelName);
 *     return <Section {...section} />;
 */
const components = {
    AutoCompletePosts: dynamic(() => import('./blocks/SearchBlock/AutoCompletePosts')),
    CarouselSection: dynamic(() => import('./sections/CarouselSection')),
    CheckboxFormControl: dynamic(() => import('./blocks/FormBlock/CheckboxFormControl')),
    CheckoutButton: dynamic(() => import('./blocks/CheckoutButton'), { ssr: false }),
    DividerSection: dynamic(() => import('./sections/DividerSection')),
    EmailFormControl: dynamic(() => import('./blocks/FormBlock/EmailFormControl')),
    FeaturedItem: dynamic(() => import('./sections/FeaturedItemsSection/FeaturedItem')),
    FeaturedItemToggle: dynamic(() => import('./sections/FeaturedItemsSection/FeaturedItemToggle')),
    FeaturedItemsSection: dynamic(() => import('./sections/FeaturedItemsSection')),
    FeaturedPeopleSection: dynamic(() => import('./sections/FeaturedPeopleSection')),
    FeaturedPostsSection: dynamic(() => import('./sections/FeaturedPostsSection')),
    FormBlock: dynamic(() => import('./blocks/FormBlock')),
    GenericSection: dynamic(() => import('./sections/GenericSection')),
    BasicSection: dynamic(() => import('./sections/BasicSection')),
    ContactSection: dynamic(() => import('./sections/ContactSection')),
    AccordionSection: dynamic(() => import('./sections/AccordionSection')),
    RequestAQuoteSection: dynamic(() => import('./sections/RequestAQuoteSection')),
    FoxAnimation: dynamic(() => import('./foxanimation')),
    SpinningSphereBlock: dynamic(() => import('./blocks/SpinningSphereBlock'), { ssr: false }),
    ImageBlock: dynamic(() => import('./blocks/ImageBlock')),
    RadarBlock: dynamic(() => import('./blocks/RadarBlock')),
    SignupBox: dynamic(() => import('./blocks/SignupBox'), { ssr: false }),
    ImageGallerySection: dynamic(() => import('./sections/ImageGallerySection')),
    'CTI-AgentsSection': dynamic(() => import('./sections/PricingSection')),
    'malware-reportSection': dynamic(() => import('./sections/PricingSection')),
    OurProcessSection: dynamic(() => import('./sections/OurProcessSection')),
    ValueGridSection: dynamic(() => import('./sections/ValueGridSection')),
    PainPointsSection: dynamic(() => import('./sections/PainPointsSection')),
    AsSeenInSection: dynamic(() => import('./sections/AsSeenInSection')),
    ScreenshotShowcaseSection: dynamic(() => import('./sections/ScreenshotShowcaseSection')),
    PostFeedSection: dynamic(() => import('./sections/PostFeedSection')),
    ToolsHeroSection: dynamic(() => import('./sections/ToolsHeroSection')),
    PricingSection: dynamic(() => import('./sections/PricingSection')),
    RecentPostsSection: dynamic(() => import('./sections/RecentPostsSection')),
    SelectFormControl: dynamic(() => import('./blocks/FormBlock/SelectFormControl')),
    TextareaFormControl: dynamic(() => import('./blocks/FormBlock/TextareaFormControl')),
    TextFormControl: dynamic(() => import('./blocks/FormBlock/TextFormControl')),
    VideoBlock: dynamic(() => import('./blocks/VideoBlock')),
    PageLayout: dynamic(() => import('./layouts/PageLayout')),
    PostLayout: dynamic(() => import('./layouts/PostLayout')),
    ToolLayout: dynamic(() => import('./layouts/ToolLayout')),
    LoginLayout: dynamic(() => import('./layouts/LoginLayout')),
    SignupLayout: dynamic(() => import('./layouts/SignupLayout')),
    DashboardLayout: dynamic(() => import('./layouts/DashboardLayout'), { ssr: false }),
    PostFeedLayout: dynamic(() => import('./layouts/PostFeedLayout')),
    PostFeedCategoryLayout: dynamic(() => import('./layouts/PostFeedCategoryLayout'))
};
