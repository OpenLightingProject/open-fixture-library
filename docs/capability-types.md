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
* [PrismOff](#prismoff) / [PrismOn](#prismon) / [PrismRotation](#prismrotation)
* [BladeInsertion](#bladeinsertion)
 / [BladeRotation](#bladerotation) / [BladeSystemRotation](#bladesystemrotation)
* [FogOn](#fogon) / [FogOutput](#fogoutput) / [FogType](#fogtype)
* Generic types: [BeamAngle](#beamangle) / [Rotation](#rotation) / [Speed](#speed) / [Time](#time) / [Maintenance](#maintenance) / [Generic](#generic)


#### NoFunction

No type-specific properties.


#### ShutterStrobe

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>shutterEffect</td>
  <td>yes</td>
  <td>
    <ul>
      <li><code>Open</code></li>
      <li><code>Closed</code></li>
      <li><code>Strobe</code></li>
      <li><code>StrobeRandom</code></li>
      <li><code>Pulse</code></li>
      <li><code>PulseRandom</code></li>
      <li><code>RampUp</code></li>
      <li><code>RampUpRandom</code></li>
      <li><code>RampDown</code></li>
      <li><code>RampDownRandom</code></li>
      <li><code>RampUpDown</code></li>
      <li><code>RampUpDownRandom</code></li>
      <li><code>Lightning</code></li>
    </ul>
  </td>
  <td></td>
</tr>
<tr>
  <td>speed</td>
  <td></td>
  <td>Entity <em>Speed</em></td>
  <td></td>
</tr>
<tr>
  <td>duration</td>
  <td></td>
  <td>Entity <em>Time</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### StrobeSpeed

global, doesn't activate strobe directly

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
<tr>
  <td>speed</td>
  <td></td>
  <td>Entity <em>Speed</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### StrobeDuration

global, doesn't activate strobe directly

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>duration</td>
  <td></td>
  <td>Entity <em>Time</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### Intensity

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>brightness</td>
  <td></td>
  <td>Entity <em>Brightness</em></td>
  <td>Defaults to <code>brightnessStart: "off", brightnessEnd: "bright"</code></td>
</tr>
</tbody>
</table>


#### ColorIntensity

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>color</td>
  <td>yes</td>
  <td>one of our predefined Single Colors: <ul>
    <li><code>Red</code></li>
    <li><code>Green</code></li>
    <li><code>Blue</code></li>
    <li><code>Cyan</code></li>
    <li><code>Magenta</code></li>
    <li><code>Yellow</code></li>
    <li><code>Amber</code></li>
    <li><code>White</code></li>
    <li><code>UV</code></li>
    <li><code>Lime</code></li>
    <li><code>Indigo</code></li>
  </ul></td>
  <td></td>
</tr>
<tr>
  <td>brightness</td>
  <td></td>
  <td>Entity <em>Brightness</em></td>
  <td>Defaults to <code>brightnessStart: "off", brightnessEnd: "bright"</code></td>
</tr>
</tbody>
</table>


#### ColorPreset

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>colors</td>
  <td></td>
  <td>array of individual color beams as hex code</td>
  <td>see below</td>
</tr>
<tr>
  <td>colorTemperature</td>
  <td></td>
  <td>Entity <em>ColorTemperature</em></td>
  <td></td>
</tr>
</tbody>
</table>

"Individual color beams" means that one beam is visually distinguishable from the others, i.e.:

  * A Red/Green/Blue/White/Amber LED produces a single color beam, as all these color components are mixed together. For a color preset "Red+Blue", `colors` should be set to `["#ff00ff"]`.
  * A laser device has seperate light beams that don't mix. If red and green lasers are active, `colors` should be set to `["#ff0000", "#00ff00"]`.
  * UV is always counted as a separate color as the ultraviolet light doesn't really mix with normal RGB colors. For a color preset "Red+Green+UV", `colors` should be set to `["#ffff00", "UV"]`.


#### ColorWheelIndex

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>index</td>
  <td>yes</td>
  <td>Entity <em>Index</em></td>
  <td><ul>
    <li><code>0</code> for open</li>
    <li><code>1</code> for Gobo 1</li>
    <li><code>1.5</code> for Gobo 1/2 split</li>
    <li>etc.</li>
  </ul></td>
</tr>
  <td>colors</td>
  <td></td>
  <td>array of individual color beams as hex code</td>
  <td>see <a href="#colorpreset"><em>ColorPreset</em></a> capability type</td>
</tr>
<tr>
  <td>colorTemperature</td>
  <td></td>
  <td>Entity <em>ColorTemperature</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### ColorWheelRotation

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>speed</td>
  <td>yes</td>
  <td>Entity <em>RotationSpeed</em></td>
  <td>can't be used together with <em>angle</em></td>
</tr>
<tr>
  <td>angle</td>
  <td>yes</td>
  <td>Entity <em>RotationAngle</em></td>
  <td>can't be used together with <em>speed</em></td>
</tr>
</tbody>
</table>


#### ColorTemperature

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>colorTemperature</td>
  <td>yes</td>
  <td>Entity <em>ColorTemperature</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### Pan

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>angle</td>
  <td>yes</td>
  <td>Entity <em>RotationAngle</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### PanContinuous

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>speed</td>
  <td>yes</td>
  <td>Entity <em>RotationSpeed</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### Tilt

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>angle</td>
  <td>yes</td>
  <td>Entity <em>RotationAngle</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### TiltContinuous

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>speed</td>
  <td>yes</td>
  <td>Entity <em>RotationSpeed</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### PanTiltSpeed

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>speed</td>
  <td>yes</td>
  <td>Entity <em>Speed</em></td>
  <td>can't be used together with <em>duration</em></td>
</tr>
<tr>
  <td>duration</td>
  <td>yes</td>
  <td>Entity <em>Duration</em></td>
  <td>can't be used together with <em>speed</em></td>
</tr>
</tbody>
</table>


#### Effect

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>effectName</td>
  <td>yes</td>
  <td>Free text describing the effect</td>
  <td>can't be used together with <em>effectPreset</em></td>
</tr>
<tr>
  <td>effectPreset</td>
  <td>yes</td>
  <td><code>ColorJump</code> or <code>ColorFade</code></td>
  <td>can't be used together with <em>effectName</em></td>
</tr>
<tr>
  <td>speed</td>
  <td></td>
  <td>Entity <em>Speed</em></td>
  <td></td>
</tr>
<tr>
  <td>duration</td>
  <td></td>
  <td>Entity <em>Time</em></td>
  <td></td>
</tr>
<tr>
  <td>effectIntensity</td>
  <td></td>
  <td>Entity <em>Factor</em></td>
  <td></td>
</tr>
<tr>
  <td>soundControlled</td>
  <td></td>
  <td>Entity <em>Boolean</em></td>
  <td>Defaults to <code>false</code></td>
</tr>
<tr>
  <td>soundSensitivity</td>
  <td></td>
  <td>Entity <em>Percent</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### EffectIntensity

global, doesn't activate an effect directly

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>effectIntensity</td>
  <td>yes</td>
  <td>Entity <em>Factor</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### EffectSpeed

global, doesn't activate an effect directly

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>speed</td>
  <td>yes</td>
  <td>Entity <em>Speed</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### EffectDuration

global, doesn't activate an effect directly

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>duration</td>
  <td>yes</td>
  <td>Entity <em>Duration</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### SoundSensitivity

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>soundSensitivity</td>
  <td>yes</td>
  <td>Entity <em>Percent</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### GoboIndex

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>index</td>
  <td>yes</td>
  <td>Entity <em>Index</em></td>
  <td><ul>
    <li><code>0</code> for open</li>
    <li><code>1</code> for Gobo 1</li>
    <li><code>1.5</code> for Gobo 1/2 split</li>
    <li>etc.</li>
  </ul></td>
</tr>
<tr>
  <td>shakeSpeed</td>
  <td></td>
  <td>Entity <em>Speed</em></td>
  <td></td>
</tr>
<tr>
  <td>shakeAngle</td>
  <td></td>
  <td>Entity <em>SwingAngle</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### GoboShake

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>shakeSpeed</td>
  <td></td>
  <td>Entity <em>Speed</em></td>
  <td></td>
</tr>
<tr>
  <td>shakeAngle</td>
  <td></td>
  <td>Entity <em>SwingAngle</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### GoboStencilRotation

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>speed</td>
  <td>yes</td>
  <td>Entity <em>RotationSpeed</em></td>
  <td>can't be used together with <em>angle</em></td>
</tr>
<tr>
  <td>angle</td>
  <td>yes</td>
  <td>Entity <em>RotationAngle</em></td>
  <td>can't be used together with <em>speed</em></td>
</tr>
</tbody>
</table>


#### GoboWheelRotation

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>speed</td>
  <td>yes</td>
  <td>Entity <em>RotationSpeed</em></td>
  <td>can't be used together with <em>angle</em></td>
</tr>
<tr>
  <td>angle</td>
  <td>yes</td>
  <td>Entity <em>RotationAngle</em></td>
  <td>can't be used together with <em>speed</em></td>
</tr>
</tbody>
</table>


#### Focus

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>distance</td>
  <td>yes</td>
  <td>Entity <em>Distance</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### Zoom

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>angle</td>
  <td>yes</td>
  <td>Entity <em>BeamAngle</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### Iris

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>openPercent</td>
  <td>yes</td>
  <td>Entity <em>IrisPercent</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### IrisEffect

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>effectName</td>
  <td>yes</td>
  <td>Free text describing the effect</td>
  <td></td>
</tr>
<tr>
  <td>speed</td>
  <td></td>
  <td>Entity <em>Speed</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### Frost

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>frostIntensity</td>
  <td>yes</td>
  <td>Entity <em>Percent</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### FrostEffect

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>effectName</td>
  <td>yes</td>
  <td>Free text describing the effect</td>
  <td></td>
</tr>
<tr>
  <td>speed</td>
  <td></td>
  <td>Entity <em>Speed</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### PrismOff

No type-specific properties.


#### PrismOn

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>speed</td>
  <td></td>
  <td>Entity <em>RotationSpeed</em></td>
  <td>can't be used together with <em>angle</em></td>
</tr>
<tr>
  <td>angle</td>
  <td></td>
  <td>Entity <em>RotationAngle</em></td>
  <td>can't be used together with <em>speed</em></td>
</tr>
</tbody>
</table>


#### PrismRotation

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>speed</td>
  <td>yes</td>
  <td>Entity <em>RotationSpeed</em></td>
  <td>can't be used together with <em>angle</em></td>
</tr>
<tr>
  <td>angle</td>
  <td>yes</td>
  <td>Entity <em>RotationAngle</em></td>
  <td>can't be used together with <em>speed</em></td>
</tr>
</tbody>
</table>


#### BladeInsertion

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>blade</td>
  <td>yes</td>
  <td><ul>
    <li><code>Top</code></li>
    <li><code>Right</code></li>
    <li><code>Bottom</code></li>
    <li><code>Left</code></li>
    <li>number if the position is unknown</li>
  </ul></td>
  <td></td>
</tr>
<tr>
  <td>insertion</td>
  <td>yes</td>
  <td>Entity <em>Insertion</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### BladeRotation

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>blade</td>
  <td>yes</td>
  <td><ul>
    <li><code>Top</code></li>
    <li><code>Right</code></li>
    <li><code>Bottom</code></li>
    <li><code>Left</code></li>
    <li>number if the position is unknown</li>
  </ul></td>
  <td></td>
</tr>
<tr>
  <td>angle</td>
  <td>yes</td>
  <td>Entity <em>RotationAngle</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### BladeSystemRotation

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>angle</td>
  <td>yes</td>
  <td>Entity <em>RotationAngle</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### FogOn

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>fogType</td>
  <td></td>
  <td><code>Fog</code> or <code>Haze</code></td>
  <td></td>
</tr>
<tr>
  <td>fogOutput</td>
  <td></td>
  <td>Entity <em>FogOutput</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### FogOutput

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>fogOutput</td>
  <td>yes</td>
  <td>Entity <em>FogOutput</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### FogType

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>fogType</td>
  <td>yes</td>
  <td><code>Fog</code> or <code>Haze</code></td>
  <td></td>
</tr>
</tbody>
</table>


#### BeamAngle

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>angle</td>
  <td>yes</td>
  <td>Entity <em>BeamAngle</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### Rotation

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>speed</td>
  <td>yes</td>
  <td>Entity <em>RotationSpeed</em></td>
  <td>can't be used together with <em>angle</em></td>
</tr>
<tr>
  <td>angle</td>
  <td>yes</td>
  <td>Entity <em>RotationAngle</em></td>
  <td>can't be used together with <em>speed</em></td>
</tr>
</tbody>
</table>


#### Speed

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>speed</td>
  <td>yes</td>
  <td>Entity <em>Speed</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### Time

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>time</td>
  <td>yes</td>
  <td>Entity <em>Time</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### Maintenance

<table>
<thead>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Possible values</th>
  <th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
  <td>parameter</td>
  <td></td>
  <td>Entity <em>Factor</em></td>
  <td></td>
</tr>
<tr>
  <td>hold</td>
  <td></td>
  <td>Entity <em>Time</em></td>
  <td></td>
</tr>
</tbody>
</table>


#### Generic

No type-specific properties.



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
