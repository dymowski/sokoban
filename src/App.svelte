<script lang="ts">
  import { LEVELS } from './levels/levels';
  import { parseLevel, LevelError, type LevelDef } from './domain/level';
  import {
    boxesOnGoals,
    isSolved,
    move,
    newGame,
    reset,
    undo,
    type GameState,
  } from './domain/game';
  import { keyToAction } from './domain/keys';
  import { pickLevelId } from './domain/random';
  import { readLastLevelId, sessionStore, writeLastLevelId, type KeyValueStore } from './storage';
  import { t } from './i18n';
  import Board from './ui/Board.svelte';
  import Hud from './ui/Hud.svelte';
  import WinOverlay from './ui/WinOverlay.svelte';

  interface Props {
    levels?: readonly LevelDef[];
    rng?: () => number;
    storage?: KeyValueStore | null;
  }

  let { levels = LEVELS, rng = Math.random, storage = sessionStore() }: Props = $props();

  type Loaded = { ok: true; game: GameState } | { ok: false; id: string; message: string };

  function load(lastId: string | null): Loaded {
    const id = pickLevelId(
      levels.map((l) => l.id),
      lastId,
      rng,
    );
    writeLastLevelId(storage, id);
    const def = levels.find((l) => l.id === id) as LevelDef;
    try {
      return { ok: true, game: newGame(parseLevel(def)) };
    } catch (e) {
      if (e instanceof LevelError) return { ok: false, id, message: e.message };
      throw e;
    }
  }

  // Initial value only, on purpose: the level is picked once when the page loads.
  // svelte-ignore state_referenced_locally
  let current = $state.raw<Loaded>(load(readLastLevelId(storage)));

  const solved = $derived(current.ok && isSolved(current.game));

  function nextLevel() {
    current = load(current.ok ? current.game.level.id : current.id);
  }

  function setGame(game: GameState) {
    if (current.ok && current.game !== game) current = { ok: true, game };
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const action = keyToAction(event.key);
    if (!action) return;
    // Enter on a focused button is handled by the button itself.
    if (action.type === 'confirm' && event.target instanceof HTMLButtonElement) return;
    event.preventDefault();
    if (!current.ok) {
      if (action.type === 'next' || action.type === 'confirm') nextLevel();
      return;
    }
    const game = current.game;
    switch (action.type) {
      case 'move':
        if (!solved) setGame(move(game, action.dir));
        break;
      case 'undo':
        setGame(undo(game));
        break;
      case 'reset':
        setGame(reset(game));
        break;
      case 'next':
        nextLevel();
        break;
      case 'confirm':
        if (solved) nextLevel();
        break;
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<main>
  <header>
    <h1>{t('title')}</h1>
    <p class="tagline">{t('tagline')}</p>
  </header>

  {#if current.ok}
    {@const game = current.game}
    <Hud
      name={game.level.name}
      moves={game.moves}
      pushes={game.pushes}
      onGoals={boxesOnGoals(game)}
      total={game.level.goals.size}
      canUndo={game.history.length > 0}
      onUndo={() => setGame(undo(game))}
      onReset={() => setGame(reset(game))}
      onNext={nextLevel}
    />
    <div class="stage">
      <Board {game} />
      {#if solved}
        <WinOverlay moves={game.moves} pushes={game.pushes} onNext={nextLevel} />
      {/if}
    </div>
  {:else}
    <section class="error" role="alert">
      <h2>{t('errorTitle')}</h2>
      <p class="detail">{current.message}</p>
      <p>{t('errorHint')}</p>
      <button type="button" onclick={nextLevel}>{t('errorRetry')}</button>
    </section>
  {/if}

  <ul class="legend">
    <li>{t('keysMove')}</li>
    <li>{t('keysUndo')}</li>
    <li>{t('keysReset')}</li>
    <li>{t('keysNext')}</li>
  </ul>
</main>

<style>
  main {
    max-width: 960px;
    margin: 0 auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  header {
    text-align: center;
  }
  h1 {
    margin: 0;
    font-size: 1.75rem;
    letter-spacing: 0.04em;
  }
  .tagline {
    margin: 4px 0 0;
    color: var(--muted);
  }
  .stage {
    position: relative;
  }
  .legend {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 20px;
    color: var(--muted);
    font-size: 0.875rem;
  }
  .error {
    max-width: 520px;
    padding: 16px 20px;
    border: 1px solid var(--danger);
    border-radius: 8px;
    background: var(--surface);
  }
  .error h2 {
    margin: 0 0 8px;
    font-size: 1.125rem;
  }
  .detail {
    font-family: ui-monospace, monospace;
    font-size: 0.875rem;
  }
</style>
