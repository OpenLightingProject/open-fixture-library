# Common Fixture Mistakes

This document lists some of the most frequent mistakes found during review of fixture PRs submitted via the [Fixture Editor](https://open-fixture-library.org/fixture-editor), together with corrected examples.

See also the [fixture format documentation](fixture-format.md) and the [capability types documentation](capability-types.md), as well as the [contributing guidelines](./CONTRIBUTING.md) when you want to fix the mistakes.

## General

### Wrong mode name format

Modes that have no name in the manual should follow the `5-channel` / `5ch` format (with lowercase `c`). When multiple modes share the same channel count, append a number, e.g. `8-channel 1` / `8ch1`, `8-channel 2` / `8ch2`, etc.

```diff
- { "name": "5-Channel", "shortName": "5CH", … }
+ { "name": "5-channel", "shortName": "5ch", … }
- { "name": "8-channel", "shortName": "8ch", … },
- { "name": "8-channel", "shortName": "8ch", … },
+ { "name": "8-channel 1", "shortName": "8ch1", … },
+ { "name": "8-channel 2", "shortName": "8ch2", … },
```

### Missing physical data

The `physical` section should be filled in whenever the information is available in the manual or on the product page.

```diff
+ "physical": {
+   "dimensions": [283, 165, 435],
+   "weight": 9.85,
+   "power": 200,
+   "DMXconnector": "3-pin",
+   "bulb": {
+     "type": "200× RGBW LED"
+   },
+   "lens": {
+     "degreesMinMax": [15, 30]
+   }
+ }
```

### Non-English links

Prefer English manuals and product pages where available.

```diff
  "links": {
    "productPage": [
-     "https://www.example.com/de/produkt/fixture-x"
+     "https://www.example.com/en/product/fixture-x"
    ]
  }
```

### Too few links

Every fixture should have three links if possible: a manual PDF, a product page on the manufacturer's website, and a video.

```diff
  "links": {
-   "productPage": ["https://google.com"],
+   "manual": ["https://example.com/manual.pdf"],
+   "productPage": ["https://example.com/products/fixture-x"],
+   "video": ["https://www.youtube.com/watch?v=XXXXXXXXXXX"]
  }
```

### SCREAM CASE names

Channel names, mode names, effect names and capability comments should use sentence or title case, not ALL CAPS.

```diff
- COLD WHITE
+ Cold White
```

## Channels

### Separate fine channels instead of `fineChannelAliases`

When a fixture has coarse and fine (MSB/LSB) channels for pan, tilt, dimmer, etc., declare them using `fineChannelAliases` on the coarse channel instead of creating separate channel entries.

```diff
  "availableChannels": {
    "Pan": {
+     "fineChannelAliases": ["Pan fine"],
      "capability": { 
        "type": "Pan",
        "angleStart": "0deg",
        "angleEnd": "540deg"
      }
    },
-   "Pan fine": {
-     "capability": {
-       "type": "Pan",
-       "angleStart":
-       "0deg",
-       "angleEnd": "540deg"
-     }
-   },
```

### Per-pixel channels without `templateChannels` and `matrix`

When a fixture has the same set of channels repeated for each pixel/LED segment, use `templateChannels` (above `availableChannels`) and a `matrix` definition instead of duplicating channels for every pixel.

```diff
+ "matrix": {
+   "pixelCount": [3, 1, 1],
+   "pixelGroups": { "Master": "all" }
+ },
+ "templateChannels": {
+   "Red $pixelKey": {
+     "capability": {
+       "type": "ColorIntensity",
+       "color": "Red"
+     }
+   }
+ },
  "availableChannels": {
-   "Red 1": {
-     "capability": {
-       "type": "ColorIntensity",
-       "color": "Red"
-     }
-   },
-   "Red 2": {
-     "capability": {
-       "type": "ColorIntensity",
-       "color": "Red"
-     }
-   },
-   "Red 3": {
-     "capability": {
-       "type": "ColorIntensity",
-       "color": "Red"
-     }
-   }
  }
```

## Capability types

### Wrong capability type for strobe channels

Use `ShutterStrobe` (with a `shutterEffect` property) for channels that combine open/closed/strobe states.

```diff
  "Strobe": {
    "capabilities": [
      {
        "dmxRange": [0, 0],
-       "type": "NoFunction",
-       "comment": "Lamp constantly on"
+       "type": "ShutterStrobe",
+       "shutterEffect": "Open"
      },
      {
        "dmxRange": [1, 255],
-       "type": "StrobeSpeed",
+       "type": "ShutterStrobe",
+       "shutterEffect": "Strobe",
        "speedStart": "slow",
        "speedEnd": "fast"
      }
    ]
  }
```

### Wrong `Generic` capability type

`Generic` is a last-resort type. Replace it with the most specific type that fits:

- `Effect` for built-in automated programs/shows, with `"soundControlled": true` for sound-triggered ones.
- `EffectSpeed` for channels that control the speed of a currently-active effect.
- `Maintenance` for setup/utility operations like motor reset, calibration, or unit on/off.
- `NoFunction` when a DMX range does nothing.
- `Fog` (with `fogType` and `fogOutput`/`fogOutputStart`/`fogOutputEnd`) for fog/haze output channels.
- See [Capability types](./capability-types.md) for all capability types.

```diff
  "Program": {
    "capabilities": [
      {
        "dmxRange": [0, 9],
-       "type": "Generic",
-       "comment": "No function"
+       "type": "NoFunction"
      },
      {
        "dmxRange": [10, 50],
-       "type": "Generic",
-       "comment": "Auto Program 1"
+       "type": "Effect",
+       "effectName": "Auto program 1"
      },
      {
        "dmxRange": [51, 100],
-       "type": "Generic",
-       "comment": "Sound Program 1"
+       "type": "Effect",
+       "effectName": "Sound program 1",
+       "soundControlled": true
      }
    ]
  },
  "Reset": {
    "capabilities": [
      {
        "dmxRange": [0, 128],
        "type": "NoFunction"
      },
      {
        "dmxRange": [129, 255],
-       "type": "Generic",
+       "type": "Maintenance",
        "comment": "Motor reset"
      }
    ]
  },
  "Haze output": {
    "capabilities": [
      {
        "dmxRange": [0, 10],
-       "type": "Generic",
-       "comment": "Off"
+       "type": "Fog",
+       "fogType": "Haze",
+       "fogOutput": "off"
      },
      {
        "dmxRange": [11, 255],
-       "type": "Generic",
-       "comment": "Haze output: weak to strong"
+       "type": "Fog",
+       "fogType": "Haze",
+       "fogOutputStart": "weak",
+       "fogOutputEnd": "strong"
      }
    ]
  }
```

## Capability details

### Unknown strobe disable threshold

When the manual doesn't clearly state at which DMX value strobe is disabled (i.e. the light is constantly on or off), add a `helpWanted` message. But even better: Find out when the exact DMX ranges and add a second `ShutterEffect` capability with an `Open` or `Closed` `shutterEffect`.

```diff
  "Strobe": {
    "capabilities": [
      {
        "dmxRange": [0, 255],
        "type": "ShutterStrobe",
        "shutterEffect": "Strobe",
        "speedStart": "slow",
        "speedEnd": "fast",
+       "helpWanted": "At which DMX values is strobe disabled? When is the lamp constantly on/off?"
      }
    ]
  }
```

### Missing `colors` in `ColorPreset` capabilities

Color macros should use the `ColorPreset` capability type with a `colors` array of hex codes so lighting software can display the correct color. For split (half-and-half) slots, provide both colors.

```diff
  {
    "dmxRange": [11, 21],
    "type": "ColorPreset",
    "comment": "Red",
+   "colors": ["#ff0000"]
  },
  {
    "dmxRange": [22, 32],
    "type": "ColorPreset",
    "comment": "Red + Blue",
+   "colors": ["#ff0000", "#0000ff"]
  }
```

### Missing `colorsStart`/`colorsEnd` for color-transitioning capabilities

When a `ColorPreset` capability smoothly transitions between two colors across its DMX range, use `colorsStart` and `colorsEnd` instead of a single `colors` value.

```diff
  {
    "dmxRange": [11, 30],
    "type": "ColorPreset",
    "comment": "Red to Yellow",
-   "colors": ["#ff0000", "#ffff00"]
+   "colorsStart": ["#ff0000"],
+   "colorsEnd": ["#ffff00"]
  }
```

### Split color/gobo wheel slots without `.5` slot numbers

When a `WheelSlot` capability selects the position between two wheel slots (a split/half-half position), use a fractional `slotNumber` (e.g. `1.5`) instead of adding a new wheel slot.

```diff
  {
    "dmxRange": [22, 32],
    "type": "WheelSlot",
-   "slotNumber": 2,
-   "comment": "Red + Blue"
+   "slotNumber": 1.5
  }
```

### Missing `effectPreset` for standard color effects

When an `Effect` capability describes a color jump or color fade, use the standard `effectPreset` values (`ColorJump` or `ColorFade`) instead of a free-form `effectName`.

```diff
  {
    "dmxRange": [51, 100],
    "type": "Effect",
-   "effectName": "Auto Color Jump"
+   "effectPreset": "ColorJump"
  }
```

### Missing `randomTiming: true` for random strobe

When a strobe effect fires at random intervals (rather than a fixed or adjustable speed), add `"randomTiming": true` to the `ShutterStrobe` capability.

```diff
  {
    "dmxRange": [200, 209],
    "type": "ShutterStrobe",
    "shutterEffect": "Strobe",
-   "comment": "Random strobe"
+   "randomTiming": true
  }
```

### Redundant `comment` duplicating structured data

`comment` should only add information that is not already captured by the capability's structured properties. Do not use it to repeat what is already expressed elsewhere; the display name is auto-generated from those properties.

Common examples of redundant comments:

```diff
  // slot name is inherited from the wheel definition
  {
    "dmxRange": [11, 20],
    "type": "WheelSlot",
-   "comment": "Red",
    "slotNumber": 2
  }

  // "Open" / "Closed" is conveyed by shutterEffect
  {
    "dmxRange": [0, 0],
    "type": "ShutterStrobe",
-   "comment": "No strobe",
    "shutterEffect": "Open"
  }
```

### Missing `hold` on timed `Maintenance` capabilities

When a `Maintenance` capability requires the DMX value to be held for a certain duration to take effect (e.g. lamp on/off, motor reset), add a `hold` property.

```diff
  {
    "dmxRange": [240, 255],
    "type": "Maintenance",
-   "comment": "Lamp on / reset (hold 3 seconds)"
+   "comment": "Lamp on / reset",
+   "hold": "3s"
  }
```
