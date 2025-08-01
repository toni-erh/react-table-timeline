# Architecture Decision Records (ADRs)

## ADR-001: Virtualization Strategy

**Status**: Accepted  
**Date**: 2025-07-31  
**Context**: Large datasets (10k+ rows) require performance optimization  

**Decision**: Implement custom virtualization hook instead of external library
- **Pros**: Full control, minimal bundle size, tailored to tree structures, extensible for timeline integration
- **Cons**: More development effort, potential edge cases

**Consequences**: Better performance for tree data, maintainable codebase

---

## ADR-002: Tree Data Structure

**Status**: Proposed  
**Date**: 2025-07-31  
**Context**: Need to support hierarchical data with parent-child relationships  

**Options**:
1. Nested object structure
2. Adjacency list only
3. Flat array with parentId references + computed children arrays

**Decision**: TBD

**Consequences**: TBD

---

## ADR-003: Build Tool Selection

**Status**: Accepted  
**Date**: 2025-07-31  
**Context**: Need fast development and optimized library builds  

**Decision**: Vite for build tooling
- **Pros**: Fast HMR, excellent TypeScript support, optimized bundling
- **Cons**: Newer ecosystem compared to Webpack

**Consequences**: Faster development cycles, modern build output

---

## ADR-004: Styling Approach

**Status**: Proposed  
**Date**: 2025-07-31  
**Context**: Need maintainable, themeable styling for table components  

**Options**:
1. **CSS Modules**: Scoped styles, good performance
2. **Styled Components**: Runtime styling, theme support
3. **Vanilla CSS**: Minimal bundle, requires careful naming

**Decision**: TBD - Need to evaluate based on theming requirements

---

## ADR-005: State Management

**Status**: Proposed  
**Date**: 2025-07-31  
**Context**: Managing table state (expansion, selection, sorting)  

**Options**:
1. **Internal useState**: Simple, self-contained
2. **useReducer**: Complex state logic, predictable updates
3. **External state**: Zustand/Redux for complex apps

**Decision**: TBD - Start with useState, migrate to useReducer if needed

---

## ADR-006: API Design Philosophy

**Status**: Accepted  
**Date**: 2025-07-31  
**Context**: Library should be easy to use but flexible  

**Decision**: Declarative API with sensible defaults
- Minimal required props
- Rich configuration options
- Render props for customization
- TypeScript-first design

**Example**:
```tsx
<Table
  data={treeData}
  columns={columns}
  virtualized={true}
  expandable={true}
  onRowExpand={(nodeId) => {}}
/>
```

**Consequences**: Easy adoption, flexible customization, good TypeScript experience

---

## Template für neue ADRs

```markdown
## ADR-XXX: [Title]

**Status**: [Proposed | Accepted | Deprecated | Superseded]
**Date**: YYYY-MM-DD
**Context**: [Why is this decision needed?]

**Decision**: [What are we doing?]
- **Pros**: [Benefits]
- **Cons**: [Drawbacks]

**Alternatives Considered**:
- Option 1 (rejected: reason)
- Option 2 (rejected: reason)

**Consequences**: [What are the implications?]
```
