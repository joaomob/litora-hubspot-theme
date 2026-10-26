# Litora, a HubSpot CMS theme for event landing pages

[![checks](https://github.com/joaomob/litora-hubspot-theme/actions/workflows/checks.yml/badge.svg)](https://github.com/joaomob/litora-hubspot-theme/actions/workflows/checks.yml)

A HubSpot CMS theme for a webinar page, an in-person event page, their two thank you pages and a privacy page, in Portuguese and English. It was built for a design portfolio. Litora, the Tavessa project and the speakers are fictional, and nothing on these pages is an offer.

Live on the HubSpot free plan, with noindex:

- Webinar: https://litora.joaomob.com/webinar-visto-eb5 (English: https://litora.joaomob.com/en/eb5-visa-webinar)
- Event: https://litora.joaomob.com/evento-visto-eb5-sao-paulo (English: https://litora.joaomob.com/en/eb5-event-sao-paulo)

## What the marketing team gets

- 15 page modules, one per block of the page (hero with schedule and sign up form, project photo that opens through a circle, topic rows, audience and speaker cards, numbers on a ruler with a cost table, stacked full screen photos, questions with a timeline, final call, steps, legal text, header and footer). Every text, photo and alt text is a field, so a page changes without code.
- 13 section templates, so a block can be added to any page from the section library with its layout locked.
- 10 page templates, one per page and language, each one filled with that page's texts and photos.
- A blog: a listing of posts as cards with pagination, and a post with tags, the author box, related posts and HubSpot comments in the theme's fields and buttons. Three blog modules hold every label, and the header and the footer follow the blog's language.
- The seven system pages HubSpot asks of a theme: 404 and 500 errors, password prompt, email subscription preferences, subscriptions confirmation, backup unsubscribe and search results. Each one has a short message the editor changes like any text, and HubSpot's own form or results under it, in the theme's fields, buttons and type.
- Theme settings with the brand colours and the two text fonts, under HubSpot's standard names (`primary_color`, `secondary_color`, `heading_font`, `body_font`). Spacing, sizes and the type scale stay fixed in code: the editor picks a section colour, never a number.

## How it is built

- HubL templates, modules and sections, with Client-First class names.
- The styles are inlined in the head, from readable files: `css/tokens.css` (fonts and design tokens), `css/system.css` (the shared classes) and one file per section in `css/sections/`. The theme colours and fonts override the tokens in a `:root` block of the base layout. The self-hosted fonts load from the theme, and the font settings do not load a second copy from Google.
- Every responsive image goes through one macro, `templates/partials/images.html`, which writes the `srcset` from the image and its widths.
- The sign up form is a HubSpot form picked in the hero module's "Form" field, styled to the theme in `css/sections/form-card.css`, with an LGPD consent checkbox.
- Motion runs on GSAP and ScrollTrigger, loaded after the page; nothing hides content inside the HubSpot editor, without JavaScript or with reduced motion.
- The questions open with the first one, keep one open at a time (`<details name>`) and open and close with an animated height (instant with reduced motion).

## Structure

- `litora/theme.json`, `litora/fields.json`: the theme and its settings.
- `litora/templates/`: the base layout, the page templates, the blog, the system pages (`templates/system/`), the sections and the image macro.
- `litora/modules/`: one folder per module (`module.html`, `fields.json`, `meta.json`).
- `litora/css/`, `litora/js/`, `litora/fonts/`, `litora/images/`: styles, the motion and form scripts, fonts and photos.
- `scripts/check-theme.mjs`: the structure check.

## Tools

| Tool                                            | Where                               | Why                                                                                                            |
| ----------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Node 20 or newer                                | system                              | runs everything below                                                                                          |
| `@hubspot/cli`                                  | `package.json`                      | `hs cms upload`, `hs account auth`                                                                             |
| Prettier 2 with `@hubspot/prettier-plugin-hubl` | `package.json`, `.prettierrc.json`  | one code style for HubL, CSS, JavaScript and JSON (`npm run format`); the HubL plugin supports Prettier 2 only |
| ESLint 9                                        | `package.json`, `eslint.config.mjs` | `npm run lint` over the browser scripts                                                                        |
| gitleaks                                        | system                              | secret scan before every push                                                                                  |

## Commands

```bash
npm install
npm run check         # every tag closed, every field a module reads exists, every template extends the base
npm run lint          # ESLint
npm run format:check  # Prettier with the HubL plugin
npm run verify        # all of the above, as CI runs it
npm run upload        # verify, then hs cms upload litora litora
```

## Continuous integration

`.github/workflows/checks.yml` runs `npm run verify` on every push and pull request. A push to `main` that passes the checks uploads `litora/` to the HubSpot account with [HubSpot's CMS deploy action](https://github.com/HubSpot/hubspot-cms-deploy-action). The key is the repository secret `HUBSPOT_PERSONAL_ACCESS_KEY` and the account id the variable `HUBSPOT_ACCOUNT_ID`. Pull requests run only the checks. Pages keep their cached HTML until they are republished, so a theme change shows on the live pages after the next republish.

## Checks

- `hs cms theme marketplace-validate litora`: no errors. The only warnings are on the base layout and the two partials, which are `templateType: none` on purpose, as in HubSpot's boilerplate theme.
- PageSpeed Insights, webinar page (25 October 2026): performance 92 to 96 on a phone in three runs, 100 on a computer; accessibility 100 and best practices 100. SEO is lower only because of the noindex.
- Both forms reach the HubSpot CRM with every field.

## Use

```bash
npm install
npx hs account auth
npm run upload
```

Theme by [João Marcos](https://joaomob.com).
