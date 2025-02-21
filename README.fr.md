# My Thesaurus  

Ajoute automatiquement des tags en fonction d’un thésaurus au format CSV ou d'une table Markdown.  

Le plugin cherche le mot ou la suite de mots dans l'entête (propriétés), dans le corps et le titre de la note. Le mot recherché le sera :
- Strictement (sans troncature à droite ou gauche),
- Insensible à la casse (majuscule ou minuscules)
- Sensible aux accents (paramétrable)

> [!TIP]
> `jeu` trouve `JEU` ou `JEu`
> `jeu de carte` trouve `Jeu De Carte` mais pas `jeux de cartes`
> `jeu` ne trouvera ni `jeux`, `enjeu` ou `rajeunir`
> `rôle` ne trouvera pas `role`
> `role` ne trouvera pas `rôle`

## 📚 Format du Thésaurus

Le thésaurus doit être un tableau avec deux colonnes : une pour les termes et une pour les synonymes. La première ligne doit contenir les en-têtes de colonnes.

> [!TIP]  
> Le thésaurus peut être un fichier CSV comme ceci :  
> ```csv
> Terme,Synonyme
> ordinateur,PC
> ordinateur,machine
> ordinateur,vélo
> ```
>
> Ou en format Markdown :
> ```markdown
> | Terme      | Synonyme      |
> |------------|---------------|
> | ordinateur | PC            |
> | ordinateur | machine       |
> | ordinateur | processeur    |
> ```

> [!NOTE]
> Si vous choisissez d'utiliser un fichier Markdown, la table Markdown doit être le seul contenu du fichier.
> Cependant, vous pouvez avoir un entête YAML (propriété) au début du fichier.

## ⚙️ Paramètres  

1. <ins>Thésaurus</ins> : Chemin du fichier contenant le thésaurus. Ce fichier doit être un CSV et être stocké dans votre coffre (vault). Vous pouvez cliquer sur le bouton `save` pour vérifier que le fichier est valide (chemin correct, fichier existant et bien formé).
2. <ins>Séparateur</ins> : Le séparateur utilisé dans le fichier CSV. Les séparateurs pris en charge sont `,`, `;`, `|` et `tabulation`.  
3. <ins>Colonne cible</ins> : Le titre de la colonne du fichier CSV contenant les tags :  
    - **Terme** : Nom de la colonne contenant les **tags à ajouter**.
    - **Synonymes** : Nom de la colonne des mots à **rechercher** dans le fichier (contenu et titre).

> [!WARNING]  
> Si, pour une raison quelconque, le fichier est déplacé, vous devrez mettre à jour son chemin dans les paramètres ! Il ne sera pas mis à jour automatiquement.  

4. <ins>Chemins inclus</ins> : Les fichiers situés dans ces dossiers seront pris en compte lors de l'exécution de la commande `My Thesaurus: Analyser tous les fichiers`. Vous pouvez séparer les chemins par une virgule, un point-virgule ou un saut de ligne. De plus, les expressions régulières (regex) sont prises en charge.  

> [!TIP]  
> Vous pouvez inclure tous les fichiers de votre coffre en utilisant `.*` comme chemin ! Cette valeur est utilisés par défaut.

5. <ins>Supprimer les accents</ins> : Si activé, les accents seront supprimés lors de la reconnaissance de synonymes. Permet de faire correspondre `rôle` à `role` (et vice-versa).

## 📝 Utilisation  

Le plugin propose deux commandes :  

1. <ins>My Thesaurus: Analyser tous les fichiers</ins> : Cette commande analysera tous les fichiers situés dans les chemins inclus et ajoutera les tags en fonction du thésaurus. À la fin, un message affichera les résultats, notamment :  
    - **Erreurs** : Les fichiers ayant rencontré une erreur, ainsi que le message d’erreur correspondant.  
    - **Fichiers ignorés** : Les fichiers qui ont été ignorés car aucun synonyme n'a été trouvé.  
    - **Succès** : Les fichiers analysés avec succès, accompagnés des tags qui ont été ajoutés.  
2. <ins>My Thesaurus: Analyser le fichier actuel</ins> : Cette commande analysera uniquement le fichier en cours et ajoutera les tags en fonction du thésaurus.  

## 📥 Installation  

- [ ] Depuis les plugins communautaires d'Obsidian  
- [x] Avec BRAT via `https://github.com/Mara-Li/`  
- [x] Depuis la page des versions :  
    - Téléchargez la dernière version  
    - Décompressez `my-thesaurus.zip` dans le dossier `.obsidian/plugins/`  
    - Dans les paramètres d’Obsidian, rechargez les plugins  
    - Activez le plugin  

### 🎼 Langues  

- [x] Anglais  
- [x] Français  

Pour ajouter une traduction :  
1. Forkez le dépôt  
2. Ajoutez la traduction dans le dossier `src/i18n/locales` sous le nom de la langue (ex : `fr.json`).  
    - Vous pouvez récupérer le code de votre langue depuis Obsidian en utilisant [obsidian translation](https://github.com/obsidianmd/obsidian-translations) ou via une commande (par exemple dans Templater) : `<% tp.obsidian.moment.locale() %>`  
    - Copiez le contenu du fichier [`en.json`](./src/i18n/locales/en.json) dans le nouveau fichier  
    - Traduisez le contenu  
3. Modifiez `i18n/i18next.ts` :  
    - Ajoutez `import * as <lang> from "./locales/<lang>.json";`  
    - Ajoutez `<lang> : {translation: <lang>}` dans la section `ressource`.  
