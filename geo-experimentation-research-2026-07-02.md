# Statistically Rigorous GEO/AEO Experimentation: Research Brief

_Prepared 2026-07-02. Evidence base from a 22-source deep-research pass (104 agents, adversarial 3-vote verification: 13 claims confirmed, 12 killed). Confidence tags are explicit. Where I extrapolate past the verified evidence to product/market conclusions, it is marked **[synthesis]** or **[speculative]** — the web pass did not strongly source the landscape/market angles, so treat Sections 2 and 4's market claims as hypotheses, not findings._

---

## 1. Executive frontier — the 5 sharpest findings

1. **The noise floor is real and large enough to swamp most reported GEO "wins."** Variance decomposition across 12 LLMs × 10 prompts × 100 samples (Haase et al., arXiv:2601.21339, Jan 2026) attributes **10.56% of originality and 33.70% of fluency variance to within-model stochasticity alone** — before any prompt or model effect. A single-probe citation-rate reading cannot distinguish this sampling noise from a genuine content effect. This is the empirical spine of your thesis and it holds. _(confirmed, 3–0)_

2. **The reproducibility crisis in LLM eval is your best marketing analogy.** "A Sober Look at Progress in Language Model Reasoning" (arXiv:2504.07086, Apr 2025) shows Pass@1 swings **5–15 percentage points across random seeds** on small benchmarks, and that **most published RL "improvements" vanish under multi-seed evaluation** — only DeepScaleR and FastCuRL survived. The exact same failure — mistaking seed variance for signal — is what every GEO dashboard is doing today. _(confirmed, 3–0 and 2–1)_

3. **Staggered/naïve DiD is mathematically biased, not just imprecise.** Callaway & Sant'Anna (2020, _J. Econometrics_) prove two-way fixed-effects DiD assigns **negative weights** to some comparisons when treatment timing varies, biasing the estimate. Any GEO tool doing "before/after across a batch of pages rolled out over weeks" is running exactly this broken estimator. The fix (group-time ATE decomposition) is known, published, and nobody in GEO has implemented it. _(confirmed, high)_

4. **The correct math for "one shared ChatGPT" already exists — in marketplace experimentation.** Jia, Kallus & Lee Yu (arXiv:2312.15574) prove **clustered switchback designs with truncated Horvitz-Thompson estimators** achieve near-optimal MSE under Markovian spatio-temporal interference — the same structure as a shared answer engine where today's index state depends on yesterday's. This is the transferable IP: switchback-over-time on the _engine_, cluster-randomize on _topics_. _(confirmed, 3–0)_

5. **Cluster-randomized experiments with individual-level outcomes need their own estimator — freshly published, zero industry adoption.** Chen & Li (arXiv:2502.10939, Feb 2026) derive design-based inference for **staggered-rollout cluster-randomized experiments (SR-CREs)** — treatment assigned to clusters (topics/pages), outcomes measured at the probe level. This is precisely the GEO data structure, the paper is <6 months old, and it has no production implementation anywhere. First-mover window is open. _(confirmed, 3–0)_

---

## 2. Ranked idea list

Tags: **Novelty** (is anyone doing it) · **Difficulty** · **Defensibility** · **Time-to-demo**.

| #   | Idea                                                                                                                                                                                                                                                                                 | Novelty                               | Difficulty | Defensibility                                                           | Demo          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ---------- | ----------------------------------------------------------------------- | ------------- |
| 1   | **Noise-floor calibrator (OSS wedge).** Library that probes an engine N times per prompt, computes bootstrap CIs on citation rate / share-of-voice, and returns "minimum detectable effect at 80% power." Nobody ships this. It reframes every competitor's dashboard as un-powered. | High — no tool computes a noise floor | Low        | Medium (method is public; execution + dataset is the moat)              | **1–2 weeks** |
| 2   | **Cluster-randomized topic-holdout engine + SR-CRE estimator.** The SearchPilot-for-GEO core: matched topic clusters, holdouts, Callaway-Sant'Anna / Chen-Li estimators so mid-test model swaps cancel across arms.                                                                  | Very high — the whitespace            | High       | **High** (novel application of 2026 econometrics; data network effects) | 8–12 weeks    |
| 3   | **Silent-model-swap detector.** Continuous change-point detection (CUSUM / Bayesian online) on a fixed canary-prompt battery; flags when an engine updated so you can segment experiments. Sellable standalone; also a required input to #2.                                         | High                                  | Medium     | Medium-High                                                             | 3–4 weeks     |
| 4   | **Switchback timing engine for shared surfaces.** Truncated-HT clustered switchback for surfaces you can't topic-split (e.g. testing prompt-template or schema changes against one engine over time).                                                                                | High                                  | High       | High                                                                    | 6–10 weeks    |
| 5   | **"Is your GEO report significant?" free audit tool.** Upload a competitor's before/after export; it recomputes with CIs and tells you if the movement clears the noise floor. Pure lead-gen; weaponizes Finding #1.                                                                 | High                                  | Low        | Low (but strategic)                                                     | **1 week**    |
| 6   | **Crawl-to-effect lag estimator.** Model the delay from content change → citation lift as a distributed-lag / survival curve per engine. Turns "did it not work" vs "not yet" into a dated posterior.                                                                                | High                                  | High       | High                                                                    | 6–8 weeks     |

**Recommended sequence [synthesis]:** ship #1 + #5 as the open-core wedge (weeks), earn credibility by publicly debunking un-powered dashboards, then build #2/#3 as the hosted always-on product. This mirrors SearchPilot's own arc (methodology credibility first, platform second).

---

## 3. Methodology map — technique → GEO scenario → failure mode

| Technique                                                                         | Fits GEO scenario                                                                   | Failure mode in GEO                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multi-sample probing + bootstrap CI**                                           | Estimating any single-prompt metric (citation rate, SoV)                            | Task-specificity: variance ratios are measured on math/creativity tasks (Haase, AIME); SEO-intent tasks untested. Rate limits + per-token cost bound N. _[caveat verified]_                                                         |
| **Cluster-RCT on topics + matched holdouts (Callaway-Sant'Anna, Chen-Li SR-CRE)** | Rolling out content changes across many pages/topics                                | Requires defining a "cluster" in a continuous LLM index; **conditional** parallel-trends assumption failed 1–2 verification (do not assume the naïve extension holds). SUTVA violated by entity confusion bleeding across clusters. |
| **Clustered switchback + truncated HT (Jia-Kallus)**                              | One shared engine, testing a global change over time                                | Needs bounded-degree / spatially-clusterable interference graph; a genuinely global model update hits all time-buckets and is _not_ separable — carryover/lag corrupts adjacent buckets.                                            |
| **CausalImpact / Bayesian structural time series**                                | "Did this action cause the lift, controlling for seasonality" with no clean control | Needs a credible synthetic control series; parametric-memory effects (baked into model weights) may never move, making the counterfactual undefined.                                                                                |
| **Change-point detection (CUSUM / Bayesian)**                                     | Detecting silent model swaps as a confound                                          | Distinguishing a model swap from a genuine content effect requires an untreated canary set; false positives on prompt-volume drift.                                                                                                 |
| **Naïve before/after (what everyone ships)**                                      | —                                                                                   | Biased, not just noisy (negative-weighting proof). This is the incumbent methodology and it is provably wrong under staggered rollout.                                                                                              |

---

## 4. Strongest bear case (steelman — why NOT to build this)

1. **Identifiability may be genuinely hopeless.** Parametric-memory effects — where a brand is baked into model weights, not retrieved at inference — may _never_ respond to content changes, and you cannot separate "our content works but only via RAG" from "the model already knew us." If a meaningful fraction of citations are parametric, your treatment effect is unidentifiable no matter how clean the design. **[speculative — flagged in caveats, not resolved by evidence]**

2. **Effects may be too slow for a sellable feedback loop.** If crawl-to-effect lag is measured in weeks-to-months and engines swap models on a similar cadence, every experiment is confounded by a model update before it reaches power. SearchPilot works because Google's index refreshes in days; if LLM RAG stores refresh slower than models update, the DiD washout you're counting on never gets a clean window.

3. **Market may be too small / too early.** SearchPilot sells rigor to enterprises with enough SEO traffic that a 5% lift is worth five figures/month. GEO traffic today is a rounding error for most brands; the ROI math that justifies paying for statistical rigor may not exist for another 2–3 years. You could be right and early — the worst place to be. **[speculative — the market-sizing angle came back thin from web search; validate directly.]**

4. **Incumbents can bolt on "CIs" cheaply.** The noise-floor math is public. Profound/Conductor could add error bars in a quarter and neutralize the wedge's _appearance_ — your real moat has to be the cluster-randomization data network and estimator engineering, which is a harder, slower story to sell.

---

## 5. Surprise me — the angle you probably haven't weighed

**The reproducibility-crisis paper (arXiv:2504.07086) is not just an analogy — it is a ready-made, citable, third-party credibility weapon, and it points at a second product.** The academic ML community has _already_ established, in print, that single-seed LLM evaluation is scientifically invalid and that most reported gains are noise. You don't have to convince the market that GEO dashboards are un-rigorous from scratch — you can borrow a peer-reviewed consensus that already exists one field over and say "GEO tools are doing the exact thing ML researchers just got shamed for."

The second-order idea: the same "characterize the output distribution, don't trust one draw" toolkit is a **general stochastic-surface measurement primitive**, not a GEO-only one. Anywhere a business is measured by an opaque, non-randomizable, silently-updating model — **AI coding-assistant recommendation share (which package/tool the agent suggests), agent-mediated purchasing/booking, LLM-driven recommendation feeds, RAG-app answer quality** — the customer has the identical problem and no vocabulary for it. GEO is the beachhead; the defensible IP is "confidence intervals and DiD for surfaces you can't A/B test." That framing is bigger than SEO-for-robots and nobody owns it. **[synthesis / speculative]**

---

## Kill criteria — the 3 fastest ways to know you should abandon

1. **Run the noise floor first.** Probe a real engine 100× on a fixed prompt battery for 2 weeks. If the within-prompt citation-rate variance is _small_ (tight CIs on single draws), your core premise is wrong and dashboards are fine as-is. _(Verified evidence says variance is large — but on math/creativity tasks, not SEO intent. Test SEO intent directly; this is the #1 kill experiment.)_
2. **Measure the model-swap cadence vs. crawl-to-effect lag.** With change-point detection on canary prompts, estimate how often the engine silently updates. If model updates arrive faster than content effects materialize, no clean DiD window exists and the design is dead. Abandon.
3. **Estimate parametric vs. RAG citation share.** Probe with citations disabled/enabled or with retrieval blocked. If most brand mentions are parametric (weight-baked, not retrieved), treatment effects are unidentifiable and there is nothing to optimize. Abandon.

---

### Source appendix (verified primaries)

- Callaway & Sant'Anna 2020, _J. Econometrics_ — staggered DiD negative-weighting.
- Chen & Li, arXiv:2502.10939 (Feb 2026) — SR-CRE design-based inference.
- Jia, Kallus & Lee Yu, arXiv:2312.15574 — clustered switchback + truncated HT under Markovian interference.
- Haase et al., arXiv:2601.21339 (Jan 2026) — LLM variance decomposition (within-model 10.56%/33.70%).
- "A Sober Look…", arXiv:2504.07086 (Apr 2025) — seed variance 5–15pp; RL gains fail replication.
- DoorDash eng. blog; Statsig; jong-min.org — switchback practice (secondary).
- SearchPilot (what-we-do, data-analysts, split-testing blog) — precedent (secondary/self-reported).

_Killed by verification (do not cite): temperature-monotonically-hurts-accuracy claims, "deterministic inference kills," mutation-temperature-scales-with-model-size, and several task-specific temperature-variation percentages — all failed 0–3 or 1–2. The temperature literature is contradictory; do not lean on it._
