# SURA GitHub Branch Workflow

SURA uses a deliberately conservative delivery flow. **`main` is the production branch** and should receive only reviewed, validated releases. Direct feature work must not be committed to `main`.

| Branch | Purpose | Allowed source | Merge destination |
| --- | --- | --- | --- |
| `main` | Production source of truth | Approved `staging` release | Production deployment only |
| `staging` | Pre-production validation | Approved `dev` release candidate | `main` after validation |
| `dev` | Shared integration branch | Reviewed feature branches | `staging` for release testing |
| `feature/<name>` | One isolated capability or fix | Starts from current `dev` | `dev` by pull request |

## Required flow

Create each body of work from `dev`, for example `feature/personal-edit-studio` or `feature/repository-workflow`. Run the relevant tests and type check on that branch, open a pull request into `dev`, and merge only after review. Promote a stable `dev` revision to `staging` for pre-production checks. Promote only the validated `staging` revision to `main` for production.

## Safeguards

Do not force-push shared branches. Keep secrets, local environment files, logs, transient test output, and direct runtime uploads outside Git; managed storage holds private image bytes. Use GitHub branch protection for `main` and `staging` so release promotions occur through reviewed pull requests.
