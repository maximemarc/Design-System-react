# design-system.

Système de design React de la vitrine `design-system`, publié aussi en
paquet npm : **`@maximemarc/design-system`** (GitHub Packages).

## Vitrine

```bash
npm ci
npm run dev
```

Image `ghcr.io/maximemarc/design-system`, publiée par `.github/workflows/image.yml`.

## Paquet

Contenu (`src/lib/index.ts`) : jetons de thème clair et sombre, composants de
base (`Button`, `Badge`, `Switch`, `Modal`…), primitives (`Checkbox`,
`Breadcrumb`, `Spinner`, `EmptyState`…), superpositions, kit de tableau de bord
(`Tile`, `StatTile`, `TabBar`, `Callout`…), notifications, et `designSystemStyle()`.

```bash
# .npmrc du projet consommateur
@maximemarc:registry=https://npm.pkg.github.com
# jeton : GITHUB_TOKEN (packages: read) en CI, PAT classique read:packages ailleurs
npm install @maximemarc/design-system
```

```tsx
import '@maximemarc/design-system/design-system.css';
import { Button, designSystemStyle } from '@maximemarc/design-system';

<div className={`design-system${dark ? ' dark' : ''}`} style={designSystemStyle({ dark })}>
  <Button>Créer</Button>
</div>;
```

Polices : DM Sans (texte) et Manrope (titres), à charger par l'application
(par exemple `@fontsource-variable/dm-sans` et `@fontsource-variable/manrope`).

Publication : aligner `version` dans `package.json`, fusionner, puis pousser
l'étiquette `vX.Y.Z` sur le commit de fusion. `.github/workflows/paquet.yml`
publie le paquet, `image.yml` l'image de la vitrine. Une version publiée n'est
jamais republiée.

## Migration depuis `@maximemarc/forma` (2.0.0)

Le design system s'appelait **forma.** jusqu'à la 1.4.1 (dépôt `Design-System-react`,
image `design-system-react`). La 2.0.0 ne change que les noms :

| 1.x (forma)                       | 2.0.0                                           |
| --------------------------------- | ----------------------------------------------- |
| `@maximemarc/forma`               | `@maximemarc/design-system`                     |
| `@maximemarc/forma/forma.css`     | `@maximemarc/design-system/design-system.css`   |
| `formaStyle`, `FormaStyleOptions` | `designSystemStyle`, `DesignSystemStyleOptions` |
| classe racine `.forma`            | `.design-system`                                |
| image `design-system-react`       | `ghcr.io/maximemarc/design-system`              |

La vitrine recopie au démarrage les réglages enregistrés sous `forma-*` vers
`design-system-*` (`src/migrateStorage.ts`).
