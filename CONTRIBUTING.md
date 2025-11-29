# Contributing to PresentBuddy

Thank you for your interest in contributing to PresentBuddy! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/presentbuddy/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your OS and version
   - Screenshots if applicable

### Suggesting Features

1. Check if the feature has already been suggested
2. Create a new issue with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach (if you have ideas)

### Contributing Code

1. **Fork the repository**
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**:
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed
4. **Test your changes**:
   - Test on your platform
   - Ensure existing features still work
5. **Commit your changes**:
   ```bash
   git commit -m "Add: description of your feature"
   ```
   Use clear, descriptive commit messages
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**:
   - Provide a clear description
   - Reference any related issues
   - Wait for review and feedback

## Development Setup

See the [README.md](README.md) for setup instructions.

## Code Style

- Use TypeScript for type safety
- Follow existing code formatting
- Use meaningful variable and function names
- Add JSDoc comments for public functions
- Keep functions focused and small

## Platform-Specific Contributions

When adding platform-specific features:

1. **Add to the abstraction layer** (`src/main/platform/index.ts`)
2. **Implement for all platforms** (Windows, macOS, Linux)
3. **Handle errors gracefully** with user-friendly messages
4. **Test on the target platform** if possible
5. **Document platform-specific requirements**

## Testing

- Test on your primary platform
- If possible, test on multiple platforms
- Test edge cases and error conditions
- Ensure auto-restore works correctly

## Documentation

- Update README.md for user-facing changes
- Update code comments for complex logic
- Add examples for new features
- Document platform-specific behavior

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Make sure all tests pass (if applicable)
3. Update documentation as needed
4. Request review from maintainers
5. Address feedback and suggestions
6. Once approved, maintainers will merge

## Questions?

Feel free to:
- Open an issue for questions
- Start a discussion in GitHub Discussions
- Reach out to maintainers

Thank you for contributing to PresentBuddy! 🎉

