import './style.css';
import exampleRoster from '../example_CTA.txt?raw';
import {
  DEFAULT_CUSTOM_TEMPLATE,
  DEFAULT_WAIT_MS,
  PLAYER_TOKEN,
  buildCustomInviteString,
  buildInviteString,
  parseGroups,
} from './parser.js';

const rosterInput = document.querySelector('#roster');
const generateButton = document.querySelector('#generate');
const loadExampleButton = document.querySelector('#load-example');
const status = document.querySelector('#status');
const results = document.querySelector('#results');
const settingsDialog = document.querySelector('#settings-dialog');
const openSettingsButton = document.querySelector('#open-settings');
const closeSettingsButton = document.querySelector('#close-settings');
const cancelSettingsButton = document.querySelector('#cancel-settings');
const settingsForm = document.querySelector('#settings-form');
const waitMsInput = document.querySelector('#wait-ms');
const waitMsError = document.querySelector('#wait-ms-error');
const customOutputCheckbox = document.querySelector('#custom-output');
const customOutputInput = document.querySelector('#custom-output-template');
const customOutputError = document.querySelector('#custom-output-error');

let renderedGroups = [];
let waitMs = DEFAULT_WAIT_MS;
let useCustomOutput = false;
let customOutputTemplate = DEFAULT_CUSTOM_TEMPLATE;
let hasGenerated = false;

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

function clearWaitMsError() {
  waitMsError.hidden = true;
  waitMsError.textContent = '';
  waitMsInput.removeAttribute('aria-invalid');
}

function showWaitMsError(message) {
  waitMsError.textContent = message;
  waitMsError.hidden = false;
  waitMsInput.setAttribute('aria-invalid', 'true');
  waitMsInput.focus();
}

function clearCustomOutputError() {
  customOutputError.hidden = true;
  customOutputError.textContent = '';
  customOutputInput.removeAttribute('aria-invalid');
}

function showCustomOutputError(message) {
  customOutputError.textContent = message;
  customOutputError.hidden = false;
  customOutputInput.setAttribute('aria-invalid', 'true');
  customOutputInput.focus();
}

function createGroupCard(group, inviteString) {
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
      await copyText(inviteString);
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
    text: useCustomOutput
      ? buildCustomInviteString(group.players, customOutputTemplate)
      : buildInviteString(group.players, waitMs),
    players: group.players,
  }));
  hasGenerated = true;

  if (groups.length === 0) {
    status.textContent = 'No se detectaron grupos. Usá encabezados como "PARTY 1 :".';
    return;
  }

  const totalPlayers = groups.reduce((sum, group) => sum + group.players.length, 0);
  const groupWord = groups.length === 1 ? 'grupo' : 'grupos';

  status.textContent = `${groups.length} ${groupWord} detectado${groups.length === 1 ? '' : 's'} · ${totalPlayers} ${totalPlayers === 1 ? 'jugador' : 'jugadores'}`;

  groups.forEach((group, index) => {
    results.append(createGroupCard(group, renderedGroups[index].text));
  });
}

function generate() {
  if (!rosterInput.value.trim()) {
    renderedGroups = [];
    hasGenerated = false;
    results.replaceChildren();
    status.textContent = 'Pegá un roster para generar los comandos.';
    return;
  }

  renderGroups(parseGroups(rosterInput.value));
}

function applySettings() {
  const customTemplate = customOutputInput.value.trim();
  const wantsCustomOutput = customOutputCheckbox.checked;
  let value = waitMs;

  if (!wantsCustomOutput) {
    const raw = waitMsInput.value.trim();
    value = Number(raw);

    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value)) {
      showWaitMsError('Ingresá un número entero válido mayor o igual a 0.');
      return;
    }
  }

  if (wantsCustomOutput && !customTemplate) {
    showCustomOutputError('Escribí una plantilla para la salida personalizada.');
    return;
  }

  if (wantsCustomOutput && !customTemplate.includes(PLAYER_TOKEN)) {
    showCustomOutputError(`La plantilla debe incluir ${PLAYER_TOKEN} para el nombre del jugador.`);
    return;
  }

  waitMs = value;
  useCustomOutput = wantsCustomOutput;
  customOutputTemplate = customTemplate || DEFAULT_CUSTOM_TEMPLATE;
  settingsDialog.close();
  clearWaitMsError();
  clearCustomOutputError();

  if (hasGenerated) generate();
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

openSettingsButton.addEventListener('click', () => {
  waitMsInput.value = String(waitMs);
  waitMsInput.disabled = useCustomOutput;
  customOutputCheckbox.checked = useCustomOutput;
  customOutputInput.value = customOutputTemplate;
  customOutputInput.disabled = !useCustomOutput;
  clearWaitMsError();
  clearCustomOutputError();
  settingsDialog.showModal();

  if (useCustomOutput) {
    customOutputInput.focus();
    customOutputInput.select();
  } else {
    waitMsInput.focus();
    waitMsInput.select();
  }
});

closeSettingsButton.addEventListener('click', () => settingsDialog.close());
cancelSettingsButton.addEventListener('click', () => settingsDialog.close());

waitMsInput.addEventListener('input', clearWaitMsError);
customOutputInput.addEventListener('input', clearCustomOutputError);

customOutputCheckbox.addEventListener('change', () => {
  const enabled = customOutputCheckbox.checked;
  customOutputInput.disabled = !enabled;
  waitMsInput.disabled = enabled;
  clearCustomOutputError();

  if (enabled) {
    clearWaitMsError();
    customOutputInput.focus();
    customOutputInput.select();
  }
});

settingsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  applySettings();
});

settingsDialog.addEventListener('click', (event) => {
  if (event.target === settingsDialog) settingsDialog.close();
});

settingsDialog.addEventListener('close', () => {
  clearWaitMsError();
  clearCustomOutputError();
});
