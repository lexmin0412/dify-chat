# AppCard & AppList Components

This document provides comprehensive documentation for the reusable `AppCard` and `AppList` components that have been extracted from the app-markets and workspaces modules.

## Overview

The `AppCard` and `AppList` components are designed to provide a consistent, reusable interface for displaying application data across different parts of the application. They support various layouts, responsive design, and customizable rendering options.

## Components

### BaseAppCard

A flexible card component for displaying application information with support for different variants and custom rendering.

#### Props

| Prop               | Type                                  | Description                                           |
| ------------------ | ------------------------------------- | ----------------------------------------------------- |
| `app`            | `AppData`                           | The application data to display                       |
| `variant`        | `AppCardVariant`                    | Card display variant (`'default'` \| `'compact'`) |
| `className`      | `string`                            | Additional CSS classes                                |
| `renderMetadata` | `(app: AppData) => React.ReactNode` | Custom metadata rendering function                    |
| `renderActions`  | `(app: AppData) => React.ReactNode` | Custom actions rendering function                     |
| `onClick`        | `(app: AppData) => void`            | Click handler                                         |

#### AppData Interface

```typescript
interface AppData {
  id: string;
  name: string;
  description: string;
  icon?: string;
  icon_background?: string;
  mode?: string;
  site?: {
    title: string;
    url: string;
  };
  [key: string]: any;
}
```

#### Usage Examples

**Basic Usage:**

```tsx
import { BaseAppCard } from '@/components';

<BaseAppCard
  app={{
    id: '1',
    name: 'My App',
    description: 'Application description',
    icon: '🚀'
  }}
  onClick={(app) => console.log('Clicked:', app)}
/>
```

**Custom Rendering:**

```tsx
<BaseAppCard
  app={appData}
  variant="compact"
  renderMetadata={(app) => (
    <div className="custom-metadata">
      <span>{app.mode}</span>
    </div>
  )}
  renderActions={(app) => (
    <div className="custom-actions">
      <button onClick={() => handleEdit(app)}>Edit</button>
      <button onClick={() => handleDelete(app)}>Delete</button>
    </div>
  )}
/>
```

### BaseAppList

A comprehensive list component that handles loading, error, and empty states while displaying applications in various layouts.

#### Props

| Prop                   | Type                                                 | Description                           |
| ---------------------- | ---------------------------------------------------- | ------------------------------------- |
| `apps`               | `AppData[]`                                        | Array of application data             |
| `loading`            | `boolean`                                          | Loading state                         |
| `error`              | `string \| null`                                    | Error message                         |
| `layout`             | `AppListLayout`                                    | Layout type (`'grid'` \| `'row'`) |
| `gridCols`           | `object`                                           | Responsive grid configuration         |
| `renderAppCard`      | `(app: AppData, index: number) => React.ReactNode` | Custom card rendering                 |
| `renderErrorActions` | `() => React.ReactNode`                            | Custom error actions                  |
| `onRefresh`          | `() => void`                                       | Refresh handler                       |
| `emptyMessage`       | `string`                                           | Custom empty state message            |
| `className`          | `string`                                           | Additional CSS classes                |

#### AppListLayout Type

```typescript
type AppListLayout = 'grid' | 'row';
```

#### Default Grid Configuration

```typescript
const defaultGridCols = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 4,
  xxl: 6
};
```

#### Usage Examples

**Basic Grid Layout:**

```tsx
import { BaseAppList } from '@/components';

<BaseAppList
  apps={applications}
  loading={isLoading}
  error={error}
  layout="grid"
  onRefresh={() => refetch()}
/>
```

**Custom Card Rendering:**

```tsx
<BaseAppList
  apps={applications}
  layout="row"
  renderAppCard={(app, index) => (
    <BaseAppCard
      key={app.id}
      app={app}
      variant="compact"
      renderActions={(app) => (
        <Button onClick={() => handleSelect(app)}>
          Select
        </Button>
      )}
    />
  )}
/>
```

**Custom Error Handling:**

```tsx
<BaseAppList
  apps={applications}
  error="Failed to load applications"
  renderErrorActions={() => (
    <div>
      <Button onClick={() => retry()}>Retry</Button>
      <Button onClick={() => navigate('/settings')}>
        Check Settings
      </Button>
    </div>
  )}
/>
```

## Migration Guide

### From app-markets Components

**Before:**

```tsx
// AppCard.tsx (app-markets)
import { Card, Tag } from 'antd';
// ... custom implementation

// AppList.tsx (app-markets)
import { Row, Col, Empty, Alert } from 'antd';
// ... custom state handling
```

**After:**

```tsx
// Use shared components
import { BaseAppCard, BaseAppList } from '@/components';

<BaseAppList
  apps={apps}
  loading={loading}
  error={error}
  renderAppCard={(app) => (
    <BaseAppCard
      app={app}
      renderActions={(app) => (
        // Custom actions for app-markets
      )}
    />
  )}
/>
```

### From workspaces Components

**Before:**

```tsx
// app-card.tsx (workspaces)
import { Card, Tag } from 'antd';
// ... custom implementation

// app-list-view.tsx (workspaces)
import { Row, Col, Empty, Alert } from 'antd';
// ... custom state handling
```

**After:**

```tsx
// Use shared components
import { BaseAppCard, BaseAppList } from '@/components';

<BaseAppList
  apps={applications}
  loading={loading}
  error={error}
  renderAppCard={(app) => (
    <BaseAppCard
      app={app}
      renderMetadata={(app) => (
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">{app.mode}</span>
        </div>
      )}
    />
  )}
/>
```

## Styling and Theming

The components use Tailwind CSS classes for styling and are designed to be theme-compatible. Key styling features:

- **Responsive Design**: Automatic adaptation to different screen sizes
- **Hover Effects**: Interactive hover states for better UX
- **Loading States**: Skeleton loaders for better perceived performance
- **Error States**: Clear error messaging with actionable buttons
- **Empty States**: Friendly empty state messages

## Best Practices

1. **Consistent Data Structure**: Ensure all app data follows the `AppData` interface
2. **Custom Rendering**: Use `renderMetadata` and `renderActions` for module-specific features
3. **Error Handling**: Always provide meaningful error messages and recovery actions
4. **Performance**: Use memoization for expensive operations in custom render functions
5. **Accessibility**: Ensure custom content follows accessibility guidelines

## TypeScript Support

Full TypeScript support is provided with comprehensive type definitions:

```typescript
// Import types for use in your components
import type { 
  BaseAppCardProps, 
  BaseAppListProps, 
  AppData, 
  AppCardVariant, 
  AppListLayout 
} from '@/components';
```

## Contributing

When extending these components:

1. Follow the existing prop interface patterns
2. Maintain backward compatibility
3. Update documentation for new features
4. Add TypeScript types for new props
5. Test with different data scenarios

## File Structure

```
src/components/
├── app-card/
│   ├── base-app-card.tsx    # Main AppCard component
│   └── index.ts             # Exports
├── app-list/
│   ├── base-app-list.tsx    # Main AppList component
│   └── index.ts             # Exports
└── index.tsx                # Main exports
```

This modular structure ensures easy maintenance and clear separation of concerns.
