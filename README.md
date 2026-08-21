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

- Search Pokémon by name or ID
- Retrieve Pokémon data directly from PokéAPI
- Handle invalid Pokémon names gracefully
- Provide clear empty and error states
- Press `/` to focus the search bar from anywhere on the page

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
- Playable Pokémon cry (audio)

### Favorites

- Add and remove Pokémon from favorites
- Persist favorites using browser local storage
- Dedicated favorites view

### Pokémon Comparison

- Select two Pokémon for comparison
- Compare key statistics:
  - HP
  - Attack
  - Defense
  - Special Attack
  - Special Defense
  - Speed
- Side-by-side comparison stage with visual stat bars
- Comparison full modal when the comparison limit is reached

### Themes

- Dark mode
- Light mode
- Persistent theme preference

### Audio

- UI interaction sounds (navigation, favorites, comparison, confirmations)
- Pokémon cry playback on the detail page
- Vault transition sound on page navigation

### Animations

- Vault door open/close transition between pages
- Card entrance and hover micro-interactions
- Stat bar animations on the detail and comparison pages
- Skeleton loading states
- Respects `prefers-reduced-motion`

### Accessibility

- Skip to main content link
- Keyboard navigation support
- Focus-visible states on interactive elements
- ARIA labels and roles
- Reduced motion support

### UI States

The application includes dedicated states for:

- Loading
- API errors
- Network errors
- Pokémon not found
- Empty search results
- Empty favorites
- Comparison full

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

- React 19
- TypeScript
- Vite
- React Router DOM
- CSS (custom properties, responsive media queries)

### API

- [PokéAPI](https://pokeapi.co/api/v2/)

### Development

- Vite HMR
- Oxlint
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
│   ├── assets/
│   │   └── vault/
│   ├── icons.svg
│   └── logo.png
│
├── src/
│   ├── assets/
│   │   ├── branding/
│   │   ├── fonts/
│   │   └── vault/
│   │
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
│   │   ├── ComparisonFullModal.tsx
│   │   ├── CryButton.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── ErrorState.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── VaultLink.tsx
│   │   └── VaultTransitionContext.tsx
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Favorites.tsx
│   │   ├── Comparison.tsx
│   │   ├── PokemonDetails.tsx
│   │   └── NotFound.tsx
│   │
│   ├── services/
│   │   └── pokemonApi.ts
│   │
│   ├── hooks/
│   │   ├── usePokemon.ts
│   │   ├── useFavorites.ts
│   │   ├── useComparison.ts
│   │   ├── useTheme.ts
│   │   ├── useAudioSystem.ts
│   │   ├── useCry.ts
│   │   └── useInView.ts
│   │
│   ├── context/
│   │   └── AppStateContext.tsx
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
│   ├── mock/
│   │   └── pokemonMockData.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
└── README.md
```

---

## Setup & Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## Deployment

The project includes a [`vercel.json`](vercel.json) configuration for deployment on Vercel. The rewrite rule ensures client-side routing works correctly by directing all routes to `index.html`.

---

## Browser Support

- Modern browsers with CSS custom properties and `AudioContext` support
- Responsive layouts tested for desktop, tablet, and mobile viewports

---

## License

This project is private and intended for evaluation purposes.

---

[PokéAPI]: https://pokeapi.co/
