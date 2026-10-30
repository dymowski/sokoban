<script lang="ts">
  import { t } from '../i18n';

  interface Props {
    /** Level number (1-based) and the number of all levels. */
    number: number;
    count: number;
    name: string;
    moves: number;
    pushes: number;
    onGoals: number;
    total: number;
    canUndo: boolean;
    onUndo: () => void;
    onReset: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onLevels: () => void;
  }

  let {
    number,
    count,
    name,
    moves,
    pushes,
    onGoals,
    total,
    canUndo,
    onUndo,
    onReset,
    onPrevious,
    onNext,
    onLevels,
  }: Props = $props();
</script>

<section class="hud">
  <dl>
    <div>
      <dt>{t('level')}</dt>
      <dd>
        <span data-testid="level-number">{t('levelCounter', { number, total: count })}</span>
        <span class="name">{name}</span>
      </dd>
    </div>
    <div>
      <dt>{t('moves')}</dt>
      <dd data-testid="moves">{moves}</dd>
    </div>
    <div>
      <dt>{t('pushes')}</dt>
      <dd data-testid="pushes">{pushes}</dd>
    </div>
    <div>
      <dt>{t('boxes')}</dt>
      <dd data-testid="boxes">{onGoals}/{total}</dd>
    </div>
  </dl>
  <div class="actions">
    <button type="button" onclick={onPrevious} disabled={number <= 1}>
      <span aria-hidden="true">◀</span>
      {t('previous')} <kbd>P</kbd>
    </button>
    <button type="button" onclick={onNext} disabled={number >= count}>
      {t('next')} <kbd>N</kbd>
      <span aria-hidden="true">▶</span>
    </button>
    <button type="button" onclick={onLevels}>{t('levels')} <kbd>L</kbd></button>
    <button type="button" onclick={onUndo} disabled={!canUndo}>{t('undo')} <kbd>Z</kbd></button>
    <button type="button" onclick={onReset}>{t('reset')} <kbd>R</kbd></button>
  </div>
</section>

<style>
  .hud {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 12px 24px;
  }
  dl {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 20px;
    margin: 0;
  }
  dl div {
    text-align: center;
  }
  dt {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
  }
  dd {
    margin: 0;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .name {
    margin-left: 4px;
    font-weight: 400;
    color: var(--muted);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }
</style>
