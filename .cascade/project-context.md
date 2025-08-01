# Table Library - Projektkontext

## 🏗️ Architektur Übersicht

### Hauptkomponenten
- **Table Component**: Featurereiche performante React-Komponente mit Tree-Struktur Support
- **Gantt / Scheduler Component (Ausblick)**: Erweiterung der Table-Komponente mit Timeline-Funktionalität 

### Technologie Stack
- **Framework**: React 18+ mit TypeScript
- **Build Tool**: Vite für optimale Performance
- **Package Type**: NPM Library für Wiederverwendung
- **Styling**: CSS Modules oder Styled Components (TBD)

## 🎯 Funktionale Anforderungen

### Core Features (Implementiert)
- ✅ Zeilen Virtualization für Performance bei großen Datasets
- ✅ Lazy Loading Mechanismus
- ✅ Row Range Callbacks

### Tree Functionality (In Entwicklung)
- 🔄 Hierarchische Datenstruktur Display
- 🔄 Expand/Collapse Funktionalität
- 🔄 Parent-Child Relationship Handling
- 🔄 Nested Row Rendering
- 🔄 Zusammenspiel mit Lazy Loading und Virtualization 

### Geplante Features
- 📋 Sortierung nach mehreren Spalten
- 📋 Drag & Drop für Zeilenumsortierung (auch bei Tree-Struktur)
- 📋 Spalteninteraktionen (z.B. Spaltenbreite, Spaltenreihenfolge, Spaltenausblenden, Spaltenfixieren)
- 📋 Spaltenvirtualization
- 📋 Single-/Multi-Selection für Zeilen und Zellen
- 📋 Bearbeitung von Zellen 
- 📋 Keyboard Handling (navigieren, markieren, bearbeiten...)
- 📋 Fußzeile
- 📋 Konfiguration speicherbar und ladbar
- 📋 Gantt / Scheduler 

## ⚡ Performance Prioritäten

### Runtime Performance (Höchste Priorität)
- Smooth Scrolling auch bei 10k+ Rows
- Minimale Re-Renders bei Tree-Operationen
- Effiziente Memory Usage

### Bundle Size (Mittlere Priorität)
- Tree-Shaking freundlich
- Lazy Loading von Features
- Minimale Dependencies

## 🌐 Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Polyfills**: Minimal, nur bei kritischen Features

## 📊 Datenhandling
- React/Redux freundlich
- keine interne Datenverwaltung
- keine direkte Datenabfrage über Callbacks

## 🔧 Development Environment
- **Node Version**: 18+ (LTS)
- **Package Manager**: npm
- **IDE**: VS Code mit TypeScript/React Extensions
- **Testing**: Jest + React Testing Library
