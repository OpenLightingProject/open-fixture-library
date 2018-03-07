This is a full list of capability types with their properties, entities and units. See the [general information about capabilities](fixture-format.md#capabilities).

### Possible entities and keywords

| Entity | Allowed Units | `-100%` | `-1%` | `0%` | `1%` | `100%`
| - | - | - | - | - | - | -
| Speed | `Hz`, `%` | fast reverse | slow reverse | stop | slow | fast
| RotationSpeed | `Hz`, `%` | fast CCW | slow CW | stop | slow CW | fast CWW
| Time | `s`, `ms`, `%` | – | – | instant | short | long
| Distance | `m`, `%` | – | – | – | near | far
| Brightness | `lm`, `%` | – | – | off | dark | bright
| ColorTemperature | `K`, `%` | warm | – | default | – | cold
| FogOutput | `m^3/min`, `%` | – | – | off | weak | strong
| RotationAngle | `°`, `%` | – | – | – | – | –
| BeamAngle | `°`, `%` | – | – | closed | narrow | wide
| Factor | (no unit), `%` | – | – | off | low | high
| Index | (no unit) | – | – | – | – | –
| Percent | `%` | – | – | off | low | high
| Insertion | `%` | – | – | out | – | in
| IrisPercent | `%` | – | – | closed | – | open

### Possible capability types

Required properties are _italic_, the entity is written in (parentheses).

* Nothing
* ShutterOpen
* ShutterClosed
* StrobeEffect
  * strobeType: one of `Normal` (default), `Random`, `Pulse`, `PulseRandom`, `RampUp`, `RampUpRandom`, `RampDown`, `RampDownRandom`
* StrobeSpeed
  * _speed_ (Speed)
  * strobeType: one of `Normal` (default), `Random`, `Pulse`, `PulseRandom`, `RampUp`, `RampUpRandom`, `RampDown`, `RampDownRandom`
* StrobeDuration
  * _time_ (Time)
  * strobeType: one of `Normal` (default), `Random`, `Pulse`, `PulseRandom`, `RampUp`, `RampUpRandom`, `RampDown`, `RampDownRandom`
* Intensity
  * _brightness_ (Brightness)
* ColorIntensity
  * _color_: one of our predefined Single Colors (Red, Green, Blue, White, Amber, etc.)
  * _brightness_ (Brightness)
* ColorPreset
  * colors: array of visible colors as hex codes; e.g. `['#ffff00']` if red and green LEDs are on that mix to yellow, `['#ff0000', '#00ff00']` if red and green laser beams are on that don't mix. UV is always counted as seperate color.
  * use colorsStart and colorsEnd instead of colors to declare a color change from the start to the end of the range
* ColorWheelIndex
  * _index_ (Index): `0` for open, `1` for Color 1, `1.5` for Color 1/2 split, etc.
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
  * effectIntensity (Factor)
  * speed (Speed)
* EffectIntensity (global, doesn't activate an effect directly)
  * _effectIntensity_ (Factor)
* EffectSpeed (global, doesn't activate an effect directly)
  * _speed_ (Speed)
* SoundSensitivity
  * _sensitivity_ (Percent)
* GoboIndex
  * _index_ (Index): `0` for open, `1` for Gobo 1, `1.5` for Gobo 1/2 split, etc.
* GoboShake
  * _index_ (Index)
  * speed (Speed)
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
  * speed (Speed)
* Frost
  * _frostIntensity_ (Percent)
* FrostEffect
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