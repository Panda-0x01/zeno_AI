# Contributing to JARVIS

Thank you for your interest in contributing to JARVIS! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Prioritize user privacy and security

## Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/jarvis.git
   cd jarvis
   ```
3. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

See [README.md](README.md) for detailed setup instructions.

Quick start:
```bash
# Install dependencies
npm install
cd backend && pip install -r requirements.txt

# Run in development
npm run dev
```

## Making Changes

### Code Style

**Frontend (TypeScript/React)**:
- Use TypeScript strict mode
- Follow React hooks best practices
- Use functional components
- Add proper TypeScript types
- Include accessibility attributes (ARIA)

**Backend (Python)**:
- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Use async/await for I/O operations

### Commit Messages

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(chat): add streaming response support
fix(security): patch command injection vulnerability
docs(readme): update installation instructions
```

### Testing

**Frontend**:
```bash
cd frontend
npm test
```

**Backend**:
```bash
cd backend
pytest
```

**Integration**:
```bash
npm run test:integration
```

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Run all tests** and ensure they pass
4. **Update CHANGELOG.md** with your changes
5. **Submit PR** with clear description

PR Template:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

## Security

**Reporting Vulnerabilities**:
- Do NOT open public issues for security vulnerabilities
- Email: security@jarvis-project.example
- Include detailed description and reproduction steps
- Allow 48 hours for initial response

**Security Considerations**:
- All system actions must go through sandbox
- User confirmation required for sensitive operations
- Audit logging for all actions
- No external network access by default

## Plugin Development

See [docs/PLUGINS.md](docs/PLUGINS.md) for detailed guide.

Basic plugin structure:
```python
from jarvis.plugin import Plugin, command

class MyPlugin(Plugin):
    name = "my-plugin"
    description = "My awesome plugin"
    
    @command(name="hello", description="Say hello")
    async def hello(self, name: str):
        return f"Hello, {name}!"
```

## Documentation

- Update README.md for user-facing changes
- Update docs/ for architectural changes
- Add inline comments for complex logic
- Include examples in documentation

## Questions?

- Open a discussion on GitHub
- Join our community chat (if available)
- Check existing issues and PRs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
