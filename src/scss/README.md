# SCSS Architecture Documentation

## Folder Structure

```
scss/
├── base/               # Foundation styles
├── utilities/          # Helper classes
├── components/         # UI components
├── pages/              # Page-specific styles
└── main.scss           # Main entry point
```

## Import Order (main.scss)

The imports are organized in a specific order to ensure proper cascading:

1. **Base Styles**: Colors, variables, reset, mixins, layout
2. **Utilities**: Helper classes for quick styling
3. **Design System Components**: Buttons, forms, alerts, etc.
4. **Navigation Components**: All navigation elements
5. **Feature Components**: Complex feature-specific components
6. **Page-Specific Styles**: Styles for individual pages
7. **Legacy/Custom**: Older styles to be refactored

## Base (`base/`)

Foundation styles that define the core styling system.

### Files:
- `_colors.scss` - Color palette definitions
- `_variables.scss` - Base SCSS variables
- `_variables-apu.scss` - APU brand variables (active brand)
- `_base-reset.scss` - CSS reset and normalize
- `_mixins.scss` - Reusable SCSS mixins
- `_base-layout.scss` - Core layout styles
- `_buttons.scss` - Base button styles (non-brand)
- `_headings.scss` - Base heading styles (non-brand)
- `_brand-variables.scss` - Brand override variables (placeholder)

### Key Variables:
```scss
// Colors
$primary: #000;
$secondary: #fff;
$apu-blue: #00FFFF;
$apu-green: #80C342;
$apu-yellow: #FDB933;

// Grays
$gray-10: #f5f5f5;
$gray-20: #e5e5e5;
$gray-60: #6b6b6b;
$gray-dk: #424242;

// Status Colors
$red: #E4193B;
$green: #80C342;
$orange: #F88A00;
$yellow: #FDB933;
$blue: #0096D6;
```

### Key Mixins:
```scss
@include white-box-apus;          // White box with shadow
@include white-box-apus-nopad;    // White box without padding
@include flex-center;              // Center content with flexbox
@include flex-between;             // Space-between with flexbox
@include space-between;            // Flex space-between
```

## Utilities (`utilities/`)

Helper classes for rapid development without writing custom CSS.

### Files:
- `_utilities.scss` - Color, spacing, typography utilities
- `_layouts.scss` - Grid and layout utilities

### Utility Classes:

**Colors:**
```html
<div class="red">Red text</div>
<div class="bg-blue">Blue background</div>
<div class="apu-blue">APU brand blue text</div>
```

**Typography:**
```html
<h3 class="small-title">Small Title</h3>
<p class="lead">Lead paragraph</p>
<p class="text-sm">Small text</p>
<i class="icon-lg">Large icon</i>
```

**Spacing:**
```html
<div class="mb-sm">Margin bottom small</div>
```

**Buttons:**
```html
<button class="btn btn-min-width">Button</button>
```

**Layout:**
```html
<div class="row-main-layout">2 column grid (2fr 1fr)</div>
<div class="space-between">Flex space-between</div>
```

## Components (`components/`)

Reusable UI components organized by type.

### Design System Components:
- `_buttons-apu.scss` - APU brand button styles
- `_headings-apu.scss` - APU brand heading styles
- `_forms.scss` - Form elements and validation
- `_alerts.scss` - Alert/notification components
- `_modal.scss` - Modal dialog styles
- `_tabs.scss` - Tab navigation components
- `_badges.scss` - Status badges
- `_counts.scss` - Count notification badges
- `_cards.scss` - Card and white-box components

### Navigation Components:
- `_nav.scss` - Main navigation bar
- `_nav-offcanvas.scss` - Off-canvas mobile menu
- `_nav-overlay.scss` - Overlay navigation
- `_appmenu.scss` - Application menu

### Feature Components:
- `_footer.scss` - Footer component
- `_search.scss` - Search component
- `_profile.scss` - Profile card/modal
- `_shortcuts.scss` - Quick shortcuts widget
- `_calendar.scss` - Calendar component
- `_messages.scss` - Message center
- `_progress-bar.scss` - Progress bar indicators
- `_horizontal-progress-tracker.scss` - Chevron progress tracker
- `_chat.scss` - Chat widget
- `_document-lists.scss` - Document list items
- `_degree-finder.scss` - Degree finder tool

### Legacy Components:
- `_custom.scss` - Mixed custom styles (to be refactored)
- `_classes.scss` - Miscellaneous class styles

## Pages (`pages/`)

Page-specific styles that don't fit in reusable components.

### Files:
- `_application.scss` - Application flow pages
- `_registration.scss` - Registration flow pages
- `_news.scss` - News and updates pages

## Best Practices

### When to Create a New Component
1. If a style is used in 2+ places → Extract to component
2. If it's a distinct UI element → Create new component file
3. If it's page-specific → Put in `pages/` folder
4. If it's a utility → Add to `utilities/`

### Naming Conventions
- Use BEM naming: `.block__element--modifier`
- Use semantic names: `.document-item` not `.box-1`
- Prefix brand-specific: `.apu-blue`, `.amu-red`

### File Organization
- Keep files focused and small (< 300 lines)
- Group related styles together
- Comment complex styles
- Use section headers for organization

### SCSS Guidelines
```scss
// Good - Use variables
color: $apu-blue;

// Bad - Hard-coded values
color: #00FFFF;

// Good - Use mixins
@include white-box-apus;

// Bad - Duplicate styles
padding: 2.5rem;
border-radius: 9px;
background: $wht;
box-shadow: 0 4px 20px rgba(0,0,0,0.08);

// Good - Nested selectors
.card {
  padding: 2rem;

  &__title {
    font-size: 1.8rem;
  }

  &:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
}
```

## Compilation

SCSS is compiled using Gulp:

```bash
# Compile once
gulp styles

# Watch for changes
gulp serve
```

Output: `dist/css/main.css`

## Troubleshooting

### Issue: Styles not updating
**Solution**: Run `gulp clean` then `gulp styles`

### Issue: Variables not found
**Solution**: Check import order in `main.scss` - variables must be imported before use

### Issue: Mixin not found
**Solution**: Ensure `base/_mixins.scss` is imported before components

### Issue: Wrong brand colors
**Solution**: Check which `_variables-[brand].scss` is imported in `main.scss`

## Future Improvements

1. **Refactor `_custom.scss`**: Break into logical component files
2. **Extract inline styles**: Move remaining inline styles to classes
3. **Create AMU brand**: Duplicate APU brand files for AMU
4. **Component documentation**: Add Storybook or style guide
5. **Remove deprecated code**: Clean up unused styles

---

Last Updated: April 2026
