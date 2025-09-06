# Contributing to BotCommander

Thank you for your interest in contributing to BotCommander! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- Linux system (Ubuntu, Debian, CentOS, etc.)
- Basic knowledge of JavaScript/TypeScript and React
- Familiarity with Discord bot development

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR-USERNAME/TestDCBotPanel.git
   cd TestDCBotPanel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the development environment**
   - Frontend: http://localhost:5000
   - Backend API: http://localhost:5000/api

## 🛠 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing code formatting (ESLint/Prettier)
- Use meaningful variable and function names
- Comment complex logic

### File Structure
```
├── client/src/          # React frontend
├── server/             # Express backend  
├── shared/             # Shared types/schemas
├── docs/               # Documentation
└── install.sh          # Installation script
```

### Component Guidelines
- Use functional components with hooks
- Follow existing naming conventions
- Keep components focused and reusable
- Use TypeScript interfaces for props

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **System information**:
   - OS and version
   - Node.js version
   - Browser (if frontend issue)
5. **Error logs** if available

Use the GitHub issue template for consistency.

## ✨ Feature Requests

For new features:

1. Check existing issues to avoid duplicates
2. Provide clear use case and benefits
3. Consider implementation complexity
4. Be open to discussion and feedback

## 📝 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests if applicable
   - Update documentation

3. **Test thoroughly**
   ```bash
   npm run build
   npm start
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add bot template system"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Fill out PR template** with:
   - Description of changes
   - Testing performed  
   - Screenshots if UI changes
   - Breaking changes (if any)

## 🧪 Testing

- Test on multiple Linux distributions when possible
- Verify both development and production builds
- Test with actual Discord bots
- Check responsive design on different screen sizes

## 🌟 Areas for Contribution

### High Priority
- Docker support
- Database migrations
- Bot template improvements
- Performance optimizations

### Medium Priority
- Additional Linux distribution support
- UI/UX improvements
- Documentation updates
- Localization/i18n

### Good First Issues
- Bug fixes in existing features
- Code cleanup and refactoring
- Documentation improvements
- Unit test additions

## 📋 Commit Message Guidelines

Use conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

Example:
```
feat: add Python bot template support

- Add Python template selection
- Update bot creation workflow
- Add Python dependency management
```

## 🤝 Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Focus on constructive feedback
- Keep discussions professional
- Report inappropriate behavior

## 💬 Getting Help

- **Discord**: [Join our community server]
- **GitHub Issues**: For bugs and features
- **GitHub Discussions**: For questions and ideas

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to BotCommander! 🎮