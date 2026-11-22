# forma.

Système de design React de la vitrine `design-system-react`, publié aussi en
paquet npm : **`@maximemarc/forma`** (GitHub Packages).

## Vitrine

```bash
npm ci
npm run dev
```

Image `ghcr.io/maximemarc/design-system-react`, publiée par `.github/workflows/image.yml`.

## Paquet

Contenu (`src/lib/index.ts`) : jetons de thème clair et sombre, composants de
base (`Button`, `Badge`, `Switch`, `Modal`…), primitives (`Checkbox`,
`Breadcrumb`, `Spinner`, `EmptyState`…), superpositions, kit de tableau de bord
(`Tile`, `StatTile`, `TabBar`, `Callout`…), notifications, et `formaStyle()`.

```bash
# .npmrc du projet consommateur
@maximemarc:registry=https://npm.pkg.github.com
# jeton : GITHUB_TOKEN (packages: read) en CI, PAT classique read:packages ailleurs
npm install @maximemarc/forma
```

```tsx
import '@maximemarc/forma/forma.css';
import { Button, formaStyle } from '@maximemarc/forma';

<div className={`forma${dark ? ' dark' : ''}`} style={formaStyle({ dark })}>
  <Button>Créer</Button>
</div>;
```

Polices : DM Sans (texte) et Manrope (titres), à charger par l'application
(par exemple `@fontsource-variable/dm-sans` et `@fontsource-variable/manrope`).

Publication : aligner `version` dans `package.json`, fusionner, puis pousser
l'étiquette `vX.Y.Z` sur le commit de fusion. `.github/workflows/paquet.yml`
publie le paquet, `image.yml` l'image de la vitrine. Une version publiée n'est
jamais republiée.
