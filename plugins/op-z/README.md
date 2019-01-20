# OP-Z Plugin

[Teenage Engineering's OP-Z](https://www.teenageengineering.com/products/op-z) synthesizer and sequencer has a separate track for controlling light fixtures via DMX. The DMX configuration is saved in a `dmx.json` file (see the [OP-Z online manual](https://www.teenageengineering.com/guides/op-z/lights)). This OFL plugin exports that `dmx.json` file for a given set of fixtures, however, it is likely that it needs manual adjustments to fit the exact configuration and workflow of the user.


## OP-Z channel types

This table is taken from the [OP-Z online manual](https://www.teenageengineering.com/guides/op-z/lights).

| channel     | range   | description               |
| ----------- | ------- | ------------------------- |
| `red`       | 0 – 255 | red color                 |
| `green`     | 0 – 255 | green color               |
| `blue`      | 0 – 255 | blue color                |
| `white`     | 0 – 255 | white color               |
| `color`     | 0 – 255 | color wheel               |
| `intensity` | 0 – 255 | intensity / dimmer        |
| `fog`       | 0, 255  | triggered by animation 14 |
| `dial 1`    | 0 – 255 | green dial (page 1)       |
| `dial 2`    | 0 – 255 | blue dial (page 1)        |
| `dial 3`    | 0 – 255 | yellow dial (page 1)      |
| `dial 4`    | 0 – 255 | red dial (page 1)         |
| `dial 5`    | 0 – 255 | green dial (page 2)       |
| `dial 6`    | 0 – 255 | blue dial (page 2)        |
| `dial 7`    | 0 – 255 | yellow dial (page 2)      |
| `dial 8`    | 0 – 255 | red dial (page 2)         |
| `0 – 255`   | 0 – 255 | custom fixed value        |
| `on`        | 255     | always on                 |
| `off`       | 0       | always off                |

**TODO:** In [a forum post](https://op-forums.com/t/dmx-on-op-z-dmx-json-question/8099/4), `knob1` instead of `dial 1` (and so on) is mentioned. What is the correct channel type to use?

The dials are assigned to the first 8 DMX channels that are not natively supported by the OP-Z (i.e. color channels, intensity and fog channels). The same channel in different modes is assigned the same dial. After all dials are assigned, remaining channels are just represented by their default DMX value. Fine channels and null channels are always `off`.
