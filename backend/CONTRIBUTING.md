# Guide de Contribution

Merci de votre intérêt pour contribuer à Jure AI !

## Comment contribuer

### Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les Issues
2. Créez une nouvelle Issue avec :
   - Un titre clair et descriptif
   - Une description détaillée du problème
   - Les étapes pour reproduire le bug
   - Le comportement attendu vs le comportement actuel
   - Captures d'écran si applicable
   - Informations sur votre environnement (OS, Node version, etc.)

### Proposer une nouvelle fonctionnalité

1. Créez une Issue pour discuter de la fonctionnalité
2. Décrivez clairement :
   - Le problème que cette fonctionnalité résout
   - Comment elle devrait fonctionner
   - Des exemples d'utilisation

### Soumettre des modifications

1. **Fork** le projet
2. **Créez une branche** pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalite`)
3. **Committez** vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
4. **Push** vers la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une **Pull Request**

## Standards de code

### TypeScript

- Utilisez TypeScript strict mode
- Typez toutes les fonctions et variables
- Évitez `any` autant que possible
- Utilisez des interfaces pour les objets complexes

### Conventions de nommage

- **Variables et fonctions**: camelCase (`myVariable`, `myFunction`)
- **Classes et interfaces**: PascalCase (`MyClass`, `MyInterface`)
- **Constantes**: UPPER_SNAKE_CASE (`MY_CONSTANT`)
- **Fichiers**: kebab-case (`my-file.ts`)

### Structure des commits

Utilisez des messages de commit clairs et descriptifs :

```
type(scope): description courte

Description plus détaillée si nécessaire
```

Types de commits :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatting, point-virgule manquant, etc.
- `refactor`: Refactorisation du code
- `test`: Ajout de tests
- `chore`: Maintenance

Exemples :
```
feat(auth): ajout de l'authentification à deux facteurs
fix(conversation): correction du bug de message dupliqué
docs(readme): mise à jour des instructions d'installation
```

## Tests

Avant de soumettre une Pull Request :

1. Assurez-vous que le code compile (`npm run build`)
2. Testez manuellement vos changements
3. Vérifiez que les endpoints API fonctionnent (`npm run test:api`)
4. Vérifiez que tous les services démarrent (`npm run check:services`)

## Documentation

- Documentez toutes les nouvelles fonctionnalités
- Mettez à jour le README si nécessaire
- Ajoutez des commentaires pour le code complexe
- Mettez à jour l'API_DOCUMENTATION.md pour les nouveaux endpoints

## Questions ?

N'hésitez pas à poser des questions en créant une Issue avec le label "question".

Merci pour votre contribution ! 🎉
