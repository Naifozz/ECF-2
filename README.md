# Projet Minecraft Craft

## Instructions de démarrage (Get Started)

### Prérequis

- Node.js

### Installation

1. Clonez le dépôt
   ```
   git clone https://github.com/Naifozz/ECF-2.git
   ```
2. Installez les dépendances

   ```
   cd ECF-2
   cd backend
   npm install

   cd ..
   cd frontend
   npm install
   ```

3. Démarrez l'api

   Ouvrez un terminal puis aller dans le fichier backend et faites

   ```
   npm run dev
   ```

4. Démarrez le serveur front

   Puis revenez en arriere pour aller dans le fichier frontend

   ```
   "Depuis le fichier backend"
   cd .. "revenir en arriere"
   cd frontend
   npm run dev
   ```

## Conception de la base de données

### Structure de la base de données

La base de données est structurée autour des entités principales suivantes :

- **ITEM** : Représente les objets du jeu Minecraft
- **RECIPE** : Contient les recettes de craft pour fabriquer des items
- **ITEM_RECIPE** : Table de jointure pour la relation many-to-many entre les recettes et les ingrédients, avec la position de l'ingrédient
- **USER** : Stocke les informations des utilisateurs pour l'authentification
- **INVENTORY** : Représente l'inventaire d'un utilisateur
- **ITEM_INV** : Table de jointure entre Items et Inventory pour lister les items et leurs quantités dans l'inventaire

### Relations entre les entités

- **Item - Recipe** : Un item peut être le résultat de plusieurs recettes, mais une recette ne produit qu'un seul item résultat (One-to-Many)
- **Recipe - Item (en tant qu'ingrédients)** : Une recette peut contenir plusieurs items comme ingrédients, et un item peut être utilisé dans plusieurs recettes (Many-to-Many)
  - Cette relation est implémentée via la table de jointure **ITEM_RECIPE** qui stocke également la position de l'ingrédient dans la grille de craft (1-9)
- **User - Inventory** : Chaque utilisateur possède un inventaire unique (One-to-One)
- **Inventory - Item** : Un inventaire contient plusieurs items en quantité variable (Many-to-Many via ITEM_INV)

## Requêtes SQL pour les opérations CRUD

### Items

- **Create** :
  ```sql
  INSERT INTO ITEM (Name, Image_Path) VALUES (?, ?);
  ```
- **Get** :

  ```sql
  -- Lire tous les items
  SELECT * FROM ITEM;

  -- Lire un item spécifique
  SELECT * FROM ITEM WHERE ID_Item = ?;
  ```

- **Update** :
  ```sql
  UPDATE ITEM SET Name = ?, Image_Path = ? WHERE ID_Item = ?;
  ```
- **Delete** :
  ```sql
  DELETE FROM ITEM WHERE ID_Item = ?;
  ```
- **IsItemUsedInRecipes** :
  ```sql
  SELECT COUNT(*) as count FROM ITEM_RECIPE WHERE ID_Item = ?;
  ```

### Recipes

- **Create** :

  ```sql
  -- Créer une recette
  INSERT INTO RECIPE (ID_Item_Result) VALUES (?);

  -- Ajouter les ingrédients à la recette
  INSERT INTO ITEM_RECIPE (ID_Recipe, ID_Item, Position) VALUES (?, ?, ?);
  ```

- **Get** :

  ```sql
  -- Lire toutes les recettes
  SELECT * FROM RECIPE;

  -- Lire toutes les recettes avec leurs ingrédients
  SELECT r.*, i.ID_Item, i.Name, ir.Position
  FROM RECIPE r
  JOIN ITEM_RECIPE ir ON r.ID_Recipe = ir.ID_Recipe
  JOIN ITEM i ON ir.ID_Item = i.ID_Item;

  -- Lire une recette spécifique
  SELECT * FROM RECIPE WHERE ID_Recipe = ?;

  -- Lire une recette spécifique avec ses ingrédients
  SELECT r.*, i.ID_Item, i.Name, ir.Position
  FROM RECIPE r
  JOIN ITEM_RECIPE ir ON r.ID_Recipe = ir.ID_Recipe
  JOIN ITEM i ON ir.ID_Item = i.ID_Item
  WHERE r.ID_Recipe = ?;
  ```

- **Update** :

  ```sql
  -- Mettre à jour une recette
  UPDATE RECIPE SET ID_Item_Result = ? WHERE ID_Recipe = ?;

  -- Supprimer les anciens ingrédients
  DELETE FROM ITEM_RECIPE WHERE ID_Recipe = ?;

  -- Ajouter les nouveaux ingrédients
  INSERT INTO ITEM_RECIPE (ID_Recipe, ID_Item, Position) VALUES (?, ?, ?);
  ```

- **Delete** :

  ```sql
  -- Supprimer les ingrédients associés
  DELETE FROM ITEM_RECIPE WHERE ID_Recipe = ?;

  -- Supprimer la recette
  DELETE FROM RECIPE WHERE ID_Recipe = ?;
  ```

### Users

- **Create** :
  ```sql
  INSERT INTO USER (Pseudo, Email, Password) VALUES (?, ?, ?);
  ```
- **Read** :

  ```sql
  -- Lire tous les utilisateurs
  SELECT * FROM USER;

  -- Lire un utilisateur spécifique
  SELECT * FROM USER WHERE ID_User = ?;

  -- Rechercher un utilisateur par email
  SELECT * FROM USER WHERE Email = ?;
  ```

- **Update** :
  ```sql
  UPDATE USER SET Pseudo = ?, Email = ?, Password = ? WHERE ID_User = ?;
  ```
- **Delete** :
  ```sql
  DELETE FROM USER WHERE ID_User = ?;
  ```

### Inventory

- **Create** :
  ```sql
  INSERT INTO INVENTORY (ID_User) VALUES (?);
  ```
- **Read** :
  ```sql
  SELECT i.ID_Inventory, i.ID_User, ii.ID_Item, it.Name, it.Image_Path, ii.Quantity
  FROM INVENTORY i
  JOIN ITEM_INV ii ON i.ID_Inventory = ii.ID_Inventory
  JOIN ITEM it ON ii.ID_Item = it.ID_Item
  WHERE i.ID_User = ?;
  ```
- **Delete** :
  ```sql
  DELETE FROM INVENTORY WHERE ID_User = ?;
  ```

## MCD (Modèle Conceptuel de Données)

![alt text](/docs/mcd.png)
Le MCD montre les relations entre nos différentes entités:

```
USER (1,1) ---- (0,1) INVENTORY (0,N) ---- (0,N) ITEM (1,N) ---- (0,N) RECIPE
```

- Un utilisateur peut avoir au maximum un inventaire et un inventaire appartient à un seul utilisateur
- Un inventaire peut contenir plusieurs items et un item peut être dans plusieurs inventaires
- Un item peut être le résultat de plusieurs recettes
- Une recette peut contenir plusieurs items comme ingrédients (avec une position spécifique)

### Description du MCD

#### Entités

- **Item** :

  - ID_Item (PK)
  - Name
  - Image_Path

- **Recipe** :

  - ID_Recipe (PK)
  - ID_Item_Result (FK)
  - ID_Item_Required (FK)
  - Position

- **User** :

  - ID_User (PK)
  - Pseudo
  - Email
  - Password

- **Inventory** :

  - ID_Inventory (PK)
  - ID_User (FK, UNIQUE)
  - ID_Item (FK)
  - Quantity

#### Relations

- User → Inventory : Un utilisateur possède un inventaire unique (1-to-1)
- Inventory → Item (via ITEM_INV) : Un inventaire contient plusieurs items avec des quantités
- Item → Recipe (résultat) : Un item peut être le résultat de plusieurs recettes
- Recipe → Item (via ITEM_RECIPE) : Une recette utilise plusieurs items comme ingrédients à des positions spécifiques

## MLD (Modèle Logique des Données)

![alt text](/docs/mld.png)
MLD Disponible sur dbdiagram : https://dbdiagram.io/d/67f90d534f7afba1843fbed0

### Structure du MLD

Le MLD présente une base de données structurée pour une application de crafting inspirée de Minecraft avec les tables suivantes:

#### Tables principales

1. **USER**: Stocke les informations utilisateur

   - ID_User integer [primary key]
   - Pseudo varchar
   - Email varchar
   - Password varchar

2. **INVENTORY**: Représente l'inventaire unique de chaque utilisateur

   - ID_Inventory integer [primary key]
   - ID_User integer

3. **ITEM**: Catalogue des objets disponibles

   - ID_Item integer [primary key]
   - Name varchar
   - Image_Path varchar

4. **RECIPE**: Recettes de craft
   - ID_Recipe integer [primary key]
   - ID_Item_Result integer

#### Tables de jointure

5. **ITEM_INV**: Relation entre inventaires et items

   - ID_Inventory integer
   - ID_Item integer
   - Quantity varchar

6. **ITEM_RECIPE**: Stocke les ingrédients nécessaires à chaque recette
   - ID_Item_Recipe integer [primary key]
   - ID_Recipe integer
   - ID_Item integer
   - Position integer

#### Relations

- Ref: RECIPE.ID_Recipe < ITEM_RECIPE.ID_Recipe
- Ref: ITEM.ID_Item - RECIPE.ID_Item_Result
- Ref: ITEM.ID_Item < ITEM_RECIPE.ID_Item
- Ref: ITEM.ID_Item < ITEM_INV.ID_Item
- Ref: INVENTORY.ID_Inventory < ITEM_INV.ID_Inventory
- Ref: USER.ID_User - INVENTORY.ID_User

#### Caractéristiques notables

1. **Position des ingrédients**: La table ITEM_RECIPE stocke la position (1-9) des ingrédients dans la grille de craft, essentielle pour reproduire les recettes Minecraft.
2. **Vérification des dépendances**: Le système vérifie si un item est utilisé dans des recettes avant de permettre sa suppression.

## Fonctionnalités implémentées

- Gestion complète des items (création, modification, suppression)
- Gestion des recettes avec positionnement des ingrédients dans la grille de craft 3x3
- Interface utilisateur intuitive pour la création et modification de recettes
- Système d'authentification utilisateur avec gestion de sessions
- Inventaire personnel pour chaque utilisateur
- Vérification des dépendances avant suppression d'un item (protection des références)

## Technologies utilisées

- Frontend : HTML, CSS, JavaScript
- Backend : Node.js, Express
- Base de données : SQLite avec abstraction via la bibliothèque `openDb`
- Authentification : MDP hashé avec bcrypt, session avec Express-session
- Architecture : CRUDS (Controller, Service, Repository)
