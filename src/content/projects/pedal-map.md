---
name: "Pedal Map"
slug: "pedal-map"
order: 0
description: "Live Citi Bike map with historical station availability views."
tags:
  - "react"
  - "tanstack"
  - "typescript"
githubUrl: "https://github.com/mattbolanos/pedal-map"
projectUrl: "https://pedal-map.vercel.app"
imageUrl: "pedal-map/pedal-map.svg"
images:
  - src: "/projects/pedal-map/og-image.png"
    width: 1200
    height: 737
---

I love Citi Bike. This app visualizes how the system fluctuates throughout the day. The live map is built from Citi Bike's public GBFS feeds. The app fetches station metadata then merges it with the status feed for current bike, dock, e-bike, rental, and return state.

The station table and individual station pages are powered by a small Convex-backed aggregation pipeline. A scheduled job samples station status every 15 minutes, refreshes the station catalog when the feed changes, and stores compact availability samples with occupancy, dock availability, empty/full flags, and inferred arrivals and departures based on changes between samples. Read more [here](https://pedal-map.vercel.app/about).
