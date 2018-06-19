This is a full list of capability types with their properties, entities and units. See the [general information about capabilities](fixture-format.md#capabilities).


### Possible entities and keywords

Most type-specific properties refer to one of the following entities, which allow different units. 

To make common percentage values more readable, one can use specific keywords to replace them. For example, `"speed": "fast"` has the same effect as `"speed": "100%"`.

| Entity           | Allowed Units    | `-100%`      | `-1%`        | `0%`    | `1%`    | `100%`
| -                | -                | -            | -            | -       | -       | -
| Speed            | `Hz`, `bpm`, `%` | fast reverse | slow reverse | stop    | slow    | fast
| RotationSpeed    | `Hz`, `rpm`, `%` | fast CCW     | slow CCW     | stop    | slow CW | fast CW
| Time             | `s`, `ms`, `%`   | –            | –            | instant | short   | long
| Distance         | `m`, `%`         | –            | –            | –       | near    | far
| Brightness       | `lm`, `%`        | –            | –            | off     | dark    | bright
| ColorTemperature | `K`, `%`         | warm / CTO   | –            | default | –       | cold / CTB
| FogOutput        | `m^3/min`, `%`   | –            | –            | off     | weak    | strong
| RotationAngle    | `deg`, `%`       | –            | –            | –       | –       | –
| BeamAngle        | `deg`, `%`       | –            | –            | closed  | narrow  | wide
| SwingAngle       | `deg`, `%`       | –            | –            | off     | narrow  | wide
| Factor           | (no unit), `%`   | –            | –            | off     | low     | high
| Index            | (no unit)        | –            | –            | –       | –       | –
| Percent          | `%`              | –            | –            | off     | low     | high
| Insertion        | `%`              | –            | –            | out     | –       | in
| IrisPercent      | `%`              | –            | –            | closed  | –       | open


### Possible capability types

**Table of contents**

* [NoFunction](#nofunction)
* [ShutterStrobe](#shutterstrobe) / [StrobeSpeed](#strobespeed) / [StrobeDuration](#strobeduration)
* [Intensity](#intensity)
* [ColorIntensity](#colorintensity)
* [ColorPreset](#colorpreset)
* [ColorWheelIndex](#colorwheelindex) / [ColorWheelRotation](#colorwheelrotation)
* [ColorTemperature](#colortemperature)
* [Pan](#pan) / [PanContinuous](#pancontinuous)
* [Tilt](#tilt) / [TiltContinuous](#tiltcontinuous)
* [PanTiltSpeed](#pantiltspeed)
* [Effect](#effect) / [EffectIntensity](#effectintensity) / [EffectSpeed](#effectspeed) / [EffectDuration](#effectduration)
* [SoundSensitivity](#soundsensitivity)
* [GoboIndex](#goboindex) / [GoboShake](#goboshake) / [GoboStencilRotation](#gobostencilrotation) / [GoboWheelRotation](#gobowheelrotation)
* [Focus](#focus)
* [Zoom](#zoom)
* [Iris](#iris) / [IrisEffect](#iriseffect)
* [Frost](#frost) / [FrostEffect](#frosteffect)
* [Prism](#prism) / [PrismRotation](#prismrotation)
* [BladeInsertion](#bladeinsertion)
 / [BladeRotation](#bladerotation) / [BladeSystemRotation](#bladesystemrotation)
* [Fog](#fog) / [FogOutput](#fogoutput) / [FogType](#fogtype)
* Generic types: [BeamAngle](#beamangle) / [Rotation](#rotation) / [Speed](#speed) / [Time](#time) / [Maintenance](#maintenance) / [Generic](#generic)


<table>
<thead>
<tr>
  <th scope="col">Capability type</th>
  <th scope="col">Property</th>
  <th scope="col">Possible values</th>
  <th scope="col">Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <th valign="top" scope="row" id="nofunction">NoFunction</th>
  <td valign="top" colspan="3">No type-specific properties.</td>
</tr>
  <th valign="top" scope="row" id="shutterstrobe" rowspan="3">ShutterStrobe</th>
  <td valign="top">shutterEffect<br><sub>:star2: required</sub><br><sub>:feet: <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top"><code>Open</code>, <code>Closed</code>, <code>Strobe</code>, <code>StrobeRandom</code>, <code>Pulse</code>, <code>PulseRandom</code>, <code>RampUp</code>, <code>RampUpRandom</code>, <code>RampDown</code>, <code>RampDownRandom</code>, <code>RampUpDown</code>, <code>RampUpDownRandom</code>, <code>Lightning</code></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">speed<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">duration<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Time</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="strobespeed">StrobeSpeed</th>
  <td valign="top">speed<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top">global, doesn't activate strobe directly</td>
</tr>
<tr>
  <th valign="top" scope="row" id="strobeduration">StrobeDuration</th>
  <td valign="top">duration<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Time</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="intensity">Intensity</th>
  <td valign="top">brightness<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Brightness</em></td>
  <td valign="top">Defaults to <code>brightnessStart: "off", brightnessEnd: "bright"</code></td>
</tr>
<tr>
  <th valign="top" scope="row" id="colorintensity" rowspan="2">ColorIntensity</th>
  <td valign="top">color<br><sub>:star2: required</sub><br><sub>:feet: <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top">one of our predefined Single Colors:
    <code>Red</code>, <code>Green</code>, <code>Blue</code>, <code>Cyan</code>, <code>Magenta</code>, <code>Yellow</code>, <code>Amber</code>, <code>White</code>, <code>UV</code>, <code>Lime</code>, <code>Indigo</code>
  </td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">brightness<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Brightness</em></td>
  <td valign="top">Defaults to <code>brightnessStart: "off", brightnessEnd: "bright"</code></td>
</tr>
<tr>
  <th valign="top" scope="row" id="colorpreset" rowspan="2">ColorPreset</th>
  <td valign="top">colors<br><sub>:grey_question: optional</sub></td>
  <td valign="top">array of individual color beams as hex code</td>
  <td valign="top"><a href="#property-colors">see footnote <em>colors</em></a></td>
</tr>
<tr>
  <td valign="top">colorTemperature<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>ColorTemperature</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="colorwheelindex" rowspan="3">ColorWheelIndex</th>
  <td valign="top">index<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>Index</em></td>
  <td valign="top"><a href="#property-index">see footnote <em>index</em></a></td>
</tr>
  <td valign="top">colors<br><sub>:grey_question: optional</sub></td>
  <td valign="top">array of individual color beams as hex code</td>
  <td valign="top"><a href="#property-colors">see footnote <em>colors</em></a></td>
</tr>
<tr>
  <td valign="top">colorTemperature<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>ColorTemperature</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="colorwheelrotation" rowspan="2">ColorWheelRotation</th>
  <td valign="top">speed<br><sub>:vs: required</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td rowspan="2">either <em>speed</em> or <em>angle</em> is allowed</td>
</tr>
<tr>
  <td valign="top">angle<br><sub>:vs: required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
</tr>
<tr>
  <th valign="top" scope="row" id="colortemperature">ColorTemperature</th>
  <td valign="top">colorTemperature<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>ColorTemperature</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="pan">Pan</th>
  <td valign="top">angle<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="pancontinuous">PanContinuous</th>
  <td valign="top">speed<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="tilt">Tilt</th>
  <td valign="top">angle<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="tiltcontinuous">TiltContinuous</th>
  <td valign="top">speed<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="pantiltspeed" rowspan="2">PanTiltSpeed</th>
  <td valign="top">speed<br><sub>:vs: required</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td rowspan="2">either <em>speed</em> or <em>duration</em> is allowed</td>
</tr>
<tr>
  <td valign="top">duration<br><sub>:vs: required</sub></td>
  <td valign="top">Entity <em>Duration</em></td>
</tr>
<tr>
  <th valign="top" scope="row" id="effect" rowspan="7">Effect</th>
  <td valign="top">effectName<br><sub>:vs: required</sub><br><sub>:feet: <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top">Free text describing the effect</td>
  <td rowspan="2">either <em>effectName</em> or <em>effectPreset</em> is allowed</td>
</tr>
<tr>
  <td valign="top">effectPreset<br><sub>:vs: required</sub><br><sub>:feet: <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top"><code>ColorJump</code> or <code>ColorFade</code></td>
</tr>
<tr>
  <td valign="top">speed<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">duration<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Time</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">effectIntensity<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Factor</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">soundControlled<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Boolean</em></td>
  <td valign="top">Defaults to <code>false</code></td>
</tr>
<tr>
  <td valign="top">soundSensitivity<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Percent</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="effectintensity">EffectIntensity</th>
  <td valign="top">effectIntensity<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>Factor</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="effectspeed">EffectSpeed</th>
  <td valign="top">speed<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="effectduration">EffectDuration</th>
  <td valign="top">duration<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>Duration</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="soundsensitivity">SoundSensitivity</th>
  <td valign="top">soundSensitivity<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>Percent</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="goboindex" rowspan="3">GoboIndex</th>
  <td valign="top">index<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>Index</em></td>
  <td valign="top"><a href="#property-index">see footnote <em>index</em></a></td>
</tr>
<tr>
  <td valign="top">shakeSpeed<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">shakeAngle<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>SwingAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="goboshake" rowspan="2">GoboShake</th>
  <td valign="top">shakeSpeed<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">shakeAngle<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>SwingAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="gobostencilrotation" rowspan="2">GoboStencilRotation</th>
  <td valign="top">speed<br><sub>:vs: required</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td rowspan="2">either <em>speed</em> or <em>angle</em> is allowed</td>
</tr>
<tr>
  <td valign="top">angle<br><sub>:vs: required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
</tr>
<tr>
  <th valign="top" scope="row" id="gobowheelrotation" rowspan="2">GoboWheelRotation</th>
  <td valign="top">speed<br><sub>:vs: required</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td rowspan="2">either <em>speed</em> or <em>angle</em> is allowed</td>
</tr>
<tr>
  <td valign="top">angle<br><sub>:vs: required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
</tr>
<tr>
  <th valign="top" scope="row" id="focus">Focus</th>
  <td valign="top">distance<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>Distance</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="zoom">Zoom</th>
  <td valign="top">angle<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>BeamAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="iris">Iris</th>
  <td valign="top">openPercent<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>IrisPercent</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="iriseffect" rowspan="2">IrisEffect</th>
  <td valign="top">effectName<br><sub>:star2: required</sub><br><sub>:feet: <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top">Free text describing the effect</td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">speed<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="frost">Frost</th>
  <td valign="top">frostIntensity<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>Percent</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="frosteffect" rowspan="2">FrostEffect</th>
  <td valign="top">effectName<br><sub>:star2: required</sub><br><sub>:feet: <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top">Free text describing the effect</td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">speed<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="prism" rowspan="2">Prism</th>
  <td valign="top">speed<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td rowspan="2">activates fixture's prism; either <em>speed</em> or <em>angle</em> is allowed</td>
</tr>
<tr>
  <td valign="top">angle<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
</tr>
<tr>
  <th valign="top" scope="row" id="prismrotation" rowspan="2">PrismRotation</th>
  <td valign="top">speed<br><sub>:vs: required</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td rowspan="2">doesn't activate prism directly; either <em>speed</em> or <em>angle</em> is allowed</td>
</tr>
<tr>
  <td valign="top">angle<br><sub>:vs: required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
</tr>
<tr>
  <th valign="top" scope="row" id="bladeinsertion" rowspan="2">BladeInsertion</th>
  <td valign="top">blade<br><sub>:star2: required</sub><br><sub>:feet: <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top"><code>Top</code>, <code>Right</code>, <code>Bottom</code>, <code>Left</code> or a number if the position is unknown</td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">insertion<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>Insertion</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="bladerotation" rowspan="2">BladeRotation</th>
  <td valign="top">blade<br><sub>:star2: required</sub><br><sub>:feet: <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top"><code>Top</code>, <code>Right</code>, <code>Bottom</code>, <code>Left</code> or a number if the position is unknown</td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">angle<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="bladesystemrotation">BladeSystemRotation</th>
  <td valign="top">angle<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="fog" rowspan="2">Fog</th>
  <td valign="top">fogType<br><sub>:grey_question: optional</sub><br><sub>:feet: <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top"><code>Fog</code> or <code>Haze</code></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">fogOutput<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>FogOutput</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="fogoutput">FogOutput</th>
  <td valign="top">fogOutput<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>FogOutput</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="fogtype">FogType</th>
  <td valign="top">fogType<br><sub>:star2: required</sub><br><sub>:feet: <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top"><code>Fog</code> or <code>Haze</code></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="beamangle">BeamAngle</th>
  <td valign="top">angle<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>BeamAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="rotation" rowspan="2">Rotation</th>
  <td valign="top">speed<br><sub>:vs: required</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td rowspan="2">either <em>speed</em> or <em>angle</em> is allowed</td>
</tr>
<tr>
  <td valign="top">angle<br><sub>:vs: required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
</tr>
<tr>
  <th valign="top" scope="row" id="speed">Speed</th>
  <td valign="top">speed<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="time">Time</th>
  <td valign="top">time<br><sub>:star2: required</sub></td>
  <td valign="top">Entity <em>Time</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="maintenance" rowspan="2">Maintenance</th>
  <td valign="top">parameter<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Factor</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">hold<br><sub>:grey_question: optional</sub></td>
  <td valign="top">Entity <em>Time</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="generic">Generic</th>
  <td valign="top" colspan="3">No type-specific properties.</td>
</tr>
</tbody>
</table>

### Footnotes

#### Must be stepped

Properties that must be stepped (they have a :feet: footsteps icon next to them) can't be appended with `Start` or `End`. E.g. only `effectName` (not `effectNameStart`/`effectNameEnd`) is allowed, while both `speed` and `speedStart`/`speedEnd` are valid.

#### Property *colors*

"Individual color beams" means that one beam is visually distinguishable from the others, i.e.:

  * A Red/Green/Blue/White/Amber LED produces a single color beam, as all these color components are mixed together. For a color preset "Red+Blue", `colors` should be set to `["#ff00ff"]`.
  * A laser device has seperate light beams that don't mix. If red and green lasers are active, `colors` should be set to `["#ff0000", "#00ff00"]`.
  * UV is always counted as a separate color as the ultraviolet light doesn't really mix with normal RGB colors. For a color preset "Red+Green+UV", `colors` should be set to `["#ffff00", "UV"]`.


#### Property *index*

Use zero-based numbering (e.g. `0` for open, `1` for *Color/Gobo 1*). If the capability shows a split color/gobo, use the value halfway between them (e.g. `1.5` for *Split Color/Gobo 1/2*). If all steps in between can be selected by the proportional capability, use `indexStart` and `indexEnd` (e.g. from *Color/Gobo 1* to *Color/Gobo 2*).


### How to add new capability types / type-specific properties

* Update the schema (mainly `capability.json`, `definitions.json` for units / entities)
* Update this document (both table of contents and the section itself)
* Add new properties to the model (in `Capability.mjs`)
* If it's a start/end entity, add its name to `Capability.START_END_ENTITIES`
* Add new types to capability name generation (in `Capability.mjs`)
* Add new types to channel type generation (in `Channel.mjs`)
* Update editor:
  * Create new component in `ui/components/editor-capabilities`. Make sure it has a `defaultData` object as component data.
  * Import the new component in the [capability component](../ui/components/editor-capability.vue) and register it in its `components` section.
