# Next-Gen Chinese Agent Workspace Roadmap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Start the next-generation self-owned product line on top of the validated `Hive CN` baseline, prioritizing product definition, UI/UX modernization, and Chinese-developer-native workflows before any desktop-shell rewrite.

**Architecture:** Treat `Hive CN` as a stable maintenance baseline and open a separate next-product track. Keep the proven local-first desktop architecture for the first redesign cycle, then extract core services to reduce Electron coupling. Do not begin with a Tauri rewrite; use Tauri only after product shape and shell boundaries are stable enough to justify migration cost.

**Tech Stack:** Current baseline: Electron 33, React 19, TypeScript 5.7, Zustand 5, SQLite, better-sqlite3, node-pty, native Ghostty addon, Tailwind CSS 4, shadcn/ui, pnpm. Future evaluation target: Tauri 2 + existing React frontend + Rust/native plugins only after architecture extraction.

---

## Decision Summary

### What we are deciding now

- `Hive CN` has reached a usable acceptance baseline for personal daily use.
- The biggest remaining gap is no longer localization or installation, but overall product polish, visual language, and workflow design.
- We should now enter `next-generation product development`.
- We should **not** enter `full desktop runtime rewrite` yet.

### What this means in practice

- `Hive CN` becomes the stable line for bug fixes, compatibility, and self-use continuity.
- A new product line starts now, focused on:
  - modern UI/UX
  - clearer information architecture
  - stronger Chinese-developer defaults
  - product identity independent from upstream Hive
- Electron remains acceptable for the next product prototype cycle.
- Tauri is deferred to a later architecture decision gate.

### Non-goals for this stage

- No immediate Electron-to-Tauri rewrite
- No cloud sync or team SaaS platform work
- No plugin marketplace or extension platform
- No attempt to preserve upstream parity as a primary goal
- No broad team rollout before the next product direction is coherent

---

## Product Line Split

### Track A: `Hive CN` Maintenance Line

**Role:** Stable, installable, Chinese-localized daily-driver fork.

**Scope:**
- bug fixes
- remaining high-value localization gaps
- compatibility maintenance
- packaging and install reliability
- Chinese-network/provider usability improvements only when clearly needed

**Out of scope:**
- major navigation redesign
- deep visual rebrand
- large information architecture changes
- risky shell/runtime rewrites

**Success criteria:**
- stays usable as the fallback daily-driver
- remains isolated from official Hive
- continues to build and package reliably

### Track B: Next-Generation Self-Owned Product

**Role:** The future primary product line aimed at a better Chinese-native agent workspace experience.

**Scope:**
- new product identity
- modernized layout and interaction model
- redesigned onboarding and empty states
- more opinionated workflows for Chinese developers
- eventual shell decoupling and runtime replacement evaluation

**Success criteria:**
- materially better UX than `Hive CN`
- clear product identity independent from upstream
- validated by personal daily use before broader distribution

---

## Repo and Branch Strategy

### Immediate strategy

- Stay in the current repository for the planning and prototype phase.
- Keep `codex/i18n-foundation` as the maintenance branch for `Hive CN`.
- Create a dedicated next-product branch when implementation starts, using a name such as `codex/next-product-foundation`.

### Repo split gate

Create a separate repository only after at least one of the following becomes true:

- the next product no longer intends to merge upstream changes regularly
- branding, navigation, and core UX diverge enough that the app is no longer meaningfully a Hive fork
- core service extraction begins to remove large parts of Electron-specific structure
- the Tauri spike is approved and a shell rewrite becomes an active milestone

**Recommendation:** Do not split repos yet. Split only after the next product has a stable direction and a clear ownership boundary.

---

## Phase Goals

### Phase 0: Freeze the Baseline

**Goal:** Stop treating `Hive CN` as the main innovation surface and stabilize it as the fallback product line.

**Exit criteria:**
- current acceptance status is written down
- maintenance scope is clearly bounded
- next-product branch strategy is defined

### Phase 1: Product Definition

**Goal:** Define what the next product is, who it is for, and how it should feel.

**Deliverables:**
- product positioning note
- target user profile and use cases
- UX principles
- information architecture draft
- brand direction and naming placeholder
- workflow priorities for Chinese developers

**Exit criteria:**
- we can explain the product in one paragraph without mentioning Hive first
- top 3 workflows are explicit
- redesign scope is bounded

### Phase 2: UX and Visual Redesign on Current Shell

**Goal:** Prove the next product experience without paying rewrite cost too early.

**Deliverables:**
- redesigned home/projects surface
- redesigned session/composer experience
- redesigned settings and onboarding
- design token system and UI language
- empty states, loading states, and error states that feel intentional

**Exit criteria:**
- daily use feels materially more modern than `Hive CN`
- visual system is coherent across major screens
- personal usage validates the new direction

### Phase 3: Core Service Extraction

**Goal:** Reduce hard Electron coupling so the shell can be swapped later without rewriting product logic twice.

**Deliverables:**
- thinner shell boundary
- clearer service interfaces for project, session, git, settings, terminal
- reduced renderer knowledge of Electron-specific APIs
- identified abstractions for terminal backends and native integrations

**Exit criteria:**
- key product logic can be described without Electron-specific terms
- shell-specific responsibilities are isolated enough for a Tauri spike

### Phase 4: Runtime Decision Gate

**Goal:** Decide whether the product should stay on Electron or move to Tauri.

**Decision inputs:**
- actual performance pain, not hypothetical discomfort
- package size and memory pressure in real use
- complexity of terminal migration
- viability of replacing `node-pty` and the Ghostty native overlay
- cost of losing velocity during migration

**Exit criteria:**
- explicit stay-on-Electron decision, or
- approved Tauri migration spike with bounded scope

---

## Why Tauri Is Deferred

Tauri is attractive for size and platform efficiency, but it does not automatically solve our current biggest problem. Our main dissatisfaction is product polish and UX clarity, not the inability to ship the current product. The current codebase also has deep Electron coupling in IPC, window management, terminal orchestration, `node-pty`, and the native Ghostty overlay. Rewriting the shell before stabilizing product direction would stack product risk and architecture risk at the same time.

**Working rule:**

- redesign first
- extract services second
- migrate shell only if real gains justify the cost

**A Tauri migration is justified only when all of the following are true:**

- the next product UX has stabilized across the main workflows
- Electron-specific APIs are no longer spread across the product logic
- terminal strategy is explicit:
  - either an external-terminal compromise is acceptable
  - or a Rust/native terminal replacement plan is funded
- we have measured reasons to migrate, such as startup, memory, package size, or distribution constraints

---

## Product Priorities for the Next Generation

### Priority 1: Modern UI/UX

- stronger visual hierarchy
- more intentional typography and spacing
- clearer density strategy for project/session-heavy usage
- less “utility app” feel, more “developer workspace” feel

### Priority 2: Better Information Architecture

- clearer separation between projects, worktrees, sessions, and actions
- lower cognitive load for first-run and return usage
- faster orientation when switching contexts

### Priority 3: Chinese-Developer-Native Defaults

- clearer Chinese microcopy
- more realistic proxy/provider assumptions
- terminology adapted for Chinese engineering workflows
- onboarding optimized for local usage habits

### Priority 4: Product Identity

- name, visual language, and tone should no longer read like an upstream translation
- the app should be recommendable as its own product, not as “the Chinese Hive fork”

---

## Implementation Tasks

### Task 1: Document the Product Split

**Files:**
- Create: `docs/plans/2026-03-26-next-gen-product-roadmap.md`
- Reference: `docs/plans/2026-03-26-chinese-agent-fork-roadmap.md`

**Objective:** Record the decision that `Hive CN` and the next-generation product are now separate tracks with different goals.

**Steps:**
1. Write the decision summary and non-goals.
2. Define Track A and Track B responsibilities.
3. Record repo and branch policy.
4. Record the Tauri decision gate.

**Verification:**
- The document makes it clear why we are starting a new product track now.
- The document makes it clear why Tauri is deferred.

### Task 2: Write the Product Definition Pack

**Files:**
- Create: `docs/plans/2026-03-26-next-product-definition.md`
- Create: `docs/plans/2026-03-26-next-product-ux-principles.md`
- Create: `docs/plans/2026-03-26-next-product-ia.md`

**Objective:** Turn the broad product direction into explicit product and UX definitions.

**Steps:**
1. Write a one-paragraph product positioning statement.
2. Define the target users and top 3 workflows.
3. Define UX principles and anti-patterns.
4. Draft a first-pass information architecture for the main screens.

**Verification:**
- The product can be described without leaning on upstream Hive framing.
- The redesign target is concrete enough to start UI work.

### Task 3: Create the Visual Redesign Plan

**Files:**
- Create: `docs/plans/2026-03-26-next-product-visual-system.md`
- Modify later: `src/renderer/src/components/layout/*`
- Modify later: `src/renderer/src/components/sessions/*`
- Modify later: `src/renderer/src/components/settings/*`

**Objective:** Define the visual and interaction system before touching implementation.

**Steps:**
1. Define typography, spacing, color, and surface rules.
2. Define layout principles for desktop-heavy workflows.
3. Define how empty/loading/error states should feel.
4. Define modernization targets for the top-level screens.

**Verification:**
- The redesign has a coherent visual direction.
- Screen work can be split into implementation batches afterward.

### Task 4: Start the Next-Product Prototype on the Current Shell

**Files:**
- Branch target: `codex/next-product-foundation`
- Modify later: renderer layout, navigation, onboarding, settings, session surfaces

**Objective:** Validate the next-generation UX on the current desktop shell before any runtime rewrite.

**Steps:**
1. Create a dedicated next-product branch.
2. Implement the redesign on the current Electron/React foundation.
3. Use personal daily-driver testing to validate the direction.
4. Keep `Hive CN` available as a fallback branch and installable build.

**Verification:**
- The new UX is usable end-to-end on real projects.
- We have enough evidence to decide whether the product direction is working.

### Task 5: Prepare the Architecture Extraction Plan

**Files:**
- Create: `docs/plans/2026-03-26-shell-decoupling-plan.md`
- Reference: `src/main/index.ts`
- Reference: `src/preload/index.ts`
- Reference: `src/main/ipc/*`
- Reference: `src/renderer/src/components/terminal/backends/*`

**Objective:** Identify what must be extracted before a Tauri spike becomes rational.

**Steps:**
1. Map Electron-specific shell responsibilities.
2. Separate product logic from shell integration responsibilities.
3. Define terminal strategy options and trade-offs.
4. Create migration gates for any future shell replacement.

**Verification:**
- We can explain what a Tauri migration would require in bounded terms.
- We avoid starting a shell rewrite without a service-boundary plan.

---

## Decision Gates

### Gate A: Start Next-Product Implementation

Proceed when:
- this roadmap is documented
- product definition documents exist
- redesign scope is explicit enough to start UI work

### Gate B: Split Repo

Proceed when:
- the next-product branch is clearly no longer an upstream-oriented fork
- sync with upstream becomes secondary to product independence

### Gate C: Approve Tauri Spike

Proceed only when:
- the next-product UX has been proven in daily use
- architecture extraction is complete enough
- terminal strategy is explicit
- measured shell pain is significant enough to justify migration

---

## Recommended Immediate Next Step

Write the next three planning documents before touching the next-product implementation:

1. `docs/plans/2026-03-26-next-product-definition.md`
2. `docs/plans/2026-03-26-next-product-ux-principles.md`
3. `docs/plans/2026-03-26-next-product-ia.md`

That sequence keeps product thinking ahead of code and prevents us from using a runtime rewrite as a substitute for product clarity.
