import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  DEFAULT_CUSTOM_TEMPLATE,
  buildCustomInviteString,
  buildInviteString,
  parseGroups,
} from './parser.js';

test('parsea los grupos del ejemplo y quita el tag de los jugadores', () => {
  const example = readFileSync(new URL('../example_CTA.txt', import.meta.url), 'utf8');
  const groups = parseGroups(example);

  assert.equal(groups.length, 2);
  assert.equal(groups[0].name, 'PARTY 1');
  assert.equal(groups[0].players.length, 20);
  assert.equal(groups[0].players[0], '@! El Demo');
  assert.equal(groups[0].players[7], 'VOIDZ');
  assert.equal(groups[1].name, 'PARTY 2');
  assert.equal(groups[1].players.length, 20);
  assert.equal(groups[1].players[0], 'xRyzeAlexx');
  assert.equal(groups[1].players[19], '@!NoSoyNadie (alias Demo)');
});

test('detecta encabezados sin importar mayúsculas ni espacios', () => {
  const groups = parseGroups('Party 3 :\n1 Rol: JugadorA\nPARTY 4:\n2 Rol: @[TAG]JugadorB');

  assert.deepEqual(
    groups.map((group) => group.name),
    ['PARTY 3', 'PARTY 4'],
  );
  assert.deepEqual(groups[0].players, ['JugadorA']);
  assert.deepEqual(groups[1].players, ['JugadorB']);
});

test("procesa líneas con ':' aunque no tengan número", () => {
  const groups = parseGroups('PARTY 1 :\nCaller: JugadorA\nSin numero: JugadorB');

  assert.deepEqual(groups[0].players, ['JugadorA', 'JugadorB']);
});

test("ignora líneas sin ':', pies de página y texto previo al primer grupo", () => {
  const groups = parseGroups(
    [
      'Texto previo: ignorado',
      'PARTY 1 :',
      'JugadorSuelto',
      'Tocá «Anotarme» y escribí el número del rol',
      'Para salir: botón «Salir»',
      '1 Rol: @[THR] JugadorA',
      'Quien armó este roster con «Gestionar»',
    ].join('\n'),
  );

  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].players, ['JugadorA']);
});

test('mantiene todos los duplicados y el orden', () => {
  const groups = parseGroups('PARTY 1 :\n1 Rol: JugadorA\n2 Rol: JugadorB\n3 Rol: JugadorA');

  assert.deepEqual(groups[0].players, ['JugadorA', 'JugadorB', 'JugadorA']);
});

test('sin encabezados arma un único grupo PARTY 1', () => {
  const groups = parseGroups('1 Caller: @[THR] JugadorA\n2 Rol: JugadorB');

  assert.equal(groups.length, 1);
  assert.equal(groups[0].name, 'PARTY 1');
  assert.deepEqual(groups[0].players, ['JugadorA', 'JugadorB']);
});

test("ignora valores vacíos después de ':'", () => {
  const groups = parseGroups('PARTY 1 :\n1 Rol:\n2 Rol:   ');

  assert.deepEqual(groups[0].players, []);
});

test('procesa el roster de World Boss ignorando roles y porcentajes', () => {
  const example = readFileSync(new URL('../example_WB.txt', import.meta.url), 'utf8');
  const groups = parseGroups(example);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].name, 'PARTY 1');
  assert.deepEqual(groups[0].players, [
    'Nandiyux',
    'Vettini08',
    'danielnotF',
    'charlatanX',
    'Steelbolt7893',
    'AvalonCA',
    'IIFrostEchoII',
    'IRunebladel',
    'IStormy',
    'AlcyoneDVega',
  ]);
});

test("usa el último ':' y no el primero", () => {
  const groups = parseGroups(
    'PARTY 1 :\n1 Rol: Descripción: JugadorA\n:icono: (111) Rol: @[TAG] JugadorB',
  );

  assert.deepEqual(groups[0].players, ['JugadorA', 'JugadorB']);
});

test('ignora porcentajes y líneas de rol sin jugador', () => {
  const groups = parseGroups('PARTY 1 :\nGuild: 50%\n1st Scout: 5%\n:oso: Scout 1 [NE]:');

  assert.deepEqual(groups[0].players, []);
});

test('genera el string con el WAITMS predeterminado', () => {
  const result = buildInviteString(['Jugador1', 'Jugador2']);

  assert.equal(
    result,
    '{WAITMS500}{RETURN}{WAITMS500}/invite Jugador1{WAITMS500}{RETURN}{WAITMS500}{RETURN}{WAITMS500}/invite Jugador2{WAITMS500}{RETURN}',
  );
});

test('permite personalizar el WAITMS', () => {
  const result = buildInviteString(['Jugador1'], 250);

  assert.equal(result, '{WAITMS250}{RETURN}{WAITMS250}/invite Jugador1{WAITMS250}{RETURN}');
});

test('omite los WAITMS cuando el valor es 0', () => {
  const result = buildInviteString(['Jugador1', 'Jugador2'], 0);

  assert.equal(result, '{RETURN}/invite Jugador1{RETURN}{RETURN}/invite Jugador2{RETURN}');
});

test('genera la salida personalizada por defecto por cada jugador', () => {
  const result = buildCustomInviteString(['Jugador1', 'Jugador2']);

  assert.equal(
    result,
    '{WAITMS500}{RETURN}{WAITMS500}/invite Jugador1{WAITMS500}{RETURN}{WAITMS500}{RETURN}{WAITMS500}/invite Jugador2{WAITMS500}{RETURN}',
  );
});

test('la plantilla personalizada por defecto usa {player}', () => {
  assert.equal(
    DEFAULT_CUSTOM_TEMPLATE,
    '{WAITMS500}{RETURN}{WAITMS500}/invite {player}{WAITMS500}{RETURN}',
  );
});

test('reemplaza todas las apariciones de {player} en la plantilla', () => {
  const result = buildCustomInviteString(['JugadorA'], '/invite {player}{RETURN}{player}');

  assert.equal(result, '/invite JugadorA{RETURN}JugadorA');
});

test('no interpreta caracteres especiales de reemplazo en el nombre', () => {
  const result = buildCustomInviteString(['$&'], '{player}');

  assert.equal(result, '$&');
});

test('respeta los WAITMS escritos literalmente en la plantilla', () => {
  const result = buildCustomInviteString(['JugadorA'], '{WAITMS250}/invite {player}');

  assert.equal(result, '{WAITMS250}/invite JugadorA');
});

test('devuelve una cadena vacía sin jugadores', () => {
  assert.equal(buildCustomInviteString([], DEFAULT_CUSTOM_TEMPLATE), '');
});
