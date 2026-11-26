# Sheshank & Sakshi

A portrait Next.js engagement invitation based on the provided reference. Scroll controls the doors, scene transitions, and artwork. On desktop the invitation appears inside a phone frame. On portrait mobile screens it fills the display.

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Scroll down to swing the palace doors inward and move through the arch into the garden. Keep scrolling through the full-height scenes. **Events** sits below the engagement invitation and above the venue and directions.

Run `npm run build` to create a static website in `out/`. The project download includes a prebuilt copy. To serve it without installing dependencies, run `python3 -m http.server 3000 --directory out` from the project folder, then open http://localhost:3000.

## How it scrolls

The invitation is one long sheet of paper that scrolls naturally inside the phone, like the Utsavy templates. A faint jaali pattern runs the whole length, and a golden thread winds down behind every section, drawing itself in as you read. The opening, storybook and Events hold their scenes in place while scrolling advances their animations.

| Section | File | Signature element |
|---|---|---|
| Opening | `components/Opening.jsx` | Modelled on a Pinterest e-invite. The couple, seen from behind, sit before a curtained pooja frame hung with bells and garlands. As you scroll the curtains draw open on Radha and Krishna on a marigold swing, the camera pushes into the painting as the couple slips away, carved pillars and marigold garlands frame the card, and the swing settles at the top. The words (shloka, invitation, शेशांक संग साक्षी, names, date) then write themselves in |
| Invitation | `ScrollCard.jsx` | Modelled on a Pinterest e-invite: two hennaed hands hold a painted scroll rolled shut, then pull the brass-capped rollers apart to unroll it, and the names, parents and date write themselves onto the paper. It plays once, on its own, when it comes into view; tapping the scroll plays it at once |
| Couple | `Couple.jsx` | Modelled on a Pinterest e-invite: a cream card with a rose border, block-print butis, cypresses and a white chhatri. The couple rises in at the foot, a hennaed hand and a hand offering a pink lotus sweep in from either side and gently reach toward each other, an S&S monogram blooms inside a swan-and-rose wreath, and the names and "are getting engaged" write themselves in. It plays once, on its own |
| Our story | `StoryBook.jsx` | An open rose-and-gold storybook (painted with ChatGPT) held on screen on cream paper while you scroll. The book stands upright, bound across the middle like an album. Each chapter is a spread, its picture on the top page and its words on the bottom. Scrolling flips each page up over the spine, with shading as the page curves |
| Save the date | `SaveTheDate.jsx` | A flower-decked convertible drives down a painted temple garden path, wiping away the opening title and revealing the engagement date and names |
| Events | `EventVine.jsx` | Events advance after three seconds, and guests can also scroll. Holding pauses the countdown, and clicking or tapping restarts it |
| Venue | `Venue.jsx` | The couple walks toward a painted mandap as the venue name and address appear |
| Moments | `MomentsDeck.jsx` | A taped polaroid deck: swipe or use the arrows |
| RSVP | `Rsvp.jsx` | A stacked reply card with a wax seal on its corner; the seal stamps and sky lanterns rise on "yes" |
| Blessings | `BlessingBranch.jsx` | A branch draws itself, notes hang from it and sway, and a new note drops onto it |
| Thank you | `Finale.jsx` | A cream-and-gold courtyard with fireworks, the couple and the families |

Decoration painted with ChatGPT for this version: `paper-tile` (the sheet's paper), `floral-border` (roses climbing both edges), `toran` (bells and marigolds over Events and RSVP), `swans` (over the RSVP card), `lotus-divider` (under every heading), `corner-bouquet` (on cards) and `arch-frame` (around each event). Sources are in `../generated_images/v3`.

The golden thread stays in the side margins and only swoops across in the empty space above a section's heading, so it never runs through text. Add `?guest=Sharma+Family` to the link to greet a guest by name.

Animated ornaments (`Ornaments.jsx`): diya, fairy lights, hanging lantern, sparkles, birds and butterflies. Butterflies drift over the whole invitation, and the finale has lanterns, diyas and birds.

Shared pieces: `GoldenThread.jsx`, `Toran.jsx`, `SectionTitle.jsx`, `Petals.jsx`, `Lanterns.jsx` and `Fireworks.jsx`. The scroll hooks are in `lib/sheet.js` and the .ics links in `lib/calendar.js`. Each component has its own `.css` file next to it. `globals.css` holds only the phone frame, the paper sheet and the shared buttons.

**Bride & groom profiles** (`Profiles.jsx`, under the couple card): each person in `invite.people` has `role`, `roleHindi`, `name`, `fullName`, `parents`, `about` and `photo`. Put the customer's photos in `public/photos/` (portrait, about 3:4) and point `photo` at them; the current `groom.webp` and `bride.webp` are placeholders cut from the illustration. Each profile plays once: its arch opens on the photo, the name is written in and the words rise out of a blur.

Names, date, venue, events, story, gallery captions and starter blessings live in `app/invite.js`.  The event programme times (other than 6 pm), the story text and the starter blessings are placeholders. Replace them with the family's own.

Add or reorder entries in `invite.events` to change the programme. Each event uses `name`, `start` (ISO date and time with its offset), `time` (the displayed time) and `place`. You can also set `attire`, an `art` path, an event-specific `mapUrl`, and a `transition` of `feathers`, `toast`, `marigolds` or `roses`. The sequence adapts to the number of entries.

Artwork was generated with ChatGPT. Source sheets are in `../generated_images/v2`, and the sliced WebPs are in `public/art`.
