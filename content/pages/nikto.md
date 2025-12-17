---
title: Nikto
slug: /nikto
sections:
  - type: GenericSection
    title:
      text: Nikto Web Server Scanner
      color: text-dark
      type: TitleBlock
    subtitle: Web server misconfiguration & vulnerability checks
    text: >
      Nikto is a web server scanner that looks for common misconfigurations, outdated software, and known vulnerabilities in HTTP/S services. It is optimized for speed and breadth, scanning for many known issues across web servers and applications.
    media:
      type: ImageBlock
      url: /images/icon2.svg
      altText: Nikto overview
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
      text: About Nikto
      color: text-dark
      type: TitleBlock
    items:
      - title: What Nikto Does
        subtitle: Web-focused vulnerability checks
        icon: /images/icons/section/fighterjet.png
        description: Nikto performs targeted checks against web servers to find outdated components, misconfigurations, dangerous defaults, and common security vulnerabilities.
      - title: A Short History
        subtitle: Origins and design
        icon: /images/icons/section/lightning.png
        description: Nikto has been used by security professionals for many years as a fast, pragmatic way to scan web servers for known issues. Its signature-based checks make it useful for discovering common configuration problems.
      - title: Typical Workflows
        subtitle: Scanning & triage
        icon: /images/icons/section/meter.png
        description: Teams use Nikto to validate web application hardening, confirm patching status for web servers, and identify misconfigured services before production rollout.
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
    subtitle: When to run Nikto
    text: >
      - Validate web server security posture after configuration changes
      - Check for dangerous default files and directories
      - Identify outdated server modules and components
      - Support application security testing and triage
    colors: bg-neutral-fg-dark
    styles:
      self:
        padding:
          - pt-12
          - pb-12

seo:
  metaTitle: Nikto — Web Server Scanner
  metaDescription: Learn what Nikto is, its background, and typical uses for discovering misconfigurations and common vulnerabilities on web servers.
  type: Seo
type: PageLayout
---
