This is a full list of capability types with their properties, entities and units. See the [general information about capabilities](fixture-format.md#capabilities).


### Possible entities and keywords

Most type-specific properties refer to one of the following entities, which allow different units. 

To make common percentage values more readable, one can use specific keywords to replace them. For example, `"speed": "fast"` has the same effect as `"speed": "100%"`.

| Entity           | Allowed Units    | `-100%`      | `-1%`        | `0%`          | `1%`                       | `100%`
| -                | -                | -            | -            | -             | -                          | -
| Speed            | `Hz`, `bpm`, `%` | fast reverse | slow reverse | stop          | slow                       | fast
| RotationSpeed    | `Hz`, `rpm`, `%` | fast CCW     | slow CCW     | stop          | slow CW                    | fast CW
| Time             | `s`, `ms`, `%`   | –            | –            | instant       | short                      | long
| Distance         | `m`, `%`         | –            | –            | –             | near                       | far
| Brightness       | `lm`, `%`        | –            | –            | off           | dark                       | bright
| ColorTemperature | `K`, `%`         | warm / CTO   | –            | default       | –                          | cold / CTB
| FogOutput        | `m^3/min`, `%`   | –            | –            | off           | weak                       | strong
| RotationAngle    | `deg`, `%`       | –            | –            | –             | –                          | –
| BeamAngle        | `deg`, `%`       | –            | –            | closed        | narrow                     | wide
| HorizontalAngle  | `deg`, `%`       | left         | –            | center        | –                          | right
| VerticalAngle    | `deg`, `%`       | top          | –            | center        | –                          | bottom
| SwingAngle       | `deg`, `%`       | –            | –            | off           | narrow                     | wide
| Parameter        | (no unit), `%`   | –            | –            | off / instant | low / slow / small / short | high / fast / big / long
| SlotNumber       | (no unit)        | –            | –            | –             | –                          | –
| Percent          | `%`              | –            | –            | off           | low                        | high
| Insertion        | `%`              | –            | –            | out           | –                          | in
| IrisPercent      | `%`              | –            | –            | closed        | –                          | open


### Possible capability types

**Table of contents**

* [NoFunction](#no-function)
* [ShutterStrobe](#shutter-strobe) / [StrobeSpeed](#strobe-speed) / [StrobeDuration](#strobe-duration)
* [Intensity](#intensity)
* [ColorIntensity](#color-intensity)
* [ColorPreset](#color-preset)
* [ColorTemperature](#color-temperature)
* [Pan](#pan) / [PanContinuous](#pan-continuous)
* [Tilt](#tilt) / [TiltContinuous](#tilt-continuous)
* [PanTiltSpeed](#pan-tilt-speed)
* [WheelSlot](#wheel-slot) / [WheelShake](#wheel-shake) / [WheelSlotRotation](#wheel-slot-rotation) / [WheelRotation](#wheel-rotation)
* [Effect](#effect) / [EffectSpeed](#effect-speed) / [EffectDuration](#effect-duration) / [EffectParameter](#effect-parameter)
* [SoundSensitivity](#sound-sensitivity)
* [BeamAngle](#beam-angle) / [BeamPosition](#beam-position)
* [Focus](#focus)
* [Zoom](#zoom)
* [Iris](#iris) / [IrisEffect](#iris-effect)
* [Frost](#frost) / [FrostEffect](#frost-effect)
* [Prism](#prism) / [PrismRotation](#prism-rotation)
* [BladeInsertion](#blade-insertion)
 / [BladeRotation](#blade-rotation) / [BladeSystemRotation](#blade-system-rotation)
* [Fog](#fog) / [FogOutput](#fog-output) / [FogType](#fog-type)
* Generic types: [Rotation](#rotation) / [Speed](#speed) / [Time](#time) / [Maintenance](#maintenance) / [Generic](#generic)


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
  <th valign="top" scope="row" id="no-function">
    <img src="../ui/assets/icons/fixture/no-function.svg" />
    NoFunction
  </th>
  <td valign="top" colspan="3">No type-specific properties.</td>
</tr>
  <th valign="top" scope="row" id="shutter-strobe" rowspan="5">
    <img src="../ui/assets/icons/fixture/shutter.svg" />
    <img src="../ui/assets/icons/fixture/strobe.svg" />
    ShutterStrobe
  </th>
  <td valign="top">shutterEffect<br><sub>🌟 required</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top"><code>Open</code>, <code>Closed</code>, <code>Strobe</code>, <code>Pulse</code>, <code>RampUp</code>, <code>RampDown</code>, <code>RampUpDown</code>, <code>Lightning</code>, <code>Spikes</code>, <code>Burst</code></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">soundControlled<br><sub>❔ optional</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></td>
  <td valign="top">Entity <em>Boolean</em></td>
  <td valign="top">Defaults to <code>false</code></td>
</tr>
<tr>
  <td valign="top">speed<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">duration<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>Time</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">randomTiming<br><sub>❔ optional</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></td>
  <td valign="top">Entity <em>Boolean</em></td>
  <td valign="top">Defaults to <code>false</code></td>
</tr>
<tr>
  <th valign="top" scope="row" id="strobe-speed">
    <img src="../ui/assets/icons/fixture/speed.svg" />
    StrobeSpeed
  </th>
  <td valign="top">speed<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top">global, doesn't activate strobe directly</td>
</tr>
<tr>
  <th valign="top" scope="row" id="strobe-duration">
    <img src="../ui/assets/icons/fixture/speed.svg" />
    StrobeDuration
  </th>
  <td valign="top">duration<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>Time</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="intensity">
    <img src="../ui/assets/icons/fixture/dimmer.svg" />
    Intensity
  </th>
  <td valign="top">brightness<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>Brightness</em></td>
  <td valign="top">Defaults to <code>brightnessStart: "off", brightnessEnd: "bright"</code></td>
</tr>
<tr>
  <th valign="top" scope="row" id="color-intensity" rowspan="2">
    <img src="../ui/assets/icons/fixture/dimmer.svg" />
    ColorIntensity
  </th>
  <td valign="top">color<br><sub>🌟 required</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top">one of our predefined Single Colors:
    <code>Red</code>, <code>Green</code>, <code>Blue</code>, <code>Cyan</code>, <code>Magenta</code>, <code>Yellow</code>, <code>Amber</code>, <code>White</code>, <code>Warm White</code>, <code>Cold White</code>, <code>UV</code>, <code>Lime</code>, <code>Indigo</code>
  </td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">brightness<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>Brightness</em></td>
  <td valign="top">Defaults to <code>brightnessStart: "off", brightnessEnd: "bright"</code></td>
</tr>
<tr>
  <th valign="top" scope="row" id="color-preset" rowspan="2">
    <img src="../ui/assets/icons/fixture/color-changer.svg" />
    ColorPreset
  </th>
  <td valign="top">colors<br><sub>❔ optional</sub></td>
  <td valign="top">array of individual color beams as hex code</td>
  <td valign="top"><a href="#property-colors">see footnote <em>colors</em></a></td>
</tr>
<tr>
  <td valign="top">colorTemperature<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>ColorTemperature</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="color-temperature">
    <img src="../ui/assets/icons/fixture/color-temperature.svg" />
    ColorTemperature
  </th>
  <td valign="top">colorTemperature<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>ColorTemperature</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="pan">
    <img src="../ui/assets/icons/fixture/pan.svg" />
    Pan
  </th>
  <td valign="top">angle<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="pan-continuous">
    <img src="../ui/assets/icons/fixture/pan-continuous-cw.svg" />
    PanContinuous
  </th>
  <td valign="top">speed<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="tilt">
    <img src="../ui/assets/icons/fixture/tilt.svg" />
    Tilt
  </th>
  <td valign="top">angle<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="tilt-continuous">
    <img src="../ui/assets/icons/fixture/tilt-continuous-cw.svg" />
    TiltContinuous
  </th>
  <td valign="top">speed<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="pan-tilt-speed" rowspan="2">
    <img src="../ui/assets/icons/fixture/speed.svg" />
    PanTiltSpeed
  </th>
  <td valign="top">speed<br><sub>🆚 required</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td rowspan="2">either <em>speed</em> or <em>duration</em> is allowed</td>
</tr>
<tr>
  <td valign="top">duration<br><sub>🆚 required</sub></td>
  <td valign="top">Entity <em>Time</em></td>
</tr>
<tr>
  <th valign="top" scope="row" id="wheel-slot" rowspan="2">
    <img src="../ui/assets/icons/fixture/gobo.svg" />
    WheelSlot
  </th>
  <td valign="top">wheel<br><sub>❔ optional</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top">Wheel name</td>
  <td valign="top">Defaults to channel name</td>
</tr>
<tr>
  <td valign="top">slotNumber<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>SlotNumber</em></td>
  <td valign="top"><a href="#property-slotnumber">see footnote <em>slotNumber</em></a></td>
</tr>
<tr>
  <th valign="top" scope="row" id="wheel-shake" rowspan="5">
    <img src="../ui/assets/icons/fixture/wheel-shake.svg" />
    <img src="../ui/assets/icons/fixture/slot-shake.svg" />
    WheelShake
  </th>
  <td valign="top">isShaking<br><sub>❔ optional</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top"><code>wheel</code> or <code>slot</code></td>
  <td valign="top">Defaults to <code>wheel</code>.</td>
</tr>
<tr>
  <td valign="top">wheel<br><sub>❔ optional</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top">Wheel name or array of wheel names</td>
  <td valign="top">Defaults to channel name. Array not allowed when <em>slotNumber</em> is set.</td>
</tr>
<tr>
  <td valign="top">slotNumber<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>SlotNumber</em></td>
  <td valign="top"><a href="#property-slotnumber">see footnote <em>slotNumber</em></a></td>
</tr>
<tr>
  <td valign="top">shakeSpeed<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">shakeAngle<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>SwingAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="wheel-slot-rotation" rowspan="4">
    <img src="../ui/assets/icons/fixture/rotation-cw.svg" />
    WheelSlotRotation
  </th>
  <td valign="top">wheel<br><sub>❔ optional</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top">Wheel name or array of wheel names</td>
  <td valign="top">Defaults to channel name. Array not allowed when <em>slotNumber</em> is set.</td>
</tr>
<tr>
  <td valign="top">slotNumber<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>SlotNumber</em></td>
  <td valign="top"><a href="#property-slotnumber">see footnote <em>slotNumber</em></a></td>
</tr>
<tr>
  <td valign="top">speed<br><sub>🆚 required</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td rowspan="2">either <em>speed</em> or <em>angle</em> is allowed</td>
</tr>
<tr>
  <td valign="top">angle<br><sub>🆚 required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
</tr>
<tr>
  <th valign="top" scope="row" id="wheel-rotation" rowspan="3">
    <img src="../ui/assets/icons/fixture/rotation-cw.svg" />
    WheelRotation
  </th>
  <td valign="top">wheel<br><sub>❔ optional</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top">Wheel name or array of wheel names</td>
  <td valign="top">Defaults to channel name.</td>
</tr>
<tr>
  <td valign="top">speed<br><sub>🆚 required</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td rowspan="2">either <em>speed</em> or <em>angle</em> is allowed</td>
</tr>
<tr>
  <td valign="top">angle<br><sub>🆚 required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
</tr>
<tr>
  <th valign="top" scope="row" id="effect" rowspan="7">
    <img src="../ui/assets/icons/fixture/effect.svg" />
    Effect
  </th>
  <td valign="top">effectName<br><sub>🆚 required</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top">Free text describing the effect</td>
  <td rowspan="2">either <em>effectName</em> or <em>effectPreset</em> is allowed</td>
</tr>
<tr>
  <td valign="top">effectPreset<br><sub>🆚 required</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top"><code>ColorJump</code> or <code>ColorFade</code></td>
</tr>
<tr>
  <td valign="top">speed<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">duration<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>Time</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">parameter<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>Parameter</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">soundControlled<br><sub>❔ optional</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></td>
  <td valign="top">Entity <em>Boolean</em></td>
  <td valign="top">Defaults to <code>false</code></td>
</tr>
<tr>
  <td valign="top">soundSensitivity<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>Percent</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="beam-angle">
    <img src="../ui/assets/icons/fixture/beam-angle.svg" />
    BeamAngle
  </th>
  <td valign="top">angle<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>BeamAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="beam-position" rowspan="2">
    <img src="../ui/assets/icons/fixture/beam-position.svg" />
    BeamPosition
  </th>
  <td valign="top">horizontalAngle<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>HorizontalAngle</em></td>
  <td valign="top" rowspan="2">at least one of <em>horizontalAngle</em> or <em>verticalAngle</em> is required</td>
</tr>
<tr>
  <td valign="top">verticalAngle<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>VerticalAngle</em></td>
</tr>
<tr>
  <th valign="top" scope="row" id="effect-speed">
    <img src="../ui/assets/icons/fixture/speed.svg" />
    EffectSpeed
  </th>
  <td valign="top">speed<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="effect-duration">
    <img src="../ui/assets/icons/fixture/speed.svg" />
    EffectDuration
  </th>
  <td valign="top">duration<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>Time</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="effect-parameter">
    <img src="../ui/assets/icons/fixture/effect-parameter.svg" />
    EffectParameter
  </th>
  <td valign="top">parameter<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>Parameter</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="sound-sensitivity">
    <img src="../ui/assets/icons/fixture/sound-sensitivity.svg" />
    SoundSensitivity
  </th>
  <td valign="top">soundSensitivity<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>Percent</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="focus">
    <img src="../ui/assets/icons/fixture/focus.svg" />
    Focus
  </th>
  <td valign="top">distance<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>Distance</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="zoom">
    <img src="../ui/assets/icons/fixture/zoom.svg" />
    Zoom
  </th>
  <td valign="top">angle<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>BeamAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="iris">
    <img src="../ui/assets/icons/fixture/iris.svg" />
    Iris
  </th>
  <td valign="top">openPercent<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>IrisPercent</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="iris-effect" rowspan="2">
    <img src="../ui/assets/icons/fixture/iris.svg" />
    IrisEffect
  </th>
  <td valign="top">effectName<br><sub>🌟 required</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top">Free text describing the effect</td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">speed<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="frost">
    <img src="../ui/assets/icons/fixture/frost.svg" />
    Frost
  </th>
  <td valign="top">frostIntensity<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>Percent</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="frost-effect" rowspan="2">
    <img src="../ui/assets/icons/fixture/frost.svg" />
    FrostEffect
  </th>
  <td valign="top">effectName<br><sub>🌟 required</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top">Free text describing the effect</td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">speed<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="prism" rowspan="2">
    <img src="../ui/assets/icons/fixture/prism.svg" />
    Prism
  </th>
  <td valign="top">speed<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td rowspan="2">activates fixture's prism; either <em>speed</em> or <em>angle</em> is allowed</td>
</tr>
<tr>
  <td valign="top">angle<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
</tr>
<tr>
  <th valign="top" scope="row" id="prism-rotation" rowspan="2">
    <img src="../ui/assets/icons/fixture/rotation-cw.svg" />
    PrismRotation
  </th>
  <td valign="top">speed<br><sub>🆚 required</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td rowspan="2">doesn't activate prism directly; either <em>speed</em> or <em>angle</em> is allowed</td>
</tr>
<tr>
  <td valign="top">angle<br><sub>🆚 required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
</tr>
<tr>
  <th valign="top" scope="row" id="blade-insertion" rowspan="2">
    <img src="../ui/assets/icons/fixture/blade-insertion.svg" />
    BladeInsertion
  </th>
  <td valign="top">blade<br><sub>🌟 required</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top"><code>Top</code>, <code>Right</code>, <code>Bottom</code>, <code>Left</code> or a number if the position is unknown</td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">insertion<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>Insertion</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="blade-rotation" rowspan="2">
    <img src="../ui/assets/icons/fixture/rotation-cw.svg" />
    BladeRotation
  </th>
  <td valign="top">blade<br><sub>🌟 required</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top"><code>Top</code>, <code>Right</code>, <code>Bottom</code>, <code>Left</code> or a number if the position is unknown</td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">angle<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="blade-system-rotation">
    <img src="../ui/assets/icons/fixture/rotation-cw.svg" />
    BladeSystemRotation
  </th>
  <td valign="top">angle<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="fog" rowspan="2">
    <img src="../ui/assets/icons/fixture/smoke.svg" />
    <img src="../ui/assets/icons/fixture/hazer.svg" />
    Fog
  </th>
  <td valign="top">fogType<br><sub>❔ optional</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top"><code>Fog</code> or <code>Haze</code></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">fogOutput<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>FogOutput</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="fog-output">
    <img src="../ui/assets/icons/fixture/smoke.svg" />
    FogOutput
  </th>
  <td valign="top">fogOutput<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>FogOutput</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="fog-type">
    <img src="../ui/assets/icons/fixture/smoke.svg" />
    <img src="../ui/assets/icons/fixture/hazer.svg" />
    FogType
  </th>
  <td valign="top">fogType<br><sub>🌟 required</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></sub></td>
  <td valign="top"><code>Fog</code> or <code>Haze</code></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="rotation" rowspan="2">
    <img src="../ui/assets/icons/fixture/rotation-cw.svg" />
    Rotation
  </th>
  <td valign="top">speed<br><sub>🆚 required</sub></td>
  <td valign="top">Entity <em>RotationSpeed</em></td>
  <td rowspan="2">either <em>speed</em> or <em>angle</em> is allowed</td>
</tr>
<tr>
  <td valign="top">angle<br><sub>🆚 required</sub></td>
  <td valign="top">Entity <em>RotationAngle</em></td>
</tr>
<tr>
  <th valign="top" scope="row" id="speed">
    <img src="../ui/assets/icons/fixture/speed.svg" />
    Speed
  </th>
  <td valign="top">speed<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>Speed</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="time">
    <img src="../ui/assets/icons/fixture/speed.svg" />
    Time
  </th>
  <td valign="top">time<br><sub>🌟 required</sub></td>
  <td valign="top">Entity <em>Time</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="maintenance" rowspan="2">
    <img src="../ui/assets/icons/fixture/maintenance.svg" />
    Maintenance
  </th>
  <td valign="top">parameter<br><sub>❔ optional</sub></td>
  <td valign="top">Entity <em>Parameter</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <td valign="top">hold<br><sub>❔ optional</sub><br><sub>👣 <a href="#must-be-stepped">must be stepped</a></td>
  <td valign="top">Entity <em>Time</em></td>
  <td valign="top"></td>
</tr>
<tr>
  <th valign="top" scope="row" id="generic">
    <img src="../ui/assets/icons/fixture/other.svg" />
    Generic
  </th>
  <td valign="top" colspan="3">No type-specific properties.</td>
</tr>
</tbody>
</table>

### Footnotes

#### Must be stepped

Properties that must be stepped (they have a 👣 footsteps icon next to them) can't be appended with `Start` or `End`. E.g. only `effectName` (not `effectNameStart`/`effectNameEnd`) is allowed, while both `speed` and `speedStart`/`speedEnd` are valid.

#### Property *colors*

"Individual color beams" means that one beam is visually distinguishable from the others, i.e.:

  * A Red/Green/Blue/White/Amber LED produces a single color beam, as all these color components are mixed together. For a color preset "Red+Blue", `colors` should be set to `["#ff00ff"]`.
  * A laser device has separate light beams that don't mix. If red and green lasers are active, `colors` should be set to `["#ff0000", "#00ff00"]`.
  * UV is always counted as a separate color as the ultraviolet light doesn't really mix with normal RGB colors. For a color preset "Red+Green+UV", `colors` should be set to `["#ffff00", "UV"]`.


#### Property *slotNumber*

Use one-based numbering (e.g. `1` for *Open*, `2` for *Color/Gobo 1*). If the capability shows a split slot, use the value halfway between them (e.g. `2.5` for *Split Color/Gobo 1/2*). If all steps in between can be selected by the proportional capability, use `slotNumberStart` and `slotNumberEnd` (e.g. from *Color/Gobo 1* to *Color/Gobo 2*).

**Note:** If there are e.g. 8 slots, and a capability allows gradually selecting anything between the last slot (*Color/Gobo 7*) and the first (*Open*) in this direction, use `"slotNumberStart": 8, "slotNumberEnd": 9`. If you chose `"slotNumberEnd": 1` instead, that would indicate a rotation in the other direction (i.e. over all other Gobos). Likewise, `"slotNumberStart": 0, "slotNumberEnd": 1` is also allowed.


### How to add new capability types / type-specific properties

* Update the schema (mainly `capability.json`, `definitions.json` for units / entities)
* Update this document (both table of contents and the section itself)
* Add new properties to the model (in `Capability.js`)
* If it's a start/end entity, add its name to `Capability.START_END_ENTITIES`
* Add new types to capability name generation (in `Capability.js`)
* Add new types to channel type generation (in `CoarseChannel.js`)
* Add a capability icon (see `ui/assets/icon` and maybe also the `app-fixture-capability-type-icon` component)
* Update editor:
  * Create new component in `ui/components/editor-capabilities`. Make sure it has a `defaultData` object as component data.
  * Import the new component in the [capability component](../ui/components/editor/EditorCapabilityTypeData.vue) and register it in its `components` section.
