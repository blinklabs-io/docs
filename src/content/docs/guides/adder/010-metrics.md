---
title: Adder Prometheus Metrics
description: Scrape Adder pipeline event flow and processing duration metrics.
---

## Overview

This reference describes Adder's Prometheus endpoint and the pipeline metrics that it exposes. The metrics cover event flow through the pipeline and processing time up to output channel acceptance.

## Endpoint

Adder exposes the Prometheus text format at:

```http
GET /metrics
```

The `API_ADDRESS` and `API_PORT` settings configure the API listener. Adder uses `0.0.0.0:8080` by default.

Unlike the versioned API routes, `/metrics` does not use the `/v1` route group. A scrape against the default listener uses the following command:

```bash
curl http://127.0.0.1:8080/metrics
```

Replace the host and port when the API listener uses different values. Restrict the API listener at the network boundary when the metrics endpoint must not be broadly accessible.

## Pipeline metrics

| Metric | Meaning |
| --- | --- |
| `adder_pipeline_received_events_total` | Counts input events when the pipeline reads them from input plugin channels. |
| `adder_pipeline_processed_events_total` | Counts events after all configured output channels accept their event copies. This count does not confirm successful delivery by an external sink. |
| `adder_pipeline_filtered_events_total` | Counts drops that built in filters report. A custom filter contributes to this count only when it reports the drop through the pipeline drop observer. |
| `adder_pipeline_processing_duration_seconds` | Measures the time from pipeline ingress until all configured output channels accept their event copies. This histogram does not measure delivery by an external sink. |

The metrics do not include labels derived from events or user data. Metric values reset when the Adder process restarts.