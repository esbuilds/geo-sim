# Deep research prompt: commercialization and distribution paths for two open-source technical projects

## Your task

I have two finished-enough technical projects sitting unlaunched. I do not need
help building them. I need evidence-backed answers about how projects like these
actually convert into money, attention, and career leverage, and which of the two
deserves the push.

Research this and come back with specific, sourced recommendations. Where you
cannot find evidence, say so explicitly rather than filling the gap with
plausible-sounding advice.

## Who is asking

Independent web engineer and technical SEO consultant, based in Orange County,
California. Recently laid off (August 2026). Currently running client consulting
at roughly $70/hour on time and materials, with clients in health tech, DTC, and
B2B services. Actively targeting forward-deployed engineer and applied-AI roles
at product companies, while keeping consulting revenue alive.

Constraints that matter for your recommendations:

- One person. No team, no funding, no runway to spend six months on distribution.
- Consulting work already consumes most weekday hours. Realistic capacity for
  this is a few hours a week, not full time.
- Already tried and abandoned one productized-service play in the adjacent space
  (a $1,500 flat-fee AI-visibility audit for med spas, backed by original
  research showing that in a dense market like Irvine, roughly 14 of 97
  businesses got named by Perplexity and Google AI combined, with the two
  engines agreeing on only one). The research was sound. The outreach never
  happened. Treat "just do cold outreach" as a strategy that has already failed
  once for reasons of execution, not thesis, and tell me what would make attempt
  two different.
- Strong preference for things that compound (an asset, an audience, a hiring
  signal) over things that trade hours for dollars.

## Asset 1: geo-sim

**What it is.** A controlled RAG-injection harness in TypeScript/Node. It feeds
two content variants to an LLM as context for the same query and records which
one gets cited. Repeated trials per provider, AB/BA order swapping to
counterbalance position bias, Wilson score intervals, two-sided binomial test
against a 50/50 null. Supports Anthropic, OpenAI, and Google providers. SQLite
storage, CLI, and a Next.js dashboard. 43 automated tests.

**What it deliberately does not claim.** It does not predict whether content will
be retrieved by ChatGPT, Perplexity, or Google AI Overviews in production. Both
variants are in the model's context by construction, so it measures citation
preference given retrieval, never retrieval itself. This scope limit is stated
prominently in the README and is not negotiable. Any go-to-market you propose
must survive that caveat being stated up front, honestly.

**Methodological lineage.** Aggarwal et al., "GEO: Generative Engine
Optimization," KDD 2024. Vishwakarma et al., "What Gets Cited: Competitive GEO in
AI Answer Engines," SIGIR 2026. A logistic GLMM with nested random effects, as in
the latter, is a known v2 upgrade that is not built.

**Status.** Feature complete except for confirming the live provider HTTP calls.
Not published anywhere. No commits yet.

**Market context.** The AI-visibility and GEO tooling category is funded and
noisy: Profound raised $96M in February 2026, Schema App killed its self-serve
tier in favor of done-for-you. Incumbents sell tracking and monitoring.

## Asset 2: mmm_tvp

**What it is.** An identifiability-aware Bayesian marketing mix model in Python
and NumPyro. Time-varying parameters with HSGP components, fixed saturation
point.

**The actual differentiator.** It ships identifiability diagnostics as a
first-class feature, specifically targeting the nonlinear-versus-time-varying
confound described in Dew, Padilla and Shchetkina (2024). That means
autocorrelation-of-adstocked-spend checks, simulation-based calibration, and
static-versus-TVP WAIC/LOO comparison that can tell the user "your data does not
support this model" instead of silently fitting a fancier one. The time-varying
mechanism itself is not novel (PyMC-Marketing ships an HSGP time-varying
intercept, Uber has published a Bayesian TVP MMM). The diagnostics are the claim.

**Honest scope limits.** It detects and flags identifiability problems, it does
not resolve them. Incrementality experiments remain the real fix. Seasonality
controls (Fourier basis plus event indicators) are not implemented, which is the
top blocker for real-data use and currently weakens its own benchmark comparison
against the PyMC-Marketing example dataset.

**Status.** v0.1.0, MIT licensed, packaged, CI running pytest on 3.11 and 3.12,
public on GitHub, six test modules. Zero promotion. Zero users.

## What I do not want from you

Do not return generic startup or creator advice. Specifically, do not tell me to
"build in public," "post consistently," "engage with the community," "start a
newsletter," or "leverage LinkedIn" unless you can point to a documented case of
a comparable single-maintainer technical project where that specific action
produced a measurable result, and you tell me what the result actually was.

Do not recommend building more product as the answer to a distribution problem.

Do not soften the possibility that one or both of these should be abandoned.

## Research questions

### A. Precedent

1. Find 5 to 10 documented cases of solo-maintainer open-source tools in adjacent
   spaces (marketing science, Bayesian modeling, SEO tooling, LLM evaluation
   harnesses) that converted into money or a job. For each: what was the actual
   mechanism, how long did it take, and what was the maintainer's situation
   before and after?
2. Which mechanism appears most often: consulting pull-through, acquisition,
   sponsorship, paid tier, hiring signal, or something else? Distinguish what
   worked from what is merely frequently recommended.
3. Find the counter-cases. Technically strong solo projects in these spaces that
   got no traction. What did they have in common?

### B. Monetization, per project

4. For geo-sim: is there a real business here given the honest scope limit, or is
   its value entirely as credibility for consulting and hiring? Consider open-core,
   a hosted version, a paid benchmark report, licensing to an agency, and selling
   the methodology rather than the tool. Rank by revenue per hour of my time and
   by likelihood of ever reaching a first dollar.
5. For geo-sim specifically: do the funded incumbents (Profound and others) sell
   retrieval tracking, citation-preference testing, or both? Is the thing geo-sim
   actually measures a gap in their offering, or is it a niche they have
   deliberately skipped because buyers do not care about it?
6. For mmm_tvp: who actually pays for MMM tooling, and does anyone pay for
   diagnostics as distinct from the model itself? Look at how PyMC Labs, Recast,
   and similar shops convert open-source credibility into engagements, including
   what they charge where public.
7. Is the realistic mmm_tvp path an expert-consulting funnel rather than a
   product? If so, what specifically generates inbound for Bayesian marketing
   science consultants, and what does that market pay?

### C. Attention

8. For each project, identify the specific venues where its actual audience
   already congregates. Name conferences, journals, workshops, Discords, mailing
   lists, subreddits, podcasts, and newsletters. For each, state the submission
   or participation mechanics and the realistic reach.
9. For mmm_tvp: is there a credible path to academic or practitioner citation?
   Consider arXiv preprint, JOSS submission, PyData or StanCon talks, and direct
   engagement with the Dew/Padilla/Shchetkina line of work. What is the cost and
   payoff of each? Would the authors of that paper plausibly engage with an
   implementation of diagnostics for the confound they described?
10. For geo-sim: the SEO and GEO practitioner world moves on original data, not
    tools. Given I already have unpublished original research (the Irvine med spa
    citation study), what is the highest-leverage way to publish a study that
    geo-sim generates? Who amplifies that kind of work, and what makes such a
    study travel versus sink?
11. Show me what actually produced distribution for comparable technical projects
    in the last 18 months, with evidence. Rank Hacker News, Show HN, arXiv,
    conference talks, podcast appearances, and practitioner newsletters by
    realistic payoff for a project with no existing audience.

### D. Positioning and credibility

12. Both projects lead with honest scope limitations. Does prominent
    self-limitation help or hurt with each audience: technical peers, potential
    buyers, hiring managers? Find evidence rather than asserting the comfortable
    answer.
13. Which of the two is the better artifact for landing a forward-deployed or
    applied-AI engineering role, and why? Consider what those hiring processes
    actually evaluate. Does a statistically rigorous evaluation harness read as
    more relevant than a Bayesian modeling library, or the reverse?
14. Is there a version of these two that is stronger combined than separate, for
    instance as evidence of a single competence in measurement and causal rigor
    under uncertainty? Or does combining them dilute both?

### E. The decision

15. Given a few hours a week, recommend a single primary bet and say plainly what
    the other project should become: archived, kept as a portfolio link, or put
    on maintenance.
16. Give me the first three concrete actions for the primary bet, in order, each
    with the time it takes and what specifically would count as evidence it is
    working.
17. Define kill criteria. What signal, by what date, means I stop and the answer
    was no?
18. State the strongest argument against your own recommendation.

## Output format

1. Executive answer: the single bet, in under 150 words, stated as a decision.
2. Evidence table of precedent cases: project, maintainer situation, mechanism,
   outcome, elapsed time, source link.
3. Per-project findings, answering the numbered questions, with sources inline.
4. Ranked action plan for the primary bet, with time estimates and success
   signals.
5. Kill criteria with dates.
6. What you could not find evidence for, stated explicitly as open questions.

## Evidence standards

Cite sources with links. Distinguish clearly between documented outcomes,
practitioner consensus, and your own inference. Where you are reasoning by
analogy rather than from evidence, label it. Prefer recent sources, 2024 through
2026, since both the GEO category and the MMM tooling landscape have moved fast.
Note publication dates. If a claim rests on a single blog post or a founder's own
account of their success, say so.
