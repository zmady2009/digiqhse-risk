# Plan de tests - Parcours Risques

## Tests unitaires
- **useListRisks / useActionPlans / useDocuments**
  - Vérifier les paramètres transmis à `apiClient` et l'invalidation des clés (`riskKeys`).
  - Simuler une erreur réseau (ApiError) pour garantir le mapping RFC7807.
- **RiskTable**
  - Rendu de l'état vide lorsque `data.meta.totalItems = 0`.
  - Vérifier le déclenchement des callbacks de tri et de sélection de ligne.
  - Validation de la virtualisation (scroll + nombre d'items montés).
- **RiskEvaluationRoute**
  - Conversion des liens de pièces jointes en objets `{ name, url }`.
  - Déclenchement de l'autosave (mock `useUpdateAssessment`) après debounce.

## Tests d'intégration (React Testing Library)
- Charger la page liste avec `QueryClientProvider` mocké et vérifier les transitions entre `loading`, `success` et `error`.
- Simuler une recherche (changement d'input) et vérifier la mise à jour de la table et de l'URL.
- Tester l'écran détail : affichage des plans d'action / documents et création via les dialogues.
- Tester l'écran d'évaluation : navigation par stepper, validation Zod, gestion du conflit 409.

## Tests End-to-End (Playwright)
1. **Lecture simple**
   - Authentification par saisie de la clé API (mock backend).
   - Chargement de la liste des risques avec données fictives.
   - Vérification du tri par défaut (score décroissant) et du nombre d'éléments paginés.
2. **Filtrage et pagination**
   - Appliquer un filtre statut = `open`.
   - Vérifier la mise à jour des résultats et la persistance de la sélection lors du changement de page.
3. **Navigation détail & évaluation**
   - Depuis la ligne d'un risque, naviguer vers l'écran de détail.
   - Ajouter un plan d'action puis un document et vérifier leur présence.
   - Ouvrir l'écran d'évaluation, compléter les étapes et valider l'autosave (vérifier la notification "Dernière sauvegarde").
   - Retour à la liste en conservant les filtres initiaux.
