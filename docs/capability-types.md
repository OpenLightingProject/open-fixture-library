This is a full list of capability types with their properties, entities and units. See the [general information about capabilities](fixture-format.md#capabilities).

### Possible entities and keywords

Most type-specific properties refer to one of the following entities, which allow different units. 

To make common percentage values more readable, one can use specific keywords to replace them. For example, `"speed": "fast"` has the same effect as `"speed": "100%"`.

| Entity           | Allowed Units    | `-100%`      | `-1%`        | `0%`    | `1%`    | `100%`
| -                | -                | -            | -            | -       | -       | -
| Speed            | `Hz`, `bpm`, `%` | fast reverse | slow reverse | stop    | slow    | fast
| RotationSpeed    | `Hz`, `bpm`, `%` | fast CCW     | slow CCW     | stop    | slow CW | fast CW
| Time             | `s`, `ms`, `%`   | –            | –            | instant | short   | long
| Distance         | `m`, `%`         | –            | –            | –       | near    | far
| Brightness       | `lm`, `%`        | –            | –            | off     | dark    | bright
| ColorTemperature | `K`, `%`         | warm / CTO   | –            | default | –       | cold / CTB
| FogOutput        | `m^3/min`, `%`   | –            | –            | off     | weak    | strong
| RotationAngle    | `deg`, `%`       | –            | –            | –       | –       | –
| BeamAngle        | `deg`, `%`       | –            | –            | closed  | narrow  | wide
| Factor           | (no unit), `%`   | –            | –            | off     | low     | high
| Index            | (no unit)        | –            | –            | –       | –       | –
| Percent          | `%`              | –            | –            | off     | low     | high
| Insertion        | `%`              | –            | –            | out     | –       | in
| IrisPercent      | `%`              | –            | –            | closed  | –       | open

### Possible capability types

Required properties are _italic_, the entity is written in (parentheses).

* Nothing
* ShutterStrobe
  * _shutterEffect_: one of `Open`, `Closed`, `Strobe`, `StrobeRandom`, `Pulse`, `PulseRandom`, `RampUp`, `RampUpRandom`, `RampDown`, `RampDownRandom`, `RampUpDown`, `RampUpDownRandom`, `Lightning`
  * speed (Speed) (can't be used together with duration)
  * duration (Time) (can't be used together with speed)
* StrobeSpeed (global, doesn't activate strobe directly)
  * _speed_ (Speed)
* StrobeDuration (global, doesn't activate strobe directly)
  * _duration_ (Time)
* Intensity
  * brightness (Brightness): Defaults to `brightnessStart: "off", brightnessEnd: "bright`
* ColorIntensity
  * _color_: one of our predefined Single Colors: `Red`, `Green`, `Blue`, `Cyan`, `Magenta`, `Yellow`, `Amber`, `White`, `UV`, `Lime`, `Indigo`
  * brightness (Brightness): Defaults to `brightnessStart: "off", brightnessEnd: "bright`
* ColorPreset
  * colors: array of individual color beams, either as hex code or color name (like `Red` or `Lavender`) that will be automatically resolved to a hex code if possible. "Individual color beams" means that is visually distinguishable from the other colors, i.e.:
    * A Red/Green/Blue/White/Amber LED produces a single color beam, as all these color components are mixed together. For a color preset "Red+White", `colors` should be set to `["#ffaaaa"]` or `["Lightred"]`.
    * A laser device has seperate light beams that don't mix. If red and green lasers are active, `colors` should be set to `["Red", "Green"]`.
    * UV is always counted as seperate color as the ultraviolet light doesn't really mix with normal RGB colors. For a color preset "Red+Green+UV", `colors` should be set to `["Yellow", "UV"]`.
  * colorTemperature (ColorTemperature)
* ColorWheelIndex
  * _index_ (Index): `0` for open, `1` for Color 1, `1.5` for Color 1/2 split, etc.
  * colors: See above
  * colorTemperature (ColorTemperature)
* ColorWheelRotationAngle
  * _angle_ (RotationAngle)
* ColorWheelRotationSpeed
  * _speed_ (RotationSpeed)
* ColorTemperature
  * _colorTemperature_ (ColorTemperature)
* Pan
  * _angle_ (RotationAngle)
* PanContinuous
  * _speed_ (RotationSpeed)
* Tilt
  * _angle_ (RotationAngle)
* TiltContinuous
  * _speed_ (RotationSpeed)
* PanTiltSpeed
  * _speed_ (Speed)
* Effect
  * _effectName_: Free text describing the effect (can't be used together with effectPreset)
  * _effectPreset_: one of `ColorJump`, `ColorFade` (can't be used together with effectName)
  * soundControlled (Boolean): Defaults to `false`
  * effectIntensity (Factor)
  * speed (Speed) (can't be used together with duration)
  * duration (Time) (can't be used together with speed)
  * soundSensitivity (Percent)
* EffectIntensity (global, doesn't activate an effect directly)
  * _effectIntensity_ (Factor)
* EffectSpeed (global, doesn't activate an effect directly)
  * _speed_ (Speed)
* EffectDuration (global, doesn't activate an effect directly)
  * _duration_ (Duration)
* SoundSensitivity
  * _sensitivity_ (Percent)
* GoboIndex
  * _index_ (Index): `0` for open, `1` for Gobo 1, `1.5` for Gobo 1/2 split, etc.
* GoboShake
  * _index_ (Index)
  * speed (Speed)
  * swingAngle (RotationAngle)
* GoboStencilRotationAngle
  * _angle_ (RotationAngle)
* GoboStencilRotationSpeed
  * _speed_ (RotationSpeed)
* GoboWheelRotationAngle
  * _angle_ (RotationAngle)
* GoboWheelRotationSpeed
  * _speed_ (RotationSpeed)
* Focus
  * _distance_ (Distance)
* Zoom
  * _angle_ (BeamAngle)
* Iris
  * _openPercent_ (IrisPercent)
* IrisEffect
  * _effectName_: Free text describing the effect
  * speed (Speed)
* Frost
  * _frostIntensity_ (Percent)
* FrostEffect
  * _effectName_: Free text describing the effect
  * speed (Speed)
* PrismOff
* PrismOn
  * angle (RotationAngle)
  * speed (RotationSpeed)
* PrismRotationAngle
  * _angle_ (RotationAngle)
* PrismRotationSpeed
  * _speed_ (RotationSpeed)
* BladeInsertion
  * _insertion_ (Insertion)
  * _blade_: one of `Top`, `Right`, `Bottom`, `Left` or a number if the position is unknown
* BladeRotation
  * _angle_ (RotationAngle)
  * _blade_: one of `Top`, `Right`, `Bottom`, `Left` or a number if the position is unknown
* BladeSystemRotation
  * _angle_ (RotationAngle)
* FogOff
* FogOn
  * fogOutput (FogOutput)
  * fogType: either `Fog` or `Haze`
* FogOutput
  * _fogOutput_ (FogOutput)
* FogType
  * _fogType_: either `Fog` or `Haze`
* BeamAngle
  * _angle_ (BeamAngle)
* RotationAngle
  * _angle_ (RotationAngle)
* RotationSpeed
  * _speed_ (RotationSpeed)
* Speed
  * _speed_ (Speed)
* Maintenance
  * parameter (Factor)
  * hold (Time)
* Generic
