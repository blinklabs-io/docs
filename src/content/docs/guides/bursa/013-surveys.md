---
title: CIP-179 Surveys and Polls
description: Browse, create, answer, cancel, and reveal CIP-179 surveys in the Bursa wallet and API.
---

# CIP-179 Surveys and Polls

This guide covers the Bursa wallet workflow and API contract for CIP-179 surveys and polls. Bursa reads survey data from the embedded Cardano node and provides tools to browse surveys, connect them to governance actions, publish responses, create surveys, cancel owned surveys, and reveal sealed responses.

## Prerequisites

- A Bursa wallet with an embedded node.
- A queryable node for survey reads.
- A fully synced node and a wallet that can sign with a local seed for actions that build transactions.

Survey reads use data available from the embedded node. The wallet does not need an external service to list or inspect surveys. Transaction building requires node synchronization and local signing capability; the wallet presents the resulting transaction for confirmation through the existing send flow.

## Wallet workflow

### Browse and search surveys

Open the Surveys view to browse CIP-179 surveys and polls. The list supports:

- Text search across the title, description, and survey ID.
- Status filters for `open`, `closed`, and `cancelled` surveys.
- Pagination.
- Survey details and results.
- A link from each survey to the governance actions that reference it.

The governance browser can open a survey from a governance action. A governance link advertises the relationship between the action and the survey; it does not change which roles may respond.

The wallet can show a partial list while it indexes label-17 history. More surveys can appear as indexing continues. A queryable node is required for this read workflow.

### Inspect details and results

Open a survey to view its title, description, status, response deadline, eligible roles, owner, survey ID, presentation anchor, and sealed response state. The results view reports response counts and question tallies by role when a tally exists.

Cancelled surveys do not have a tally because the wallet does not tally their responses.

### Respond to a survey

1. Open an `open` survey.
2. Select a response role from the roles supported by the wallet's credentials.
3. Complete the available question inputs. The wallet supports single choice, multi-select, ranking, numeric range, points allocation, and rating questions.
4. Leave a question unanswered to abstain when the question allows abstention.
5. Select **Review response**.
6. Review and confirm the pending transaction through the existing send confirmation flow.

The wallet cannot answer a required custom question. It also cannot respond when the survey only permits roles whose credentials the wallet does not hold. A fully synced node and a local signing seed are required to build the response transaction.

For a sealed survey, the wallet encrypts the response on the device. The response remains sealed until the configured reveal time passes.

### Create a survey

Select **New survey** and provide a title, description, eligible roles, end epoch, and questions. An optional presentation anchor can include a URI and its document content. An optional seal can specify the Drand round and padding size for sealed responses.

The wallet builds a pending transaction preview rather than submitting immediately. Review and confirm the preview through the existing send confirmation flow. Survey creation requires a fully synced node and a wallet that can sign with a local seed.

### Cancel an owned survey

The survey owner can cancel an `open` survey from its detail view. The wallet marks the cancellation as a pending transaction preview, which requires confirmation through the existing send confirmation flow. Only the wallet that owns the survey's payment key can cancel it.

### Reveal sealed responses

When the reveal time has passed and sealed responses remain, open **Reveal sealed responses** and choose one of the following options:

- Grant consent to fetch the Drand beacon from the configured public relay.
- Paste the beacon signature in hexadecimal form.

The wallet contacts the external relay only after explicit consent. A pasted beacon supplies the reveal input directly, so the wallet does not fetch a beacon from the relay. The reveal request requires consent when it does not include a pasted beacon. After a successful reveal, refresh the survey to view the available results.

## API reference

The survey endpoints use JSON. Survey identifiers use the `<transaction hash>:<index>` format returned by the list endpoint.

### List surveys

```http
GET /wallet/surveys
```

Query parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `q` | string | Searches the title, description, and survey ID. |
| `status` | string | Filters by `open`, `closed`, or `cancelled`. |
| `page` | integer | Selects the result page. |
| `count` | integer | Sets the number of results per page. |
| `linked` | boolean | Set to `true` to return surveys linked from governance actions. |

The response contains the requested page:

```json
{
  "surveys": [
    {
      "id": "<transaction hash>:<index>",
      "tx_hash": "<transaction hash>",
      "index": 0,
      "title": "Example survey",
      "description": "Survey description",
      "owner": "<owner identifier>",
      "owner_script": false,
      "roles": [0, 1],
      "end_epoch": 1234,
      "status": "open",
      "sealed": false,
      "questions": 2,
      "linked_actions": ["<governance action identifier>"],
      "owned": true
    }
  ],
  "total": 1,
  "page": 1,
  "count": 20,
  "partial": true
}
```

`surveys` contains summary objects. Each summary includes the survey ID, transaction reference, title, description, owner, whether the owner uses a script, eligible role codes, end epoch, status, sealed mode, question count, linked governance action IDs, and whether the active wallet owns the survey. The `partial` field appears only while the node has not finished indexing the available label-17 history.

Role codes are `0` for DRep, `1` for SPO, `2` for CC, `3` for stakeholder, and `4` for keyholder. Status values are `open`, `closed`, and `cancelled`.

### Get survey details and results

```http
GET /wallet/surveys/{id}
```

The response extends the summary with the survey definition:

```json
{
  "id": "<transaction hash>:<index>",
  "tx_hash": "<transaction hash>",
  "index": 0,
  "title": "Example survey",
  "description": "Survey description",
  "owner": "<owner identifier>",
  "owner_script": false,
  "roles": [0, 1],
  "end_epoch": 1234,
  "status": "open",
  "sealed": false,
  "questions": 1,
  "linked_actions": [],
  "owned": true,
  "definition": {
    "title": "Example survey",
    "description": "Survey description",
    "roles": [0, 1],
    "end_epoch": 1234,
    "mode": {
      "sealed": false
    },
    "questions": [
      {
        "kind": 1,
        "prompt": "Select one option",
        "options": ["Yes", "No"],
        "required": true
      }
    ]
  },
  "tally": {
    "roles": [],
    "excluded": []
  }
}
```

The `definition` object contains the title, description, eligible roles, end epoch, survey mode, questions, and optional presentation anchor. A question reports its `kind`, prompt, and the fields required by that kind, such as `options`, `min`, `max`, `budget`, `range`, `scale`, `require_all`, or `required`. A definition can also contain an anchor with a URI and hash.

The `tally` field contains per-role response counts and question results, including answered and abstained counts, option counts, numeric aggregates, and excluded responses. The tally is absent for a cancelled survey.

Question and answer kinds use these numeric codes:

| Code | Kind |
| --- | --- |
| `0` | Custom |
| `1` | Single choice |
| `2` | Multi-select |
| `3` | Ranking |
| `4` | Numeric range |
| `5` | Points allocation |
| `6` | Rating |

### Build a response transaction

```http
POST /wallet/surveys/respond
Content-Type: application/json
```

Request body:

```json
{
  "survey": "<transaction hash>:<index>",
  "role": 0,
  "answers": [
    {
      "kind": 1,
      "question": 0,
      "choice": 0
    }
  ]
}
```

`survey` identifies the survey, `role` selects the responding role, and `answers` contains answer objects. Each answer identifies its question and kind, then uses the value field for that kind: `choice` for single choice, `indices` for multi-select and ranking, `number` for numeric answers, or `pairs` for points and rating answers. The endpoint returns a pending transaction preview for confirmation rather than completing the transaction.

### Build a survey creation transaction

```http
POST /wallet/surveys/create
Content-Type: application/json
```

Request body:

```json
{
  "title": "Example survey",
  "description": "Survey description",
  "roles": [0, 1],
  "end_epoch": 1234,
  "questions": [
    {
      "kind": 1,
      "prompt": "Select one option",
      "options": ["Yes", "No"],
      "required": true
    }
  ],
  "anchor_uri": "https://example.com/survey.json",
  "anchor_document": "<presentation document>",
  "seal": {
    "round": 123456,
    "padding_size": 32
  }
}
```

`title`, `description`, `roles`, `end_epoch`, and `questions` are required. `anchor_uri`, `anchor_document`, and `seal` are optional. The `seal` object contains the Drand reveal `round` and response `padding_size`. The endpoint returns a pending transaction preview for confirmation rather than completing the transaction.

### Build a cancellation transaction

```http
POST /wallet/surveys/cancel
Content-Type: application/json
```

Request body:

```json
{
  "survey": "<transaction hash>:<index>"
}
```

The endpoint returns a pending transaction preview for confirmation. Only the survey owner can complete the cancellation.

### Reveal a sealed survey

```http
POST /wallet/surveys/{id}/reveal
Content-Type: application/json
```

Fetch the beacon after consent:

```json
{
  "consent": true
}
```

Or provide a beacon directly:

```json
{
  "beacon": "<beacon signature in hexadecimal form>"
}
```

The request returns the updated survey detail. `consent` allows the wallet to fetch the Drand beacon from the public relay. `beacon` supplies the reveal input without an external fetch. The API returns a consent error when the request provides neither consent nor a beacon.

## Errors and node state

- Invalid JSON or invalid request values return an error response.
- A survey ID that does not exist returns a not-found error.
- Survey list responses can include `partial: true` while label-17 history indexing continues. A detail request can return `503` while indexing cannot yet provide a complete result.
- A node that is unavailable or not ready for the requested operation returns `503`. Reads require a queryable node; response, creation, and cancellation requests require a fully synced node and local signing seed.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>