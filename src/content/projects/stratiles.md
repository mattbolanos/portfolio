---
name: "Stratiles"
slug: "stratiles"
order: 2
description: "iOS widget that displays a GitHub-style heatmap of your Strava activities."
tags:
  - "swift"
  - "cloudflare-workers"
githubUrl: "https://github.com/mattbolanos/stratiles"
imageUrl: "stratiles/stratiles.png"
images:
  - src: "/projects/stratiles/app-1.png"
    width: 581
    height: 1260
  - src: "/projects/stratiles/phone-1.png"
    width: 581
    height: 1260
  - src: "/projects/stratiles/app-2.png"
    width: 581
    height: 1260
  - src: "/projects/stratiles/app-3.png"
    width: 581
    height: 1260
  - src: "/projects/stratiles/app-4.png"
    width: 581
    height: 1260
  - src: "/projects/stratiles/phone-2.png"
    width: 581
    height: 1260
---

Inspired by GitHub's contribution graphs, I built this iOS app to visualize my Strava activity consistency as a widget on my iPhone. The project uses SwiftUI and WidgetKit, with a backend powered by Cloudflare Workers to manage authentication and data caching.

The dashboard includes visualizations of activity patterns by time and day. Charts can be customized to filter which activity types are included or excluded from the heatmaps. The Strava API is used to fetch activity data and update the widget in real-time.
