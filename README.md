# Digiqhse-risk
# Digirisk — Option B Starter (Headless Dolibarr backend + React Front)

Ce dépôt est un **squelette** pour lancer l’Option *frontend dédié* (React+TS) consommant **uniquement** l’API REST Dolibarr/Digirisk.

## Contenu
- `openapi.yaml` : contrat d’API (MVP) — à enrichir au fil des itérations
- `frontend/` : application React+TS (Vite), TanStack Query, axios intercepteur, AuthProvider
- `ops/` : `docker-compose.yml` (dev), `nginx.conf` (exemple minimal)

## Démarrage rapide (dev)
```bash
cd frontend
npm install
npm run dev
```
Par défaut, l’app lit :
- `API_BASE_URL` (ex: `http://localhost:8080/api/index.php`)
- `AUTH_HEADER` (par défaut `DOLAPIKEY`)
- `API_KEY` (clé pour dev local)

Créez un fichier `.env` dans `frontend/` si besoin :
```
VITE_API_BASE_URL=http://localhost:8080/api/index.php
VITE_AUTH_HEADER=DOLAPIKEY
VITE_API_KEY=changeme
```

## Lancer en Docker (dev)
```bash
docker compose -f ops/docker-compose.yml up --build
```
Cela lance le **front** (port 5173). Le backend Dolibarr **n’est pas** inclus (à brancher sur votre instance).

## Scripts utiles
- **Lint/Tests/Build** : `npm run lint`, `npm run test`, `npm run build`
- **OpenAPI** :
  - `npm run openapi:lint` — lint du schéma
  - `npm run openapi:types` — générer types/clients (ex: orval/openapi-typescript)

## Prompts “Codex” recommandés
- *“Voici `openapi.yaml`. Propose les modèles/types, génère le client TS et les hooks React Query (`useListRisks`, `useRisk`, `useCreateAssessment`). Inclure les invalidations de cache.”*
- *“Améliore la table des risques (virtualisation, filtres server-side persistés dans l’URL, tests RTL).”*
- *“Génère le workflow GitHub Actions (lint/test/build) et un Dockerfile multi-stage pour le front.”*

## Sécurité (rappels)
- Pas de stockage persistant de la clé API dans `localStorage`. Ici elle est chargée depuis des variables d’environnement Vite pour le développement, ou fournie via un **proxy** avec cookie HttpOnly en prod.
- Activez CORS **restrictif** côté backend ; ajoutez des **headers** de sécurité au reverse proxy (CSP, HSTS, etc.).

## Dépots Github
- **Dolibarr** : https://github.com/Dolibarr/dolibarr
- **Digirisk** : https://github.com/Evarisk/Digirisk
- **Sature** : https://github.com/Evarisk/Saturne
---
License: GPL-3.0-compatible (se conformer à Dolibarr/Digirisk).

