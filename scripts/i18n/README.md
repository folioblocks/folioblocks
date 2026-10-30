# FolioBlocks translations

The source dictionaries are `locales/{sv_SE,it_IT,es_ES,fr_FR}.json`.
Keep every translation inside the `translations` object. Preserve printf
placeholders (`%s`, `%d`, `%1$s`, etc.), URLs and product names. Values are strings,
except plural messages, which use a two-element array keyed by the singular:

```json
{
  "translations": {
    "%d star": ["%d stjärna", "%d stjärnor"]
  }
}
```

The extractor reads PHP and JavaScript translation calls and block metadata.
It supports the `__`/`_e` family and `_n` plural calls. If new code introduces
contextual translations (`_x`/`_nx`), extend extraction and catalog generation
before using them. Swedish, Italian and Spanish use `n != 1` for plurals; French
uses `n > 1`.

From the plugin root, with Node dependencies installed and GNU gettext's
`msgfmt` on PATH:

```sh
npm run test:i18n
npm run i18n:refresh
```

Refresh validates the dictionaries, extracts a current POT, builds the blocks,
prunes obsolete dictionary keys, then generates PO, MO and JavaScript JSON files.
Missing translations and changed placeholders fail generation rather than
silently shipping English fallbacks. Catalogs in `languages/` are tracked and
must be committed alongside dictionary changes.

`npm run i18n:check:source` checks dictionary coverage without building.
`npm run i18n:check` also checks POT/PO coverage, versions, compiled MO contents
and JavaScript catalog contents against the current build. `npm run
release:check` refreshes and validates translations before packaging.

The shared JavaScript loader includes messages from block bundles and the
standalone page/post settings script. The plugin registers its bundled PHP
language directory on `init`. Bundled language files remain Pro-only under the
existing Freemius packaging rules; free distributions retain WordPress language
pack loading.
