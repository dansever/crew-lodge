# Button Component - UX Guide

## Overview

A comprehensive, accessible button component with semantic variants, proper focus states, and loading support.

## 🎨 Variant Guide

### Primary Actions

Use for the main call-to-action. Most prominent button.

```tsx
<Button variant="primary" text="Save Changes" />
<Button variant="primary" text="Get Started" icon={ArrowRight} />
```

### Secondary Actions

Use for alternative or less important actions.

```tsx
<Button variant="secondary" text="Cancel" />
<Button variant="secondary" text="Learn More" />
```

### Outline

Use for neutral actions that need definition but not emphasis.

```tsx
<Button variant="outline" text="Filter" icon={FilterIcon} />
<Button variant="outline" text="Export" />
```

### Ghost

Use for tertiary actions, icon buttons, or minimal emphasis.

```tsx
<Button variant="ghost" icon={MoreVertical} ariaLabel="More options" />
<Button variant="ghost" text="Skip" />
```

### Link

Use when you want button functionality with link appearance.

```tsx
<Button variant="link" text="View Details" />
<Button variant="link" href="/help" text="Learn more" />
```

### Success

Use for confirmations, completions, positive outcomes.

```tsx
<Button variant="success" text="Approve" icon={Check} />
<Button variant="success" text="Publish" />
```

### Warning

Use for actions requiring caution.

```tsx
<Button variant="warning" text="Archive" icon={Archive} />
<Button variant="warning" text="Proceed with caution" />
```

### Danger

Use for destructive actions (primary dangerous action).

```tsx
<Button variant="danger" text="Delete Account" icon={Trash2} />
<Button variant="danger" text="Remove" />
```

### Destructive Outline

Use for destructive actions that need less emphasis.

```tsx
<Button variant="dangerOutline" text="Delete" icon={Trash2} />
<Button variant="dangerOutline" text="Remove Item" />
```

## 📏 Sizes

```tsx
<Button size="sm" text="Small" />      // h-8, compact
<Button size="md" text="Medium" />     // h-10, default
<Button size="lg" text="Large" />      // h-12, prominent
```

## 🔄 Loading States

```tsx
<Button text="Save" isLoading />
<Button text="Refresh" icon={RefreshCw} isLoading /> // Uses RefreshCw for spinner
<Button text="Submit" isLoading loadingIcon={Loader2} />
```

## 🎯 Icon Buttons

### Icon Only (Requires ariaLabel!)

```tsx
<Button
  variant="ghost"
  icon={Settings}
  ariaLabel="Open settings" // Required for accessibility!
/>
```

### Icon + Text

```tsx
<Button text="Delete" icon={Trash2} />
<Button text="Next" icon={ArrowRight} iconPosition="right" />
```

## 🔗 As Links

```tsx
<Button href="/dashboard" text="Go to Dashboard" />
<Button href="https://example.com" text="External" external />
```

## ♿ Accessibility Features

1. **Focus States**: Visible focus rings for keyboard navigation
2. **Icon-only Warning**: Console warning if no `ariaLabel` provided
3. **Loading States**: `aria-busy` automatically applied
4. **Disabled States**: `aria-disabled` for screen readers
5. **Icon Hidden**: Icons marked `aria-hidden="true"` to avoid duplication

## 🎯 Usage Recommendations

### Visual Hierarchy

1. **Page primary action**: `variant="primary"` size="lg"
2. **Section actions**: `variant="primary"` or `variant="secondary"`
3. **Supporting actions**: `variant="outline"` or `variant="ghost"`
4. **Destructive actions**: `variant="dangerOutline"` first, escalate to `variant="danger"`

### Do's ✅

- Use semantic variants that match intent
- Provide `ariaLabel` for icon-only buttons
- Use `isLoading` for async actions
- Use `dangerOutline` before `danger` for progressive disclosure
- Use `link` variant for navigation that looks like a link

### Don'ts ❌

- Don't use multiple primary buttons on the same screen section
- Don't forget accessibility for icon-only buttons
- Don't use `danger` variant casually (it's very prominent)
- Don't mix button text styles (use either `text` prop OR `children`, not both)
