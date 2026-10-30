<script lang="ts">
  import { keyToAction } from '../domain/keys';
  import { gridStep } from '../domain/navigation';
  import { t } from '../i18n';

  interface Props {
    names: readonly string[];
    /** Index of the level being played. */
    current: number;
    onPick: (index: number) => void;
    onClose: () => void;
  }

  let { names, current, onPick, onClose }: Props = $props();

  /** Levels per row: 40 levels make an 8 × 5 grid. */
  const COLUMNS = 8;

  let grid: HTMLOListElement | undefined = $state();
  // Initial value only, on purpose: the selection starts at the level being played.
  // svelte-ignore state_referenced_locally
  let selected = $state(current);

  const focusSelected = () =>
    grid?.querySelectorAll<HTMLButtonElement>('button')[selected]?.focus();

  $effect(focusSelected);

  /** While the list is open it owns the keyboard; App ignores game keys. */
  function onKeydown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const action = keyToAction(event.key);
    if (!action) return;
    switch (action.type) {
      case 'move':
        event.preventDefault();
        selected = gridStep(selected, action.dir, names.length, COLUMNS);
        focusSelected();
        break;
      case 'confirm':
        // Enter on a focused button is handled by the button itself.
        if (event.target instanceof HTMLButtonElement) return;
        event.preventDefault();
        onPick(selected);
        break;
      case 'close':
      case 'levels':
        event.preventDefault();
        onClose();
        break;
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="picker-title">
  <div class="card">
    <h2 id="picker-title">{t('pickerTitle')}</h2>
    <ol class="grid" bind:this={grid} style:--columns={COLUMNS}>
      {#each names as name, i (i)}
        <li>
          <button
            type="button"
            class:current={i === current}
            aria-current={i === current ? 'true' : undefined}
            aria-label={t('levelOption', { number: i + 1, name })}
            title={name}
            onclick={() => onPick(i)}
            onfocus={() => (selected = i)}>{i + 1}</button
          >
        </li>
      {/each}
    </ol>
    <p class="hint">{t('pickerHint')}</p>
    <button type="button" onclick={onClose}>{t('pickerClose')} <kbd>Esc</kbd></button>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: grid;
    place-items: center;
    padding: 16px;
    background: color-mix(in srgb, var(--bg) 70%, transparent);
    backdrop-filter: blur(2px);
  }
  .card {
    max-width: 100%;
    padding: 20px;
    border-radius: 10px;
    background: var(--surface);
    box-shadow: 0 8px 24px rgb(0 0 0 / 25%);
    text-align: center;
  }
  h2 {
    margin: 0 0 14px;
    font-size: 1.25rem;
  }
  .grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(var(--columns), minmax(0, 2.75rem));
    gap: 6px;
  }
  .grid button {
    width: 100%;
    padding: 8px 0;
    font-variant-numeric: tabular-nums;
  }
  .grid button.current {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }
  .hint {
    margin: 14px 0 12px;
    color: var(--muted);
    font-size: 0.875rem;
  }
</style>
