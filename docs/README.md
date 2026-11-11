# Owwab documentation

Written in November 2026 from the code on branch `feat/nearest-mosque` (`master` plus three commits: nearest mosque, audio and location behind the container, `CLAUDE.md`). Nearest mosque is the only feature here that is not on `master`. When code and docs disagree, the code is right; fix the doc in the same change.

| Document | What it answers |
|---|---|
| [PRD.md](PRD.md) | What the product is, who it is for, what it must do, what is broken, and what comes next |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How the system is built: layers, state, navigation, theme, audio, alarms, native code, external services, build and release |
| [STRUCTURE.md](STRUCTURE.md) | Where files live, where new code goes, the coding conventions, and leftovers to avoid |
| [features/](features/README.md) | One document per feature: what it does, how the user reaches it, how it works, its code map, storage, permissions and open issues |

Other files in this folder:

- [redesign-suggestions.md](redesign-suggestions.md) — an earlier redesign audit (Arabic, October). Parts of it are already done.
- `ux-audit/` — screenshots from the November UX pass on the emulator.

## Keeping it current

- A change to a feature updates that feature's file in `features/`.
- A new feature adds a file from the template in [features/README.md](features/README.md) and a row in the PRD feature table.
- A new service, slice, route, permission or external host updates [ARCHITECTURE.md](ARCHITECTURE.md).
- A closed issue is removed from the "Open issues" section of its feature doc and from the PRD roadmap.
