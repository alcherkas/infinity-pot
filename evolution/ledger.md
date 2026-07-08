# Evolution ledger — every agent-definition edit, across all projects

Append-only. The editing agent appends its own entry; nothing else writes here.

Entry format:

```
### <project> turn N — <agent> [PROBATION]
before: "<sentence as it was>"
after: "<sentence as it is now>"
evidence: <concrete run event: verdict bounce, failed command, reviewer finding, weakness-report line>
```

Probation is resolved later by the same agent, at its next reflection, by appending:

```
verdict on <project> turn N edit: KEPT | REVERTED — <evidence>
```

---
