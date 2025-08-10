---
trigger: always_on
---

# Coding & Workflow Präferenzen

## 🎯 Coding Style

### Sprache
- **Kommentare**: Englisch
- **Variablennamen**: Englisch (internationale Standards)
- **Dokumentation**: Englisch

### TypeScript Standards
- **Typisierung**: Strenge Typisierung bevorzugt
- **Interface vs Type**: Interfaces für öffentliche APIs, Types für interne Logik
- **Generics**: Explizite Constraints verwenden
- **Null Safety**: Strict null checks aktiviert

### Code Formatierung
- **Prettier**: Standard-Konfiguration mit 2 Spaces
- **ESLint**: Airbnb-Base + TypeScript recommended
- **Import Order**: External → Internal → Relative
- **Prop Order**: Props, Refs, Events, Callbacks, Children (alphabetisch)
- **Line Length**: 100 Zeichen

### Naming Conventions
- **Components**: PascalCase (`TableComponent`)
- **Hooks**: camelCase mit `use` Prefix (`useVirtualization`)
- **Types/Interfaces**: PascalCase (`TableProps`, `ITableData`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEFAULT_ROW_HEIGHT`)
- **Files**: PascalCase für Komponenten (`Table.tsx`, `Playground.tsx`), camelCase für Utilities/Hooks (`virtualization.tsx`, `main.tsx`)

## 🔄 Workflow

### Git Standards
- **Commits**: Conventional Commits (feat:, fix:, docs:, etc.)
- **Branches**: feature/*, bugfix/*, hotfix/*
- **Sprache**: Commit Messages auf Englisch
- **Commit Messages**: Kurze und prägnant, als Stichpunkte aufgelistet

### Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright (bei Bedarf)
- **Coverage**: Mindestens 80% für kritische Komponenten
- **Test-Dateien**: `*.test.tsx` neben der Implementierung

### Documentation
- **JSDoc**: Für alle öffentlichen APIs
- **README**: Englisch, mit Code-Beispielen
- **Inline Comments**: Sparsam, nur bei komplexer Logik
- **Changelog**: Keep a Changelog Format

### Review Prozess
- **Erklärungen**: Kurze Zusammenfassung + Details bei komplexen Änderungen
- **Implementierung einfacher Teile**: Erst implementieren, dann kurz zusammenfassen
- **Implementierung komplexer Teile**: Erst Umsetzungskonzept zusammen planen, dann implementieren
- **Feedback**: Proaktiv nach Verbesserungen fragen

## 📦 Package Management
- **Manager**: npm (konsistent mit bestehender package.json)
- **Versions**: Exact versions für dependencies, ranges für devDependencies
- **Updates**: Regelmäßige Updates mit Breaking Change Analyse
