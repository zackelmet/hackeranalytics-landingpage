---
title: Pricing
slug: /pricing
sections:
  - type: GenericSection
    title:
      text: Simple, Transparent Pricing
      color: text-dark
      type: TitleBlock
    subtitle: Choose the plan that fits your security needs
    elementId: pricing-hero
    colors: bg-neutral-fg-dark
    styles:
      self:
        alignItems: center
        padding:
          - pt-16
          - pb-12
        textAlign: center

  - type: PricingSection
    title:
      text: Hosted Vulnerability Scanner Plans
      color: text-dark
      type: TitleBlock
    subtitle: Professional security scanning without the infrastructure overhead
    plans:
      - type: PricingPlan
        title: Essential
        price: $96
        details: per year
        description: Perfect for small teams and individual security professionals
        features:
          - 100 scans per month
          - OpenVAS scanner access
          - Basic vulnerability reports
          - Email support
          - 7-day money-back guarantee
        actions:
          - type: CheckoutButton
            tier: ESSENTIAL
            label: Get Started
            style: primary
        colors: bg-light-fg-dark
        
      - type: PricingPlan
        title: Pro
        price: $240
        details: per year
        description: For security teams requiring comprehensive scanning capabilities
        features:
          - 500 scans per month
          - OpenVAS + Nmap scanners
          - Advanced vulnerability reports
          - Priority email support
          - Custom scan scheduling
          - API access
          - 7-day money-back guarantee
        actions:
          - type: CheckoutButton
            tier: PRO
            label: Get Started
            style: primary
        colors: bg-light-fg-dark
        
      - type: PricingPlan
        title: Scale
        price: $720
        details: per year
        description: For organizations with demanding security assessment requirements
        features:
          - Unlimited scans
          - Full scanner suite access
          - Custom integrations
          - Dedicated support
          - SLA guarantee
          - Team collaboration tools
          - Advanced reporting & analytics
          - 7-day money-back guarantee
        actions:
          - type: CheckoutButton
            tier: SCALE
            label: Get Started
            style: primary
        colors: bg-light-fg-dark
        
      - type: PricingPlan
        title: Custom
        price: Contact Us
        details: tailored pricing
        description: Need something specific? We'll build a plan that works for you
        features:
          - Custom scan volumes
          - White-label options
          - On-premise deployment
          - Custom tool integrations
          - Dedicated account manager
          - Training & onboarding
          - Custom SLA terms
        actions:
          - type: Button
            label: Contact Sales
            url: '#'
            style: secondary
        colors: bg-light-fg-dark
    elementId: pricing-plans
    colors: bg-dark-fg-light
    styles:
      self:
        padding:
          - pt-16
          - pb-16
        justifyContent: center

  - type: GenericSection
    title:
      text: Frequently Asked Questions
      color: text-dark
      type: TitleBlock
    text: >
      **What payment methods do you accept?**
      
      We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.


      **Can I change plans later?**
      
      Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.


      **What's your refund policy?**
      
      All plans come with a 7-day, no-questions-asked money-back guarantee. If you're not satisfied, we'll refund your payment in full.


      **Do you offer discounts for annual billing?**
      
      Yes! Save 20% when you pay annually. Contact our sales team for details.


      **What happens if I exceed my scan limit?**
      
      We'll notify you when you approach your limit. You can upgrade your plan or purchase additional scan credits as needed.
    elementId: faq-section
    colors: bg-light-fg-dark
    styles:
      self:
        padding:
          - pt-16
          - pb-16
          - pl-16
          - pr-16
        textAlign: left

  - type: ContactSection
    elementId: contact-section
    title:
      text: "Questions About Pricing?"
      color: text-dark
      type: TitleBlock
    subtitle: Our team is here to help you find the right plan
    text: Or schedule a demo to see our platform in action
    media:
      fields:
        - name: name
          label: Name
          hideLabel: true
          placeholder: Your name
          isRequired: true
          width: full
          type: TextFormControl
        - name: email
          label: Email
          hideLabel: true
          placeholder: Your email
          isRequired: true
          width: full
          type: EmailFormControl
        - name: company
          label: Company
          hideLabel: true
          placeholder: Your company
          isRequired: false
          width: full
          type: TextFormControl
        - name: message
          label: Message
          hideLabel: true
          placeholder: Tell us about your needs
          isRequired: false
          width: full
          type: TextareaFormControl
      elementId: pricing-contact-form
      styles:
        self:
          padding:
            - pt-6
            - pb-6
            - pl-6
            - pr-6
          borderColor: border-light
          borderStyle: solid
          borderWidth: 1
          borderRadius: large
      type: FormBlock
      submitButton:
        type: SubmitButtonFormControl
        label: Send Message
        style: primary
    colors: bg-neutral-fg-dark
    styles:
      self:
        padding:
          - pt-16
          - pb-16
        justifyContent: center
seo:
  metaTitle: Pricing - Hosted Vulnerability Scanners - Hacker Analytics
  metaDescription: "Transparent pricing for professional vulnerability scanning. Plans starting at $49/month with 7-day money-back guarantee. OpenVAS and Nmap hosted scanners."
  socialImage: /images/Hacker Analytics.png
  type: Seo
type: PageLayout
---
