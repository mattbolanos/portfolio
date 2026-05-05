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
    width: 2850
    height: 1750
---

I built Pedal Map because I use Citi Bike constantly and wanted the system to feel easier to read than the official map. The first view is a live station map for New York City, showing bikes, docks, e-bikes, capacity, and pickup/dropoff status in a way that is fast to scan while standing on a corner deciding where to walk.

The live map is built from Citi Bike's public GBFS feeds. The app fetches station metadata such as name, coordinates, region, and capacity, then merges it with the status feed for current bike, dock, e-bike, rental, and return state. Station status is refreshed about every 15 seconds.

The station table and individual station pages are powered by a small Convex-backed aggregation pipeline. A scheduled job samples station status every 15 minutes, refreshes the station catalog when the feed changes, and stores compact availability samples with occupancy, dock availability, empty/full flags, and inferred arrivals and departures based on changes between samples.
