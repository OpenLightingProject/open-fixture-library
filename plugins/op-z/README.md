# OP-Z Plugin

[Teenage Engineering's OP-Z](https://www.teenageengineering.com/products/op-z) synthesizer and sequencer has a separate track for controlling light fixtures via DMX. The DMX configuration is saved in a `dmx.json` file (see the [OP-Z online manual](https://www.teenageengineering.com/guides/op-z/lights)). This OFL plugin exports that `dmx.json` file for a given set of fixtures, however, it is likely that it needs manual adjustments to fit the exact configuration and workflow of the user.

The OP-Z only allows 16 fixtures to be used at the same time, so the `config` section will only include the first mode of the first 16 fixtures.


## OP-Z channel types

*This table is taken from the `how_to_dmx.txt` file in OP-Z's content mode.*

**Note:** The table in the [OP-Z online manual](https://www.teenageengineering.com/guides/op-z/lights) is out of date. `dial 1` there is now actually `knob1` (and so on).

| channel     | range   | description               |
| ----------- | ------- | ------------------------- |
| `red`       | 0 – 255 | red color                 |
| `green`     | 0 – 255 | green color               |
| `blue`      | 0 – 255 | blue color                |
| `white`     | 0 – 255 | white color               |
| `color`     | 0 – 255 | color wheel               |
| `intensity` | 0 – 255 | intensity / dimmer        |
| `fog`       | 0, 255  | triggered by animation 14 |
| `knob1`     | 0 – 255 | green knob (page 1)       |
| `knob2`     | 0 – 255 | blue knob (page 1)        |
| `knob3`     | 0 – 255 | yellow knob (page 1)      |
| `knob4`     | 0 – 255 | red knob (page 1)         |
| `knob5`     | 0 – 255 | green knob (page 2)       |
| `knob6`     | 0 – 255 | blue knob (page 2)        |
| `knob7`     | 0 – 255 | yellow knob (page 2)      |
| `knob8`     | 0 – 255 | red knob (page 2)         |
| `0 – 255`   | 0 – 255 | custom fixed value        |
| `on`        | 255     | always on                 |
| `off`       | 0       | always off                |

**TODO:** One of the example fixtures in the OP-Z's default `dmx.json` contains a `strobe` channel. Is that channel type actually supported?

The knobs are assigned to the first 8 DMX channels that are not natively supported by the OP-Z (i.e. color channels, intensity and fog channels). The same channel in different modes is assigned the same knob. After all knobs are assigned, remaining channels are just represented by their default DMX value. Fine channels and null channels are always `off`.
