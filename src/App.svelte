<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
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
  import { hashOf, levelFromHash } from './domain/navigation';
  import { readHash, writeHash } from './url';
  import { t } from './i18n';
  import Board from './ui/Board.svelte';
  import Hud from './ui/Hud.svelte';
  import LevelPicker from './ui/LevelPicker.svelte';
  import WinOverlay from './ui/WinOverlay.svelte';

  interface Props {
    levels?: readonly LevelDef[];
  }

  let { levels = LEVELS }: Props = $props();

  type Loaded = { ok: true; game: GameState } | { ok: false; message: string };
  type Current = { readonly index: number; readonly loaded: Loaded };

  function load(index: number): Current {
    const def = levels[index];
    if (!def) {
      throw new Error(`No level ${index + 1} — add levels in src/levels/levels.ts`);
    }
    writeHash(hashOf(index));
    try {
      return { index, loaded: { ok: true, game: newGame(parseLevel(def)) } };
    } catch (e) {
      if (e instanceof LevelError) return { index, loaded: { ok: false, message: e.message } };
      throw e;
    }
  }

  // Initial value only, on purpose: later the level changes through goTo().
  // svelte-ignore state_referenced_locally
  let current = $state.raw<Current>(load(levelFromHash(readHash(), levels.length)));
  let pickerOpen = $state(false);

  const isLast = $derived(current.index === levels.length - 1);
  const solved = $derived(current.loaded.ok && isSolved(current.loaded.game));

  function goTo(index: number) {
    pickerOpen = false;
    if (index < 0 || index >= levels.length) return;
    current = load(index);
  }

  const next = () => goTo(current.index + 1);
  const previous = () => goTo(current.index - 1);
  const afterWin = () => goTo(isLast ? 0 : current.index + 1);

  function setGame(game: GameState) {
    if (current.loaded.ok && current.loaded.game !== game) {
      current = { index: current.index, loaded: { ok: true, game } };
    }
  }

  function onHashChange() {
    const index = levelFromHash(readHash(), levels.length);
    if (index !== current.index) goTo(index);
    else writeHash(hashOf(index));
  }

  // Keys that are down and not released yet: one arrow press moves the player one square.
  const down = new SvelteSet<string>();

  function onKeyup(event: KeyboardEvent) {
    down.delete(event.key);
  }

  // A key released outside the window never sends keyup.
  function onBlur() {
    down.clear();
  }

  function onKeydown(event: KeyboardEvent) {
    const held = event.repeat || down.has(event.key);
    down.add(event.key);
    // The open level list handles its own keys.
    if (pickerOpen) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const action = keyToAction(event.key);
    if (!action) return;
    // Enter on a focused button is handled by the button itself.
    if (action.type === 'confirm' && event.target instanceof HTMLButtonElement) return;
    event.preventDefault();
    switch (action.type) {
      case 'next':
        next();
        return;
      case 'previous':
        previous();
        return;
      case 'levels':
        pickerOpen = true;
        return;
    }
    if (!current.loaded.ok) return;
    const game = current.loaded.game;
    switch (action.type) {
      case 'move':
        if (!solved && !held) setGame(move(game, action.dir));
        break;
      case 'undo':
        setGame(undo(game));
        break;
      case 'reset':
        setGame(reset(game));
        break;
      case 'confirm':
        if (solved) afterWin();
        break;
    }
  }
</script>

<svelte:window
  onkeydown={onKeydown}
  onkeyup={onKeyup}
  onblur={onBlur}
  onhashchange={onHashChange}
/>

<main>
  <header>
    <h1>{t('title')}</h1>
    <p class="tagline">{t('tagline')}</p>
  </header>

  {#if current.loaded.ok}
    {@const game = current.loaded.game}
    <Hud
      number={current.index + 1}
      count={levels.length}
      name={game.level.name}
      moves={game.moves}
      pushes={game.pushes}
      onGoals={boxesOnGoals(game)}
      total={game.level.goals.size}
      canUndo={game.history.length > 0}
      onUndo={() => setGame(undo(game))}
      onReset={() => setGame(reset(game))}
      onPrevious={previous}
      onNext={next}
      onLevels={() => (pickerOpen = true)}
    />
    <div class="stage">
      <Board {game} />
      {#if solved}
        <WinOverlay
          moves={game.moves}
          pushes={game.pushes}
          last={isLast}
          count={levels.length}
          onNext={afterWin}
        />
      {/if}
    </div>
  {:else}
    <section class="error" role="alert">
      <h2>{t('errorTitle', { number: current.index + 1 })}</h2>
      <p class="detail">{current.loaded.message}</p>
      <p>{t('errorHint')}</p>
      <button type="button" onclick={() => (pickerOpen = true)}>{t('errorRetry')}</button>
    </section>
  {/if}

  {#if pickerOpen}
    <LevelPicker
      names={levels.map((l) => l.name)}
      current={current.index}
      onPick={goTo}
      onClose={() => (pickerOpen = false)}
    />
  {/if}

  <ul class="legend">
    <li>{t('keysMove')}</li>
    <li>{t('keysUndo')}</li>
    <li>{t('keysReset')}</li>
    <li>{t('keysNext')}</li>
    <li>{t('keysLevels')}</li>
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
