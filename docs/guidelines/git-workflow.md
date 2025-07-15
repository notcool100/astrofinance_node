# Git Workflow Guidelines

This document outlines the Git workflow for the Financial Management System project. Following these guidelines will help maintain a clean and organized repository, facilitate collaboration, and ensure code quality.

## Branching Strategy

We follow a modified Git Flow branching strategy with the following branches:

### Main Branches

- **`main`**: The production branch containing the code currently deployed to production.
- **`develop`**: The development branch containing the latest development changes.

### Supporting Branches

- **Feature Branches**: For new features and non-emergency bug fixes.
- **Release Branches**: For preparing releases.
- **Hotfix Branches**: For emergency production fixes.

## Branch Naming Conventions

Use the following naming conventions for branches:

- Feature branches: `feature/[issue-number]-[short-description]`
  - Example: `feature/123-user-authentication`

- Bug fix branches: `bugfix/[issue-number]-[short-description]`
  - Example: `bugfix/456-login-validation-error`

- Release branches: `release/[version-number]`
  - Example: `release/1.2.0`

- Hotfix branches: `hotfix/[issue-number]-[short-description]`
  - Example: `hotfix/789-critical-security-fix`

## Workflow Process

### Feature Development

1. **Create a Feature Branch**:
   ```bash
   # Ensure you're on the latest develop branch
   git checkout develop
   git pull origin develop
   
   # Create a new feature branch
   git checkout -b feature/123-user-authentication
   ```

2. **Work on the Feature**:
   - Make regular commits with meaningful messages
   - Keep changes focused on the specific feature
   - Follow the coding standards

3. **Keep Your Branch Updated**:
   ```bash
   # Regularly update your branch with changes from develop
   git checkout develop
   git pull origin develop
   git checkout feature/123-user-authentication
   git merge develop
   # Resolve any conflicts
   ```

4. **Push Your Branch**:
   ```bash
   git push origin feature/123-user-authentication
   ```

5. **Create a Pull Request**:
   - Create a PR from your feature branch to `develop`
   - Fill out the PR template with details about your changes
   - Request reviews from appropriate team members

6. **Address Review Feedback**:
   - Make necessary changes based on review feedback
   - Push additional commits to your branch
   - Respond to review comments

7. **Merge to Develop**:
   - Once approved, merge your PR into `develop`
   - Use "Squash and merge" for a clean history
   - Delete the feature branch after merging

### Release Process

1. **Create a Release Branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/1.2.0
   ```

2. **Prepare the Release**:
   - Update version numbers
   - Update CHANGELOG.md
   - Fix any minor bugs specific to the release
   - No new features should be added at this stage

3. **Test the Release**:
   - Deploy to staging environment
   - Perform thorough testing
   - Fix any issues found during testing

4. **Finalize the Release**:
   ```bash
   # Merge to main
   git checkout main
   git pull origin main
   git merge --no-ff release/1.2.0
   git tag -a v1.2.0 -m "Version 1.2.0"
   git push origin main --tags
   
   # Merge back to develop
   git checkout develop
   git pull origin develop
   git merge --no-ff release/1.2.0
   git push origin develop
   
   # Delete the release branch
   git branch -d release/1.2.0
   git push origin --delete release/1.2.0
   ```

### Hotfix Process

1. **Create a Hotfix Branch**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/789-critical-security-fix
   ```

2. **Implement the Fix**:
   - Make the necessary changes to fix the issue
   - Keep changes minimal and focused on the specific issue

3. **Test the Fix**:
   - Ensure the fix resolves the issue
   - Verify no new issues are introduced

4. **Finalize the Hotfix**:
   ```bash
   # Merge to main
   git checkout main
   git pull origin main
   git merge --no-ff hotfix/789-critical-security-fix
   git tag -a v1.2.1 -m "Version 1.2.1"
   git push origin main --tags
   
   # Merge to develop
   git checkout develop
   git pull origin develop
   git merge --no-ff hotfix/789-critical-security-fix
   git push origin develop
   
   # Delete the hotfix branch
   git branch -d hotfix/789-critical-security-fix
   git push origin --delete hotfix/789-critical-security-fix
   ```

## Commit Guidelines

### Commit Message Format

Follow this format for commit messages:

```
[type]: Short summary (50 chars or less)

More detailed explanatory text, if necessary. Wrap it to about 72
characters. The blank line separating the summary from the body is
critical.

- Bullet points are okay
- Typically a hyphen or asterisk is used for the bullet, followed by a
  single space

Fixes #123
```

### Commit Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

### Examples

```
feat: Add user authentication system

Implement JWT-based authentication with the following features:
- Login with email and password
- Token refresh mechanism
- Password reset functionality

Fixes #123
```

```
fix: Correct validation error in loan application form

The form was not properly validating loan amounts less than the minimum
threshold. This commit adds proper validation and error messages.

Fixes #456
```

## Pull Request Guidelines

### PR Template

Each PR should include:

1. **Description**: What changes does this PR introduce?
2. **Related Issue**: Link to the issue this PR addresses
3. **Type of Change**: New feature, bug fix, documentation, etc.
4. **How Has This Been Tested?**: Description of testing done
5. **Checklist**: Items to verify before merging

### Review Process

1. **Automated Checks**:
   - All CI/CD checks must pass
   - Code must meet linting standards
   - Tests must pass

2. **Code Review**:
   - At least one approval is required
   - Address all review comments
   - Ensure code follows project standards

3. **Merging**:
   - Use "Squash and merge" for feature branches
   - Use "Merge commit" for release and hotfix branches
   - Delete the branch after merging

## Git Best Practices

1. **Keep branches short-lived**:
   - Complete features quickly
   - Break large features into smaller, manageable pieces

2. **Commit often**:
   - Make small, focused commits
   - Easier to review and understand

3. **Keep the repository clean**:
   - Delete merged branches
   - Don't commit temporary or generated files

4. **Use .gitignore properly**:
   - Exclude build artifacts
   - Exclude environment-specific files
   - Exclude dependency directories

5. **Don't rewrite public history**:
   - Avoid force pushing to shared branches
   - Use rebase only for local branches

## Handling Conflicts

1. **Prevent conflicts**:
   - Regularly update your branch with the latest changes from the target branch
   - Communicate with team members working on related areas

2. **Resolve conflicts**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-feature
   git merge develop
   # Resolve conflicts in your editor
   git add .
   git commit -m "Merge develop and resolve conflicts"
   ```

3. **Get help when needed**:
   - For complex conflicts, pair with a team member
   - Document resolution decisions for future reference

## Git Hooks

We use Git hooks to enforce quality standards:

1. **pre-commit**:
   - Runs linting
   - Checks formatting
   - Prevents committing forbidden files

2. **pre-push**:
   - Runs tests
   - Checks for security vulnerabilities
   - Verifies build success

## Troubleshooting

### Common Issues and Solutions

1. **Accidentally committed to the wrong branch**:
   ```bash
   # Create a new branch with your changes
   git checkout -b feature/correct-branch
   
   # Reset the original branch
   git checkout original-branch
   git reset --hard origin/original-branch
   
   # Continue working on the correct branch
   git checkout feature/correct-branch
   ```

2. **Need to undo the last commit but keep changes**:
   ```bash
   git reset --soft HEAD~1
   ```

3. **Need to completely undo the last commit**:
   ```bash
   git reset --hard HEAD~1
   ```

4. **Accidentally pushed sensitive information**:
   - Contact the repository administrator immediately
   - Do not try to hide it with force push
   - Follow the security incident response procedure

## Additional Resources

- [Pro Git Book](https://git-scm.com/book/en/v2)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)