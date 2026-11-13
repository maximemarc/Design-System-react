---
name: forma-design
description: Construire des interfaces React modulaires, fluides et personnalisables avec le système forma. Utiliser pour créer, adapter ou améliorer une interface, une galerie de composants ou un nouveau projet reposant sur ces conventions.
---
# Forma design

## Direction
Conserver une identité sobre et chaleureuse : surfaces neutres, accent sauge ou bleu, espaces généreux et hiérarchie typographique nette. Adapter la personnalité au projet plutôt que reproduire une page identique.

## Composition
Lire les éléments existants avant de créer une variante. Réutiliser les éléments de src/components/ui.tsx lorsqu’ils sont présents. Séparer les contrôles génériques des compositions métier : un bouton ne doit pas connaître le projet qui l’utilise.

Centraliser couleurs, arrondis, densité et durée des transitions dans des variables de thème pour permettre une personnalisation cohérente. Utiliser un rythme d’espacement de 8 pixels, trois graisses typographiques maximum, et un contraste lisible dans les deux thèmes.

Prévoir les états sélectionné, désactivé, vide, chargement et erreur quand ils s’appliquent. Chaque action doit produire un résultat visible. Ne pas simuler un paiement ou un envoi réel ; identifier les démonstrations explicitement.

## Mouvement et accessibilité
Animer discrètement le relief, la couleur et la position sans perturber la lecture. Respecter prefers-reduced-motion et le réglage d’animations de l’interface. Utiliser des contrôles natifs, des libellés explicites, un focus visible et une navigation clavier utilisable.

Adapter chaque composition aux mobiles sans débordement. Tester les contrôles, vérifier les types et la compilation ; signaler honnêtement l’absence de vérification dans un navigateur.

## Exemple
Une carte de profil réutilise Badge et Button et ouvre Modal pour les détails. Le changement de couleur d’accent affecte simultanément les boutons, les indicateurs et les aperçus sans modifier chaque carte.
