import { mount } from 'svelte';
import App from './App.svelte';
import './global.css';

// Boot game engine (creates bus, state, systems)
import '$lib/engine.js';

// Start playtest logger (records all events, export with Ctrl+Shift+L or console)
import '$lib/playlog.js';

const app = mount(App, { target: document.getElementById('app') });

export default app;
