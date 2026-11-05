import './style.css';
import exampleRoster from '../example_CTA.txt?raw';
import { buildInviteString, parseGroups } from './parser.js';

const rosterInput = document.querySelector('#roster');
const generateButton = document.querySelector('#generate');
const loadExampleButton = document.querySelector('#load-example');
const status = document.querySelector('#status');
const results = document.querySelector('#results');

let renderedGroups = [];

function copyWithFallback(text) {
  const helper = document.createElement('textarea');
  helper.value = text;
  helper.setAttribute('readonly', '');
  helper.style.position = 'fixed';
  helper.style.opacity = '0';
  document.body.append(helper);
  helper.select();
  document.execCommand('copy');
  helper.remove();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    copyWithFallback(text);
  }
}

function createGroupCard(group, index) {
  const inviteString = buildInviteString(group.players);
  const card = document.createElement('article');
  card.className = 'group-card';

  const header = document.createElement('header');
  header.className = 'group-header';

  const title = document.createElement('h2');
  title.textContent = group.name;

  const count = document.createElement('span');
  count.className = 'group-count';
  const total = group.players.length;
  count.textContent = `${total} ${total === 1 ? 'jugador' : 'jugadores'}`;

  header.append(title, count);

  const output = document.createElement('textarea');
  output.className = 'group-output';
  output.readOnly = true;
  output.spellcheck = false;
  output.value = inviteString;
  output.setAttribute('aria-label', `Comandos de ${group.name}`);

  const button = document.createElement('button');
  button.className = 'btn btn-primary copy-button';
  button.type = 'button';
  button.textContent = 'Copiar en portapapeles';
  button.disabled = total === 0;

  if (total === 0) {
    button.textContent = 'Sin jugadores';
  } else {
    button.addEventListener('click', async () => {
      await copyText(renderedGroups[index].text);
      button.textContent = '¡Copiado!';
      button.classList.add('is-copied');

      window.setTimeout(() => {
        button.textContent = 'Copiar en portapapeles';
        button.classList.remove('is-copied');
      }, 1500);
    });
  }

  card.append(header, output, button);
  return card;
}

function renderGroups(groups) {
  results.replaceChildren();
  renderedGroups = groups.map((group) => ({
    name: group.name,
    text: buildInviteString(group.players),
    players: group.players,
  }));

  if (groups.length === 0) {
    status.textContent = 'No se detectaron grupos. Usá encabezados como "PARTY 1 :".';
    return;
  }

  const totalPlayers = groups.reduce((sum, group) => sum + group.players.length, 0);
  const groupWord = groups.length === 1 ? 'grupo' : 'grupos';

  status.textContent = `${groups.length} ${groupWord} detectado${groups.length === 1 ? '' : 's'} · ${totalPlayers} ${totalPlayers === 1 ? 'jugador' : 'jugadores'}`;

  groups.forEach((group, index) => {
    results.append(createGroupCard(group, index));
  });
}

function generate() {
  const groups = parseGroups(rosterInput.value);

  if (!rosterInput.value.trim()) {
    renderedGroups = [];
    results.replaceChildren();
    status.textContent = 'Pegá un roster para generar los comandos.';
    return;
  }

  renderGroups(groups);
}

generateButton.addEventListener('click', generate);

rosterInput.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    generate();
  }
});

loadExampleButton.addEventListener('click', () => {
  rosterInput.value = exampleRoster.trim();
  generate();
});
