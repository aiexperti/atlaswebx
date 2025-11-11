# Contributing to AtlaswebX

First off, thank you for considering contributing to AtlaswebX! It's people like you that make AtlaswebX such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs** if possible
* **Include your environment details** (OS, Electron version, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior** and **explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the JavaScript/Node.js styleguide
* Include screenshots and animated GIFs in your pull request whenever possible
* End all files with a newline
* Avoid platform-dependent code

## Development Setup

### Prerequisites

```bash
# Node.js v16 or higher
node --version

# npm or yarn
npm --version
```

### Setup

1. Fork the repo
2. Clone your fork:
```bash
git clone https://github.com/your-username/atlaswebx.git
cd atlaswebx
```

3. Install dependencies:
```bash
npm install
```

4. Create a `.env` file:
```bash
cp .env.example .env
# Add your OpenAI API key
```

5. Run in development mode:
```bash
npm run dev
```

## Project Structure

```
atlaswebx/
├── main.js                 # Electron main process
├── renderer.js             # Main renderer logic
├── index.html              # Main UI structure
├── styles.css              # Core styling
├── ai-v2-router.js         # AI command routing
├── ai-v2-chat.js           # AI chat interface
├── backend/                # Backend services
├── ai-services/            # AI service integrations
└── settings/               # Settings management
```

## Coding Standards

### JavaScript Style Guide

* Use 2 spaces for indentation
* Use semicolons
* Use single quotes for strings
* Use camelCase for variables and functions
* Use PascalCase for classes
* Add comments for complex logic
* Keep functions small and focused

### Example:

```javascript
// Good
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Bad
function calc(i) {
  var t = 0;
  for(var x=0;x<i.length;x++){
    t=t+i[x].price
  }
  return t
}
```

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### Example:

```
Add AI element selector feature

- Implement pointer mode for element selection
- Add visual overlay for selected elements
- Integrate with AI chat for element manipulation

Fixes #123
```

## Testing

Before submitting a pull request, make sure to:

1. Test your changes thoroughly
2. Test on multiple platforms if possible (Windows, macOS, Linux)
3. Ensure the app builds successfully:
```bash
npm run build
```

## Documentation

* Update the README.md if you change functionality
* Comment your code where necessary
* Update relevant documentation files

## Areas for Contribution

We especially welcome contributions in these areas:

### High Priority
- [ ] Local LLM integration (Ollama, LM Studio)
- [ ] Bookmarks management system
- [ ] History tracking and search
- [ ] Download manager
- [ ] Extension/plugin system

### Medium Priority
- [ ] Custom theme creator
- [ ] Voice commands
- [ ] Mobile companion app
- [ ] Performance optimizations
- [ ] Accessibility improvements

### Good First Issues
- [ ] UI/UX improvements
- [ ] Documentation updates
- [ ] Bug fixes
- [ ] Translation support
- [ ] Icon and asset improvements

## Community

* Join our [GitHub Discussions](https://github.com/yourusername/atlaswebx/discussions)
* Follow us on [Twitter](https://twitter.com/atlaswebx)
* Read our [Blog](https://atlaswebx.dev/blog)

## Recognition

Contributors will be recognized in:
* README.md contributors section
* Release notes
* Project website (coming soon)

## Questions?

Feel free to open an issue with the `question` label or reach out in our discussions forum.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AtlaswebX! 🚀
