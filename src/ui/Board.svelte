<script lang="ts">
  import type { GameState } from '../domain/game';
  import { t } from '../i18n';

  let { game }: { game: GameState } = $props();

  const level = $derived(game.level);
  const cells = $derived(Array.from({ length: level.width * level.height }, (_, i) => i));
  const px = $derived(game.player % level.width);
  const py = $derived(Math.floor(game.player / level.width));

  const kind = (i: number) =>
    level.walls.has(i) ? 'wall' : level.floor.has(i) ? 'floor' : 'outside';
</script>

<div
  class="board"
  data-testid="board"
  data-level-id={level.id}
  role="img"
  aria-label={t('boardLabel', { name: level.name })}
  style:--cols={level.width}
  style:--rows={level.height}
>
  {#each cells as i (i)}
    <div class="tile {kind(i)}" class:goal={level.goals.has(i)}>
      {#if game.boxes.has(i)}
        <div class="box" class:on-goal={level.goals.has(i)}></div>
      {/if}
    </div>
  {/each}
  <div
    class="player facing-{game.facing}"
    data-testid="player"
    data-pos="{px},{py}"
    style:transform="translate(calc({px} * var(--tile)), calc({py} * var(--tile)))"
  >
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle class="body" cx="50" cy="52" r="34" />
      <g class="eyes">
        <circle class="eye" cx="38" cy="46" r="10" />
        <circle class="eye" cx="62" cy="46" r="10" />
        <circle class="pupil" cx="38" cy="46" r="5" />
        <circle class="pupil" cx="62" cy="46" r="5" />
      </g>
    </svg>
  </div>
</div>

<style>
  .board {
    --tile: min(52px, calc((100vw - 32px) / var(--cols)), calc((100dvh - 260px) / var(--rows)));
    position: relative;
    display: grid;
    grid-template-columns: repeat(var(--cols), var(--tile));
    grid-template-rows: repeat(var(--rows), var(--tile));
  }
  .tile {
    position: relative;
  }
  .floor {
    background: var(--floor);
  }
  .wall {
    background:
      linear-gradient(var(--wall-mortar) 0 0) 0 50% / 100% 2px no-repeat,
      linear-gradient(var(--wall-mortar) 0 0) 50% 0 / 2px 50% no-repeat,
      linear-gradient(var(--wall-mortar) 0 0) 20% 100% / 2px 50% no-repeat,
      var(--wall);
    border-radius: 3px;
    box-shadow: inset 0 0 0 1px var(--wall-mortar);
  }
  .goal::after {
    content: '';
    position: absolute;
    inset: 34%;
    border-radius: 50%;
    background: var(--goal);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--goal) 35%, transparent);
  }
  .box {
    position: absolute;
    inset: 8%;
    z-index: 1;
    border-radius: 4px;
    background:
      linear-gradient(45deg, transparent 46%, var(--box-line) 46% 54%, transparent 54%),
      linear-gradient(-45deg, transparent 46%, var(--box-line) 46% 54%, transparent 54%), var(--box);
    box-shadow:
      inset 0 0 0 3px var(--box-line),
      0 2px 3px rgb(0 0 0 / 25%);
    transition: background-color 120ms;
  }
  .box.on-goal {
    background:
      linear-gradient(45deg, transparent 46%, var(--box-done-line) 46% 54%, transparent 54%),
      linear-gradient(-45deg, transparent 46%, var(--box-done-line) 46% 54%, transparent 54%),
      var(--box-done);
    box-shadow:
      inset 0 0 0 3px var(--box-done-line),
      0 2px 3px rgb(0 0 0 / 25%);
  }
  .player {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: var(--tile);
    height: var(--tile);
    transition: transform 90ms ease-out;
  }
  .player svg {
    width: 100%;
    height: 100%;
  }
  .body {
    fill: var(--player);
    stroke: var(--player-edge);
    stroke-width: 4;
  }
  .eye {
    fill: #fff;
  }
  .pupil {
    fill: #1d1d1f;
    transition: transform 90ms;
  }
  .facing-left .pupil {
    transform: translate(-4px, 0);
  }
  .facing-right .pupil {
    transform: translate(4px, 0);
  }
  .facing-up .pupil {
    transform: translate(0, -4px);
  }
  .facing-down .pupil {
    transform: translate(0, 4px);
  }
  @media (prefers-reduced-motion: reduce) {
    .player,
    .pupil {
      transition: none;
    }
  }
</style>
