# PROJECT_SETUP.md — GitHub Projects / Kanban Setup (v1.0)

## Ziel
Ein Board, auf dem jedes Issue „durch die Maschine“ läuft, ohne dass Ihr nachdenken müsst.

## Empfohlene Labels (einmalig anlegen)
- Typ:
  - `type:bug`
  - `type:feature`
  - `type:content`
  - `type:docs`
  - `type:qa`
  - `type:release`
  - `type:tech-debt`
  - `type:assets`
- Priorität:
  - `prio:P0-blocker`
  - `prio:P1-high`
  - `prio:P2-medium`
  - `prio:P3-low`
- Status:
  - `status:blocked`
  - `status:needs-review`
- Bereiche (optional, aber hilfreich):
  - `area:hub`
  - `area:dungeons`
  - `area:modes`
  - `area:save`
  - `area:ui`
  - `area:input`
  - `area:cleanup`
  - `area:assets`

## Milestones
- `v1.0` (alles, was für Release „muss“)
- optional danach: `v1.1 polish`, `v1.2 content`, …

## GitHub Project (Kanban)
### Spalten (empfohlen)
1. Backlog
2. Ready
3. In Progress
4. Review / Playtest
5. Blocked
6. Done

### Custom Fields (Project)
- `Priority` (P0/P1/P2/P3)
- `Area` (Hub/Dungeons/Modes/Assets/UI/QA/Release)
- `Estimate` (S/M/L oder 1/2/3)
- `Dependencies` (Text)
- `Test Evidence` (Text/Link)

### Automations (Vorschläge)
- Wenn Label `prio:P0-blocker` → automatisch in „Ready“ + markiere als urgent
- Wenn Label `status:blocked` → automatisch in „Blocked“
- Wenn PR merged → Issue automatisch nach „Done“
- Wenn Issue reopened → zurück nach „Ready“

## Work-Rules (die Euch Zeit sparen)
- Kein Issue ohne „Akzeptanzkriterien“.
- Kein Merge ohne „Test Evidence“ (kurz: welche 1–2 Tests wurden gemacht).
- P0-Blocker werden nicht parallelisiert: erst fixen, dann weiter.
