// Simple Data-fetching
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'
import {PokemonDataView, fetchPokemon, PokemonInfoFallback, PokemonErrorBoundary} from '../pokemon'
import {createResource} from '../utils'

const resource = createResource(fetchPokemon('pikachu'))

function PokemonInfo() {
  const pokemon = resource.read()

  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

function App() {
  return (
    <div className="pokemon-info-app">
      <div className="pokemon-info">
        <React.Suspense fallback={<PokemonInfoFallback name="Pikachu" />}>
          <PokemonErrorBoundary>
            <PokemonInfo />
          </PokemonErrorBoundary>
        </React.Suspense>
      </div>
    </div>
  )
}

export default App
