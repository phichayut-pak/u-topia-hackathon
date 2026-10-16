---
name: ui-reverse-engineering
description: Reverse-engineer and reproduce reference web or Electron interfaces when the user requests a visual match or clone, using live DOM and computed-style evidence.
---

# UI Reverse Engineering

When cloning a reference web/Electron UI:

1. Connect to the reference application using Chrome DevTools/CDP.
2. Never infer CSS from screenshots when computed styles are available.
3. Inspect DOM hierarchy.
4. Extract:
   - bounding boxes
   - computed CSS
   - CSS variables
   - typography
   - colors
   - padding/margin/gap
   - border radius
   - shadows
   - flex/grid properties
5. Inspect hover, focus, active, selected states.
6. Inspect SVG/icon dimensions.
7. Reimplement components independently in the target repository.
8. Render the target at the same viewport.
9. Screenshot reference and target.
10. Compare them visually.
11. Iterate until major visual differences are resolved.
