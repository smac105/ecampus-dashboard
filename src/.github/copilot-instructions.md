# Copilot Instructions: eCampus Dashboard

## Project Overview
**eCampus Dashboard** is a student lifecycle management interface for APU (American Public University). The project uses **Nunjucks templating** for HTML, **SCSS** for styling, and **vanilla JavaScript** with jQuery for interactivity. It's a stage-based student journey application supporting multiple user personas (prospective → applicant → accepted → enrolled → returning → alumni).

## Architecture & Key Patterns

### Component Organization
- **`html/layouts/`** - Master templates (`base.njk`, `registration-layout.njk`) that extend to page-specific layouts
- **`html/pages/`** - Individual page templates (40+ pages) that extend layouts and define block content
- **`html/partials/`** - Reusable UI components (header, navigation, modals, forms)
- **`html/macros/`** - Nunjucks macros for repeated patterns (`productCard`, `classCard`, etc.)
- **`html/data/`** - JSON data files (courses, products, navigation) used by templates via fetch

### State Management Pattern
Multiple systems use localStorage for persistence:
- **Registration flow** (`registration.js`): Stores `registrationState` and `registrationCart`
- **Application flow** (`application.js`): Stores `apusApplicationState` with multi-step form data
- **Enrollment tasks** (`enrollment-tasks.js`): Stores `enrollmentTasksState` with task completion order

**Key pattern**: State objects are saved after each step/action. Always check localStorage at page init.

### Student Journey Stages
The dashboard dynamically renders different content based on student stage (selector on index page):
```html
<!-- index.njk uses stage-switcher to toggle visibility -->
<div class="stage-container" data-stage="applicant">
  {% include "partials/stages/applicant.njk" %}
</div>
```
**Stage flow**: `prospective` → `applicant` → `accepted` → `enrolled` → `returning` → `alumni`

### Data Flow in Registration
1. User selects courses → saved to state in `registration.js`
2. `cart-manager.js` reads `registrationCart` from localStorage
3. Cart modal (`registration/exit-confirmation-modal.njk`) renders saved selections
4. On confirmation, cart updates and badge counter displays pending course count

## Styling System

### SCSS Architecture
- **`_variables.scss`** - Color palette, typography, utility values
- **`_brand-variables.scss`** - APU brand overrides (aqua/cyan, neon colors)
- **`_variables-apu.scss`** - Alternative branding (imported in `main.scss`)
- **`_buttons-apu.scss`, `_headings-apu.scss`** - APU-specific component overrides

**Branding approach**: Base styles are defined, then APU brand files override (marked with `-apu` suffix). Change brand colors in `_brand-variables.scss` without modifying base files.

### Color System (CSS Custom Properties)
Primary variables in `:root`:
```scss
--primary: #041E42 (navy)
--secondary: #05C3DE (aqua)
--apu-blue: #00ffff
--apu-green: #00ff00
--apu-yellow: #ffff00
```

## JavaScript Conventions

### Module Pattern
Register global namespaces for major features:
- `window.CartManager` - cart operations
- Modules use IIFE + 'use strict' for scope isolation
- Event listeners attached in `DOMContentLoaded` callbacks

### Multi-Step Flow Implementation
All multi-step forms follow this pattern (see `application.js`, `registration.js`):
1. Initialize state object with step tracking
2. Load state from localStorage on page load
3. Hide/show step divs by ID (e.g., `appStep1`, `appStep2`)
4. Save current step data before navigating
5. Update progress tracker and navigation buttons

### Form Data Capture
Use `FormData` API to serialize form inputs:
```javascript
const form = document.getElementById('personalInfoForm');
const formData = new FormData(form);
applicationState.personalInfo = Object.fromEntries(formData);
```

## Data Files & Filters

### JSON Data Structure
- **`courses.json`** - `{ availableCourses, completedCourses, inProgressCourses }`
- **`products.json`** - Array of product objects with `inStock`, `price`, `image`
- **`navigation.json`** - Site navigation structure
- **`site.json`** - Global site config (title, student name, page metadata)

### Nunjucks Filters
Located in `/filters/`:
- `currency.js` - Formats numbers to USD: `{{ value | currency }}` → `$12.50`
- `uppercase.js` - Converts to uppercase: `{{ text | uppercase }}`

Add custom filters to `/filters/` directory with `module.exports = function(value) { ... }`

## Common Workflows

### Adding a New Student Journey Page
1. Create `html/pages/new-page.njk` extending `layouts/base.njk`
2. Add entry to `html/data/navigation.json` and `site.json`
3. Add data-driven content or forms (use existing macros from `html/macros/`)
4. If form is multi-step, use pattern from `application.js` for state management
5. Create corresponding SCSS in `scss/_new-page.scss` and import in `main.scss`

### Implementing Stage-Specific Content
- Create partial in `html/partials/stages/[stage-name].njk`
- Include in stage container on `index.njk`
- Reference stage name in `index.njk` stage switcher (must match data attribute)

### Modifying Branding
1. Change colors in `scss/_brand-variables.scss` (do NOT edit `_variables.scss`)
2. Update APU-specific component styles in `_buttons-apu.scss`, `_headings-apu.scss`
3. Override CSS custom properties in `:root` if needed
4. Rebuild SCSS → CSS

## Critical File Dependencies
- `base.njk` → includes all partials and imports macros (page foundation)
- `main.js` → initializes Bootstrap offcanvas, search toggle, profile/menu collapses
- `main.scss` → aggregates all component styles; import order matters
- `site.json` → referenced by page meta (title, site-wide variables)

## Testing & Debugging Notes
- Open browser DevTools → localStorage to inspect persisted state
- Stage switcher on index page allows testing different student personas without auth
- Course data loads from `/html/data/courses.json`; check Network tab if registration fails
- Use `console.log()` at state save/load points (existing code includes these)
