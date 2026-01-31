---
title: Nmap
slug: /nmap
sections:
  - type: GenericSection
    title:
      text: Nmap Online Port Scanner
      color: text-dark
      type: TitleBlock
    subtitle: Network discovery & port intelligence
    text: >
      Use Nmap to discover open ports and services on Internet-facing systems. Our Nmap offering provides accurate port status and service detection so you can quickly identify exposed services, verify firewall rules, and map your external attack surface.
    media:
      type: ImageBlock
      url: /images/icons/section/nmap.jpeg
      altText: Nmap overview
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
      text: Overview
      color: text-dark
      type: TitleBlock
    items:
      - title: What Nmap Does
        subtitle: Port scanning & service detection
        icon: /images/icons/section/meter.png
        description: Nmap probes target hosts to determine which TCP/UDP ports are open and which services are listening, often including version detection and basic OS fingerprinting.
      - title: A Short History
        subtitle: Origins and evolution
        icon: /images/icons/section/lightning.png
        description: Nmap was created by Gordon Lyon (Fyodor) in 1997 and has evolved into the de facto open-source network scanner. It gained extensibility through the Nmap Scripting Engine (NSE), which enables a wide range of protocol checks and automation.
      - title: Advanced Capabilities
        subtitle: Scripting, OS detection, traceroute
        icon: /images/icons/section/fighterjet.png
        description: Modern Nmap supports OS detection, service versioning, traceroute, and a rich set of NSE scripts that enable targeted checks beyond basic port discovery.
    colors: bg-dark-fg-light
    styles:
      self:
        padding:
          - pt-12
          - pb-12

  - type: GenericSection
    title:
      text: Typical uses
      color: text-dark
      type: TitleBlock
    subtitle: How teams commonly use Nmap
    text: >
      - Confirming firewall rules and host reachability
      - Discovering exposed services on cloud and virtual servers
      - Validating IDS/monitoring by generating benign test traffic
      - Troubleshooting network service availability and configuration
    colors: bg-neutral-fg-dark
    styles:
      self:
        padding:
          - pt-12
          - pb-12

seo:
  metaTitle: Nmap — Network Port Scanner
  metaDescription: Learn what Nmap is, its history, and how it is used to discover open ports and services on Internet-facing systems.
  type: Seo
type: PageLayout
---
