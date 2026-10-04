# Litora, a HubSpot CMS theme for event landing pages

A HubSpot CMS theme for a webinar page, an in-person event page, their two thank you pages and a privacy page, in Portuguese and English. It was built for a design portfolio. Litora, the Tavessa project and the speakers are fictional, and nothing on these pages is an offer.

Live on the HubSpot free plan, with noindex:

- Webinar: https://litora.joaomob.com/webinar-visto-eb5 (English: https://litora.joaomob.com/en/eb5-visa-webinar)
- Event: https://litora.joaomob.com/evento-visto-eb5-sao-paulo (English: https://litora.joaomob.com/en/eb5-event-sao-paulo)

## What the marketing team gets

- 15 modules, one per block of the page (hero with schedule and sign up form, project photo that opens through a circle, topic rows, audience and speaker cards, numbers on a ruler with a cost table, stacked full screen photos, questions with a timeline, final call, steps, legal text, header and footer). Every text, photo and alt text is a field, so a page changes without code.
- 13 section templates, so a block can be added to any page from the section library with its layout locked.
- 10 page templates, one per page and language, each one filled with that page's texts and photos.
- Theme settings with the brand colours and the two text fonts, under HubSpot's standard names (`primary_color`, `secondary_color`, `heading_font`, `body_font`). Spacing, sizes and the type scale stay fixed in code: the editor picks a section colour, never a number.

## How it is built

- HubL templates, modules and sections, with Client-First class names.
- One stylesheet, minified and inlined in the head; the self-hosted fonts load from the theme, and the font settings do not load a second copy from Google.
- The sign up form is the theme's own HTML, sent to the HubSpot Forms API, with validation messages written next to each field and an LGPD consent checkbox.
- Motion runs on GSAP and ScrollTrigger, loaded after the page; nothing hides content inside the HubSpot editor, without JavaScript or with reduced motion.
- The questions open with the first one, keep one open at a time (`<details name>`) and open and close with an animated height (instant with reduced motion).

## Checks

- `hs cms theme marketplace-validate litora`: passes except the blog templates, which apply to themes sold on the HubSpot marketplace (this one is for landing pages only).
- PageSpeed Insights, webinar page: performance 99, 100 and 99 on a phone in three runs, 100 on a computer; accessibility 100 and best practices 100. SEO is lower only because of the noindex.
- Both forms reach the HubSpot CRM with every field.

## Use

```bash
npm install -g @hubspot/cli
hs account auth
hs cms upload litora litora
```

Theme by [João Marcos](https://joaomob.com).
