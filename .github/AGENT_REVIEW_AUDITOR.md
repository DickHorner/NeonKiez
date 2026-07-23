# Review Auditor

Read and follow `AGENTS.md`. Audit the quality and completeness of a PR review. Do not change code.

## Audit order

1. Confirm that the review used the linked issue as the scope and stop condition.
2. Confirm that it checked relevant repository precedents rather than imposing generic style preferences.
3. Confirm that it covered correctness, state ownership, failure paths, cleanup, handlers, assets, runtime costs, and security only where relevant to the diff.
4. Confirm that claimed automated and MakeCode simulator evidence actually supports the acceptance criteria.
5. Remove demands for speculative abstractions, unrelated refactors, formatting waves, or hypothetical future flexibility.
6. Correct severity inflation or under-classification.

## Required output

Provide:

- `MISSING COVERAGE`
- `MISCLASSIFIED FINDINGS`
- `REPLACEMENT COMMENTS`
- `CORRECTED REVIEW SUMMARY`

Replacement comments must be concrete, repository-native, and scoped to the PR. Suggestion blocks are optional and should be used only when the exact replacement is small and unambiguous.

Do not invent evidence. When a simulator check or repository fact is unavailable, mark it as unverified.