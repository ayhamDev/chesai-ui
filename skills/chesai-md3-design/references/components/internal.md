# Internal and unavailable folders

[Selection guide](../component-registry.md) · [Machine-readable registry](registry.json)

Generated from the package-root exports and curated usage guidance. Import public names from `chesai-ui`. Own-prop lists are discovery hints, not complete signatures; inherited props, required fields, unions and callbacks must be checked in source/types. Compound members listed below may include helper data; consult the usage note before treating a value as JSX.

- [action-sheet](#action-sheet)
- [adaptive-grid](#adaptive-grid)
- [blocks](#blocks)
- [carousel](#carousel)
- [list](#list)
- [shaped-button](#shaped-button)
- [showcase](#showcase)
- [ThemeSwitch](#themeswitch)
- [tree-view](#tree-view)

## action-sheet

Story examples for ActionSheetProvider/useActionSheet. No ActionSheet component is exported from the package root; use the public context API.

**Availability:** not exported from chesai-ui; do not invent a package import.


**Source:** No implementation in this folder.

**Examples:** [ActionSheet.Registry.stories.tsx](../../../../src/lib/components/action-sheet/ActionSheet.Registry.stories.tsx), [ActionSheet.stories.tsx](../../../../src/lib/components/action-sheet/ActionSheet.stories.tsx)

## adaptive-grid

Adaptive/resizable grid implementation exists locally but is not exported from the package root. Use public Grid/Masonry/Resizable when suitable; do not invent an AdaptiveGrid package import.

**Availability:** not exported from chesai-ui; do not invent a package import.


**Source:** [AdaptiveGrid.tsx](../../../../src/lib/components/adaptive-grid/AdaptiveGrid.tsx), [GridItem.tsx](../../../../src/lib/components/adaptive-grid/GridItem.tsx), [ResizeHandle.tsx](../../../../src/lib/components/adaptive-grid/ResizeHandle.tsx), [index.tsx](../../../../src/lib/components/adaptive-grid/index.tsx), [layout-engine.ts](../../../../src/lib/components/adaptive-grid/layout-engine.ts), [types.ts](../../../../src/lib/components/adaptive-grid/types.ts), [utils.ts](../../../../src/lib/components/adaptive-grid/utils.ts)

**Examples:** [AdaptiveGrid.stories.tsx](../../../../src/lib/components/adaptive-grid/AdaptiveGrid.stories.tsx)

## blocks

Reserved or internal folder; no package-root export. Do not infer a public Blocks component from the folder name.

**Availability:** not exported from chesai-ui; do not invent a package import.


**Source:** No implementation in this folder.

**Examples:** No Storybook file in this folder; inspect the source contract.

## carousel

No package-root exports from this folder. The public Carousel/CarouselItem come from material3-carousel.

**Availability:** not exported from chesai-ui; do not invent a package import.


**Source:** No implementation in this folder.

**Examples:** No Storybook file in this folder; inspect the source contract.

## list

No public List export from this folder. Use Item/ItemGroup, VirtualList or the appropriate scrolling family.

**Availability:** not exported from chesai-ui; do not invent a package import.


**Source:** No implementation in this folder.

**Examples:** No Storybook file in this folder; inspect the source contract.

## shaped-button

No package-root export from this folder. Public ShapedButton comes from shape.

**Availability:** not exported from chesai-ui; do not invent a package import.


**Source:** No implementation in this folder.

**Examples:** No Storybook file in this folder; inspect the source contract.

## showcase

Showcase/internal folder without a package-root component export. Consult public components for product UI.

**Availability:** not exported from chesai-ui; do not invent a package import.


**Source:** No implementation in this folder.

**Examples:** No Storybook file in this folder; inspect the source contract.

## ThemeSwitch

No package-root ThemeSwitch export. Compose Switch with useTheme if a theme preference control is required.

**Availability:** not exported from chesai-ui; do not invent a package import.


**Source:** No implementation in this folder.

**Examples:** No Storybook file in this folder; inspect the source contract.

## tree-view

Tree view implementation exists locally but is not exported from the package root. A product needing a real tree requires an explicit supported implementation decision, not an invented import or a disguised list.

**Availability:** not exported from chesai-ui; do not invent a package import.


**Source:** [index.tsx](../../../../src/lib/components/tree-view/index.tsx)

**Examples:** [TreeView.stories.tsx](../../../../src/lib/components/tree-view/TreeView.stories.tsx)

