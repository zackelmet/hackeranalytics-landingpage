---
title: OpenVAS
slug: /openvas
sections:
  - type: GenericSection
    title:
      text: OpenVAS Vulnerability Scanner
      color: text-dark
      type: TitleBlock
    subtitle: Deep vulnerability assessment
    text: >
      OpenVAS (now part of Greenbone's toolset) is a full-featured vulnerability scanner that performs comprehensive checks across hosts and services. It provides detailed findings with severity ratings and remediation guidance.
    media:
      type: ImageBlock
      url: /images/icon3.svg
      altText: OpenVAS overview
    colors: bg-neutral-fg-dark
    styles:
      self:
        padding:
          - pt-16
          - pl-12
          - pb-16
          - pr-12

  - type: ValueGridSection
    title:
      text: About OpenVAS
      color: text-dark
      type: TitleBlock
    items:
      - title: What OpenVAS Does
        subtitle: Comprehensive vulnerability checks
        icon: /images/icons/section/fighterjet.png
        description: OpenVAS performs authenticated and unauthenticated vulnerability checks, correlating results to known CVEs and providing prioritized findings to aid remediation.
      - title: Origins
        subtitle: From open-source roots
        icon: /images/icons/section/lightning.png
        description: OpenVAS originated as a community-driven open-source vulnerability scanner and has grown to support regular vulnerability feed updates and a rich set of checks.
      - title: Typical Outputs
        subtitle: Reports & remediation guidance
        icon: /images/icons/section/meter.png
        description: Results include vulnerability descriptions, CVE references, severity scores, and suggested remediation steps to help teams act quickly.
    colors: bg-dark-fg-light
    styles:
      self:
        padding:
          - pt-12
          - pb-12

  - type: GenericSection
    title:
      text: Use cases
      color: text-dark
      type: TitleBlock
    subtitle: When OpenVAS is helpful
    text: >
      - Comprehensive host and service vulnerability assessments
      - Regular scheduled scans to track patching and remediation
      - Compliance-oriented scanning workflows
      - Prioritizing remediation with CVE-based context
    colors: bg-neutral-fg-dark
    styles:
      self:
        padding:
          - pt-12
          - pb-12

seo:
  metaTitle: OpenVAS — Vulnerability Scanner
  metaDescription: Overview of OpenVAS, its history, and common uses for comprehensive vulnerability assessment and remediation guidance.
  type: Seo
type: PageLayout
---
