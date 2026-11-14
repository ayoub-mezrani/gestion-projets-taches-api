# Gestion de Projets & Taches - API REST (Mini-Projet DS1, ISI)

API REST construite avec **Express.js** et **MongoDB** permettant a des utilisateurs authentifies de gerer leurs projets et les taches associees, avec une authentification **JWT** et deux roles (`user` et `manager`).

> Mini-projet DS1 - ISI, donne par Mohamed Nidhal Jelassi. Deadline : **16 novembre, 12:00**.

## Auteurs

- Ayoub **[NOM DE FAMILLE A COMPLETER]**
- **[Nom du binome, si vous etes deux - sinon supprimez cette ligne]**

> **Important** : complete cette section avec le(s) nom(s) complet(s) avant de deposer le lien GitHub sur Classroom. L'enonce precise qu'en cas d'oubli, il n'y aura aucune correction possible apres coup.

## Fonctionnalites

- Inscription / connexion avec authentification **JWT**
- Deux roles : `user` et `manager`
- Gestion des **projets** (creer, lister, voir, modifier, supprimer)
- Gestion des **taches** rattachees a un projet (creer, lister, voir, modifier, supprimer, assigner)
- Tri et recherche sur les projets et les taches
- Regles metier :
  - N'importe quel utilisateur connecte peut creer un projet ou une tache
  - Un `user` ne voit que **ses propres projets** ; un `manager` voit **tous les projets**
  - Seul un `manager` peut **assigner** une tache a un utilisateur
  - Le statut d'une tache est obligatoirement `todo`, `doing` ou `done`

## Stack technique

| Techno | Role |
|---|---|
| Node.js / Express.js | Serveur HTTP et routage |
| MongoDB / Mongoose | Base de donnees et modelisation |
| jsonwebtoken (JWT) | Authentification |
| bcryptjs | Hachage des mots de passe |
| dotenv | Variables d'environnement |
| cors, morgan | Middlewares utilitaires |

## Structure du projet

```
gestion-projets-taches-api/
|-- config/
|   `-- db.js                 # Connexion a MongoDB
|-- models/
|   |-- User.js
|   |-- Project.js
|   `-- Task.js
|-- middlewares/
|   |-- auth.js               # Verifie le token JWT (protect)
|   |-- checkRole.js          # Verifie le role (authorize)
|   `-- errorHandler.js       # Gestion centralisee des erreurs
|-- controllers/
|   |-- authController.js
|   |-- projectController.js
|   `-- taskController.js
|-- routes/
|   |-- authRoutes.js
|   |-- projectRoutes.js
|   `-- taskRoutes.js
|-- utils/
|   `-- generateToken.js
|-- server.js                 # Point d'entree de l'application
|-- .env.example
`-- package.json
```

## Installation

1. Avoir Node.js installe (version 18 ou plus) et un MongoDB accessible (local ou MongoDB Atlas).
2. `npm install`
3. Copier `.env.example` en `.env` et renseigner tes valeurs (au minimum `MONGO_URI` et `JWT_SECRET`).
4. Lancer en developpement : `npm run dev` (ou `npm start` en simple).
5. L'API ecoute par defaut sur `http://localhost:5000`.

## Variables d'environnement (.env)

| Variable | Description |
|---|---|
| `PORT` | Port d'ecoute du serveur (defaut : 5000) |
| `MONGO_URI` | URL de connexion MongoDB |
| `JWT_SECRET` | Cle secrete pour signer les tokens JWT |
| `JWT_EXPIRES_IN` | Duree de validite du token (ex : `1d`) |
| `NODE_ENV` | `development` ou `production` |

## Documentation de l'API

### Authentification (`/api/auth`) - routes publiques

| Methode | Route | Description | Body |
|---|---|---|---|
| POST | `/api/auth/register` | Creer un compte | `{ nom, login, motDePasse, role? }` |
| POST | `/api/auth/login` | Se connecter | `{ login, motDePasse }` |

Les deux routes renvoient `{ token, user }`. Mets ensuite le token dans l'en-tete `Authorization: Bearer <token>` pour toutes les routes suivantes.

### Projets (`/api/projects`) - authentification requise

| Methode | Route | Acces | Description |
|---|---|---|---|
| POST | `/api/projects` | user, manager | Creer un projet |
| GET | `/api/projects` | user (les siens), manager (tous) | Lister, avec `?search=&statut=&sortBy=&order=` |
| GET | `/api/projects/:id` | proprietaire, manager | Detail d'un projet |
| PUT | `/api/projects/:id` | proprietaire, manager | Modifier un projet |
| DELETE | `/api/projects/:id` | proprietaire, manager | Supprimer un projet |

### Taches (`/api/tasks`) - authentification requise

| Methode | Route | Acces | Description |
|---|---|---|---|
| POST | `/api/tasks` | user, manager | Creer une tache sur un projet existant |
| GET | `/api/tasks` | selon visibilite (voir plus bas) | Lister, avec `?search=&statut=&projet=&sortBy=&order=` |
| GET | `/api/tasks/:id` | selon visibilite | Detail d'une tache |
| PUT | `/api/tasks/:id` | selon visibilite | Modifier (sauf l'assignation) |
| DELETE | `/api/tasks/:id` | proprietaire du projet, manager | Supprimer |
| PUT | `/api/tasks/:id/assign` | **manager uniquement** | Assigner la tache a un utilisateur (`{ utilisateurAssigne }`) |

## Tester rapidement avec curl

```bash
# Inscription
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nom":"Ayoub","login":"ayoub","motDePasse":"motdepasse123"}'

# Connexion (recupere le token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"ayoub","motDePasse":"motdepasse123"}'

# Creer un projet (remplace <TOKEN> par le token recu au login)
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"nom":"Mon projet","description":"Un test"}'

# Creer une tache (remplace <ID_PROJET>)
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"titre":"Premiere tache","projet":"<ID_PROJET>"}'
```

## Choix d'implementation (hypotheses faites)

L'enonce laisse quelques points ouverts a l'interpretation ; voici les choix faits pour ce projet :

- **Role a l'inscription** : le champ `role` est accepte a l'inscription pour pouvoir creer facilement un compte `manager` de test. En production, on ne laisserait jamais un utilisateur choisir son propre role.
- **Visibilite des taches** : l'enonce ne precise pas qui voit quelles taches. Ici, un `user` voit les taches des projets dont il est proprietaire, ainsi que les taches qui lui sont assignees ; un `manager` voit tout.
- **Modification d'une tache** : le proprietaire du projet, l'utilisateur assigne, ou un manager peuvent modifier le titre/statut/description/deadline. Seul un manager peut changer l'utilisateur assigne (meme via la route generique `PUT /:id`).
- **Suppression d'une tache** : reservee au proprietaire du projet ou a un manager (pas a l'utilisateur simplement assigne).

## Pistes d'amelioration possibles

- Pagination (`page`, `limit`) sur les listes
- Tests automatises (Jest + Supertest)
- Validation plus poussee des entrees (ex. `express-validator`)
- Rafraichissement de token (refresh token)

## Historique Git

Ce repo contient un historique de commits progressif (configuration -> modeles -> middlewares -> authentification -> projets -> taches -> serveur -> documentation), qui depasse le minimum de 8 commits demande.
