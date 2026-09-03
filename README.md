# Birthday Card — Interactive Web App

A handmade, scrapbook-style interactive birthday card. Plain HTML, CSS, and
JavaScript only — no build step, no server, no frameworks.

## How to run it

Just double-click **index.html** (or right-click → Open With → your browser).
That's it.

## Where to put your photos

Drop your own images into the `assets` folder using these exact filenames.
If a file is missing, the card automatically shows a soft placeholder
graphic instead of a broken image, so nothing ever crashes — you can add
photos gradually.

| File                  | Used in                                              |
|------------------------|-------------------------------------------------------|
| `assets/child1.jpg`    | Scene 1 (intro question) and Scene 6 (make a wish)    |
| `assets/child2.jpg`    | Scene 2 ("how dare you") and Scene 9 (letter)         |
| `assets/child3.jpg`    | Scene 3 (excitement question) and Scene 10 (final)    |
| `assets/birthday.jpg`  | Scene 5 ("HAPPY Birthday")                            |
| `assets/memory1.jpg`   | Scene 8 (memories strip, photo 1)                     |
| `assets/memory2.jpg`   | Scene 8 (memories strip, photo 2)                     |
| `assets/memory3.jpg`   | Scene 8 (memories strip, photo 3)                     |
| `assets/memory4.jpg`   | Scene 8 (memories strip, photo 4)                     |

Recommended size: roughly square or 4:3 photos, at least 400px on the short
side. They're all displayed with `object-fit: cover`, so any size works —
the frame just crops to fit.

### Repointing a scene to a different photo

Every scene looks up its photo from one small map at the top of
`script.js`:

```js
var sceneImageMap = {
  intro: images.child1,
  no: images.child2,
  excitement: images.child3,
  birthday: images.birthday,
  wish: images.child1,
  memory1: images.memory1,
  memory2: images.memory2,
  memory3: images.memory3,
  memory4: images.memory4,
  letter: images.child2,
  final: images.child3
};
```

Change the right-hand side of any line to point that scene at a different
photo — no HTML editing required.

## Customizing the text

- **The letter** — open `index.html` and find `id="letterText"` inside the
  "SCENE 9: LETTER" section. Edit the paragraph directly; line breaks in the
  HTML become paragraph breaks on the page.
- **The final message lines** — same file, "SCENE 10: FINAL MESSAGE"
  section, the four `<span>` lines inside `.heading--final`.
- **Contact link** — the `mailto:hello@example.com` link near the bottom of
  Scene 10; change it to your own email address.

## Changing which gift opens what

At the top of `script.js`:

```js
var GIFT_DESTINATIONS = {
  1: "birthday",   // gift 1 -> birthday -> wish -> back to gifts
  2: "memories",   // gift 2 -> memories -> back to gifts
  3: "letter"      // gift 3 -> letter -> final (closes the card)
};
```

Swap the scene names to rewire which gift box leads where.

## File structure

```
birthday-card/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── child1.jpg      (add your own)
    ├── child2.jpg      (add your own)
    ├── child3.jpg      (add your own)
    ├── birthday.jpg    (add your own)
    ├── memory1.jpg     (add your own)
    ├── memory2.jpg     (add your own)
    ├── memory3.jpg     (add your own)
    ├── memory4.jpg     (add your own)
    ├── cake.svg         (included illustration)
    ├── gift1.svg         (included illustration)
    ├── gift2.svg         (included illustration)
    ├── gift3.svg         (included illustration)
    └── placeholder.svg   (included fallback graphic)
```

## Notes

- Built mobile-first; the card stays a fixed comfortable width and is
  simply centered on larger screens, so it never stretches awkwardly on
  desktop.
- Respects `prefers-reduced-motion` for anyone who has that turned on.
- All interactive elements are real `<button>`/`<a>` elements, so keyboard
  navigation (Tab + Enter/Space) and screen readers work throughout.
