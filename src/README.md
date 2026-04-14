# APEI eCampus - Source Files Documentation

## Overview
This directory contains all source files for the APEI eCampus project. The project uses Gulp for build automation, Nunjucks for HTML templating, and SCSS for styling.

## Project Structure

```
src/
├── scss/               # All stylesheets (SCSS)
├── html/               # HTML templates (Nunjucks)
├── js/                 # JavaScript files
├── images/             # Image assets
├── fonts/              # Custom fonts
├── video/              # Video assets
└── filters/            # Nunjucks custom filters
```

## Quick Start

### Build Commands
```bash
# Compile all assets
gulp

# Compile SCSS only
gulp styles

# Compile HTML only
gulp html

# Watch for changes and auto-reload
gulp serve

# Clean dist folder
gulp clean
```

### Development Workflow
1. Make changes in `src/` directory
2. Run `gulp` or `gulp serve` to compile
3. View changes in `dist/` directory
4. Commit source files (never commit `dist/`)

## Brand Switching

This project supports multiple brands (APU, AMU, APUS):

**To switch brands:**
1. Open `src/scss/main.scss`
2. Change the variable import:
   ```scss
   @import "base/_variables-apu.scss";  // APU brand
   // or
   @import "base/_variables-amu.scss";  // AMU brand (if exists)
   ```
3. Change the button/heading imports:
   ```scss
   @import "components/_buttons-apu.scss";
   @import "components/_headings-apu.scss";
   ```

## Key Technologies

- **Gulp**: Build automation
- **Nunjucks**: HTML templating engine
- **SCSS**: CSS preprocessing
- **Bootstrap 5**: CSS framework
- **Font Awesome**: Icon library

## File Organization

### SCSS (`src/scss/`)
- **base/**: Foundation styles (variables, reset, mixins)
- **utilities/**: Helper classes (spacing, typography)
- **components/**: Reusable UI components
- **pages/**: Page-specific styles

### HTML (`src/html/`)
- **layouts/**: Page layout templates
- **pages/**: Individual page templates
- **partials/**: Reusable component partials
- **data/**: JSON data for templates

### JavaScript (`src/js/`)
- **main.js**: Core functionality
- **[feature].js**: Feature-specific scripts

## Important Notes

### For Backend Developers
1. **Template Data**: Nunjucks templates use JSON data from `src/html/data/`
2. **Dynamic Content**: Replace static data with backend API calls
3. **Authentication**: Implement proper auth for protected routes
4. **Form Handling**: Replace frontend form validation with backend validation

### Style Guidelines
- Use existing utility classes before creating custom styles
- Follow BEM naming convention for new components
- Use SCSS variables for colors and spacing
- Keep components modular and reusable

## Contact & Support

For questions about this codebase, contact the frontend development team.

Last Updated: April 2026
