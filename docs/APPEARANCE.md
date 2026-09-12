# Appearance and theme system

Appearance controls live in Progress → Settings & Preferences and are stored with
the learner's local progress. They are included in progress exports and restored
on import.

## Presets

- **Light** uses bright neutral surfaces.
- **Night** is the original dark appearance, renamed to describe its purpose.
- **Eye Comfort** uses warm paper tones, softer borders, and lower blue emphasis
  for longer reading sessions.
- **Ocean** uses dark blue surfaces with cyan and teal accents.
- **High Contrast** uses black surfaces, white boundaries, and bright accents.

Choosing a preset applies its suggested primary and secondary colors. The color
pickers can then override both values. Reset theme colors restores the current
preset's suggestions. Filled accent controls automatically select dark or white
foreground text from the primary color's luminance.

## Liquid Glass

Liquid Glass is independent of the color preset. When enabled, it adds translucent
surfaces, backdrop blur and saturation, subtle specular borders, soft elevation,
larger corner radii, and fixed accent color blooms. It can be disabled without
changing the selected theme or custom colors.

Browsers without backdrop-filter support keep the same theme and layout using
opaque surfaces. The layer also honors reduced-motion preferences: it introduces
no continuous animation. Browsers that request reduced transparency receive the
base opaque theme where that platform preference is exposed through CSS support.

## Persistence compatibility

The version-2 progress parser accepts original four-field appearance settings and
fills in theme-appropriate color and glass defaults. Unknown setting keys, invalid
theme names, non-boolean glass values, and colors outside six-digit hexadecimal
syntax are rejected. Version-1 dark/light records migrate to the complete matching
Night or Light palette.
