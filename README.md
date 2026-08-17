# Pokémon Explorer

A modern, responsive Pokémon discovery web application built with React and TypeScript.

Pokémon Explorer uses the public [PokéAPI] to provide an interactive interface for discovering Pokémon, exploring their types and statistics, searching the Pokédex, and comparing Pokémon.

The project is being developed as part of a frontend engineering evaluation, with a focus on clean UI/UX, API integration, responsive design, reusable components, accessibility, and code quality.

---

## Features

### Pokémon Discovery

- Browse Pokémon through a responsive card-based interface
- Display Pokémon artwork, name, Pokédex ID, types, and relevant statistics
- Load additional Pokémon using pagination / Load More
- Responsive grid for desktop, tablet, and mobile

### Search

- Search Pokémon by name
- Retrieve Pokémon data directly from PokéAPI
- Handle invalid Pokémon names gracefully
- Provide clear empty and error states

### Filtering & Sorting

- Filter Pokémon by type
- Sort Pokémon by:
  - ID
  - Name
  - Attack
  - Speed
  - HP

### Pokémon Details

Each Pokémon has a dedicated detail view containing:

- Pokémon artwork
- Pokédex ID
- Name
- Type(s)
- Height
- Weight
- Abilities
- Base statistics
- Move information

### Favorites

- Add and remove Pokémon from favorites
- Persist favorites using browser local storage
- Dedicated favorites view

### Pokémon Comparison

- Select two Pokémon for comparison
- Compare key statistics such as:
  - HP
  - Attack
  - Defense
  - Speed

### Themes

- Dark mode
- Light mode
- Persistent theme preference

### UI States

The application includes dedicated states for:

- Loading
- API errors
- Network errors
- Pokémon not found
- Empty search results
- Empty favorites

### Responsive Design

Designed for:

- Desktop
- Tablet
- Mobile

---

## Design

Pokémon Explorer follows a premium dark Pokémon-inspired visual direction.

The design combines:

- Pokémon artwork
- Pokémon type colors
- Pokédex-inspired identifiers
- Premium dark surfaces
- Clean typography
- Rounded cards
- Subtle shadows
- Type-specific visual atmospheres
- Responsive layouts
- Restrained micro-interactions

The primary design language is intended to feel polished and modern while retaining a clear Pokémon identity.

### Typography

The interface uses two primary fonts:

- **Gang of Three** — display typography
- **Inter** — UI and body typography

If Gang of Three is unavailable in the environment, Shikamaru is used as the display-font fallback.

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### API

- PokéAPI

### Development

- Vite HMR
- ESLint / Oxlint tooling
- TypeScript

---

## API

Pokémon data is provided by the public PokéAPI:

https://pokeapi.co/api/v2/

PokéAPI does not require an API key.

The application communicates with the API through a dedicated service layer rather than making API requests directly inside UI components.

---

## Project Structure

```text
pokemon-explorer/
│
├── public/
│   └── assets/
│
├── src/
│   ├── components/
│   │   ├── Navigation.tsx
│   │   ├── SearchBar.tsx
│   │   ├── TypeFilter.tsx
│   │   ├── SortSelect.tsx
│   │   ├── PokemonCard.tsx
│   │   ├── PokemonGrid.tsx
│   │   ├── FeaturedPokemon.tsx
│   │   ├── FavoriteButton.tsx
│   │   ├── CompareButton.tsx
│   │   ├── ComparisonTray.tsx
│   │   ├── PokemonStats.tsx
│   │   ├── PokemonAbilities.tsx
│   │   ├── PokemonMoves.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── ErrorState.tsx
│   │   └── EmptyState.tsx
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Favorites.tsx
│   │   ├── Comparison.tsx
│   │   └── PokemonDetails.tsx
│   │
│   ├── services/
│   │   └── pokemonApi.ts
│   │
│   ├── hooks/
│   │   ├── usePokemon.ts
│   │   ├── useFavorites.ts
│   │   └── useTheme.ts
│   │
│   ├── types/
│   │   └── pokemon.ts
│   │
│   ├── utils/
│   │   ├── pokemonTypeColors.ts
│   │   ├── formatPokemonId.ts
│   │   └── formatPokemonName.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .gitignore