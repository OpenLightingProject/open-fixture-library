| | [*cameo* Hydrabeam 300 RGBW](https://github.com/FloEdelmann/open-fixture-library/blob/master/fixtures/cameo/hydrabeam-300-rgbw.json) | [*chauvet-dj* SlimPAR Pro H USB](https://github.com/FloEdelmann/open-fixture-library/blob/master/fixtures/chauvet-dj/slimpar-pro-h-usb.json) | [*dts* XR1200 WASH](https://github.com/FloEdelmann/open-fixture-library/blob/master/fixtures/dts/xr1200-wash.json) | [*elation* Platinum Spot 15R Pro](https://github.com/FloEdelmann/open-fixture-library/blob/master/fixtures/elation/platinum-spot-15r-pro.json) | [*generic* RGBW Fader](https://github.com/FloEdelmann/open-fixture-library/blob/master/fixtures/generic/rgbw-fader.json) | [*jb-systems* Twin Effect Laser](https://github.com/FloEdelmann/open-fixture-library/blob/master/fixtures/jb-systems/twin-effect-laser.json) | [*martin* MAC Viper Performance](https://github.com/FloEdelmann/open-fixture-library/blob/master/fixtures/martin/mac-viper-performance.json)
|-|-|-|-|-|-|-|-
**Duplicate channel names** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅
**Fine channels (16bit)** [[1]](#user-content-footnote-1) | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅
**Fine channels (>16bit)** [[2]](#user-content-footnote-2) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌
**Fine channel capabilities** [[3]](#user-content-footnote-3) | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅
**Fine before coarse** [[4]](#user-content-footnote-4) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌
**Fine not-adjacent after coarse** [[5]](#user-content-footnote-5) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌
**Floating point dimensions** [[6]](#user-content-footnote-6) | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌
**Floating point weight** | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅
**Floating point power** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌
**Floating point color temperature** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌
**Floating point lumens** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌
**Floating point lens degrees** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌
**Floating point pan/tilt maximum** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌
**Heads** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌
**Multiple categories** | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅
**Multiple Focuses** [[7]](#user-content-footnote-7) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌
**No physical** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌
**`null` channels** [[8]](#user-content-footnote-8) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌
**Physical override** [[9]](#user-content-footnote-9) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌
**RDM** [[10]](#user-content-footnote-10) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅
**Reused channels** [[11]](#user-content-footnote-11) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅
**Switching channels** [[12]](#user-content-footnote-12) | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅
**Switches fine channels** [[13]](#user-content-footnote-13) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅

**<a id="user-content-footnote-1">[1]</a>**: Whether a channel defines exactly one fine channel alias

**<a id="user-content-footnote-2">[2]</a>**: Whether a channel defines two or more fine channel aliases

**<a id="user-content-footnote-3">[3]</a>**: Whether a channel with fine channel aliases has capabilities

**<a id="user-content-footnote-4">[4]</a>**: Fine channel used in a mode before its coarse channel

**<a id="user-content-footnote-5">[5]</a>**: Coarse channel with fine channels are not directly after each other

**<a id="user-content-footnote-6">[6]</a>**: In fixture physical or in a mode's physical override. See [#133](https://github.com/FloEdelmann/open-fixture-library/issues/133).

**<a id="user-content-footnote-7">[7]</a>**: True if multiple Pan / Tilt channels are used in some mode.

**<a id="user-content-footnote-8">[8]</a>**: Channel list of a mode contains null, so it has an unused channel

**<a id="user-content-footnote-9">[9]</a>**: Whether at least one mode uses the 'physical' property

**<a id="user-content-footnote-10">[10]</a>**: Whether an RDM model ID is set

**<a id="user-content-footnote-11">[11]</a>**: Whether there is at least one channel that is used in different modes

**<a id="user-content-footnote-12">[12]</a>**: Whether at least one channel defines switching channel aliases

**<a id="user-content-footnote-13">[13]</a>**: Whether at least one switching channel switches fine channels
