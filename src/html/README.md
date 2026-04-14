# HTML Templates Documentation

## Overview
This project uses **Nunjucks** templating engine for HTML generation. Nunjucks allows for template inheritance, partials, and data-driven rendering.

## Folder Structure

```
html/
├── layouts/            # Base page layouts
├── pages/              # Individual page templates
├── partials/           # Reusable components
├── data/               # JSON data files
├── macros/             # Nunjucks macros (future)
└── filters/            # Custom Nunjucks filters (in src/filters/)
```

## Layouts (`layouts/`)

Base templates that other pages extend.

### `base.njk`
The main layout template with:
- HTML head (meta tags, stylesheets)
- Header/navigation
- Content block
- Footer
- Scripts

**Usage:**
```nunjucks
{% extends "layouts/base.njk" %}

{% block content %}
  <!-- Page content here -->
{% endblock %}
```

## Pages (`pages/`)

Individual page templates that extend layouts.

### Common Pages:
- `index.njk` - Homepage
- `my-documents.njk` - Document management
- `view-application.njk` - Application status
- `messages.njk` - Message center
- `student-profile.njk` - Student profile
- `style-guide.njk` - UI component showcase

### Flow Pages:
- `application-flow.njk` - Multi-step application
- `registration-flow.njk` - Course registration
- `student-rights-flow.njk` - Student rights acknowledgment

### Example Page:
```nunjucks
{% extends "layouts/base.njk" %}

{% set title = "My Documents" %}
{% set stage = "enrolled" %}

{% block content %}
  <div class="container">
    <h1>{{ title }}</h1>
    {% include "partials/document-list.njk" %}
  </div>
{% endblock %}
```

## Partials (`partials/`)

Reusable template components included in pages.

### Navigation Partials:
- `nav.njk` - Main navigation bar
- `nav-overlay.njk` - Overlay/mobile navigation
- `top-nav.njk` - Top header navigation
- `top-nav-applicant.njk` - Applicant-specific top nav

### UI Component Partials:
- `alerts.njk` - Alert messages
- `calendar.njk` - Calendar widget
- `profile.njk` - Profile card with modals
- `search.njk` - Search component
- `shortcuts.njk` - Quick shortcuts
- `progress-bar.njk` - Vertical progress bar
- `horizontal-progress-tracker.njk` - Horizontal chevron progress
- `footer.njk` - Site footer

### Flow Partials:
- `application/` - Application flow steps
  - `step1-personal.njk`
  - `step2-education.njk`
  - `step3-military.njk`
  - `step4-documents.njk`
  - `step5-review-submit.njk`
  - `confirmation.njk`

- `registration/` - Registration flow steps
  - `step1-courses.njk`
  - `step2-payment.njk`
  - `step3-plan.njk`
  - `step5-review.njk`
  - `step6-disclosures.njk`
  - `confirmation.njk`
  - `cart-modal.njk`

- `stages/` - Student journey stages
  - `applicant.njk`
  - `prospective.njk`
  - etc.

### Branding Partials:
- `apu-logo.njk` - APU logo (color)
- `apu-logo-wht.njk` - APU logo (white)
- `amu-logo.njk` - AMU logo
- `apus-logo.njk` - APUS logo

### Utility Partials:
- `macros.njk` - Reusable macros
- `head-apu.njk` - APU-specific head content
- `head-apus.njk` - APUS-specific head content

## Data (`data/`)

JSON files that provide data to templates.

### Usage:
```nunjucks
<!-- In template -->
{{ navigation[0].title }}

<!-- data/navigation.json -->
[
  {
    "title": "Home",
    "url": "/index.html",
    "icon": "fa-home"
  }
]
```

## Nunjucks Syntax Reference

### Variables
```nunjucks
{{ title }}
{{ user.name }}
{{ items[0] }}
```

### Set Variables
```nunjucks
{% set stage = "applicant" %}
{% set currentYear = "2026" %}
```

### Conditionals
```nunjucks
{% if stage == "applicant" %}
  <p>You're an applicant</p>
{% elif stage == "enrolled" %}
  <p>You're enrolled</p>
{% else %}
  <p>Welcome</p>
{% endif %}
```

### Loops
```nunjucks
{% for item in items %}
  <li>{{ item.name }}</li>
{% endfor %}
```

### Include Partials
```nunjucks
{% include "partials/nav.njk" %}
```

### Extend Layouts
```nunjucks
{% extends "layouts/base.njk" %}

{% block content %}
  <!-- Content -->
{% endblock %}
```

### Macros (Reusable Components)
```nunjucks
{# Define macro #}
{% macro button(text, type="primary") %}
  <button class="btn btn-{{ type }}">{{ text }}</button>
{% endmacro %}

{# Use macro #}
{{ button("Click Me") }}
{{ button("Submit", "secondary") }}
```

### Filters
```nunjucks
{{ name | upper }}
{{ price | round(2) }}
{{ date | date("MMMM D, YYYY") }}
```

## Common Patterns

### Creating a New Page

1. Create page file in `pages/`:
```nunjucks
<!-- pages/my-new-page.njk -->
{% extends "layouts/base.njk" %}

{% set title = "My New Page" %}

{% block content %}
  <div class="container">
    <h1>{{ title }}</h1>
    <!-- Page content -->
  </div>
{% endblock %}
```

2. Compile with Gulp:
```bash
gulp html
```

3. View at: `dist/my-new-page.html`

### Creating a Reusable Partial

1. Create partial in `partials/`:
```nunjucks
<!-- partials/my-component.njk -->
<div class="my-component">
  <h3>{{ componentTitle }}</h3>
  <p>{{ componentDescription }}</p>
</div>
```

2. Include in page:
```nunjucks
{% set componentTitle = "Welcome" %}
{% set componentDescription = "This is my component" %}
{% include "partials/my-component.njk" %}
```

### Using Student Stage Conditionals

The site has different views based on student journey stage:

```nunjucks
{% set stage = "applicant" %}
<!-- Options: prospective, applicant, accepted, enrolled, returning, alumni -->

{% if stage == "applicant" %}
  {% include "partials/top-nav-applicant.njk" %}
  {% include "partials/stages/applicant.njk" %}
{% elif stage == "enrolled" %}
  {% include "partials/top-nav.njk" %}
  <!-- Enrolled content -->
{% endif %}
```

## Multi-Step Flows

Application and Registration flows use step-based navigation:

### Structure:
```nunjucks
<!-- pages/application-flow.njk -->
<div class="flow-container">
  <!-- Step indicator -->
  {% include "partials/progress-bar.njk" %}

  <!-- Step content -->
  <div id="step1">
    {% include "partials/application/step1-personal.njk" %}
  </div>

  <div id="step2" style="display: none;">
    {% include "partials/application/step2-education.njk" %}
  </div>

  <!-- Navigation buttons -->
  <button class="btn-next">Next</button>
  <button class="btn-prev">Back</button>
</div>
```

JavaScript handles step transitions (see `src/js/application.js`).

## Backend Integration Notes

### For Backend Developers:

1. **Replace Static Data**:
   - Data in `data/*.json` should come from your API
   - Replace `{{ user.name }}` with server-side template variables

2. **Form Handling**:
   - Current forms are client-side only
   - Add proper action/method attributes
   - Implement server-side validation
   - Add CSRF tokens

3. **Authentication**:
   - Add auth checks for protected routes
   - Implement session management
   - Redirect unauthorized users

4. **Dynamic Content**:
   - Replace hardcoded content with database queries
   - Implement user-specific data fetching
   - Add real-time updates where needed

5. **File Uploads**:
   - Document upload forms need backend handlers
   - Implement file storage and retrieval
   - Add file type/size validation

## Compilation

HTML is compiled using Gulp + Nunjucks:

```bash
# Compile once
gulp html

# Watch for changes
gulp serve
```

Output: `dist/*.html`

## Troubleshooting

### Issue: Template not found
**Solution**: Check file path in include/extends statement

### Issue: Variable undefined
**Solution**: Set variable before using: `{% set myVar = "value" %}`

### Issue: Changes not showing
**Solution**: Run `gulp clean` then `gulp html`

### Issue: Data not loading
**Solution**: Check JSON syntax in `data/` files

## Best Practices

1. **Keep partials small and focused**
2. **Use semantic HTML5 elements**
3. **Add accessibility attributes (aria-labels, roles)**
4. **Use BEM naming for CSS classes**
5. **Comment complex template logic**
6. **Don't put business logic in templates**
7. **Use macros for repeated UI patterns**

---

Last Updated: April 2026
