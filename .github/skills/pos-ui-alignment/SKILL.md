---
name: pos-ui-alignment
description: "Use when: fixing page alignment, action button styling, close/cancel button UI, spacing consistency, and date picker standardization across grocery, sales, and working screens."
---

# POS UI Alignment Fix Skill

## Purpose

Use this skill when the task is to standardize the visual layout and interaction styling across the POS app, especially when one screen already has a good pattern and the same treatment should be applied to neighboring screens.

This workflow is specifically for cases like:
- aligning grocery page boxes/cards/buttons
- matching close or cancel button UI to the approved style
- fixing spacing, padding, and margin consistency
- replacing old date picker UI with the grocery-style date picker
- applying the same alignment rules to sales and working pages

## Workflow

### 1. Identify the approved reference screen
Start from the screen that already looks correct, usually the grocery page.

Check:
- spacing between cards and panels
- button alignment and sizing
- consistent box widths and heights
- close/cancel action button treatment
- date picker design and placement

### 2. Copy the visual pattern, not the raw code blindly
Do not just duplicate markup without understanding the layout rules.

Compare:
- container widths and max widths
- row/column gaps
- heading and button alignment
- consistent padding classes
- whether the action button should be on the top-right, bottom-right, or inline

### 3. Fix close/cancel button UI and box alignment
Apply the approved close or mount-button style to other affected pages.

Required checks:
- same border radius and visual hierarchy
- same shadow/contrast/tint treatment if used
- consistent width and alignment with surrounding content
- no floating misplacement or uneven spacing
- buttons should match the local design language

### 4. Standardize layout blocks
For all affected sections:
- cards should align to the same horizontal grid
- input groups should share consistent spacing
- titles, action buttons, and form elements should line up on the same axis
- empty states and filters should not feel shifted or offset

### 5. Remove the old date picker and replace it with the grocery pattern
If a screen still uses the older date picker design:
- remove the legacy date picker UI
- replace it with the grocery page version
- keep the same date behavior and filtering logic
- ensure it matches the visual style of the approved screen

### 6. Apply the same fix to sales and working screens
Once the grocery page pattern is approved, apply it to:
- sales page
- working page
- any adjacent screen that uses the same form/filter layout

The goal is consistency, not isolated fixes.

## Decision Points

- If the layout mismatch is only cosmetic, adjust spacing and alignment classes first.
- If the button style is inconsistent, update the shared action-button treatment before changing individual pages.
- If the date picker differs by page, prefer the grocery-style date picker as the source of truth.
- If a screen has multiple forms, align them to the same column structure before touching style details.
- If the fix breaks responsiveness, prioritize clean spacing and predictable alignment over decorative detail.

## Completion Criteria

The work is complete only when all of the following are true:
- grocery, sales, and working pages use a consistent visual rhythm
- close/cancel button styling is aligned across affected screens
- card/box layout is visually balanced and cleanly spaced
- the old date picker has been removed from the target pages
- the grocery-style date picker is present and consistent where required
- the design still works without breaking existing state, filters, or forms

## Quality Rules

- Preserve existing logic and data flow; do not change behavior unless design requires it.
- Keep the fix scoped to the requested screens and UI pattern.
- Prefer shared styling conventions over one-off custom hacks.
- Match the existing project style instead of introducing a new visual language.
- Validate alignment before finalizing, especially on the affected screens.

## Example prompts to use this skill

- "Set the grocery page alignment exactly like the approved layout and apply the same close button and box spacing in sales."
- "Remove the old date picker from sales and replace it with the grocery-style date picker; do the same in working."
- "Fix the button and card alignment across grocery, sales, and working pages to match the approved UI."
- "Apply the grocery screen's close-button and panel styling to sales and working so the layout feels consistent."

## Related follow-up work

- create a shared component for action buttons if the same close/cancel pattern appears in multiple pages
- standardize date picker styling into a reusable component for all POS screens
- review whether the layout should be refactored into a common card/form grid pattern
