# SkillPath — Backend

Bun + Express API that proxies the (intentionally flaky) SkillPath upstream
service, does server-side INR/USD price conversion, and returns a clean,
schema-validated response for the frontend to render.

## Endpoint

`GET /api/v1/assignment/course-data` — no auth, open to all origins.

Fetches `BASE_URL/assignment/course-data` and `BASE_URL/assignment/country-code`
upstream. On success:

```json
{
  "courses": [
    {
      "courseName": "...",
      "...": "...",
      "refundable": true,
      "price": { "currency": "INR", "amount": 1999, "formatted": "1999.00" }
    }
  ],
  "meta": { "countryCode": "IN", "countrySource": "live" }
}
```

- `pricePaise` / `priceUsdCents` are stripped from the response — conversion
  happens once, here, so the frontend only ever displays `price.formatted`.
- If the course-data call fails or fails schema validation → `502 { "error": "..." }`.
- If the country-code call fails or fails schema validation → falls back to
  `"US"` and `meta.countrySource: "fallback"`; courses are still returned
  (a currency-detection failure shouldn't hide otherwise-good course data).
- Any method other than `GET` on this path → `405 { "error": "Method Not Allowed" }`.

## Development

```sh
bun install
bun test              # unit + route tests (mocked upstream)
bun run check-types
bun run dev            # http://localhost:4000
```

`BASE_URL` env var overrides the upstream base (defaults to
`https://syncsphere-hiv6.onrender.com`). `PORT` overrides the listen port
(defaults to `4000`).
