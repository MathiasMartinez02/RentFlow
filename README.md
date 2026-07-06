# RentFlow Front

Frontend de RentFlow, un sistema de gestión inmobiliaria (propiedades, inquilinos, contratos, pagos y mantenimiento).

## Stack tecnológico

- [Next.js 15](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) + TypeScript
- Tailwind CSS + Radix UI (estilo shadcn/ui)
- Zustand para estado global (`src/store`)
- React Hook Form + Zod para formularios y validación
- Vitest + Testing Library para tests
- ESLint (`next/core-web-vitals`) + Prettier

## Requisitos

- Node.js 20.x LTS o superior (React 19 / Next 15 requieren Node >= 18.18, se recomienda 20+)
- npm 10+ (viene con Node 20)

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar los valores según el entorno:

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base de la API del backend (incluye prefijo de versión, ej. `/api/v1`) |
| `NEXT_PUBLIC_WS_URL` | URL del servidor de WebSockets para notificaciones/actualizaciones en tiempo real |

```bash
cp .env.example .env.local
```

## Cómo correr en local

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:3000`.

## Scripts disponibles

```bash
npm run dev            # servidor de desarrollo (Next.js con Turbopack)
npm run build          # build de producción
npm run start          # levanta el build de producción
npm run lint           # lint con ESLint
npm run typecheck      # chequeo de tipos con tsc (sin emitir archivos)
npm run test           # corre la suite de tests una vez (Vitest)
npm run test:watch     # corre los tests en modo watch
npm run test:coverage  # corre los tests con reporte de cobertura
npm run format         # formatea el código con Prettier
```

## Estructura de carpetas (resumen)

```
src/
  app/              Rutas de Next.js (App Router), agrupadas en (auth) y (dashboard)
  components/       Componentes compartidos: layout, rbac, ui (primitivas estilo shadcn)
  features/         Un directorio por dominio de negocio (auth, contracts, properties,
                     tenants, payments, maintenance, users, dashboard, notifications,
                     command-palette), cada uno con components/hooks/schemas propios
  hooks/            Hooks genéricos reutilizables entre features
  lib/              Utilidades de bajo nivel, incluye el cliente HTTP (api-client.ts)
  providers/        Providers de contexto de React usados en el layout raíz
  services/         Capa de acceso a la API por dominio (contracts.service.ts, etc.),
                     mapean el DTO del backend al modelo usado en el frontend
  shared/           Constantes y utilidades compartidas entre features
  store/            Stores de Zustand (auth, catálogo, UI)
  types/            Tipos e interfaces compartidos del dominio
```

## Testing

Los tests usan Vitest con entorno `jsdom` y Testing Library. Los archivos de test viven junto al código que prueban, con sufijo `.test.ts` / `.test.tsx`.

```bash
npm run test
```

## CI

El workflow de GitHub Actions (`.github/workflows/ci.yml`) corre lint, typecheck, tests y build en cada push y pull request contra la rama principal.
