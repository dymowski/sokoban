import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

const target = document.getElementById('app');
if (!target) {
  throw new Error('No #app element in index.html — the game has nowhere to render.');
}

export default mount(App, { target });
