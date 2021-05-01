// Cache resources
// http://localhost:3000/isolated/exercise/04.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary,
} from '../pokemon'
import {createResource} from '../utils'

function PokemonInfo({pokemonResource}) {
  const pokemon = pokemonResource.read()
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
}

const PokemonContext = React.createContext()

const usePokemonContext = () => {
  return React.useContext(PokemonContext)
}

const PokemonCacheProvider = ({children, cacheTime = 5000}) => {
  const cache = React.useRef({})
  const expirations = React.useRef({})

  const getPokemonResource = React.useCallback(
    name => {
      let resource = cache.current[name]
      if (!resource) {
        resource = createPokemonResource(name)
        cache.current[name] = resource
      }
      expirations.current[name] = Date.now() + cacheTime
      return resource
    },
    [cacheTime],
  )

  React.useEffect(() => {
    const interval = setInterval(() => {
      for (const [name, time] of Object.entries(expirations.current)) {
        if (Date.now() > time) {
          delete cache.current[name]
        }
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <PokemonContext.Provider value={getPokemonResource}>
      {children}
    </PokemonContext.Provider>
  )
}

function createPokemonResource(pokemonName) {
  return createResource(fetchPokemon(pokemonName))
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG)
  const [pokemonResource, setPokemonResource] = React.useState(null)
  const getPokemonResource = usePokemonContext()

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    startTransition(() => {
      setPokemonResource(getPokemonResource(pokemonName))
    })
  }, [pokemonName, startTransition, getPokemonResource])

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className={`pokemon-info ${isPending ? 'pokemon-loading' : ''}`}>
        {pokemonResource ? (
          <PokemonErrorBoundary
            onReset={handleReset}
            resetKeys={[pokemonResource]}
          >
            <React.Suspense
              fallback={<PokemonInfoFallback name={pokemonName} />}
            >
              <PokemonInfo pokemonResource={pokemonResource} />
            </React.Suspense>
          </PokemonErrorBoundary>
        ) : (
          'Submit a pokemon'
        )}
      </div>
    </div>
  )
}

export default function AppWrapper() {
  return (
    <PokemonCacheProvider cacheTime={5000}>
      <App />
    </PokemonCacheProvider>
  )
}
