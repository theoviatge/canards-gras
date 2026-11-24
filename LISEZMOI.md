# Registre des canards gras : version hors ligne

Cette copie de l'appli marche sans connexion. Une fois ouverte une première fois avec du réseau, elle reste dans le téléphone ou l'ordinateur. Les données (lots, mouvements, fiches ICA, comptes rendus) sont gardées **sur l'appareil**, pas sur Internet.

Le dépôt GitHub ne contient **aucune donnée de l'élevage**, seulement l'appli. Il peut donc être public.

## 1. Mettre l'appli sur GitHub (une seule fois)

1. Sur github.com, créez un nouveau dépôt, par exemple `canards-gras`.
2. Dans le dépôt : **Add file › Upload files**, puis glissez **tout le contenu** du dossier (les 12 fichiers, tous au même niveau, sans dossier). Validez avec **Commit changes**.
3. Allez dans **Settings › Pages**. Dans « Branch », choisissez `main` et le dossier `/ (root)`, puis **Save**.
4. Après une ou deux minutes, l'adresse de l'appli s'affiche en haut de cette page, du type `https://votre-nom.github.io/canards-gras/`.

## 2. L'installer sur le téléphone

1. Ouvrez cette adresse avec du réseau (Chrome sur Android, Safari sur iPhone).
2. Menu du navigateur › **Ajouter à l'écran d'accueil**. L'icône « CG » apparaît.
3. À partir de là, l'appli s'ouvre même sans réseau.

## 3. Reprendre le registre de l'appli en ligne

1. Dans l'appli en ligne (claude.ai) : **Lots › Hors ligne › « Exporter pour la version hors ligne »**. Un fichier `canards-en-ligne-AAAA-MM-JJ.json` est enregistré.
2. Dans la version hors ligne : **Lots › Hors ligne › « Remplacer tout par le fichier de l'appli en ligne »**, et choisissez ce fichier.

## 4. Remettre dans l'appli en ligne ce qui a été saisi sans réseau

1. Dans la version hors ligne : **Lots › Hors ligne › « Exporter mes saisies »**.
2. Dans l'appli en ligne : **Lots › Hors ligne › « Importer des saisies faites hors ligne »**, et choisissez ce fichier.

L'import dans l'appli en ligne ajoute seulement les saisies nouvelles : il n'efface rien et ne modifie pas ce qui existe déjà. Une saisie corrigée hors ligne doit donc être corrigée aussi dans l'appli en ligne. Les photos et les PDF restent sur l'appareil où ils ont été faits.

## Mettre à jour l'appli plus tard

Quand l'appli change, renvoyez les nouveaux fichiers dans le dépôt (Upload files, en remplaçant les anciens). Le téléphone prend la nouvelle version à la deuxième ouverture avec du réseau.
