---
name: Warm Literary Paper
colors:
  surface: '#fff8f4'
  surface-dim: '#e3d8cf'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fdf2e8'
  surface-container: '#f7ece3'
  surface-container-high: '#f1e6dd'
  surface-container-highest: '#ebe1d7'
  on-surface: '#201b15'
  on-surface-variant: '#58413d'
  inverse-surface: '#352f29'
  inverse-on-surface: '#faefe5'
  outline: '#8c716c'
  outline-variant: '#e0bfb9'
  surface-tint: '#ab3521'
  primary: '#912211'
  on-primary: '#ffffff'
  primary-container: '#b23a26'
  on-primary-container: '#ffd8d1'
  inverse-primary: '#ffb4a6'
  secondary: '#2f6767'
  on-secondary: '#ffffff'
  secondary-container: '#b4edec'
  on-secondary-container: '#366d6d'
  tertiary: '#941d0d'
  on-tertiary: '#ffffff'
  tertiary-container: '#b63623'
  on-tertiary-container: '#ffd9d2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#ffb4a6'
  on-primary-fixed: '#3f0300'
  on-primary-fixed-variant: '#891d0c'
  secondary-fixed: '#b4edec'
  secondary-fixed-dim: '#99d1d0'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#114f4f'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a6'
  on-tertiary-fixed: '#3f0300'
  on-tertiary-fixed-variant: '#8c1708'
  background: '#fff8f4'
  on-background: '#201b15'
  surface-variant: '#ebe1d7'
typography:
  headline-xl:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 52px
  headline-xl-mobile:
    fontFamily: Noto Serif
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 42px
  headline-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 34px
  headline-md:
    fontFamily: Noto Serif
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
  hanzi-display:
    fontFamily: Noto Serif
    fontSize: 36px
    fontWeight: '500'
    lineHeight: 48px
  hanzi-body:
    fontFamily: Noto Serif
    fontSize: 22px
    fontWeight: '400'
    lineHeight: 36px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  pinyin-reading:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  hanviet-reading:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1.25rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embraces the tactile, serene intimacy of a personal music journal crafted for Vietnamese learners of Mandarin. It rejects sterile academic drills, gaudy gamification, and corporate test-prep aesthetics. Instead, it treats lyric appreciation as a cultural and poetic sanctuary: warm handmade paper, nuanced ink tones, and scholarly precision rendered with contemporary editorial restraint.

The aesthetic fuses classical East Asian calligraphy with modern humanist typography. The mood is contemplative, melodic, and deeply focused. Visual tension is balanced through generous breathing room, organic borders resembling diluted sumi-e ink washes, and focal accents derived from vermilion stone seal stamps (印章). Every visual element should evoke opening a well-bound linen notebook by a window while listening to evocative acoustic melodies.

## Colors

The palette simulates the natural materiality of ink on Xuan/washi paper, utilizing nuanced warm undertones rather than cold synthetic grays:

- **Primary Seal Red (`#B23A26` / `#C8432E`)**: Inspired by cinnabar seal ink. Reserved strictly for key interactive anchors, primary playback controls, active character states, and lexical highlights.
- **Secondary Deep Teal (`#255E5E` / `#1B4545`)**: Evokes antique celadon glaze and weathered bamboo. Anchors grammatical patterns, sentence structure breakdowns, and syntactic connections.
- **Paper Canvas (`#F4EFE6`)**: A soft, unbleached oat-ivory base that reduces digital eye strain and provides organic warmth.
- **Card Surfaces (`#FAF7F2` & `#FFFFFF`)**: Tinted parchment white for cards, lyric blocks, and lyric breakdown sheets.
- **Inks**:
  - Carbon Black (`#1E1A16`): The primary ink tone for Hanzi, song titles, and focused content.
  - Warm Charcoal (`#5C554E`): Secondary ink for Pinyin, Hán-Việt readings, and contextual notes.
  - Muted Mist (`#8C827A`): Tertiary ink for metadata, timestamps, and subtle hints.
  - Ink Rim Border (`#E5DDD0`): Low-contrast, paper-fiber rule lines replacing harsh CSS borders.
- **HSK Badges**: Understated tea and parchment washes (`#EFE8DC` background with `#6E6258` ink) maintaining pedagogical utility without feeling like childish merit badges.

## Typography

Typography orchestrates an effortless dual-language hierarchy where Chinese characters and Vietnamese tonal diacritics coexist in harmony:

- **Hanzi (Noto Serif / Songti fallback)**: Characters possess calligraphic proportion, distinct stroke contrast, and brush rhythm. Hanzi is always visually prioritized in scale and stroke definition over phonetic guides.
- **Vietnamese & Latin (Be Vietnam Pro)**: Modern, highly legible humanist sans engineered explicitly for complex Vietnamese tone markers and accents, avoiding character collision with ruby text.
- **The Lyric Reading Stack**:
  1. **Top**: Pinyin in warm gray muted tones (`#5C554E`) directly anchored above each character or line.
  2. **Middle / Centerpiece**: Primary Hanzi rendered in majestic `#1E1A16`.
  3. **Complementary**: Sino-Vietnamese (Âm Hán-Việt) styled in compact small-caps or bold label notation directly alongside Pinyin or beneath the glyph.
  4. **Base**: Vietnamese translation rendered in clean, natural prose at comfortable body size.

## Layout & Spacing

The layout is built mobile-first around a compact 390px baseline, expanding gracefully into a bounded, book-like editorial reading container (max-width: 860px for lyric study; 1140px for collection views) on desktop:

- **Mobile (390px - 767px)**: Single column with `1.25rem` (`20px`) margins. Lyric cards scroll seamlessly, leaving comfortable vertical space (`space-lg`) between stanzas to preserve the song's rhythmic phrasing.
- **Tablet & Desktop (768px+)**: Two-column split-notebook view:
  - Left pane (45%): Sticky audio player, vinyl/cassette artwork, track information, and synchronized interactive lyric stream.
  - Right pane (55%): Deep-dive notebook containing vocabulary breakdown, Sino-Vietnamese etymology, grammar patterns, and personal learner annotations.
- **Vertical Rhythm**: Generous stanza breaks ensure characters are never crammed, allowing room for ruby annotations without clipping ascenders or tone marks.

## Elevation & Depth

This system avoids digital blur, neon luminescence, glassmorphism, or deep modern drop-shadows. Depth is conveyed strictly through **paper layering and delicate ink perimeter lines**:

- **Ground Level (Canvas)**: Warm textured background `#F4EFE6`.
- **Level 1 (Paper Cards & Sheets)**: Lifted using a crisp, 1px perimeter outline in `#E5DDD0` coupled with a minimal, warm ambient contact shadow: `0 2px 6px -1px rgba(30, 26, 22, 0.04), 0 1px 3px -1px rgba(30, 26, 22, 0.02)`.
- **Level 2 (Active Word Popover & Sticky Lyrics)**: Raised notebook card elevated by `0 8px 24px -4px rgba(30, 26, 22, 0.08)` paired with an inner top border highlight of `rgba(255, 255, 255, 0.8)`.
- **Selection & Focus**: Indicated via subtle parchment color shifting (`#FAF7F2` to `#FFFFFF`) and seal-red ink underlines (`2px` solid `#B23A26`), mimicking an annotating pen.

## Shapes

Shapes communicate organic friendliness without feeling cartoonish or hyper-geometric:

- **Cards & Surfaces**: Soft, tactile corner radius of `14px` to `16px` (`rounded-lg`), mirroring the rounded die-cut corners of premium leather-bound journals and music folios.
- **Interactive Controls & Pills**: True pill shapes (`border-radius: 9999px`) for audio playback controls, tag selectors, audio scrubber handles, and filter chips.
- **Calligraphic Details**: Underlines for grammatical patterns and focus vocabulary feature rounded stroke terminals (`stroke-linecap: round`) simulating genuine ink pens.

## Components

### Buttons & Navigation
- **Primary Button (Seal Action)**: Pill-shaped, solid vermilion red (`#B23A26`), pure white text, zero drop shadow. In hover/active state: deepens to `#982D1C`.
- **Secondary Button (Notebook Outline)**: Pill-shaped, parchment white surface (`#FAF7F2`), bounded by a 1px `#E5DDD0` border, charcoal ink text (`#1E1A16`).
- **Lyric Audio Controller**: Floating bottom dock or inline pill bar with minimal icon buttons (Play/Pause, Replay Line, Speed adjustment: 0.8x / 1.0x).

### Vocabulary & Lyric Cards
- **Interactive Hanzi Token**: Characters in lyric lines act as interactive taps. Tapping an unfamiliar character reveals an inline gloss card with Pinyin, Hán-Việt reading, radical meaning, and sample lyric context.
- **Grammar Callout**: Boxed in an unbleached tinted card bordered with a subtle left accent line (`3px`) in Deep Teal (`#255E5E`). Grammatical structural breakdown uses teal underlining.
- **Lyric Row**: Current active line switches text color to Carbon Black (`#1E1A16`) with an unobtrusive vermilion dot stamp (印) indicating playback progress. Inactive lines rest comfortably in muted ink (`#8C827A`).

### HSK & Difficulty Badges
- Muted, low-saturation pill chips (`font-size: 11px`, uppercase, medium weight). 
- Background: Warm tea-beige (`#EFE8DC`), border: `#E5DDD0`, text: `#6E6258`. Non-intrusive and free from bright gamified rank colors.

### Input Fields & Search
- Rounded at `14px`, background `#FFFFFF`, border `1px solid #E5DDD0`.
- Caret colored in Vermilion Red (`#B23A26`). Placeholder text rendered in gentle Warm Muted (`#8C827A`). Focused state shifts border to Warm Charcoal (`#5C554E`) without harsh outer glowing rings.

### Audio Progress & Scrubbers
- Thin 3px line in `#E5DDD0` track.
- Filled progress bar in Vermilion Red (`#B23A26`). Scrubber handle is a discrete 12px pill thumb that expands slightly upon active touch.