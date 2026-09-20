# Commercialization and distribution: geo-sim vs mmm_tvp

Research date: 2026-08-23. Sources inline. Confidence labels applied throughout.

---

## 1. Executive answer

**Bet on geo-sim, and bet on it as a published study rather than as a tool.**

The thing geo-sim measures (citation preference under controlled context) is a documented methodological gap that the GEO literature itself names, and that no funded incumbent sells. But it is a gap in _method_, not in a purchase order. There is no evidence of buyers paying for context-controlled citation testing. Its realistic value is a credibility asset: original data you publish, plus the strongest available artifact for forward-deployed and applied-AI hiring loops, which weight RAG, evals, and statistical judgment directly.

mmm_tvp goes on maintenance with a portfolio link. It is the better science and the worse bet: the buyer market is small and already served by PyMC Labs and Recast, and its own top blocker (seasonality) is a build task, not a distribution task.

Ship one study. Not one product.

---

## 2. Evidence table: precedent cases

Honest framing first: **I could not find a clean set of 5 to 10 documented solo-maintainer cases in these exact niches with verifiable before/after and elapsed time.** What exists is mostly founder self-accounts, aggregate star-count studies, and hiring anecdotes on HN/DEV threads. That absence is itself a finding and is treated as such in section 6.

| Project / person                          | Maintainer situation before                                                    | Mechanism                                                                                      | Outcome                                                                                                                                                                                                                                                 | Elapsed                   | Source                                                                                                                                                                                                                                     | Evidence grade                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| promptfoo (Ian Webster, Michael D'Angelo) | Built internally for a production system serving 10M+ users, then open-sourced | OSS eval/red-team harness became the default; adoption then funding then acquisition           | $18.4M Series A (Insight, a16z, July 2025); acquired by OpenAI announced March 9 2026; 22k+ stars, 350k+ developers                                                                                                                                     | ~2 to 3 years             | [starlog.is](https://starlog.is/articles/cybersecurity/promptfoo-promptfoo), [promptfoo.dev](https://www.promptfoo.dev/docs/intro/)                                                                                                        | Documented outcome, but funding/acquisition detail rests largely on secondary coverage |
| PyMC-Marketing / PyMC Labs                | Core PyMC devs, existing consultancy                                           | Open-source library as the top of a consulting funnel; library is free, engagements are paid   | Sustained consultancy; published client result of 27%+ CPL reduction; free 30-min strategy call is the literal CTA on the docs site                                                                                                                     | Multi-year, team not solo | [pymc-labs.com](https://www.pymc-labs.com/), [pymc-marketing.io](https://www.pymc-marketing.io/)                                                                                                                                           | Mechanism is clearly documented; the outcome metric is the vendor's own account        |
| Recast (Michael Kaminsky, Tom Vladeck)    | Kaminsky ran data science at Harry's, hit a tooling gap firsthand              | Practitioner credibility plus content, converted to enterprise SaaS. Not an open-source funnel | $3.4M raise (2022); customers include Away, Harry's, Masterclass, Rocket Money, Calibrate; pricing is custom quote, unpublished                                                                                                                         | ~2 years to funding       | [AlleyWatch](https://www.alleywatch.com/2022/12/recast-marketing-mix-modeling-analytics-forecasting-platform-omnichannel-holistic-ad-spend-data-science-michael-kaminsky/), [getrecast.com](https://getrecast.com/recast-llm-information/) | Documented; note the wedge was _employment credibility_, not a repo                    |
| Ryan McKinley (Apache Lucene / Solr)      | Leading community contributor                                                  | Hiring signal: contribution record read as proof of ownership                                  | Hired by Grafana Labs as VP of Applications                                                                                                                                                                                                             | Years                     | [opensource.com](https://opensource.com/article/19/5/how-get-job-doing-open-source)                                                                                                                                                        | Third-party account, older (2019), directionally useful only                           |
| Camunda / Zeebe advocate                  | Contributing on the side while employed elsewhere                              | Hiring signal converted to developer advocate role                                             | Hired "purely based on open source contributions"                                                                                                                                                                                                       | Not stated                | [DEV / Lobsters threads](https://lobste.rs/s/4lplbe/how_contributing_open_source_helped_you)                                                                                                                                               | Anecdote, self-reported                                                                |
| Aggregate: Show HN launches               | Mixed                                                                          | Launch-day attention                                                                           | Median outcome is modest: ~121 stars in 24h, 189 in 48h, 289 in a week across 138 tracked launches; each upvote ≈ 1.4 stars; HN score explains only ~8% of star variance (r = 0.29); half-life 24h, 92% of effect gone by 48h; ~200 competing posts/day | 1 day                     | [Show HN by the Numbers, Apr 2026](https://danfking.github.io/blog/2026/04/23/show-hn-by-the-numbers/), [arXiv 2511.04453](https://arxiv.org/html/2511.04453v1)                                                                            | Best quantitative evidence in this table                                               |
| Aggregate: solo maintainer income         | Solo                                                                           | Sponsors plus one service offering                                                             | $1K to $3K/month is the reported band for maintainers who combine GitHub Sponsors with a service or extension pack                                                                                                                                      | Not stated                | [markaicode.com](https://markaicode.com/monetize-open-source-github-income/)                                                                                                                                                               | Single blog post, treat as folk wisdom not data                                        |

### Which mechanism actually appears most often

**Consulting pull-through and hiring signal.** Every case above that produced money without venture funding did it by using the repo as _proof_, and charging for something else. Paid tiers, sponsorship, and acquisition are the frequently recommended paths and the rarely observed ones. Sponsorship in particular: the reported ceiling for solo maintainers who do everything right is low four figures per month, which is below your current consulting rate for the hours involved.

Note the sharpest detail in the table: Recast, the most commercially successful MMM case, did **not** run an open-source funnel. Kaminsky's wedge was having held the buyer's job. That is a warning about mmm_tvp's theory of distribution.

### The counter-cases

I could not find a curated list of failed technically-strong solo projects, for the obvious reason that nobody writes them up. The closest usable evidence is structural, from the Show HN dataset: the modal outcome of a launch is roughly 100 to 300 stars and nothing else, and score correlates weakly with even that. Inference, labeled as such: the common features of no-traction projects in these niches are (a) the tool is the artifact rather than a finding, (b) no named audience already looking for it, and (c) the maintainer's distribution plan requires sustained repeated action. Your abandoned med spa outreach failed on (c).

---

## 3. Per-project findings

### geo-sim

**Q4. Is there a business here?**

Ranked by likelihood of a first dollar, then by revenue per hour:

1. **Credibility for consulting and hiring (non-revenue directly, highest expected value).** No sales motion required. The scope limit is a non-issue because you are selling judgment, not a number.
2. **Paid benchmark report / original research, sold or free.** Realistic first dollar is low, but the _attention_ return is the highest of any option, and it is a one-shot distribution act rather than a recurring one. See Q10.
3. **Licensing the methodology to an agency or a tooling vendor.** Plausible but slow; the buyer is a handful of firms and each is a bespoke conversation. Revenue per hour could be high if it lands.
4. **Open-core / hosted version.** Rank last. It requires ongoing product work, competes with funded incumbents on the axis they own, and the honest scope caveat guts the demo. Do not do this.

Verdict: **its value is essentially entirely as credibility for consulting and hiring.** There is no evidence of a standalone business, and the prompt asked me not to soften that.

**Q5. What do the incumbents actually sell, and is this a real gap?**

Incumbents sell **retrieval-and-mention tracking**, not context-controlled preference testing. Profound tracks brand visibility, share of voice, sentiment, competitor presence, and page-level citation across ChatGPT, Perplexity, and AI Overviews, explicitly using real user conversation data rather than simulated prompts, at a reported scale of 5M+ citations and 1M+ prompts daily ([Rankability review](https://www.rankability.com/blog/profound-ai-review/), [Discovered Labs](https://discoveredlabs.com/blog/profound-ai-visibility-tool-review), [scalenut](https://www.scalenut.com/blogs/profound-ai-reviews)). Siftly sells GEO A/B testing, but its design is observational: it splits tracked topics into test and control and watches visibility diverge over time ([siftly.ai](https://siftly.ai/features/experimentation)). That is a field experiment on a live system, not a controlled context injection.

The gap is real and is named in the literature, not by me. The 2026 GEO survey states directly that observational analyses on live systems mix content effects with retrieval rank, presentation order, and interface artifacts, and that **"without controlled experiments that isolate individual content factors, practitioners risk misidentifying citation drivers"** ([arXiv 2607.14035](https://arxiv.org/abs/2607.14035), surveying 45 studies Nov 2023 to Jul 2026). That sentence is geo-sim's entire positioning, and it was written by someone else.

Is the gap skipped deliberately because buyers do not care? **Both are true.** Buyers of AI-visibility SaaS are marketing teams buying a dashboard; they do not purchase experimental design. Researchers and a small number of sophisticated practitioners do care. That is why the output is a paper-shaped artifact, not a SKU.

**Q10 and Q11. Highest-leverage way to publish.**

The GEO practitioner world runs on original data at scale. The current benchmark volumes are brutal: Semrush's 2026 AI Visibility Index analyzed 126 million prompts ([Semrush](https://www.semrush.com/news/463141-semrush-releases-expanded-2026-ai-visibility-index-analyzing-126-million-ai-search-prompts/)), Digital Bloom published a 680-million-citation study, ConvertMate 80 million. **You cannot win on volume and should not try.** Compete on the axis they structurally cannot occupy: they run observational studies at scale; you run a controlled experiment with a stated null and confidence intervals. Your finding from prior work, that specificity beat vague copy 60-0 and that one model showed near-total position bias, is exactly the kind of result nobody in that dataset arms race can produce, because position bias is invisible without counterbalancing.

Ranked distribution channels for a project with no audience, best evidence first:

| Channel                                       | Realistic payoff                                                                                                                                                                                      | Mechanics                                               | Evidence grade                                                                               |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **arXiv preprint (cs.IR)**                    | Low immediate traffic, but it is the citation substrate for this literature and is where the survey authors look. Cheap. Needs an endorsement if you have no prior cs submissions.                    | Free, days to post                                      | The 2026 survey covering 45 studies is itself arXiv-native, so this is where the field lives |
| **Practitioner newsletters / named analysts** | Highest realistic reach per unit effort, but requires one round of targeted outreach (which is your known failure mode: make it one email to a short list, sent the day the study is live, then stop) | Direct email                                            | Inference from how the Semrush/Ahrefs studies propagate                                      |
| **Show HN**                                   | ~121 stars in 24h at median, 92% of effect gone in 48h; frame the _finding_ in the title, not the tool                                                                                                | Free, one shot, Sunday ~7pm ET is the best-scoring slot | Strong quantitative evidence                                                                 |
| **Conference talk**                           | Slow, months of lead time                                                                                                                                                                             | CFP cycles                                              | No direct evidence found                                                                     |
| **Podcasts**                                  | Requires an existing hook; the study is the hook, so this is a downstream effect, not a first move                                                                                                    | Pitch after publication                                 | No direct evidence found                                                                     |

What makes a study travel versus sink, labeled as inference from the citation-study coverage patterns: a single counterintuitive number in the headline, a named methodology limitation stated up front (which reads as rigor in this specific field because the field is full of unfalsifiable claims), and a reproducible artifact. You have all three available. Position bias being near-total in one model is the counterintuitive number.

### mmm_tvp

**Q6. Who pays for MMM tooling, and does anyone pay for diagnostics alone?**

Buyers are mid-market and enterprise consumer brands with real ad spend. Recast serves Away, Harry's, Masterclass, Rocket Money, Calibrate, on unpublished custom pricing driven by model complexity, market count, data scope, refresh cadence, and support ([Recast](https://getrecast.com/recast-llm-information/), [mediaplanningtool.com](https://www.mediaplanningtool.com/recast)). PyMC Labs monetizes an open-source library through custom model builds, coaching, and SaaS, with the docs site CTA being a free 30-minute strategy consultation ([pymc-labs.com](https://www.pymc-labs.com/)).

**Does anyone pay for diagnostics as distinct from the model?** I found **no evidence that anyone sells identifiability diagnostics as a standalone product.** Diagnostics are bundled into engagements as a trust-building step. This is a real negative finding, not an absence of searching.

**Q7. Is the realistic path an expert-consulting funnel?**

Yes, and that is the problem. It is the PyMC Labs shape, and PyMC Labs already occupies it with the reference implementation, the maintainer roster, and the brand. What generates inbound for Bayesian marketing scientists, per the visible pattern: being the maintainer of the library people already use, publishing method-level content, and prior operator credibility. You would be entering as the fourth-most-credible name in a small room. Rates: specialist marketing consultants run $150 to $500/hour with day rates roughly 6 to 8x hourly, and AI/specialist niches carry a 20 to 30% premium ([invoicebloom](https://invoicebloom.io/blog/how-much-to-charge-as-consultant), [consultfees](https://consultfees.com/blog/consultant-daily-rate)). No MMM-specific benchmark was findable. The upside over your current $70/hr is real, but the ramp is measured in quarters and the seasonality gap blocks the credibility demo today.

**Q9. Credible path to academic or practitioner citation?**

Yes, and this is genuinely mmm_tvp's best asset, which is why it goes to maintenance rather than the trash.

- **JOSS.** Requires OSI license (you have MIT), packaging (done), tests (done), docs, _and at least six months of public development history with releases and public issues_ before it is eligible ([JOSS submitting docs](https://joss.readthedocs.io/en/latest/submitting.html)). Review is a public GitHub thread, first pass targeted at 2 to 4 weeks. Preparation is stated as an hour or two if the repo is already in good shape. Payoff is a Crossref DOI and a citable object. **Cost: very low. Do this one.** Check your public-history clock before submitting.
- **arXiv preprint.** Low cost, low immediate reward for a library paper.
- **PyData / StanCon talk.** Real audience, but weeks of preparation and CFP lead time. Not compatible with a few hours a week alongside a primary bet.
- **Direct engagement with Dew, Padilla and Shchetkina.** The paper is "Your MMM is Broken," MSI Working Paper 24-144, first posted 14 Aug 2024, also on SSRN ([MSI](https://www.msi.org/working-paper/your-mmm-is-broken-identification-of-nonlinear-and-time-varying-effects-in-marketing-mix-models/), [SSRN 4928268](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4928268), [web appendix](https://rtdew1.github.io/mmm_web_appendix.pdf)). Would they engage with an implementation of diagnostics for the confound they described? **This is inference, not evidence:** academics generally do respond to working implementations of their diagnostics, and the cost is one email. But their paper's own conclusion is that the confound is often _not resolvable_ from standard data, which is also mmm_tvp's stated limit. So the honest pitch is "I implemented your diagnostic," not "I solved your problem." Send it; expect a reply, not a collaboration.

---

## 4. Positioning and credibility (Q12, Q13, Q14)

**Q12. Does prominent self-limitation help or hurt?** I found no direct empirical study on scope-limitation framing in technical README or sales contexts, so this is reasoned, labeled inference:

- **Technical peers: helps, strongly.** In the GEO field specifically, the surrounding literature is preoccupied with exactly this failure mode (the survey's core criticism of practitioner work is uncontrolled inference). Stating the limit is the credential.
- **Buyers: hurts.** A buyer purchasing a dashboard reads "does not predict production retrieval" as "does not do the thing." This is a real argument that geo-sim should not be sold as a product, and it is one of the reasons for the recommendation.
- **Hiring managers: helps, and this is the load-bearing one.** FDE and applied-AI loops are reported to weight technical depth, customer-facing judgment, and reasoning aloud under ambiguity roughly equally, with the ambiguous case study round having the lowest pass rate (~40%) and OpenAI/Anthropic weighting RAG, evals, and agent trade-offs specifically ([Perspective AI on the Anthropic Applied AI loop](https://getperspective.ai/blog/anthropic-applied-ai-engineer-interview-process-frontier-lab-2026), [Exponent FDE guide](https://www.tryexponent.com/blog/forward-deployed-engineer-interview-the-definitive-2026-guide-fde)). Caveat: these are interview-prep vendors describing loops, not the companies themselves. Still, a candidate who ships an eval harness _and_ can articulate exactly what it cannot conclude is demonstrating the scoped-judgment behavior that round is testing.

**Q13. Better artifact for an FDE / applied-AI role: geo-sim, clearly.** It is a statistically rigorous evaluation harness for LLM behavior, in TypeScript, with providers, a CLI, a dashboard, and 43 tests. That is a near-literal description of internal tooling at those companies. mmm_tvp is better statistics and worse relevance: a Bayesian MMM library reads as marketing data science, which routes you toward the marketing-analytics track you are trying to leave.

**Q14. Combined or separate?** **Separate artifacts, one shared narrative.** Do not merge the repos or build a joint thing (that would be building product to solve distribution). Do write the connective sentence once, on your site and in interviews: _"Both projects exist to answer the same question: when a model or a measurement looks confident, is that confidence identified by the data or an artifact of the design?"_ geo-sim counterbalances position bias; mmm_tvp flags the nonlinear/time-varying confound. That is one competence, demonstrated twice, in two languages, in two domains. Stated as a theme it is strong. Merged as a codebase it is a mess.

---

## 5. Ranked action plan for geo-sim

Attempt two differs from the failed med spa outreach in one structural way: **every step below terminates.** Nothing here requires sustained outreach, posting cadence, or community presence. The distribution act is a single publication plus one email batch, sent once.

**Action 1: Confirm the live provider calls and publish the repo. 3 to 4 hours.**
It currently has zero commits. Verify the HTTP paths against all three providers, commit, push public with the scope limit at the top of the README. Do not announce it.
_Evidence it worked:_ the repo runs from a clean clone on someone else's machine, and the six-month JOSS-style public-history clock starts. No traffic expected and none required.

**Action 2: Run and write the study. 6 to 10 hours across two weeks.**
One question, one headline number. Recommended: the position-bias result, since it is counterintuitive, it is invisible to every observational tool on the market, and it implies that existing GEO A/B claims may be measuring order rather than content. Include the AB/BA counterbalancing design, Wilson intervals, the binomial test, the null, and the scope limit stated in the second paragraph rather than buried. Fold in the Irvine med spa citation data as the field-side companion (14 of 97 named, engines agreeing on one) so the piece has both a controlled result and a real-market observation.
_Evidence it worked:_ the write-up exists, is reproducible from the repo, and one technically literate person who did not write it can restate the finding correctly.

**Action 3: Publish once, on three surfaces, on the same day. 2 to 3 hours.**
(a) arXiv cs.IR preprint. (b) Show HN with the finding in the title, not the tool name, posted Sunday evening ET. (c) One email, to no more than ten named people: the authors of the 2026 GEO survey and the SIGIR "What Gets Cited" paper, plus a short list of GEO newsletter writers and analysts. One send. No follow-up sequence, no drip, no CRM.
_Evidence it worked, in descending order of what actually matters:_ one citation or link from a researcher or a named practitioner publication; one inbound conversation you did not initiate (client, recruiter, or vendor); Show HN above 50 points. Stars are the weakest signal here and should not be used to make the continue/stop call.

---

## 6. Kill criteria

- **By 2026-09-15:** repo is not public and the study is not drafted. Signal: this has the same execution failure as the med spa audit. Stop, archive both, and put the remaining hours into consulting and applications. This is the most likely failure mode and the date is deliberately tight.
- **By 2026-10-31 (six weeks after publication):** zero inbound of any kind. No researcher contact, no practitioner link, no recruiter or client mention. Signal: the finding does not travel. Keep the repo as a portfolio link, stop investing hours, do not write a second study.
- **By 2026-12-31:** publication produced attention but no conversation that touched money or a hiring process. Signal: it works as a credential and not as a channel. Correct use going forward is as a resume line and interview material only, at zero further hours.
- **mmm_tvp standing criterion:** if it has not been submitted to JOSS by 2026-11-30, it is not going to be. Leave it archived-in-place with a portfolio link and stop thinking about seasonality.

---

## 7. Strongest argument against this recommendation

**mmm_tvp is the more defensible asset and I am recommending you underinvest in it.**

The case against my own answer: geo-sim's whole category may be a 2025-2026 attention bubble. Profound raised $96M, Schema App retreated from self-serve, and 45 papers appeared in 32 months. Categories that dense either consolidate or evaporate, and a controlled-injection harness with a prominent "this does not measure retrieval" caveat could be worthless in eighteen months either way, because the incumbents win or the whole GEO frame gets absorbed into normal search. mmm_tvp, by contrast, attacks a confound that has existed since MMM existed and will still be there in 2030, with a named academic lineage, a JOSS-eligible package, and a specific paper whose authors have a standing reason to care. A JOSS DOI is permanent; a Show HN is 92% expired in 48 hours.

There is also a sharper version: the FDE hiring argument is the weakest evidence in this entire document. It rests on interview-prep vendors describing loops, not on any documented case of someone being hired off an eval harness. If that link is weaker than I have assumed, then geo-sim's primary justification collapses and mmm_tvp's citation path is the only durable asset either project has.

What survives that argument: mmm_tvp cannot be honestly promoted today because seasonality is missing and its own benchmark comparison is weakened by it, and fixing that is building product to solve a distribution problem. And with a few hours a week, timing beats durability. But if you finish this quarter with more energy than expected, the correct place to spend it is the JOSS submission, not more geo-sim.

---

## 8. What I could not find evidence for

Stated explicitly, because the prompt asked me not to paper over these:

1. **A clean set of 5 to 10 documented solo-maintainer conversions in these niches**, with verifiable before/after and elapsed time. Most public accounts are founder self-reporting or one-line HN anecdotes. The evidence table above is thinner than the question deserves.
2. **Any case of anyone paying for identifiability diagnostics separately from a model or engagement.** Searched directly. Found nothing. Treat the "diagnostics as the product" thesis as unvalidated.
3. **Documented counter-cases**: no-traction technically-strong solo projects, written up honestly. Publication bias makes this nearly unfindable, so the counter-case analysis is structural inference from Show HN aggregate data, not from named failures.
4. **MMM-specific consulting rate benchmarks.** Only general marketing-consultant ranges were findable. The $150 to $500/hr specialist band is not MMM-specific.
5. **Whether Profound has deliberately evaluated and rejected context-controlled preference testing**, versus never having considered it. Public material only shows what they sell, not what they declined.
6. **Empirical evidence on how prominent scope limitations affect buyer or hiring-manager perception.** Section 4 is reasoned inference. It is the least evidenced section here and should be read that way.
7. **Whether the Dew/Padilla/Shchetkina authors have engaged with any third-party implementation of their diagnostics.** No public record found either way.
8. **Any documented hire attributable to an LLM evaluation harness specifically.** The FDE loop descriptions come from interview-prep vendors, not from the hiring companies, and they describe what is tested rather than what artifacts move decisions.
