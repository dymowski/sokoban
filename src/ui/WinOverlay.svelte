<script lang="ts">
  import { t } from '../i18n';

  let { moves, pushes, onNext }: { moves: number; pushes: number; onNext: () => void } = $props();
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="win-title">
  <div class="card">
    <h2 id="win-title">{t('winTitle')}</h2>
    <p>{t('winText', { moves, pushes })}</p>
    <button type="button" class="primary" onclick={onNext}>{t('winNext')} <kbd>Enter</kbd></button>
  </div>
</div>

<style>
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--bg) 55%, transparent);
    backdrop-filter: blur(2px);
  }
  .card {
    padding: 20px 28px;
    border-radius: 10px;
    background: var(--surface);
    box-shadow: 0 8px 24px rgb(0 0 0 / 25%);
    text-align: center;
  }
  h2 {
    margin: 0 0 6px;
    font-size: 1.5rem;
  }
  p {
    margin: 0 0 14px;
  }
</style>
