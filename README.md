# cohabitat.cc
Cohabitat Club Cyclistes

[![Playwright Tests](https://github.com/rngadam/cohabitat.cc/actions/workflows/playwright.yml/badge.svg)](https://github.com/rngadam/cohabitat.cc/actions/workflows/playwright.yml)

## Projet
Cohabitat.cc est une plateforme web ("Open Source Building OS") présentant un concept de vie utopique pour cyclistes urbains. Le bâtiment propose un design axé sur la qualité de vie supérieure partagée, offrant un équilibre entre intimité (suites privées) et impact social (cuisine partagée, restaurant solidaire, fablab).

## Liens
- **Site web:** [cohabitat.cc](https://cohabitat.cc)
- **Facebook:** [Cohabitat.cc Facebook Page](https://www.facebook.com/profile.php?id=61573297292271)

## Développement

### Installation
```bash
npm install
```

### Développement local
```bash
npm run dev
```

### Tests
```bash
# Run all tests
npm test

# Run tests with browser UI visible
npm run test:headed

# Run tests with interactive UI
npm run test:ui
```

Les tests utilisent Playwright pour vérifier la fonctionnalité du site, incluant la navigation, les composants header/footer, et la responsivité.
