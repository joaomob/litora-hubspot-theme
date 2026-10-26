# Using the Litora theme

Litora is a HubSpot CMS theme for event marketing: a webinar page, an in-person event page, a thank you page for each, a privacy page, a blog and the system pages. This guide covers everything a marketing team changes without code.

Live demo: https://litora.joaomob.com/webinar-visto-eb5

## 1. Set up the account first

1. **Logo.** Go to Settings, Content, Brand, and upload your logo. The header and the footer take it from there. Without a logo in the brand settings, the Litora mark shows.
2. **Footer menu.** Go to Settings, Content, Navigation Menus, and create a menu with the links of your footer. Then pick it in the footer's "Links menu" field (step 4). Without a menu, the footer links to the privacy page.
3. **Forms.** Go to Marketing, Forms, and create the sign up form of your event. Its fields, the error messages, the consent checkbox and the button text all live in the form. The theme styles any HubSpot form to its own fields and button.

## 2. Theme settings

Open any Litora page in the editor, then the Theme tab on the left, then Edit theme settings. Every change applies to all pages of the theme.

| Group         | What it changes                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Brand colours | The nine colours of the palette. Sections, buttons, links and forms all take their colour from here.                          |
| Typography    | The heading font and the body font, the font and weight of each heading from H1 to H6, and the links with their hover colour. |
| Buttons       | Background colour, glow colour, text font and the hover colours.                                                              |
| Forms         | Background and border of the form card, the fields on light and on dark sections, and the form button.                        |
| Header        | Header colour and font.                                                                                                       |
| Footer        | Footer colour and font.                                                                                                       |

Spacing, sizes and the type scale are fixed in code, so a page keeps its rhythm whatever the editor changes.

## 3. Create a page

1. Go to Content, Website Pages (or Landing Pages), Create.
2. Pick a template of the Litora theme:
   - **Litora webinar**: an online event, with the sign up form in the hero.
   - **Litora event**: an in-person event, with the schedule and the place.
   - **Litora webinar thank you** and **Litora event thank you**: the page after the sign up.
   - **Litora privacy policy**: a page of legal text.
3. The page opens filled with sample texts and photos. Change each text, photo and alt text in the module's fields on the left.
4. In the hero, open "Form" and pick your form. In the form's options, choose what happens after the sign up: a thank you message, or a redirect to your thank you page.

## 4. Edit the sections

- Each block of the page is a module. Click it to edit its texts and photos.
- **Section colour** (Style tab): Light, Light alternate or Dark. The colours come from the theme settings.
- **Styles** (Style tab): text colour, heading font and spacing of that section only. Left empty, the section follows the theme settings.
- **Add a section**: click the plus sign between two sections, then Sections, and pick one of the 13 Litora sections. Each one comes with its layout and sample content.
- Photos in the heroes, the project photos and the final call have a second field, "Image, phone crop", for the crop shown on phones (767 px and narrower).

## 5. Header and footer

The header and the footer are global: one change shows on every page. Open them from any page (click the header, then "Edit global content").

- The header has the language switch, the logo and the button. The button scrolls to the sign up form on the event pages.
- The footer has the logo, a short text about the company, the legal notice, the menu and the link to the other language.
- Each one has a drag and drop area above and below its bar, for a banner or a notice.

## 6. Languages

The theme ships in Portuguese (Brazil) and English (United States), one language per page.

1. Create the page in one language.
2. In the page settings, use "Add language variation" to create the other language.
3. The language switch in the header and the language link in the footer find the variation on their own.

## 7. Blog

1. Go to Content, Blog, and pick **Litora blog listing** and **Litora blog post** as the templates of your blog.
2. The listing shows the posts as cards with pagination. The post shows its tags, the author box, related posts and HubSpot comments.
3. The labels of the blog (heading, "Previous page", "Next page", the author box) are fields of the three blog modules.

## 8. System pages

Go to Settings, Content, System Pages, and pick the Litora template for each page: 404 error, 500 error, password prompt, email subscription preferences, subscriptions confirmation, backup unsubscribe and search results. Each one has a short message you change like any text, with HubSpot's own form or results under it.

## 9. Accessibility and speed

- Every image has an alt text field. Leave it empty only for a decorative image.
- Motion runs after the page loads and stops for visitors who ask for reduced motion. Nothing is hidden in the editor or without JavaScript.
- Photos are served in the sizes each screen needs.

## Support

Questions about the theme: contact@responsedesign.com.br.
