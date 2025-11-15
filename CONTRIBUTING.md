# 🤝 Contributing to Peer Learning Platform

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🌟 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Fix issues
- ✨ Add new features
- 🎨 Improve UI/UX
- ⚡ Optimize performance

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/peer-learning-platform.git
cd peer-learning-platform
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/Prateek8r4-beep/peer-learning-platform.git
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 💻 Development Setup

Follow the [SETUP.md](./SETUP.md) guide to set up your development environment.

## 📝 Coding Guidelines

### Backend (Node.js)

- Use ES6+ features
- Follow existing code style
- Add JSDoc comments for functions
- Handle errors properly
- Write meaningful commit messages

```javascript
/**
 * Create a new study room
 * @param {Object} roomData - Room information
 * @returns {Promise<Object>} Created room
 */
async function createRoom(roomData) {
  // Implementation
}
```

### Frontend (React/Next.js)

- Use functional components with hooks
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Keep components small and focused
- Add PropTypes or TypeScript types

```typescript
interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
}

export function RoomCard({ room, onJoin }: RoomCardProps) {
  // Implementation
}
```

### General Guidelines

- **Code Style:** Follow existing patterns
- **Naming:** Use descriptive variable/function names
- **Comments:** Add comments for complex logic
- **Testing:** Write tests for new features
- **Documentation:** Update docs when needed

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Write Tests

- Add unit tests for new functions
- Add integration tests for API endpoints
- Test edge cases and error scenarios

## 📤 Submitting Changes

### 1. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature"
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add real-time typing indicators
fix: resolve chat message duplication issue
docs: update API documentation
style: format code with prettier
refactor: optimize database queries
test: add tests for auth service
chore: update dependencies
```

### 2. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Submit the PR

## 📋 Pull Request Guidelines

### PR Title

Use the same format as commit messages:
```
feat: add video call feature
fix: resolve file upload bug
```

### PR Description

Include:
- **What:** What changes were made
- **Why:** Why these changes are needed
- **How:** How the changes work
- **Testing:** How to test the changes
- **Screenshots:** If UI changes (optional)

Example:
```markdown
## What
Added real-time typing indicators to chat

## Why
Users want to know when others are typing

## How
- Added Socket.io event for typing status
- Updated chat UI to show typing indicator
- Added debounce to prevent spam

## Testing
1. Open two browser windows
2. Start typing in one window
3. See typing indicator in other window

## Screenshots
[Add screenshots if applicable]
```

### PR Checklist

Before submitting, ensure:
- [ ] Code follows project style
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented code
- [ ] Branch is up to date with main

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Try latest version
3. Reproduce the bug

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox]
- Version: [e.g., 1.0.0]

**Additional context**
Any other information
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem

**Describe the solution**
How you'd like it to work

**Describe alternatives**
Other solutions you've considered

**Additional context**
Any other information
```

## 📚 Documentation

### Update Documentation

When adding features:
- Update README.md if needed
- Update API documentation
- Add code comments
- Update FEATURES.md

### Documentation Style

- Use clear, simple language
- Include code examples
- Add screenshots for UI features
- Keep it up to date

## 🎨 UI/UX Contributions

### Design Guidelines

- Follow existing design patterns
- Use Tailwind CSS classes
- Ensure responsive design
- Test on multiple devices
- Maintain accessibility (WCAG)

### Color Palette

Primary colors are defined in `tailwind.config.js`:
- Primary: Purple (#8B5CF6)
- Secondary: Blue (#3B82F6)
- Success: Green (#10B981)
- Error: Red (#EF4444)

## 🔒 Security

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead, email: prateekpc36@gmail.com

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## 📞 Getting Help

- **Questions:** Open a discussion
- **Bugs:** Open an issue
- **Chat:** Join our Discord (if available)
- **Email:** prateekpc36@gmail.com

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

**Positive behavior:**
- Using welcoming language
- Being respectful
- Accepting constructive criticism
- Focusing on what's best for the community

**Unacceptable behavior:**
- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to: prateekpc36@gmail.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions make this project better for everyone. Thank you for taking the time to contribute!

---

**Questions?** Feel free to ask in discussions or open an issue.

**Happy Contributing! 🎉**
