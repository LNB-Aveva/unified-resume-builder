# Gate 1(d) Public Processor Evidence

**Reviewed:** 2026-08-11
**Scope:** Current public provider terms and documentation only. This record
does not prove account-specific plans, regions, settings, contract acceptance,
or historical-data deletion.

## Evidence table

| Provider | Publicly verifiable evidence | Account/owner evidence still required |
|---|---|---|
| Vercel | The [DPA](https://vercel.com/legal/dpa), updated 2026-03-17 and effective 2026-03-31, applies to Pro and Enterprise customers, identifies primary processing in the United States with possible global processing, incorporates transfer mechanisms, and prohibits sensitive/special-category data in Customer Data. | The current dashboard shows Hobby. A covered plan/agreement and permitted-content decision are required before active EEA/UK marketing or intentionally routing prohibited data through Vercel. Record runtime/function regions and retention settings. |
| Supabase | The [DPA](https://supabase.com/downloads/docs/Supabase%2BDPA%2B260601.pdf), version 2026-06-01, supplements the Supabase Terms. Current [pricing](https://supabase.com/pricing) states that Free has one-day API/database log retention and no included automatic backups; [backup guidance](https://supabase.com/docs/guides/platform/backups) recommends off-site logical dumps for Free. | Retain the applicable terms/DPA and dashboard plan/region evidence. Maintain the private manual-backup register and destruction proof. |
| Render | The [DPA](https://render.com/dpa), last modified 2024-12-19, supplements the Terms and incorporates EU SCC/UK transfer terms. [Log documentation](https://render.com/docs/logging) states workspace retention of 7 days on Hobby, 14 days on Pro, and 30 days on Scale/Enterprise. Available service regions are documented [here](https://render.com/docs/regions). | The service is on Starter, but log retention depends on the workspace plan. Record the workspace plan, actual service region, DPA acceptance/effective terms, and current retention. |
| Hugging Face | [Inference Providers security documentation](https://huggingface.co/docs/inference-providers/security) says the router does not store request bodies or responses, retains debugging logs for up to 30 days without user data/tokens, and sends requests over TLS. [Hub security](https://huggingface.co/docs/hub/en/security) says GDPR DPAs are available through Enterprise. | Retain the applicable plan/contract and clarify whether the router agreement covers end-user resume data and the pinned Together provider for the intended jurisdictions. |
| Together AI | [Privacy/security documentation](https://docs.together.ai/docs/privacy-and-security) says inputs/outputs are not stored by default and third-party-authored models run on Together infrastructure; [privacy terms](https://www.together.ai/privacy) describe an account ZDR control and North American processing. | Because ResumeAI reaches Together through the Hugging Face router, obtain written confirmation of the governing terms, ZDR/retention behavior, region, subprocessors, and transfer mechanism for routed requests. Do not infer direct-account settings apply to routed traffic. |
| Sentry | Sentry supports US and Germany storage locations, including Free organizations, as documented in its [data-location announcement](https://sentry.io/changelog/data-storage-location-in-germany-is-generally-available/) and [API documentation](https://docs.sentry.io/api/). Sentry publishes DPA/transfer materials and deletion tooling. | Record the actual organization region, plan and retention; inspect/purge historical events; confirm server-side privacy settings and retain the applicable DPA/subprocessor evidence. |
| Google Analytics/AdSense/OAuth | [GA retention documentation](https://support.google.com/analytics/answer/7667196?hl=en) allows standard properties to select 2- or 14-month user/event retention; aggregated standard reports are outside that control. | Record the actual GA property setting, data-sharing/Google Signals choices, applicable processor terms, OAuth configuration, and AdSense regional-message status. No ad unit may be added until Gate 1(e) closes. |
| Cloudflare | The [Cloudflare DPA](https://www.cloudflare.com/cloudflare-customer-dpa/) version 6.4, effective 2026-04-03, covers Enterprise, self-serve, or other service agreements and incorporates transfer safeguards. Turnstile points customers to its privacy addendum in the [official documentation](https://developers.cloudflare.com/turnstile/). | Retain the agreement/version applicable to the account, Turnstile configuration evidence, subprocessor-change subscription, and any account-specific retention/security settings. |

## Result

The public-evidence collection is complete from the repository-review side. It
narrows the owner work but does not replace executed/applicable contracts,
dashboard screenshots, settings, invoices, counsel review, or a transfer
assessment. The US-focused initial-launch decision remains in
`docs/GATE1D_LAUNCH_SCOPE_DECISION.md`; active EEA/UK marketing stays deferred.
