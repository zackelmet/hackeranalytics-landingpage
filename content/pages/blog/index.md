---
title: Blog
slug: /blog
sections:
  - type: GenericSection
    title:
      text: Real attacks. Real tools.
      color: text-dark
      type: TitleBlock
    subtitle:
    text: >
      Practical guides and product updates for external vulnerability scanning and attack-surface monitoring. Find hands-on tutorials, scanner explainers, and operational advice to help you discover and fix exposures on your internet-facing assets.
    # actions removed - replaced by inline signup box media on the right column
    media:
      elementId: ''
      type: SignupBox
    badge:
      label: Weekly Cyber Threat Intel Brief
      color: text-primary
      type: Badge
    elementId: ''
    colors: bg-neutral-fg-dark
    styles:
      self:
        alignItems: center
        flexDirection: row
        padding:
          - pt-16
          - pl-16
          - pb-16
          - pr-16

  - subtitle: Intelligently Sourced
    images:
      - url: /images/TOR1.png
        altText: TOR logo
        type: ImageBlock
      - url: /images/MITRE.png
        altText: MITRE logo
        type: ImageBlock
      - url: /images/US-cert.jpeg
        altText: US-CERT logo
        type: ImageBlock
      - url: /images/NIST.png
        altText: NIST logo
        type: ImageBlock
      - url: /images/CISA.png
        altText: CISA logo
        type: ImageBlock
      - url: /images/OTX.png
        altText: OTX logo
        type: ImageBlock
      - url: /images/ENISA.png
        altText: ENISA logo
        type: ImageBlock
    motion: move-to-left
    colors: bg-gray-100-fg-dark
    styles:
      self:
        justifyContent: center
      subtitle:
        textAlign: center
    type: ImageGallerySection

  - type: RecentPostsSection
    title:
      type: TitleBlock
      text: Recent posts
      color: text-dark
      styles:
        self:
          textAlign: center
    recentCount: 12
    showThumbnail: true
    showExcerpt: true
    showDate: true
    showAuthor: true
    actions: []
    elementId: ''
    variant: three-col-grid
    colors: bg-dark-fg-light
    hoverEffect: thick-underline
    styles:
      self:
        justifyContent: center

  - type: ContactSection
    elementId: contact-section
    title:
      text: 'Contact us'
      color: text-dark
      type: TitleBlock
    subtitle: Get in touch with our team and get compliant.
    text: Or chat with us directly on Linkedin 💬
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
        - name: goals
          label: Project Goals
          hideLabel: true
          placeholder: What compliance frameworks do you need to satisfy?
          isRequired: false
          width: full
          type: TextFormControl
      elementId: quote-form
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
        label: Contact Us
        showIcon: false
        icon: arrowRight
        iconPosition: right
        style: primary
        elementId: null
        text: |-
          <div style="text-align:center;margin-top:1.5rem;">
            <span style="display:block;font-size:1.1rem;font-weight:500;color:#0a66c2;margin-bottom:0.75rem;">or chat with us directly</span>
            <a href="https://www.linkedin.com/company/hacker-analytics/" target="_blank" rel="noopener" style="display:inline-block;">
              <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg" alt="LinkedIn" style="width:40px;height:40px;vertical-align:middle;" />
            </a>
          </div>
    colors: bg-light-fg-dark
    styles:
      self:
        padding:
          - pt-10
          - pb-10
      justifyContent: center
seo:
  metaTitle: Blog
  metaDescription: 'Hacker Analytics delivers advanced cyber threat intelligence, compliance automation, and real-time monitoring for modern organizations. Protect your business, meet regulatory requirements, and stay ahead of emerging threats.'
  socialImage: /images/Hacker Analytics.png
  type: Seo
type: PageLayout
---
