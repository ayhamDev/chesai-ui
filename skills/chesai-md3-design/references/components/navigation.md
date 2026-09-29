# Navigation and shells

[Selection guide](../component-registry.md) · [Machine-readable registry](registry.json)

Generated from the package-root exports and curated usage guidance. Import public names from `chesai-ui`. Own-prop lists are discovery hints, not complete signatures; inherited props, required fields, unions and callbacks must be checked in source/types. Compound members listed below may include helper data; consult the usage note before treating a value as JSX.

- [appbar](#appbar)
- [bottom-tabs](#bottom-tabs)
- [breadcrumb](#breadcrumb)
- [layout-router](#layout-router)
- [layout-toggle](#layout-toggle)
- [navigation-menu](#navigation-menu)
- [navigation-rail](#navigation-rail)
- [shallow-router](#shallow-router)
- [sidebar](#sidebar)
- [stack-router](#stack-router)
- [tabs](#tabs)
- [taskbar](#taskbar)
- [view-transition](#view-transition)

## appbar

Page title, contextual actions and optional collapsing header. Supply title/leadingIcon/trailingIcons; attach scrollContainerRef for a custom scroll region and follow the layout reference.

**Availability:** package-root public API.

**Value exports:** `AppBar`, `useAppBarContext`.

**Type-only exports:** `AppBarColor`, `AppBarContextValue`, `AppBarProps`, `AppBarScrollBehavior`, `AppBarSharedProps`, `AppBarVariant`. Use `import type`.

- `AppBar` own props: `bottomContent`, `collapseScrollDistance`, `collapsedHeight`, `collapsible`, `color`, `effectScrollThreshold`, `elevateOnScroll`, `expandedAnimation`, `expandedContent`, `expandedHeight`, `forwardScroll`, `leadingIcon`, `routeKey`, `scrollBehavior`, `scrollContainerRef`, `scrolledColor`, `snap`, `title`, `topRowContent`, `trailingIcons`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/appbar/index.tsx)

**Examples:** [Appbar.stories.tsx](../../../../src/lib/components/appbar/Appbar.stories.tsx)

## bottom-tabs

Primary compact destinations. Compose BottomTabs.Navigator and Screen with the actual route/content contract; use Tabs for sections inside one destination.

**Availability:** package-root public API.

**Value exports:** `BottomTabs`.

**Type-only exports:** `BottomTabsItemVariant`, `BottomTabsScreenProps`, `BottomTabsSize`, `BottomTabsVariant`. Use `import type`.

- `BottomTabs` members: `BottomTabs.Navigator`, `BottomTabs.Screen`.

**Source:** [index.tsx](../../../../src/lib/components/bottom-tabs/index.tsx)

**Examples:** [bottom-tabs.stories.tsx](../../../../src/lib/components/bottom-tabs/bottom-tabs.stories.tsx)

## breadcrumb

Hierarchical location and parent links. Use Dynamic data API or List/Item/Link/Page composition; mark current location and avoid duplicating a flat tab bar.

**Availability:** package-root public API.

**Value exports:** `Breadcrumb`, `BreadcrumbEllipsis`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbList`, `BreadcrumbPage`, `BreadcrumbRoot`, `BreadcrumbSeparator`.

**Type-only exports:** `DynamicBreadcrumbProps`. Use `import type`.

- `Breadcrumb` members: `Breadcrumb.Dynamic`, `Breadcrumb.Ellipsis`, `Breadcrumb.Item`, `Breadcrumb.Link`, `Breadcrumb.List`, `Breadcrumb.Page`, `Breadcrumb.Provider`, `Breadcrumb.Separator`.
- `Breadcrumb` own props: `separator`.
- `BreadcrumbLink` own props: `asChild`.
- `BreadcrumbRoot` own props: `separator`.

**Source:** [breadcrumb-context.tsx](../../../../src/lib/components/breadcrumb/breadcrumb-context.tsx), [index.tsx](../../../../src/lib/components/breadcrumb/index.tsx)

**Examples:** [Breadcrumb.stories.tsx](../../../../src/lib/components/breadcrumb/Breadcrumb.stories.tsx), [DynamicBreadcrumb.stories.tsx](../../../../src/lib/components/breadcrumb/DynamicBreadcrumb.stories.tsx)

## layout-router

Shared-element list-to-detail transitions and dismissible screens. Compose List/Link/Screen/SharedElement under LayoutRouter; use stable shared identities and verify back behavior.

**Availability:** package-root public API.

**Value exports:** `DismissibleContext`, `LayoutRouter`, `useLayoutRouter`.

- `LayoutRouter` members: `LayoutRouter.Link`, `LayoutRouter.List`, `LayoutRouter.Screen`, `LayoutRouter.SharedElement`.
- `LayoutRouter` own props: `children`, `duration`, `easing`.

**Source:** [index.tsx](../../../../src/lib/components/layout-router/index.tsx)

**Examples:** [Layout-router.stories.tsx](../../../../src/lib/components/layout-router/Layout-router.stories.tsx)

## layout-toggle

A control for layout direction. Use LayoutDirectionToggle with existing layout context; do not change product direction merely for decoration.

**Availability:** package-root public API.

**Value exports:** `LayoutDirectionToggle`.


**Source:** [index.tsx](../../../../src/lib/components/layout-toggle/index.tsx)

**Examples:** No Storybook file in this folder; inspect the source contract.

## navigation-menu

Website-style navigation links and grouped dropdown content. Compose List/Item/Trigger/Content/Link; use DropdownMenu for commands, not destinations.

**Availability:** package-root public API.

**Value exports:** `NavigationMenu`, `navigationMenuTriggerStyle`.

- `NavigationMenu` members: `NavigationMenu.Content`, `NavigationMenu.ContentItem`, `NavigationMenu.ContentList`, `NavigationMenu.Indicator`, `NavigationMenu.Item`, `NavigationMenu.Link`, `NavigationMenu.List`, `NavigationMenu.Trigger`, `NavigationMenu.Viewport`.
- `NavigationMenu` own props: `bordered`.

**Source:** [index.tsx](../../../../src/lib/components/navigation-menu/index.tsx)

**Examples:** [navigation-menu.stories.tsx](../../../../src/lib/components/navigation-menu/navigation-menu.stories.tsx)

## navigation-rail

Primary destinations in a rail with responsive expansion. Compose Navigator/Screen plus Header, Label and FAB where useful; inspect routing and content placement in stories.

**Availability:** package-root public API.

**Value exports:** `NavigationRail`, `useNavigationRail`.

**Type-only exports:** `NavigationRailFABProps`, `NavigationRailHeaderProps`, `NavigationRailLabelProps`, `NavigationRailScreenProps`. Use `import type`.

- `NavigationRail` members: `NavigationRail.FAB`, `NavigationRail.Header`, `NavigationRail.Label`, `NavigationRail.Navigator`, `NavigationRail.Screen`.

**Source:** [index.tsx](../../../../src/lib/components/navigation-rail/index.tsx)

**Examples:** [navigation-rail.stories.tsx](../../../../src/lib/components/navigation-rail/navigation-rail.stories.tsx)

## shallow-router

Lightweight route/page switching and optional query/path synchronization. Compose ShallowRouter, Route/Page/Switch; preserve the existing application router rather than installing another unnecessarily.

**Availability:** package-root public API.

**Value exports:** `ShallowPage`, `ShallowRoute`, `ShallowRouter`, `ShallowSwitch`, `useRouter`, `useRouterOptions`.

- `ShallowPage` own props: `path`.
- `ShallowRoute` own props: `children`, `path`.
- `ShallowRouter` own props: `basePath`, `children`, `mode`, `paramName`.
- `ShallowSwitch` own props: `children`.

**Source:** [index.tsx](../../../../src/lib/components/shallow-router/index.tsx)

**Examples:** [Shallow-router.stories.tsx](../../../../src/lib/components/shallow-router/Shallow-router.stories.tsx)

## sidebar

Persistent or collapsible app navigation. Use SidebarProvider and Sidebar Header/Content/Footer/Item/Group; configure mobileLayout and collapse behavior deliberately.

**Availability:** package-root public API.

**Value exports:** `Sidebar`, `SidebarProvider`, `useSidebar`.

**Type-only exports:** `SidebarCollapseProps`, `SidebarFABProps`. Use `import type`.

- `Sidebar` members: `Sidebar.Collapse`, `Sidebar.Content`, `Sidebar.FAB`, `Sidebar.Footer`, `Sidebar.Group`, `Sidebar.Header`, `Sidebar.Item`, `Sidebar.Label`, `Sidebar.Provider`, `Sidebar.Trigger`.
- `Sidebar` own props: `collapsedWidth`, `collapsible`, `expandOnHover`, `indicatorAnimation`, `itemShape`, `itemSize`, `itemVariant`, `layout`, `mobileLayout`, `mobileWidth`, `overlay`, `raised`, `shape`, `side`, `variant`, `width`.
- `SidebarProvider` own props: `children`, `defaultOpen`.

**Source:** [index.tsx](../../../../src/lib/components/sidebar/index.tsx)

**Examples:** [Sidebar.stories.tsx](../../../../src/lib/components/sidebar/Sidebar.stories.tsx)

## stack-router

Push/pop screen flows. Use createStackNavigator or ControlledStackNavigator with external state; adapters support router integration. Read transition, back and state contracts before composing screens.

**Availability:** package-root public API.

**Value exports:** `ControlledStackNavigator`, `createStackNavigator`, `useExternalStackState`, `useNavigation`, `useRoute`, `useTanStackRouterAdapter`.

- `ControlledStackNavigator` own props: `canGoBack`, `children`, `onGoBack`, `onNavigate`, `onPop`, `onPopToTop`, `onPush`, `onReplace`, `screenOptions`, `state`.

**Source:** [tanstack.ts](../../../../src/lib/components/stack-router/adapters/tanstack.ts), [index.tsx](../../../../src/lib/components/stack-router/index.tsx), [transitions.ts](../../../../src/lib/components/stack-router/transitions.ts), [types.ts](../../../../src/lib/components/stack-router/types.ts)

**Examples:** [stack-router.stories.tsx](../../../../src/lib/components/stack-router/stack-router.stories.tsx)

## tabs

Sections within a context. Compose Tabs with defaultValue, List/Trigger and Content/Panel; verify routingMode and param names because this library can synchronize URL state.

**Availability:** package-root public API.

**Value exports:** `Tabs`, `useTabs`.

- `Tabs` members: `Tabs.Content`, `Tabs.List`, `Tabs.Panel`, `Tabs.Trigger`.
- `Tabs` own props: `children`, `defaultValue`, `initialTab`, `pageTransition`, `routingMode`, `routingParamName`, `searchParamName`, `shape`, `size`, `stretch`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/tabs/index.tsx)

**Examples:** [Tabs.stories.tsx](../../../../src/lib/components/tabs/Tabs.stories.tsx)

## taskbar

Desktop application titlebar/window controls. Bind onMinimize/onMaximize/onClose to the host application; the component does not automatically control OS windows.

**Availability:** package-root public API.

**Value exports:** `Taskbar`.

**Type-only exports:** `TaskbarProps`. Use `import type`.

- `Taskbar` own props: `bordered`, `centerAdornment`, `isMaximized`, `onClose`, `onMaximize`, `onMinimize`, `size`, `startAdornment`, `variant`.

**Source:** [index.tsx](../../../../src/lib/components/taskbar/index.tsx)

**Examples:** [Taskbar.stories.tsx](../../../../src/lib/components/taskbar/Taskbar.stories.tsx)

## view-transition

View-transition helpers for navigation. TransitionLink requires onNavigate; hooks integrate explicit or global transitions. Respect reduced motion and existing router behavior.

**Availability:** package-root public API.

**Value exports:** `TransitionLink`, `useGlobalViewTransitions`, `useViewTransition`.

**Type-only exports:** `TransitionLinkProps`. Use `import type`.

- `TransitionLink` own props: `asChild`, `onNavigate`.

**Source:** [index.tsx](../../../../src/lib/components/view-transition/index.tsx), [use-view-transition.ts](../../../../src/lib/components/view-transition/use-view-transition.ts), [useGlobalViewTransitions.tsx](../../../../src/lib/components/view-transition/useGlobalViewTransitions.tsx)

**Examples:** [ViewTransition.stories.tsx](../../../../src/lib/components/view-transition/ViewTransition.stories.tsx)

