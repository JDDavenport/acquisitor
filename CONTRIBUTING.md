# Contributing Guidelines

Thank you for contributing to Acquisitor v3!

## Workflow

### 1. Always Work on Feature Branches

```bash
git checkout -b feature/your-feature-name
git checkout -b fix/bug-name
git checkout -b docs/update-name
```

Use descriptive branch names:
- `feature/` for new features
- `fix/` for bug fixes
- `refactor/` for code refactoring
- `docs/` for documentation updates
- `chore/` for maintenance tasks

### 2. PR to Main Required

Never commit directly to `main`.

1. Create a feature branch
2. Make your changes
3. Ensure pre-commit hooks pass locally
4. Push your branch
5. Open a Pull Request
6. Wait for review and CI checks to pass
7. Merge only after approval

### 3. Commit Messages

Follow the format:
```
type(scope): description

body (optional)
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code reorganization
- `docs:` Documentation
- `chore:` Maintenance, dependencies

**Example:**
```
feat(auth): add two-factor authentication support

- Added TOTP verification module
- Updated login flow
- Added recovery codes
```

### 4. Describe What Changed and Why

In your PR:
- Explain the **why** behind your changes
- Document any **breaking changes**
- Reference related **issues**
- Add **screenshots** for UI changes
- Update the **CHANGELOG.md** and **ROADMAP**

## Pre-commit Hooks

This project uses git hooks to maintain code quality:

- **pre-commit**: Checks for secrets, validates build, warns on large diffs
- **commit-msg**: Enforces message format

Hooks run automatically. If a hook blocks your commit, fix the issue and try again.

## Code Review

All PRs require review:
- Be respectful and constructive
- Address feedback or discuss concerns
- Keep commits small and focused
- One approval required before merge

## Questions?

Open an issue or reach out to the team.

Happy contributing! 🚀
