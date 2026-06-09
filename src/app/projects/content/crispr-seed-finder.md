---
name: "CRISPR Seed Finder"
slug: "crispr-seed-finder"
order: 1
description: "CRISPRi seed off-target search app."
tags:
  - "react"
  - "typescript"
  - "python"
githubUrl: "https://github.com/mattbolanos/crispr-seed-finder"
projectUrl: "https://crispr-seed-finder.vercel.app"
imageUrl: "crispr-seed-finder/crispr-seed.png"
supplementalLinks:
  - label: "Preprint"
    href: "https://www.biorxiv.org/content/10.64898/2026.03.27.714658v2"
---

I built this for a friend completing a PhD in genetics at Stanford University, to check whether a 20 bp CRISPRi guide or a preloaded Dolcetto guide alias has PAM-proximal seed matches near annotated transcription start sites in hg38. The app manages guide lookup, sequence validation, and CSV export, enabling researchers to quickly inspect likely off-target hits.

The performance optimization occurs upstream in a Python pre-computation pipeline. It converts large pickle k-mer indexes into gzip-compressed JSON shards, grouped by 5-base prefixes for each supported seed length, and then publishes those shards to Cloudflare R2. At query time, the app fetches only the small set of shard files required for the guide's seed and reverse complement, rather than scanning the entire dataset.
