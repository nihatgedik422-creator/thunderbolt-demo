# Thunderbolt · site de la casquette

Site vitrine et de vente de la casquette Thunderbolt, brodée en France.
Site statique : du HTML, du CSS et du JavaScript, sans outil à installer.

## Organisation

```
index.html             la page du site
mentions-legales.html  la page des mentions légales
css/
  fonts.css            les polices (servies par le site lui-même)
  style.css            tous les styles, rangés par partie de la page
js/
  intro.js             l'intro (l'éclair, le nom, le rideau qui se lève)
  main.js              les animations : accueil, détails, tempête, commande, pied de page
fonts/                 les fichiers de polices (Archivo Black, Inter, DM Mono)
img/                   les photos de la casquette et l'icône du site
```

## Les parties de la page

1. **Accueil** : la casquette en 3D, son nom, le prix et le bouton Acheter
2. **Détails** : le logo brodé, le profil, la matière, l'atelier, puis la transition « Plus qu'une casquette, une identité »
3. **Commander** : le prix, la livraison, le paiement
4. **Questions** : les questions fréquentes
5. **Suivre** : Instagram et TikTok
6. **Pied de page** : liens et mentions légales

## Réglages courants

- **Activer le paiement** : dans `js/main.js`, tout en haut, mettre le lien de paiement Stripe
  entre les guillemets de `const PAYMENT_URL = '';`. Laissé vide (démo), le bouton affiche
  « Version démo ».
- **Mentions légales** : compléter les champs surlignés dans `mentions-legales.html`.
- **Prix et textes** : directement dans `index.html`.
- **Photos** : remplacer les fichiers dans `img/` en gardant les mêmes noms.

## Voir le site sur son ordinateur

Ouvrir `index.html` dans un navigateur, ou servir le dossier avec n'importe quel petit serveur web.
Mis en ligne avec GitHub Pages (branche `main`, dossier racine).

Réalisé par Studio Relief.
