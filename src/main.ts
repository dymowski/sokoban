import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

const target = document.getElementById('app');
if (!target) {
  throw new Error('Brak elementu #app w index.html — gra nie ma się gdzie wyrenderować.');
}

export default mount(App, { target });
