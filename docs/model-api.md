## Classes

<dl>
<dt><a href="#AbstractChannel">AbstractChannel</a></dt>
<dd><p>Base class for channels.</p>
</dd>
<dt><a href="#Capability">Capability</a></dt>
<dd><p>A capability represents a range of a channel.</p>
</dd>
<dt><a href="#CoarseChannel">CoarseChannel</a> ⇐ <code><a href="#AbstractChannel">AbstractChannel</a></code></dt>
<dd><p>A single DMX channel, either created as availableChannel or resolved templateChannel.
Only the MSB (most significant byte) channel if it&#39;s a multi-byte channel.</p>
</dd>
<dt><a href="#Entity">Entity</a></dt>
<dd><p>A physical entity with numerical value and unit information.</p>
</dd>
<dt><a href="#FineChannel">FineChannel</a> ⇐ <code><a href="#AbstractChannel">AbstractChannel</a></code></dt>
<dd><p>Represents a finer channel of a 16+ bit channel.
Also called LSB (least significant byte) channel.</p>
</dd>
<dt><a href="#Fixture">Fixture</a></dt>
<dd><p>A physical DMX device.</p>
</dd>
<dt><a href="#Manufacturer">Manufacturer</a></dt>
<dd><p>A company or brand that produces fixtures. A fixture is associated to exactly one manufacturer.</p>
</dd>
<dt><a href="#Matrix">Matrix</a></dt>
<dd><p>Contains information of how the pixels in a 1-, 2- or 3-dimensional space are arranged and named.</p>
</dd>
<dt><a href="#Meta">Meta</a></dt>
<dd><p>Information about a fixture&#39;s author and history.</p>
</dd>
<dt><a href="#Mode">Mode</a></dt>
<dd><p>A fixture&#39;s configuration that enables a fixed set of channels and channel order.</p>
</dd>
<dt><a href="#NullChannel">NullChannel</a> ⇐ <code><a href="#CoarseChannel">CoarseChannel</a></code></dt>
<dd><p>Dummy channel used to represent <code>null</code> in a mode&#39;s channel list.</p>
</dd>
<dt><a href="#Physical">Physical</a></dt>
<dd><p>A fixture&#39;s technical data, belonging to the hardware and not the DMX protocol.</p>
</dd>
<dt><a href="#Range">Range</a></dt>
<dd><p>Represents a range from one integer to a higher or equal integer. Primarily used for DMX ranges of capabilities.</p>
</dd>
<dt><a href="#Resource">Resource</a></dt>
<dd><p>Information about a resource.</p>
</dd>
<dt><a href="#SwitchingChannel">SwitchingChannel</a> ⇐ <code><a href="#AbstractChannel">AbstractChannel</a></code></dt>
<dd><p>Represents a channel that switches its behavior depending on trigger channel&#39;s value.
The different behaviors are implemented as different <a href="#CoarseChannel">CoarseChannel</a>s or <a href="#FineChannel">FineChannel</a>s.</p>
</dd>
<dt><a href="#TemplateChannel">TemplateChannel</a></dt>
<dd><p>Represents a blueprint channel of which several similar channels can be generated.
Currently used to create matrix channels.</p>
</dd>
<dt><a href="#Wheel">Wheel</a></dt>
<dd><p>Information about a fixture&#39;s wheel.</p>
</dd>
<dt><a href="#WheelSlot">WheelSlot</a></dt>
<dd><p>Information about a single wheel slot (or a split slot).</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Resolution">Resolution</a> : <code>number</code></dt>
<dd><p>1 for 8bit, 2 for 16bit, ...</p>
</dd>
<dt><a href="#TriggerCapability">TriggerCapability</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#SwitchingChannelBehavior">SwitchingChannelBehavior</a> : <code>&#x27;keyOnly&#x27;</code> | <code>&#x27;defaultOnly&#x27;</code> | <code>&#x27;switchedOnly&#x27;</code> | <code>&#x27;all&#x27;</code></dt>
<dd></dd>
</dl>

<a name="AbstractChannel"></a>

## *AbstractChannel*
Base class for channels.

**Kind**: global abstract class  

* *[AbstractChannel](#AbstractChannel)*
    * *[new AbstractChannel(key)](#new_AbstractChannel_new)*
    * **[.fixture](#AbstractChannel+fixture) ⇒ [<code>Fixture</code>](#Fixture)**
    * *[.key](#AbstractChannel+key) ⇒ <code>string</code>*
    * *[.name](#AbstractChannel+name) ⇒ <code>string</code>*
    * *[.uniqueName](#AbstractChannel+uniqueName) ⇒ <code>string</code>*
    * *[.pixelKey](#AbstractChannel+pixelKey) ⇒ <code>string</code> \| <code>null</code>*
    * *[.pixelKey](#AbstractChannel+pixelKey)*

<a name="new_AbstractChannel_new"></a>

### *new AbstractChannel(key)*
Create a new AbstractChannel instance. Call this from child classes as `super(key)`.

**Throws**:

- <code>TypeError</code> If the AbstractChannel is instantiated directly.


| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The channel's identifier, must be unique in the fixture. |

<a name="AbstractChannel+fixture"></a>

### **abstractChannel.fixture ⇒ [<code>Fixture</code>](#Fixture)**
**Kind**: instance abstract property of [<code>AbstractChannel</code>](#AbstractChannel)  
**Returns**: [<code>Fixture</code>](#Fixture) - The fixture instance this channel is associated to.  
**Throws**:

- <code>TypeError</code> If this property is not overridden in child classes.

<a name="AbstractChannel+key"></a>

### *abstractChannel.key ⇒ <code>string</code>*
**Kind**: instance property of [<code>AbstractChannel</code>](#AbstractChannel)  
**Returns**: <code>string</code> - The channel key.  
<a name="AbstractChannel+name"></a>

### *abstractChannel.name ⇒ <code>string</code>*
Override this method for more sensible implementation.

**Kind**: instance property of [<code>AbstractChannel</code>](#AbstractChannel)  
**Returns**: <code>string</code> - The channel key (as name).  
<a name="AbstractChannel+uniqueName"></a>

### *abstractChannel.uniqueName ⇒ <code>string</code>*
**Kind**: instance property of [<code>AbstractChannel</code>](#AbstractChannel)  
**Returns**: <code>string</code> - Unique version of this channel's name.  
**See**: [uniqueChannelNames](#Fixture+uniqueChannelNames)  
<a name="AbstractChannel+pixelKey"></a>

### *abstractChannel.pixelKey ⇒ <code>string</code> \| <code>null</code>*
**Kind**: instance property of [<code>AbstractChannel</code>](#AbstractChannel)  
**Returns**: <code>string</code> \| <code>null</code> - The key of the pixel (group) that this channel is associated to. Defaults to null.  
<a name="AbstractChannel+pixelKey"></a>

### *abstractChannel.pixelKey*
**Kind**: instance property of [<code>AbstractChannel</code>](#AbstractChannel)  

| Param | Type | Description |
| --- | --- | --- |
| pixelKey | <code>string</code> \| <code>null</code> | The key of the pixel (group) that this channel is associated to. Set to null to dereference a channel from a pixel (group). |

<a name="Capability"></a>

## Capability
A capability represents a range of a channel.

**Kind**: global class  

* [Capability](#Capability)
    * [new Capability(jsonObject, resolution, channel)](#new_Capability_new)
    * _instance_
        * [.jsonObject](#Capability+jsonObject) ⇒ <code>object</code>
        * [.dmxRange](#Capability+dmxRange) ⇒ [<code>Range</code>](#Range)
        * [.rawDmxRange](#Capability+rawDmxRange) ⇒ [<code>Range</code>](#Range)
        * [.type](#Capability+type) ⇒ <code>string</code>
        * [.name](#Capability+name) ⇒ <code>string</code>
        * [.hasComment](#Capability+hasComment) ⇒ <code>boolean</code>
        * [.comment](#Capability+comment) ⇒ <code>string</code>
        * [.isStep](#Capability+isStep) ⇒ <code>boolean</code>
        * [.isInverted](#Capability+isInverted) ⇒ <code>boolean</code>
        * [.usedStartEndEntities](#Capability+usedStartEndEntities) ⇒ <code>Array.&lt;string&gt;</code>
        * [.helpWanted](#Capability+helpWanted) ⇒ <code>string</code> \| <code>null</code>
        * [.menuClick](#Capability+menuClick) ⇒ <code>&#x27;start&#x27;</code> \| <code>&#x27;center&#x27;</code> \| <code>&#x27;end&#x27;</code> \| <code>&#x27;hidden&#x27;</code>
        * [.menuClickDmxValue](#Capability+menuClickDmxValue) ⇒ <code>number</code>
        * [.switchChannels](#Capability+switchChannels) ⇒ <code>Record.&lt;string, string&gt;</code>
        * [.shutterEffect](#Capability+shutterEffect) ⇒ <code>string</code> \| <code>null</code>
        * [.color](#Capability+color) ⇒ <code>&#x27;Red&#x27;</code> \| <code>&#x27;Green&#x27;</code> \| <code>&#x27;Blue&#x27;</code> \| <code>&#x27;Cyan&#x27;</code> \| <code>&#x27;Magenta&#x27;</code> \| <code>&#x27;Yellow&#x27;</code> \| <code>&#x27;Amber&#x27;</code> \| <code>&#x27;White&#x27;</code> \| <code>&#x27;Warm White&#x27;</code> \| <code>&#x27;Cold White&#x27;</code> \| <code>&#x27;UV&#x27;</code> \| <code>&#x27;Lime&#x27;</code> \| <code>&#x27;Indigo&#x27;</code> \| <code>null</code>
        * [.colors](#Capability+colors) ⇒ <code>object</code> \| <code>null</code>
        * [.wheels](#Capability+wheels) ⇒ [<code>Array.&lt;Wheel&gt;</code>](#Wheel)
        * [.isShaking](#Capability+isShaking) ⇒ <code>&#x27;slot&#x27;</code> \| <code>&#x27;wheel&#x27;</code>
        * [.effectName](#Capability+effectName) ⇒ <code>string</code> \| <code>null</code>
        * [.effectPreset](#Capability+effectPreset) ⇒ <code>string</code> \| <code>null</code>
        * [.isSoundControlled](#Capability+isSoundControlled) ⇒ <code>boolean</code> \| <code>null</code>
        * [.randomTiming](#Capability+randomTiming) ⇒ <code>boolean</code> \| <code>null</code>
        * [.blade](#Capability+blade) ⇒ <code>&#x27;Top&#x27;</code> \| <code>&#x27;Right&#x27;</code> \| <code>&#x27;Bottom&#x27;</code> \| <code>&#x27;Left&#x27;</code> \| <code>number</code> \| <code>null</code>
        * [.fogType](#Capability+fogType) ⇒ <code>&#x27;Fog&#x27;</code> \| <code>&#x27;Haze&#x27;</code> \| <code>null</code>
        * [.hold](#Capability+hold) ⇒ [<code>Entity</code>](#Entity) \| <code>null</code>
        * [.speed](#Capability+speed) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.duration](#Capability+duration) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.time](#Capability+time) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.brightness](#Capability+brightness) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.slotNumber](#Capability+slotNumber) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.wheelSlot](#Capability+wheelSlot) ⇒ [<code>Array.&lt;WheelSlot&gt;</code>](#WheelSlot) \| <code>null</code>
        * [.angle](#Capability+angle) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.horizontalAngle](#Capability+horizontalAngle) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.verticalAngle](#Capability+verticalAngle) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.colorTemperature](#Capability+colorTemperature) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.soundSensitivity](#Capability+soundSensitivity) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.shakeAngle](#Capability+shakeAngle) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.shakeSpeed](#Capability+shakeSpeed) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.distance](#Capability+distance) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.openPercent](#Capability+openPercent) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.frostIntensity](#Capability+frostIntensity) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.insertion](#Capability+insertion) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.fogOutput](#Capability+fogOutput) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.parameter](#Capability+parameter) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
        * [.getDmxRangeWithResolution(desiredResolution)](#Capability+getDmxRangeWithResolution) ⇒ [<code>Range</code>](#Range)
        * [.canCrossfadeTo(nextCapability)](#Capability+canCrossfadeTo) ⇒ <code>boolean</code>
        * [.getMenuClickDmxValueWithResolution(desiredResolution)](#Capability+getMenuClickDmxValueWithResolution) ⇒ [<code>Range</code>](#Range)
        * [.isSlotType(slotType)](#Capability+isSlotType) ⇒ <code>boolean</code>
        * [._getStartEndArray(property)](#Capability+_getStartEndArray) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> ℗
    * _static_
        * [.START_END_ENTITIES](#Capability.START_END_ENTITIES) ⇒ <code>Array.&lt;string&gt;</code>

<a name="new_Capability_new"></a>

### new Capability(jsonObject, resolution, channel)
Create a new Capability instance.


| Param | Type | Description |
| --- | --- | --- |
| jsonObject | <code>object</code> | The capability data from the channel's JSON. |
| resolution | [<code>Resolution</code>](#Resolution) | How fine this capability is declared. |
| channel | [<code>CoarseChannel</code>](#CoarseChannel) | The channel instance this channel is associated to. |

<a name="Capability+jsonObject"></a>

### capability.jsonObject ⇒ <code>object</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>object</code> - The capability data from the channel's JSON.  
<a name="Capability+dmxRange"></a>

### capability.dmxRange ⇒ [<code>Range</code>](#Range)
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Range</code>](#Range) - The capability's DMX bounds in the channel's highest resolution.  
<a name="Capability+rawDmxRange"></a>

### capability.rawDmxRange ⇒ [<code>Range</code>](#Range)
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Range</code>](#Range) - The capability's DMX bounds from the JSON data.  
<a name="Capability+type"></a>

### capability.type ⇒ <code>string</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>string</code> - Describes which feature is controlled by this capability.  
<a name="Capability+name"></a>

### capability.name ⇒ <code>string</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>string</code> - Short one-line description of the capability, generated from the capability's type and type-specific properties.  
<a name="Capability+hasComment"></a>

### capability.hasComment ⇒ <code>boolean</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>boolean</code> - Whether this capability has a comment set.  
<a name="Capability+comment"></a>

### capability.comment ⇒ <code>string</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>string</code> - Short additional information on this capability  
<a name="Capability+isStep"></a>

### capability.isStep ⇒ <code>boolean</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>boolean</code> - Whether this capability has the same effect from the start to the end.  
<a name="Capability+isInverted"></a>

### capability.isInverted ⇒ <code>boolean</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>boolean</code> - Whether this capability ranges from a high to a low value (e.g. speed fast…slow).  
<a name="Capability+usedStartEndEntities"></a>

### capability.usedStartEndEntities ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>Array.&lt;string&gt;</code> - Names of non-null properties with (maybe equal) start/end value.  
<a name="Capability+helpWanted"></a>

### capability.helpWanted ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>string</code> \| <code>null</code> - A string describing the help that is needed for this capability, or null if no help is needed.  
<a name="Capability+menuClick"></a>

### capability.menuClick ⇒ <code>&#x27;start&#x27;</code> \| <code>&#x27;center&#x27;</code> \| <code>&#x27;end&#x27;</code> \| <code>&#x27;hidden&#x27;</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>&#x27;start&#x27;</code> \| <code>&#x27;center&#x27;</code> \| <code>&#x27;end&#x27;</code> \| <code>&#x27;hidden&#x27;</code> - The method which DMX value to set when this capability is chosen in a lighting software's auto menu.  
<a name="Capability+menuClickDmxValue"></a>

### capability.menuClickDmxValue ⇒ <code>number</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>number</code> - The DMX value to set when this capability is chosen in a lighting software's auto menu.  
<a name="Capability+switchChannels"></a>

### capability.switchChannels ⇒ <code>Record.&lt;string, string&gt;</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>Record.&lt;string, string&gt;</code> - Switching channel aliases mapped to the channel key to which the switching channel should be set to when this capability is activated.  
<a name="Capability+shutterEffect"></a>

### capability.shutterEffect ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>string</code> \| <code>null</code> - Behavior for the shutter, for example 'Closed', 'Strobe' or 'Pulse'. Defaults to null.  
<a name="Capability+color"></a>

### capability.color ⇒ <code>&#x27;Red&#x27;</code> \| <code>&#x27;Green&#x27;</code> \| <code>&#x27;Blue&#x27;</code> \| <code>&#x27;Cyan&#x27;</code> \| <code>&#x27;Magenta&#x27;</code> \| <code>&#x27;Yellow&#x27;</code> \| <code>&#x27;Amber&#x27;</code> \| <code>&#x27;White&#x27;</code> \| <code>&#x27;Warm White&#x27;</code> \| <code>&#x27;Cold White&#x27;</code> \| <code>&#x27;UV&#x27;</code> \| <code>&#x27;Lime&#x27;</code> \| <code>&#x27;Indigo&#x27;</code> \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>&#x27;Red&#x27;</code> \| <code>&#x27;Green&#x27;</code> \| <code>&#x27;Blue&#x27;</code> \| <code>&#x27;Cyan&#x27;</code> \| <code>&#x27;Magenta&#x27;</code> \| <code>&#x27;Yellow&#x27;</code> \| <code>&#x27;Amber&#x27;</code> \| <code>&#x27;White&#x27;</code> \| <code>&#x27;Warm White&#x27;</code> \| <code>&#x27;Cold White&#x27;</code> \| <code>&#x27;UV&#x27;</code> \| <code>&#x27;Lime&#x27;</code> \| <code>&#x27;Indigo&#x27;</code> \| <code>null</code> - The color of the lamp that is controlled by this ColorIntensity capability. Defaults to null.  
<a name="Capability+colors"></a>

### capability.colors ⇒ <code>object</code> \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>object</code> \| <code>null</code> - The color hex codes for each visually distinguishable light beam. Defaults to null.  
<a name="Capability+wheels"></a>

### capability.wheels ⇒ [<code>Array.&lt;Wheel&gt;</code>](#Wheel)
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Wheel&gt;</code>](#Wheel) - The wheels this capability refers to. The array has one or more elements in wheel-related capabilities, zero otherwise.  
<a name="Capability+isShaking"></a>

### capability.isShaking ⇒ <code>&#x27;slot&#x27;</code> \| <code>&#x27;wheel&#x27;</code>
Use only in `WheelShake` capabilities!

**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>&#x27;slot&#x27;</code> \| <code>&#x27;wheel&#x27;</code> - The fixture component that is shaking.  
<a name="Capability+effectName"></a>

### capability.effectName ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>string</code> \| <code>null</code> - Describes the effect that this capability activates. May be a pretty name for an effect preset. Defaults to null.  
<a name="Capability+effectPreset"></a>

### capability.effectPreset ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>string</code> \| <code>null</code> - Describes the effect that this capability activates by using a predefined, standard name. Defaults to null.  
<a name="Capability+isSoundControlled"></a>

### capability.isSoundControlled ⇒ <code>boolean</code> \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>boolean</code> \| <code>null</code> - Whether this effect is controlled by sound perceived by a microphone. Defaults to false.  
<a name="Capability+randomTiming"></a>

### capability.randomTiming ⇒ <code>boolean</code> \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>boolean</code> \| <code>null</code> - Whether this capability's speed / duration varies by a random offset. Defaults to false.  
<a name="Capability+blade"></a>

### capability.blade ⇒ <code>&#x27;Top&#x27;</code> \| <code>&#x27;Right&#x27;</code> \| <code>&#x27;Bottom&#x27;</code> \| <code>&#x27;Left&#x27;</code> \| <code>number</code> \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>&#x27;Top&#x27;</code> \| <code>&#x27;Right&#x27;</code> \| <code>&#x27;Bottom&#x27;</code> \| <code>&#x27;Left&#x27;</code> \| <code>number</code> \| <code>null</code> - At which position the blade is attached. Defaults to null.  
<a name="Capability+fogType"></a>

### capability.fogType ⇒ <code>&#x27;Fog&#x27;</code> \| <code>&#x27;Haze&#x27;</code> \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: <code>&#x27;Fog&#x27;</code> \| <code>&#x27;Haze&#x27;</code> \| <code>null</code> - The kind of fog that should be emitted. Defaults to null.  
<a name="Capability+hold"></a>

### capability.hold ⇒ [<code>Entity</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Entity</code>](#Entity) \| <code>null</code> - How long this capability should be selected to take effect. Defaults to null.  
<a name="Capability+speed"></a>

### capability.speed ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end speed values. Defaults to null.  
<a name="Capability+duration"></a>

### capability.duration ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end duration values. Defaults to null.  
<a name="Capability+time"></a>

### capability.time ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end time values. Defaults to null.  
<a name="Capability+brightness"></a>

### capability.brightness ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end brightness values. Defaults to null.  
<a name="Capability+slotNumber"></a>

### capability.slotNumber ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end slot numbers. Defaults to null.  
<a name="Capability+wheelSlot"></a>

### capability.wheelSlot ⇒ [<code>Array.&lt;WheelSlot&gt;</code>](#WheelSlot) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;WheelSlot&gt;</code>](#WheelSlot) \| <code>null</code> - Start and end wheel slot objects this capability is referencing. Defaults to null.  
<a name="Capability+angle"></a>

### capability.angle ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end angle values. Defaults to null.  
<a name="Capability+horizontalAngle"></a>

### capability.horizontalAngle ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end horizontal angle values. Defaults to null.  
<a name="Capability+verticalAngle"></a>

### capability.verticalAngle ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end vertical angle values. Defaults to null.  
<a name="Capability+colorTemperature"></a>

### capability.colorTemperature ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end colorTemperature values. Defaults to null.  
<a name="Capability+soundSensitivity"></a>

### capability.soundSensitivity ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end sound sensitivity values. Defaults to null.  
<a name="Capability+shakeAngle"></a>

### capability.shakeAngle ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end shake angle values. Defaults to null.  
<a name="Capability+shakeSpeed"></a>

### capability.shakeSpeed ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end shake speed values. Defaults to null.  
<a name="Capability+distance"></a>

### capability.distance ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end distance values. Defaults to null.  
<a name="Capability+openPercent"></a>

### capability.openPercent ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end openPercent values. Defaults to null.  
<a name="Capability+frostIntensity"></a>

### capability.frostIntensity ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end frostIntensity values. Defaults to null.  
<a name="Capability+insertion"></a>

### capability.insertion ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end insertion values. Defaults to null.  
<a name="Capability+fogOutput"></a>

### capability.fogOutput ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end fogOutput values. Defaults to null.  
<a name="Capability+parameter"></a>

### capability.parameter ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end parameter values. Defaults to null.  
<a name="Capability+getDmxRangeWithResolution"></a>

### capability.getDmxRangeWithResolution(desiredResolution) ⇒ [<code>Range</code>](#Range)
**Kind**: instance method of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Range</code>](#Range) - The capability's DMX bounds scaled (down) to the given resolution.  

| Param | Type | Description |
| --- | --- | --- |
| desiredResolution | <code>number</code> | The grade of resolution the dmxRange should be scaled to. |

<a name="Capability+canCrossfadeTo"></a>

### capability.canCrossfadeTo(nextCapability) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Capability</code>](#Capability)  
**Returns**: <code>boolean</code> - Whether this capability's end value equals the given capability's start value, i. e. one can fade from this capability to the given one.  

| Param | Type | Description |
| --- | --- | --- |
| nextCapability | [<code>Capability</code>](#Capability) | The next capability after this one. |

<a name="Capability+getMenuClickDmxValueWithResolution"></a>

### capability.getMenuClickDmxValueWithResolution(desiredResolution) ⇒ [<code>Range</code>](#Range)
**Kind**: instance method of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Range</code>](#Range) - The capability's DMX bounds scaled (down) to the given resolution.  

| Param | Type | Description |
| --- | --- | --- |
| desiredResolution | <code>number</code> | The grade of resolution the dmxRange should be scaled to. |

<a name="Capability+isSlotType"></a>

### capability.isSlotType(slotType) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Capability</code>](#Capability)  
**Returns**: <code>boolean</code> - True if the capability references a slot (or range of slots) of the given type, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| slotType | <code>string</code> \| <code>RegExp</code> | The type of the slot to check. Can be a regular expression to be checked against the type. |

<a name="Capability+_getStartEndArray"></a>

### capability.\_getStartEndArray(property) ⇒ [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> ℗
Parses a property that has start and end variants by generating an array with start and end value.

**Kind**: instance method of [<code>Capability</code>](#Capability)  
**Returns**: [<code>Array.&lt;Entity&gt;</code>](#Entity) \| <code>null</code> - Start and end value of the property (may be equal), parsed to Entity instances. null if it isn't defined in JSON.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| property | <code>string</code> | The base property name. 'Start' and 'End' will be appended to get the start/end variants. |

<a name="Capability.START_END_ENTITIES"></a>

### Capability.START\_END\_ENTITIES ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: static property of [<code>Capability</code>](#Capability)  
**Returns**: <code>Array.&lt;string&gt;</code> - Type-specific properties that may have a start and an end value.  
<a name="CoarseChannel"></a>

## CoarseChannel ⇐ [<code>AbstractChannel</code>](#AbstractChannel)
A single DMX channel, either created as availableChannel or resolved templateChannel.
Only the MSB (most significant byte) channel if it's a multi-byte channel.

**Kind**: global class  
**Extends**: [<code>AbstractChannel</code>](#AbstractChannel)  

* [CoarseChannel](#CoarseChannel) ⇐ [<code>AbstractChannel</code>](#AbstractChannel)
    * [new CoarseChannel(key, jsonObject, fixture)](#new_CoarseChannel_new)
    * _instance_
        * [.jsonObject](#CoarseChannel+jsonObject) ⇒ <code>object</code>
        * [.fixture](#CoarseChannel+fixture) ⇒ [<code>Fixture</code>](#Fixture)
        * [.name](#CoarseChannel+name) ⇒ <code>string</code>
        * [.type](#CoarseChannel+type) ⇒ <code>string</code>
        * [.color](#CoarseChannel+color) ⇒ <code>string</code> \| <code>null</code>
        * [.fineChannelAliases](#CoarseChannel+fineChannelAliases) ⇒ <code>Array.&lt;string&gt;</code>
        * [.fineChannels](#CoarseChannel+fineChannels) ⇒ [<code>Array.&lt;FineChannel&gt;</code>](#FineChannel)
        * [.maxResolution](#CoarseChannel+maxResolution) ⇒ [<code>Resolution</code>](#Resolution)
        * [.dmxValueResolution](#CoarseChannel+dmxValueResolution) ⇒ [<code>Resolution</code>](#Resolution)
        * [.maxDmxBound](#CoarseChannel+maxDmxBound) ⇒ <code>number</code>
        * [.hasDefaultValue](#CoarseChannel+hasDefaultValue) ⇒ <code>boolean</code>
        * [.defaultValue](#CoarseChannel+defaultValue) ⇒ <code>number</code>
        * [._defaultValuePerResolution](#CoarseChannel+_defaultValuePerResolution) ⇒ <code>Record.&lt;Resolution, number&gt;</code> ℗
        * [.hasHighlightValue](#CoarseChannel+hasHighlightValue) ⇒ <code>boolean</code>
        * [.highlightValue](#CoarseChannel+highlightValue) ⇒ <code>number</code>
        * [._highlightValuePerResolution](#CoarseChannel+_highlightValuePerResolution) ⇒ <code>Record.&lt;Resolution, number&gt;</code> ℗
        * [.isInverted](#CoarseChannel+isInverted) ⇒ <code>boolean</code>
        * [.isConstant](#CoarseChannel+isConstant) ⇒ <code>boolean</code>
        * [.canCrossfade](#CoarseChannel+canCrossfade) ⇒ <code>boolean</code>
        * [.precedence](#CoarseChannel+precedence) ⇒ <code>&#x27;HTP&#x27;</code> \| <code>&#x27;LTP&#x27;</code>
        * [.switchingChannelAliases](#CoarseChannel+switchingChannelAliases) ⇒ <code>Array.&lt;string&gt;</code>
        * [.switchingChannels](#CoarseChannel+switchingChannels) ⇒ [<code>Array.&lt;SwitchingChannel&gt;</code>](#SwitchingChannel)
        * [.switchToChannelKeys](#CoarseChannel+switchToChannelKeys) ⇒ <code>Array.&lt;string&gt;</code>
        * [.capabilities](#CoarseChannel+capabilities) ⇒ [<code>Array.&lt;Capability&gt;</code>](#Capability)
        * [.isHelpWanted](#CoarseChannel+isHelpWanted) ⇒ <code>boolean</code>
        * [.key](#AbstractChannel+key) ⇒ <code>string</code>
        * [.uniqueName](#AbstractChannel+uniqueName) ⇒ <code>string</code>
        * [.pixelKey](#AbstractChannel+pixelKey) ⇒ <code>string</code> \| <code>null</code>
        * [.ensureProperResolution(uncheckedResolution)](#CoarseChannel+ensureProperResolution)
        * [.getResolutionInMode(mode, switchingChannelBehavior)](#CoarseChannel+getResolutionInMode) ⇒ [<code>Resolution</code>](#Resolution)
        * [.getDefaultValueWithResolution(desiredResolution)](#CoarseChannel+getDefaultValueWithResolution) ⇒ <code>number</code>
        * [.getHighlightValueWithResolution(desiredResolution)](#CoarseChannel+getHighlightValueWithResolution) ⇒ <code>number</code>
    * _static_
        * [.RESOLUTION_8BIT](#CoarseChannel.RESOLUTION_8BIT) ⇒ [<code>Resolution</code>](#Resolution)
        * [.RESOLUTION_16BIT](#CoarseChannel.RESOLUTION_16BIT) ⇒ [<code>Resolution</code>](#Resolution)
        * [.RESOLUTION_24BIT](#CoarseChannel.RESOLUTION_24BIT) ⇒ [<code>Resolution</code>](#Resolution)
        * [.RESOLUTION_32BIT](#CoarseChannel.RESOLUTION_32BIT) ⇒ [<code>Resolution</code>](#Resolution)

<a name="new_CoarseChannel_new"></a>

### new CoarseChannel(key, jsonObject, fixture)
Create a new CoarseChannel instance.


| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The channel's identifier, must be unique in the fixture. |
| jsonObject | <code>object</code> | The channel data from the fixture's JSON. |
| fixture | [<code>Fixture</code>](#Fixture) | The fixture instance this channel is associated to. |

<a name="CoarseChannel+jsonObject"></a>

### coarseChannel.jsonObject ⇒ <code>object</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>object</code> - The channel data from the fixture's JSON.  
<a name="CoarseChannel+fixture"></a>

### coarseChannel.fixture ⇒ [<code>Fixture</code>](#Fixture)
Overrides [`AbstractChannel.fixture`](#AbstractChannel+fixture).

**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Overrides**: [<code>fixture</code>](#AbstractChannel+fixture)  
**Returns**: [<code>Fixture</code>](#Fixture) - The fixture instance this channel is associated to.  
<a name="CoarseChannel+name"></a>

### coarseChannel.name ⇒ <code>string</code>
Overrides [`AbstractChannel.name`](#AbstractChannel+name).

**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Overrides**: [<code>name</code>](#AbstractChannel+name)  
**Returns**: <code>string</code> - The channel name if present or else the channel key.  
<a name="CoarseChannel+type"></a>

### coarseChannel.type ⇒ <code>string</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>string</code> - The channel type, derived from the channel's capability types.  
<a name="CoarseChannel+color"></a>

### coarseChannel.color ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>string</code> \| <code>null</code> - The color of an included ColorIntensity capability, null if there's no such capability.  
<a name="CoarseChannel+fineChannelAliases"></a>

### coarseChannel.fineChannelAliases ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>Array.&lt;string&gt;</code> - This channel's fine channel aliases, ordered by resolution (coarsest first).  
<a name="CoarseChannel+fineChannels"></a>

### coarseChannel.fineChannels ⇒ [<code>Array.&lt;FineChannel&gt;</code>](#FineChannel)
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: [<code>Array.&lt;FineChannel&gt;</code>](#FineChannel) - This channel's fine channels, ordered by resolution (coarsest first).  
<a name="CoarseChannel+maxResolution"></a>

### coarseChannel.maxResolution ⇒ [<code>Resolution</code>](#Resolution)
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: [<code>Resolution</code>](#Resolution) - How fine this channel can be used at its maximum. Equals the amount of coarse and fine channels.  
<a name="CoarseChannel+dmxValueResolution"></a>

### coarseChannel.dmxValueResolution ⇒ [<code>Resolution</code>](#Resolution)
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: [<code>Resolution</code>](#Resolution) - How fine this channel is declared in the JSON data. Defaults to [maxResolution](#CoarseChannel+maxResolution).  
<a name="CoarseChannel+maxDmxBound"></a>

### coarseChannel.maxDmxBound ⇒ <code>number</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>number</code> - The maximum DMX value in the highest possible resolution. E.g. 65535 for a 16bit channel.  
<a name="CoarseChannel+hasDefaultValue"></a>

### coarseChannel.hasDefaultValue ⇒ <code>boolean</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>boolean</code> - Whether this channel has a defaultValue.  
<a name="CoarseChannel+defaultValue"></a>

### coarseChannel.defaultValue ⇒ <code>number</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>number</code> - The DMX value this channel initially should be set to. Specified in the finest possible resolution. Defaults to 0.  
<a name="CoarseChannel+_defaultValuePerResolution"></a>

### coarseChannel.\_defaultValuePerResolution ⇒ <code>Record.&lt;Resolution, number&gt;</code> ℗
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>Record.&lt;Resolution, number&gt;</code> - The default DMX value of this channel in the given resolution, for all resolutions up to the channel's maximum resolution.  
**Access**: private  
<a name="CoarseChannel+hasHighlightValue"></a>

### coarseChannel.hasHighlightValue ⇒ <code>boolean</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>boolean</code> - Whether this channel has a highlightValue.  
<a name="CoarseChannel+highlightValue"></a>

### coarseChannel.highlightValue ⇒ <code>number</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>number</code> - A DMX value that "highlights" the function of this channel. Specified in the finest possible resolution. Defaults to the highest possible DMX value.  
<a name="CoarseChannel+_highlightValuePerResolution"></a>

### coarseChannel.\_highlightValuePerResolution ⇒ <code>Record.&lt;Resolution, number&gt;</code> ℗
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>Record.&lt;Resolution, number&gt;</code> - The highlight DMX value of this channel in the given resolution, for all resolutions up to the channel's maximum resolution.  
**Access**: private  
<a name="CoarseChannel+isInverted"></a>

### coarseChannel.isInverted ⇒ <code>boolean</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>boolean</code> - Whether a fader for this channel should be displayed upside down.  
<a name="CoarseChannel+isConstant"></a>

### coarseChannel.isConstant ⇒ <code>boolean</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>boolean</code> - Whether this channel should constantly stay at the same value.  
<a name="CoarseChannel+canCrossfade"></a>

### coarseChannel.canCrossfade ⇒ <code>boolean</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>boolean</code> - Whether switching from one DMX value to another in this channel can be faded smoothly.  
<a name="CoarseChannel+precedence"></a>

### coarseChannel.precedence ⇒ <code>&#x27;HTP&#x27;</code> \| <code>&#x27;LTP&#x27;</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>&#x27;HTP&#x27;</code> \| <code>&#x27;LTP&#x27;</code> - The channel's behavior when being affected by multiple faders: HTP (Highest Takes Precedent) or LTP (Latest Takes Precedent).  
<a name="CoarseChannel+switchingChannelAliases"></a>

### coarseChannel.switchingChannelAliases ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>Array.&lt;string&gt;</code> - Aliases of the switching channels defined by this channel, ordered by appearance in the JSON.  
<a name="CoarseChannel+switchingChannels"></a>

### coarseChannel.switchingChannels ⇒ [<code>Array.&lt;SwitchingChannel&gt;</code>](#SwitchingChannel)
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: [<code>Array.&lt;SwitchingChannel&gt;</code>](#SwitchingChannel) - Switching channels defined by this channel, ordered by appearance in the JSON.  
<a name="CoarseChannel+switchToChannelKeys"></a>

### coarseChannel.switchToChannelKeys ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>Array.&lt;string&gt;</code> - The keys of the channels to which the switching channels defined by this channel can be switched to.  
<a name="CoarseChannel+capabilities"></a>

### coarseChannel.capabilities ⇒ [<code>Array.&lt;Capability&gt;</code>](#Capability)
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: [<code>Array.&lt;Capability&gt;</code>](#Capability) - All capabilities of this channel, ordered by DMX range.  
<a name="CoarseChannel+isHelpWanted"></a>

### coarseChannel.isHelpWanted ⇒ <code>boolean</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>boolean</code> - True if help is needed in a capability of this channel, false otherwise.  
<a name="AbstractChannel+key"></a>

### coarseChannel.key ⇒ <code>string</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Overrides**: [<code>key</code>](#AbstractChannel+key)  
**Returns**: <code>string</code> - The channel key.  
<a name="AbstractChannel+uniqueName"></a>

### coarseChannel.uniqueName ⇒ <code>string</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Overrides**: [<code>uniqueName</code>](#AbstractChannel+uniqueName)  
**Returns**: <code>string</code> - Unique version of this channel's name.  
**See**: [uniqueChannelNames](#Fixture+uniqueChannelNames)  
<a name="AbstractChannel+pixelKey"></a>

### coarseChannel.pixelKey ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Overrides**: [<code>pixelKey</code>](#AbstractChannel+pixelKey)  
**Returns**: <code>string</code> \| <code>null</code> - The key of the pixel (group) that this channel is associated to. Defaults to null.  
<a name="CoarseChannel+ensureProperResolution"></a>

### coarseChannel.ensureProperResolution(uncheckedResolution)
Checks the given resolution if it can safely be used in this channel.

**Kind**: instance method of [<code>CoarseChannel</code>](#CoarseChannel)  
**Throws**:

- <code>RangeError</code> If the given resolution is invalid in this channel.


| Param | Type | Description |
| --- | --- | --- |
| uncheckedResolution | [<code>Resolution</code>](#Resolution) | The resolution to be checked. |

<a name="CoarseChannel+getResolutionInMode"></a>

### coarseChannel.getResolutionInMode(mode, switchingChannelBehavior) ⇒ [<code>Resolution</code>](#Resolution)
**Kind**: instance method of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: [<code>Resolution</code>](#Resolution) - How fine this channel is used in the given mode. 0 if the channel isn't used at all.  

| Param | Type | Description |
| --- | --- | --- |
| mode | [<code>Mode</code>](#Mode) | The mode in which this channel is used. |
| switchingChannelBehavior | [<code>SwitchingChannelBehavior</code>](#SwitchingChannelBehavior) | How switching channels are treated, see [getChannelIndex](#Mode+getChannelIndex). |

<a name="CoarseChannel+getDefaultValueWithResolution"></a>

### coarseChannel.getDefaultValueWithResolution(desiredResolution) ⇒ <code>number</code>
**Kind**: instance method of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>number</code> - The DMX value this channel initially should be set to, scaled to match the given resolution.  

| Param | Type | Description |
| --- | --- | --- |
| desiredResolution | [<code>Resolution</code>](#Resolution) | The grade of resolution the defaultValue should be scaled to. |

<a name="CoarseChannel+getHighlightValueWithResolution"></a>

### coarseChannel.getHighlightValueWithResolution(desiredResolution) ⇒ <code>number</code>
**Kind**: instance method of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: <code>number</code> - A DMX value that "highlights" the function of this channel, scaled to match the given resolution.  

| Param | Type | Description |
| --- | --- | --- |
| desiredResolution | [<code>Resolution</code>](#Resolution) | The grade of resolution the highlightValue should be scaled to. |

<a name="CoarseChannel.RESOLUTION_8BIT"></a>

### CoarseChannel.RESOLUTION\_8BIT ⇒ [<code>Resolution</code>](#Resolution)
**Kind**: static property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: [<code>Resolution</code>](#Resolution) - Resolution of an 8bit channel.  
<a name="CoarseChannel.RESOLUTION_16BIT"></a>

### CoarseChannel.RESOLUTION\_16BIT ⇒ [<code>Resolution</code>](#Resolution)
**Kind**: static property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: [<code>Resolution</code>](#Resolution) - Resolution of a 16bit channel.  
<a name="CoarseChannel.RESOLUTION_24BIT"></a>

### CoarseChannel.RESOLUTION\_24BIT ⇒ [<code>Resolution</code>](#Resolution)
**Kind**: static property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: [<code>Resolution</code>](#Resolution) - Resolution of a 24bit channel.  
<a name="CoarseChannel.RESOLUTION_32BIT"></a>

### CoarseChannel.RESOLUTION\_32BIT ⇒ [<code>Resolution</code>](#Resolution)
**Kind**: static property of [<code>CoarseChannel</code>](#CoarseChannel)  
**Returns**: [<code>Resolution</code>](#Resolution) - Resolution of a 32bit channel.  
<a name="Entity"></a>

## Entity
A physical entity with numerical value and unit information.

**Kind**: global class  

* [Entity](#Entity)
    * [new Entity(number, unit, keyword)](#new_Entity_new)
    * _instance_
        * [.number](#Entity+number) ⇒ <code>number</code>
        * [.unit](#Entity+unit) ⇒ <code>string</code>
        * [.keyword](#Entity+keyword) ⇒ <code>string</code> \| <code>null</code>
        * [.baseUnitEntity](#Entity+baseUnitEntity) ⇒ [<code>Entity</code>](#Entity)
        * [.valueOf()](#Entity+valueOf) ⇒ <code>number</code>
        * [.toString()](#Entity+toString) ⇒ <code>string</code>
        * [.equals(anotherEntity)](#Entity+equals) ⇒ <code>boolean</code>
    * _static_
        * [.createFromEntityString(entityString)](#Entity.createFromEntityString) ⇒ [<code>Entity</code>](#Entity)

<a name="new_Entity_new"></a>

### new Entity(number, unit, keyword)
Creates a new Entity instance.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| number | <code>number</code> |  | The numerical value. |
| unit | <code>string</code> |  | The unit symbol, e.g. 'Hz'. Must be the same as in the schema. |
| keyword | <code>string</code> \| <code>null</code> | <code>null</code> | The keyword if defined using a keyword. Optional. |

<a name="Entity+number"></a>

### entity.number ⇒ <code>number</code>
**Kind**: instance property of [<code>Entity</code>](#Entity)  
**Returns**: <code>number</code> - The numerical value of this entity.  
<a name="Entity+unit"></a>

### entity.unit ⇒ <code>string</code>
**Kind**: instance property of [<code>Entity</code>](#Entity)  
**Returns**: <code>string</code> - The unit symbol, like "Hz" or "%".  
<a name="Entity+keyword"></a>

### entity.keyword ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Entity</code>](#Entity)  
**Returns**: <code>string</code> \| <code>null</code> - The used keyword, or null if no keyword was used.  
<a name="Entity+baseUnitEntity"></a>

### entity.baseUnitEntity ⇒ [<code>Entity</code>](#Entity)
**Kind**: instance property of [<code>Entity</code>](#Entity)  
**Returns**: [<code>Entity</code>](#Entity) - An entity of the same value, but scaled to the base unit. Returns the entity itself if it is already in the base unit.  
<a name="Entity+valueOf"></a>

### entity.valueOf() ⇒ <code>number</code>
Used to allow comparing like `entity1 < entity2`

**Kind**: instance method of [<code>Entity</code>](#Entity)  
**Returns**: <code>number</code> - The numerical value of this entity.  
<a name="Entity+toString"></a>

### entity.toString() ⇒ <code>string</code>
**Kind**: instance method of [<code>Entity</code>](#Entity)  
**Returns**: <code>string</code> - The entity string that could be used in the fixture's JSON data.  
<a name="Entity+equals"></a>

### entity.equals(anotherEntity) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Entity</code>](#Entity)  
**Returns**: <code>boolean</code> - Whether this entity exactly equals the given one.  

| Param | Type | Description |
| --- | --- | --- |
| anotherEntity | [<code>Entity</code>](#Entity) | Another Entity instance to compare with. |

<a name="Entity.createFromEntityString"></a>

### Entity.createFromEntityString(entityString) ⇒ [<code>Entity</code>](#Entity)
**Kind**: static method of [<code>Entity</code>](#Entity)  
**Returns**: [<code>Entity</code>](#Entity) - A new entity from the given string.  
**Throws**:

- <code>Error</code> If the entity string is invalid.


| Param | Type | Description |
| --- | --- | --- |
| entityString | <code>string</code> | The string for a single entity value from the JSON data. May also be a keyword. |

<a name="FineChannel"></a>

## FineChannel ⇐ [<code>AbstractChannel</code>](#AbstractChannel)
Represents a finer channel of a 16+ bit channel.
Also called LSB (least significant byte) channel.

**Kind**: global class  
**Extends**: [<code>AbstractChannel</code>](#AbstractChannel)  

* [FineChannel](#FineChannel) ⇐ [<code>AbstractChannel</code>](#AbstractChannel)
    * [new FineChannel(key, coarseChannel)](#new_FineChannel_new)
    * [.coarseChannel](#FineChannel+coarseChannel) ⇒ [<code>CoarseChannel</code>](#CoarseChannel)
    * [.coarserChannel](#FineChannel+coarserChannel) ⇒ [<code>CoarseChannel</code>](#CoarseChannel) \| [<code>FineChannel</code>](#FineChannel)
    * [.name](#FineChannel+name) ⇒ <code>string</code>
    * [.fixture](#FineChannel+fixture) ⇒ [<code>Fixture</code>](#Fixture)
    * [.resolution](#FineChannel+resolution) ⇒ [<code>Resolution</code>](#Resolution)
    * [.defaultValue](#FineChannel+defaultValue) ⇒ <code>number</code>
    * [.key](#AbstractChannel+key) ⇒ <code>string</code>
    * [.uniqueName](#AbstractChannel+uniqueName) ⇒ <code>string</code>
    * [.pixelKey](#AbstractChannel+pixelKey) ⇒ <code>string</code> \| <code>null</code>

<a name="new_FineChannel_new"></a>

### new FineChannel(key, coarseChannel)
Creates a new FineChannel instance.


| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The fine channel alias as defined in the coarse channel. |
| coarseChannel | [<code>CoarseChannel</code>](#CoarseChannel) | The coarse (MSB) channel. |

<a name="FineChannel+coarseChannel"></a>

### fineChannel.coarseChannel ⇒ [<code>CoarseChannel</code>](#CoarseChannel)
**Kind**: instance property of [<code>FineChannel</code>](#FineChannel)  
**Returns**: [<code>CoarseChannel</code>](#CoarseChannel) - The coarse (MSB) channel.  
<a name="FineChannel+coarserChannel"></a>

### fineChannel.coarserChannel ⇒ [<code>CoarseChannel</code>](#CoarseChannel) \| [<code>FineChannel</code>](#FineChannel)
**Kind**: instance property of [<code>FineChannel</code>](#FineChannel)  
**Returns**: [<code>CoarseChannel</code>](#CoarseChannel) \| [<code>FineChannel</code>](#FineChannel) - The next coarser channel. May also be a fine channel, if this fine channel's resolution is 24bit or higher.  
<a name="FineChannel+name"></a>

### fineChannel.name ⇒ <code>string</code>
Overrides [`AbstractChannel.name`](#AbstractChannel+name).

**Kind**: instance property of [<code>FineChannel</code>](#FineChannel)  
**Overrides**: [<code>name</code>](#AbstractChannel+name)  
**Returns**: <code>string</code> - A generated channel name, based upon the coarse channel's name.  
<a name="FineChannel+fixture"></a>

### fineChannel.fixture ⇒ [<code>Fixture</code>](#Fixture)
Overrides [`AbstractChannel.fixture`](#AbstractChannel+fixture).

**Kind**: instance property of [<code>FineChannel</code>](#FineChannel)  
**Overrides**: [<code>fixture</code>](#AbstractChannel+fixture)  
**Returns**: [<code>Fixture</code>](#Fixture) - The fixture this channel belongs to.  
<a name="FineChannel+resolution"></a>

### fineChannel.resolution ⇒ [<code>Resolution</code>](#Resolution)
**Kind**: instance property of [<code>FineChannel</code>](#FineChannel)  
**Returns**: [<code>Resolution</code>](#Resolution) - The resolution of this fine channel. E.g. 2 (16bit) for the first fine channel, 3 (24bit) for the second fine channel, etc.  
<a name="FineChannel+defaultValue"></a>

### fineChannel.defaultValue ⇒ <code>number</code>
**Kind**: instance property of [<code>FineChannel</code>](#FineChannel)  
**Returns**: <code>number</code> - The DMX value (from 0 to 255) this channel should be set to by default.  
<a name="AbstractChannel+key"></a>

### fineChannel.key ⇒ <code>string</code>
**Kind**: instance property of [<code>FineChannel</code>](#FineChannel)  
**Overrides**: [<code>key</code>](#AbstractChannel+key)  
**Returns**: <code>string</code> - The channel key.  
<a name="AbstractChannel+uniqueName"></a>

### fineChannel.uniqueName ⇒ <code>string</code>
**Kind**: instance property of [<code>FineChannel</code>](#FineChannel)  
**Overrides**: [<code>uniqueName</code>](#AbstractChannel+uniqueName)  
**Returns**: <code>string</code> - Unique version of this channel's name.  
**See**: [uniqueChannelNames](#Fixture+uniqueChannelNames)  
<a name="AbstractChannel+pixelKey"></a>

### fineChannel.pixelKey ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>FineChannel</code>](#FineChannel)  
**Overrides**: [<code>pixelKey</code>](#AbstractChannel+pixelKey)  
**Returns**: <code>string</code> \| <code>null</code> - The key of the pixel (group) that this channel is associated to. Defaults to null.  
<a name="Fixture"></a>

## Fixture
A physical DMX device.

**Kind**: global class  

* [Fixture](#Fixture)
    * [new Fixture(manufacturer, key, jsonObject)](#new_Fixture_new)
    * [.manufacturer](#Fixture+manufacturer) ⇒ [<code>Manufacturer</code>](#Manufacturer)
    * [.key](#Fixture+key) ⇒ <code>string</code>
    * [.jsonObject](#Fixture+jsonObject) ⇒ <code>object</code>
    * [.url](#Fixture+url) ⇒ <code>string</code>
    * [.name](#Fixture+name) ⇒ <code>string</code>
    * [.hasShortName](#Fixture+hasShortName) ⇒ <code>boolean</code>
    * [.shortName](#Fixture+shortName) ⇒ <code>string</code>
    * [.categories](#Fixture+categories) ⇒ <code>Array.&lt;string&gt;</code>
    * [.mainCategory](#Fixture+mainCategory) ⇒ <code>string</code>
    * [.meta](#Fixture+meta) ⇒ [<code>Meta</code>](#Meta)
    * [.hasComment](#Fixture+hasComment) ⇒ <code>boolean</code>
    * [.comment](#Fixture+comment) ⇒ <code>boolean</code>
    * [.helpWanted](#Fixture+helpWanted) ⇒ <code>string</code> \| <code>null</code>
    * [.isHelpWanted](#Fixture+isHelpWanted) ⇒ <code>boolean</code>
    * [.isCapabilityHelpWanted](#Fixture+isCapabilityHelpWanted) ⇒ <code>boolean</code>
    * [.links](#Fixture+links) ⇒ <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> \| <code>null</code>
    * [.rdm](#Fixture+rdm) ⇒ <code>object</code> \| <code>null</code>
    * [.physical](#Fixture+physical) ⇒ [<code>Physical</code>](#Physical) \| <code>null</code>
    * [.matrix](#Fixture+matrix) ⇒ [<code>Matrix</code>](#Matrix) \| <code>null</code>
    * [.wheels](#Fixture+wheels) ⇒ [<code>Array.&lt;Wheel&gt;</code>](#Wheel)
    * [._wheelByName](#Fixture+_wheelByName) ⇒ <code>Record.&lt;string, Wheel&gt;</code> ℗
    * [.uniqueChannelNames](#Fixture+uniqueChannelNames) ⇒ <code>Record.&lt;string, string&gt;</code>
    * [.availableChannelKeys](#Fixture+availableChannelKeys) ⇒ <code>Array.&lt;string&gt;</code>
    * [.availableChannels](#Fixture+availableChannels) ⇒ [<code>Array.&lt;CoarseChannel&gt;</code>](#CoarseChannel)
    * [.coarseChannelKeys](#Fixture+coarseChannelKeys) ⇒ <code>Array.&lt;string&gt;</code>
    * [.coarseChannels](#Fixture+coarseChannels) ⇒ [<code>Array.&lt;CoarseChannel&gt;</code>](#CoarseChannel)
    * [.fineChannelAliases](#Fixture+fineChannelAliases) ⇒ <code>Array.&lt;string&gt;</code>
    * [.fineChannels](#Fixture+fineChannels) ⇒ [<code>Array.&lt;FineChannel&gt;</code>](#FineChannel)
    * [.switchingChannelAliases](#Fixture+switchingChannelAliases) ⇒ <code>Array.&lt;string&gt;</code>
    * [.switchingChannels](#Fixture+switchingChannels) ⇒ [<code>Array.&lt;SwitchingChannel&gt;</code>](#SwitchingChannel)
    * [.templateChannelKeys](#Fixture+templateChannelKeys) ⇒ <code>Array.&lt;string&gt;</code>
    * [.templateChannels](#Fixture+templateChannels) ⇒ [<code>Array.&lt;TemplateChannel&gt;</code>](#TemplateChannel)
    * [._templateChannelByKey](#Fixture+_templateChannelByKey) ⇒ <code>Record.&lt;string, TemplateChannel&gt;</code> ℗
    * [.matrixChannelKeys](#Fixture+matrixChannelKeys) ⇒ <code>Array.&lt;string&gt;</code>
    * [.matrixChannels](#Fixture+matrixChannels) ⇒ [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel)
    * [.nullChannelKeys](#Fixture+nullChannelKeys) ⇒ <code>Array.&lt;string&gt;</code>
    * [.nullChannels](#Fixture+nullChannels) ⇒ [<code>Array.&lt;NullChannel&gt;</code>](#NullChannel)
    * [.allChannelKeys](#Fixture+allChannelKeys) ⇒ <code>Array.&lt;string&gt;</code>
    * [.allChannels](#Fixture+allChannels) ⇒ [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel)
    * [.allChannelsByKey](#Fixture+allChannelsByKey) ⇒ <code>Record.&lt;string, AbstractChannel&gt;</code>
    * [.capabilities](#Fixture+capabilities) ⇒ [<code>Array.&lt;Capability&gt;</code>](#Capability)
    * [.modes](#Fixture+modes) ⇒ [<code>Array.&lt;Mode&gt;</code>](#Mode)
    * [.getLinksOfType(type)](#Fixture+getLinksOfType) ⇒ <code>Array.&lt;string&gt;</code>
    * [.getWheelByName(wheelName)](#Fixture+getWheelByName) ⇒ [<code>Wheel</code>](#Wheel) \| <code>null</code>
    * [.getTemplateChannelByKey(channelKey)](#Fixture+getTemplateChannelByKey) ⇒ [<code>TemplateChannel</code>](#TemplateChannel) \| <code>null</code>
    * [.getChannelByKey(key)](#Fixture+getChannelByKey) ⇒ [<code>AbstractChannel</code>](#AbstractChannel) \| <code>null</code>

<a name="new_Fixture_new"></a>

### new Fixture(manufacturer, key, jsonObject)
Create a new Fixture instance.


| Param | Type | Description |
| --- | --- | --- |
| manufacturer | [<code>Manufacturer</code>](#Manufacturer) | A Manufacturer instance. |
| key | <code>string</code> | The fixture's unique key. Equals to filename without '.json'. |
| jsonObject | <code>object</code> | The fixture's parsed JSON data. |

<a name="Fixture+manufacturer"></a>

### fixture.manufacturer ⇒ [<code>Manufacturer</code>](#Manufacturer)
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Manufacturer</code>](#Manufacturer) - The fixture's manufacturer.  
<a name="Fixture+key"></a>

### fixture.key ⇒ <code>string</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>string</code> - The fixture's unique key. Equals to filename without '.json'.  
<a name="Fixture+jsonObject"></a>

### fixture.jsonObject ⇒ <code>object</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>object</code> - The fixture's parsed JSON data.  
<a name="Fixture+url"></a>

### fixture.url ⇒ <code>string</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>string</code> - An URL pointing to the fixture's page on the Open Fixture Library website.  
<a name="Fixture+name"></a>

### fixture.name ⇒ <code>string</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>string</code> - The fixture's product name.  
<a name="Fixture+hasShortName"></a>

### fixture.hasShortName ⇒ <code>boolean</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>boolean</code> - Whether a short name is defined for this fixture.  
<a name="Fixture+shortName"></a>

### fixture.shortName ⇒ <code>string</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>string</code> - A globally unique and as short as possible product name, defaults to name.  
<a name="Fixture+categories"></a>

### fixture.categories ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Array.&lt;string&gt;</code> - The fixture's categories with the most applicable one first.  
<a name="Fixture+mainCategory"></a>

### fixture.mainCategory ⇒ <code>string</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>string</code> - The fixture's most applicable category. Equals to first item of categories.  
<a name="Fixture+meta"></a>

### fixture.meta ⇒ [<code>Meta</code>](#Meta)
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Meta</code>](#Meta) - A Meta instance providing information like author or create date.  
<a name="Fixture+hasComment"></a>

### fixture.hasComment ⇒ <code>boolean</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>boolean</code> - Whether a comment is defined for this fixture.  
<a name="Fixture+comment"></a>

### fixture.comment ⇒ <code>boolean</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>boolean</code> - A comment about the fixture (often a note about a incorrectness in the manual). Defaults to an empty string.  
<a name="Fixture+helpWanted"></a>

### fixture.helpWanted ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>string</code> \| <code>null</code> - A string describing the help that is needed for this fixture, or null if no help is needed.  
<a name="Fixture+isHelpWanted"></a>

### fixture.isHelpWanted ⇒ <code>boolean</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>boolean</code> - True if help is needed in this fixture (maybe in a capability), false otherwise.  
<a name="Fixture+isCapabilityHelpWanted"></a>

### fixture.isCapabilityHelpWanted ⇒ <code>boolean</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>boolean</code> - True if help is needed in a capability, false otherwise.  
<a name="Fixture+links"></a>

### fixture.links ⇒ <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> \| <code>null</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> \| <code>null</code> - An object with URL arrays, organized by link type, or null if no links are available for this fixture.  
<a name="Fixture+rdm"></a>

### fixture.rdm ⇒ <code>object</code> \| <code>null</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>object</code> \| <code>null</code> - Information about the RDM functionality of this fixture. Defaults to null.  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| modelId | <code>number</code> | The RDM model/product id of the fixture, given in decimal format. |
| softwareVersion | <code>string</code> \| <code>null</code> | The software version used as reference in this fixture definition. |

<a name="Fixture+physical"></a>

### fixture.physical ⇒ [<code>Physical</code>](#Physical) \| <code>null</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Physical</code>](#Physical) \| <code>null</code> - The general physical information for the fixture, may be overridden by modes.  
<a name="Fixture+matrix"></a>

### fixture.matrix ⇒ [<code>Matrix</code>](#Matrix) \| <code>null</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Matrix</code>](#Matrix) \| <code>null</code> - The matrix information for this fixture.  
<a name="Fixture+wheels"></a>

### fixture.wheels ⇒ [<code>Array.&lt;Wheel&gt;</code>](#Wheel)
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Array.&lt;Wheel&gt;</code>](#Wheel) - The fixture's wheels as [Wheel](#Wheel) instances.  
<a name="Fixture+_wheelByName"></a>

### fixture.\_wheelByName ⇒ <code>Record.&lt;string, Wheel&gt;</code> ℗
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Record.&lt;string, Wheel&gt;</code> - This fixture's wheel names pointing to the respective Wheel instance.  
**Access**: private  
<a name="Fixture+uniqueChannelNames"></a>

### fixture.uniqueChannelNames ⇒ <code>Record.&lt;string, string&gt;</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Record.&lt;string, string&gt;</code> - Channel keys from [allChannelKeys](#Fixture+allChannelKeys) pointing to unique versions of their channel names.  
<a name="Fixture+availableChannelKeys"></a>

### fixture.availableChannelKeys ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Array.&lt;string&gt;</code> - Coarse channels from the fixture definition's `availableChannels` section. Ordered by appearance.  
<a name="Fixture+availableChannels"></a>

### fixture.availableChannels ⇒ [<code>Array.&lt;CoarseChannel&gt;</code>](#CoarseChannel)
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Array.&lt;CoarseChannel&gt;</code>](#CoarseChannel) - Coarse channels from the fixture definition's `availableChannels` section. Ordered by appearance.  
<a name="Fixture+coarseChannelKeys"></a>

### fixture.coarseChannelKeys ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Array.&lt;string&gt;</code> - Coarse channels' keys, including matrix channels' keys. If possible, ordered by appearance.  
<a name="Fixture+coarseChannels"></a>

### fixture.coarseChannels ⇒ [<code>Array.&lt;CoarseChannel&gt;</code>](#CoarseChannel)
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Array.&lt;CoarseChannel&gt;</code>](#CoarseChannel) - Coarse channels, including matrix channels. If possible, ordered by appearance.  
<a name="Fixture+fineChannelAliases"></a>

### fixture.fineChannelAliases ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Array.&lt;string&gt;</code> - All fine channels' aliases, including matrix fine channels' aliases. If possible, ordered by appearance.  
<a name="Fixture+fineChannels"></a>

### fixture.fineChannels ⇒ [<code>Array.&lt;FineChannel&gt;</code>](#FineChannel)
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Array.&lt;FineChannel&gt;</code>](#FineChannel) - All fine channels, including matrix fine channels. If possible, ordered by appearance.  
<a name="Fixture+switchingChannelAliases"></a>

### fixture.switchingChannelAliases ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Array.&lt;string&gt;</code> - All switching channels' aliases, including matrix switching channels' aliases. If possible, ordered by appearance.  
<a name="Fixture+switchingChannels"></a>

### fixture.switchingChannels ⇒ [<code>Array.&lt;SwitchingChannel&gt;</code>](#SwitchingChannel)
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Array.&lt;SwitchingChannel&gt;</code>](#SwitchingChannel) - All switching channels, including matrix switching channels. If possible, ordered by appearance.  
<a name="Fixture+templateChannelKeys"></a>

### fixture.templateChannelKeys ⇒ <code>Array.&lt;string&gt;</code>
Template channels are used to automatically generate channels.

**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Array.&lt;string&gt;</code> - All template channel keys from the fixture definition's `templateChannels` section. Ordered by appearance.  
<a name="Fixture+templateChannels"></a>

### fixture.templateChannels ⇒ [<code>Array.&lt;TemplateChannel&gt;</code>](#TemplateChannel)
Template channels are used to automatically generate channels.

**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Array.&lt;TemplateChannel&gt;</code>](#TemplateChannel) - TemplateChannel instances for all template channels from the fixture definition's `templateChannels` section. Ordered by appearance.  
<a name="Fixture+_templateChannelByKey"></a>

### fixture.\_templateChannelByKey ⇒ <code>Record.&lt;string, TemplateChannel&gt;</code> ℗
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Record.&lt;string, TemplateChannel&gt;</code> - This fixture's template channel keys pointing to the respective template channel.  
**Access**: private  
<a name="Fixture+matrixChannelKeys"></a>

### fixture.matrixChannelKeys ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Array.&lt;string&gt;</code> - Keys of all resolved matrix channels.  
<a name="Fixture+matrixChannels"></a>

### fixture.matrixChannels ⇒ [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel)
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel) - All (resolved) channels with `pixelKey` information (including fine and switching channels).  
<a name="Fixture+nullChannelKeys"></a>

### fixture.nullChannelKeys ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Array.&lt;string&gt;</code> - All null channels' keys.  
<a name="Fixture+nullChannels"></a>

### fixture.nullChannels ⇒ [<code>Array.&lt;NullChannel&gt;</code>](#NullChannel)
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Array.&lt;NullChannel&gt;</code>](#NullChannel) - Automatically generated null channels.  
<a name="Fixture+allChannelKeys"></a>

### fixture.allChannelKeys ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Array.&lt;string&gt;</code> - All channel keys used in this fixture, including resolved matrix channels' keys. If possible, ordered by appearance.  
<a name="Fixture+allChannels"></a>

### fixture.allChannels ⇒ [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel)
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel) - All channels used in this fixture, including resolved matrix channels. If possible, ordered by appearance.  
<a name="Fixture+allChannelsByKey"></a>

### fixture.allChannelsByKey ⇒ <code>Record.&lt;string, AbstractChannel&gt;</code>
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Record.&lt;string, AbstractChannel&gt;</code> - All channel keys used in this fixture pointing to the respective channel, including matrix channels. If possible, ordered by appearance.  
<a name="Fixture+capabilities"></a>

### fixture.capabilities ⇒ [<code>Array.&lt;Capability&gt;</code>](#Capability)
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Array.&lt;Capability&gt;</code>](#Capability) - All available channels' and template channels' capabilities.  
<a name="Fixture+modes"></a>

### fixture.modes ⇒ [<code>Array.&lt;Mode&gt;</code>](#Mode)
**Kind**: instance property of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Array.&lt;Mode&gt;</code>](#Mode) - The fixture's modes.  
<a name="Fixture+getLinksOfType"></a>

### fixture.getLinksOfType(type) ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance method of [<code>Fixture</code>](#Fixture)  
**Returns**: <code>Array.&lt;string&gt;</code> - An array of URLs of the specified type (may be empty).  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The type of the links that should be returned. |

<a name="Fixture+getWheelByName"></a>

### fixture.getWheelByName(wheelName) ⇒ [<code>Wheel</code>](#Wheel) \| <code>null</code>
**Kind**: instance method of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>Wheel</code>](#Wheel) \| <code>null</code> - The wheel with the given name, or null if no wheel with the given name exists.  

| Param | Type | Description |
| --- | --- | --- |
| wheelName | <code>string</code> | The name of the wheel. |

<a name="Fixture+getTemplateChannelByKey"></a>

### fixture.getTemplateChannelByKey(channelKey) ⇒ [<code>TemplateChannel</code>](#TemplateChannel) \| <code>null</code>
Searches the template channel with the given key. Fine and switching template channel aliases *can't* be found.

**Kind**: instance method of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>TemplateChannel</code>](#TemplateChannel) \| <code>null</code> - The corresponding template channel.  

| Param | Type | Description |
| --- | --- | --- |
| channelKey | <code>string</code> | The template channel's key |

<a name="Fixture+getChannelByKey"></a>

### fixture.getChannelByKey(key) ⇒ [<code>AbstractChannel</code>](#AbstractChannel) \| <code>null</code>
**Kind**: instance method of [<code>Fixture</code>](#Fixture)  
**Returns**: [<code>AbstractChannel</code>](#AbstractChannel) \| <code>null</code> - The found channel, null if not found.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The channel's key. |

<a name="Manufacturer"></a>

## Manufacturer
A company or brand that produces fixtures. A fixture is associated to exactly one manufacturer.

**Kind**: global class  

* [Manufacturer](#Manufacturer)
    * [new Manufacturer(key, jsonObject)](#new_Manufacturer_new)
    * [.name](#Manufacturer+name) ⇒ <code>string</code>
    * [.comment](#Manufacturer+comment) ⇒ <code>string</code>
    * [.hasComment](#Manufacturer+hasComment) ⇒ <code>boolean</code>
    * [.website](#Manufacturer+website) ⇒ <code>string</code> \| <code>null</code>
    * [.rdmId](#Manufacturer+rdmId) ⇒ <code>number</code> \| <code>null</code>

<a name="new_Manufacturer_new"></a>

### new Manufacturer(key, jsonObject)
Creates a new Manufacturer instance.


| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The manufacturer key. Equals to directory name in the fixtures directory. |
| jsonObject | <code>object</code> | The manufacturer's JSON object. |

<a name="Manufacturer+name"></a>

### manufacturer.name ⇒ <code>string</code>
**Kind**: instance property of [<code>Manufacturer</code>](#Manufacturer)  
**Returns**: <code>string</code> - The manufacturer's display name. Often used as prefix of fixture names, e.g. "cameo" + "Hydrabeam 100".  
<a name="Manufacturer+comment"></a>

### manufacturer.comment ⇒ <code>string</code>
**Kind**: instance property of [<code>Manufacturer</code>](#Manufacturer)  
**Returns**: <code>string</code> - An additional description or explanation, if the name doesn't give enough information. Defaults to an empty string.  
<a name="Manufacturer+hasComment"></a>

### manufacturer.hasComment ⇒ <code>boolean</code>
**Kind**: instance property of [<code>Manufacturer</code>](#Manufacturer)  
**Returns**: <code>boolean</code> - Whether this manufacturer has a comment.  
<a name="Manufacturer+website"></a>

### manufacturer.website ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Manufacturer</code>](#Manufacturer)  
**Returns**: <code>string</code> \| <code>null</code> - An URL pointing to the manufacturer's website (with fixture product pages).  
<a name="Manufacturer+rdmId"></a>

### manufacturer.rdmId ⇒ <code>number</code> \| <code>null</code>
**Kind**: instance property of [<code>Manufacturer</code>](#Manufacturer)  
**Returns**: <code>number</code> \| <code>null</code> - The id associated to this manufacturer in the RDM protocol.  
<a name="Matrix"></a>

## Matrix
Contains information of how the pixels in a 1-, 2- or 3-dimensional space are arranged and named.

**Kind**: global class  

* [Matrix](#Matrix)
    * [new Matrix(jsonObject)](#new_Matrix_new)
    * [.jsonObject](#Matrix+jsonObject) ⇒ <code>object</code>
    * [.pixelCount](#Matrix+pixelCount) ⇒ <code>Array.&lt;number&gt;</code>
    * [.pixelCountX](#Matrix+pixelCountX) ⇒ <code>number</code>
    * [.pixelCountY](#Matrix+pixelCountY) ⇒ <code>number</code>
    * [.pixelCountZ](#Matrix+pixelCountZ) ⇒ <code>number</code>
    * [.definedAxes](#Matrix+definedAxes) ⇒ <code>Array.&lt;string&gt;</code>
    * [.pixelKeyStructure](#Matrix+pixelKeyStructure) ⇒ <code>Array.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
    * [.pixelKeys](#Matrix+pixelKeys) ⇒ <code>Array.&lt;string&gt;</code>
    * [.pixelKeyPositions](#Matrix+pixelKeyPositions) ⇒ <code>Record.&lt;string, Array.&lt;number&gt;&gt;</code>
    * [.pixelGroupKeys](#Matrix+pixelGroupKeys) ⇒ <code>Array.&lt;string&gt;</code>
    * [.pixelGroups](#Matrix+pixelGroups) ⇒ <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code>
    * [._getPixelDefaultKeys()](#Matrix+_getPixelDefaultKeys) ⇒ <code>Array.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code> ℗
    * [._getPixelDefaultKey(x, y, z)](#Matrix+_getPixelDefaultKey) ⇒ <code>string</code> ℗
    * [.getPixelKeysByOrder(firstAxis, secondAxis, thirdAxis)](#Matrix+getPixelKeysByOrder) ⇒ <code>Array.&lt;string&gt;</code>
    * [._pixelKeyFulfillsConstraints(pixelKey, constraints)](#Matrix+_pixelKeyFulfillsConstraints) ⇒ <code>boolean</code>

<a name="new_Matrix_new"></a>

### new Matrix(jsonObject)

| Param | Type | Description |
| --- | --- | --- |
| jsonObject | <code>object</code> | The fixture's JSON object containing the matrix information. |

<a name="Matrix+jsonObject"></a>

### matrix.jsonObject ⇒ <code>object</code>
**Kind**: instance property of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>object</code> - The fixture's JSON object containing the matrix information.  
<a name="Matrix+pixelCount"></a>

### matrix.pixelCount ⇒ <code>Array.&lt;number&gt;</code>
**Kind**: instance property of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>Array.&lt;number&gt;</code> - Amount of pixels in X, Y and Z direction. A horizontal bar with 4 LEDs would be `[4, 1, 1]`, a 5x5 pixel head would be `[5, 5, 1]`.  
**Throws**:

- <code>ReferenceError</code> If neither `pixelCount` nor `pixelKeys` are defined in the matrix JSON object.

<a name="Matrix+pixelCountX"></a>

### matrix.pixelCountX ⇒ <code>number</code>
**Kind**: instance property of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>number</code> - Amount of pixels in X direction.  
<a name="Matrix+pixelCountY"></a>

### matrix.pixelCountY ⇒ <code>number</code>
**Kind**: instance property of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>number</code> - Amount of pixels in Y direction.  
<a name="Matrix+pixelCountZ"></a>

### matrix.pixelCountZ ⇒ <code>number</code>
**Kind**: instance property of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>number</code> - Amount of pixels in Z direction.  
<a name="Matrix+definedAxes"></a>

### matrix.definedAxes ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>Array.&lt;string&gt;</code> - Contains each of 'X', 'Y', 'Z' if its respective axis is defined (= if its `pixelCount` is > 1).  
<a name="Matrix+pixelKeyStructure"></a>

### matrix.pixelKeyStructure ⇒ <code>Array.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code>
**Kind**: instance property of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>Array.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code> - Pixel keys by Z, Y and X position.  
**Throws**:

- <code>ReferenceError</code> if neither `pixelCount` nor `pixelKeys` are defined in the matrix JSON object.

<a name="Matrix+pixelKeys"></a>

### matrix.pixelKeys ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>Array.&lt;string&gt;</code> - All pixelKeys, ordered alphanumerically (1 < 2 < 10 < alice < bob < carol)  
<a name="Matrix+pixelKeyPositions"></a>

### matrix.pixelKeyPositions ⇒ <code>Record.&lt;string, Array.&lt;number&gt;&gt;</code>
**Kind**: instance property of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>Record.&lt;string, Array.&lt;number&gt;&gt;</code> - Each pixelKey pointing to an array of its X/Y/Z position  
<a name="Matrix+pixelGroupKeys"></a>

### matrix.pixelGroupKeys ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>Array.&lt;string&gt;</code> - All available pixel group keys, ordered by appearance.  
<a name="Matrix+pixelGroups"></a>

### matrix.pixelGroups ⇒ <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code>
**Kind**: instance property of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> - Key is the group key, value is an array of pixel keys.  
<a name="Matrix+_getPixelDefaultKeys"></a>

### matrix.\_getPixelDefaultKeys() ⇒ <code>Array.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code> ℗
Generate default keys for all pixels.

**Kind**: instance method of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>Array.&lt;Array.&lt;Array.&lt;string&gt;&gt;&gt;</code> - Default pixel keys by Z, Y and X position.  
**Access**: private  
<a name="Matrix+_getPixelDefaultKey"></a>

### matrix.\_getPixelDefaultKey(x, y, z) ⇒ <code>string</code> ℗
Generate default name based on defined axes and given position if no custom names are set via `pixelKeys`.

| Dimension | Default pixelKey |
| --------- | ---------------- |
| 1D        | `"$number"`      |
| 2D        | `"($x, $y)"`     |
| 3D        | `"($x, $y, $z)"` |

**Kind**: instance method of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>string</code> - The pixel's default key.  
**Throws**:

- <code>RangeError</code> If [definedAxes](#Matrix+definedAxes).length is not 1, 2 or 3.

**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | Position of pixel in X direction. |
| y | <code>number</code> | Position of pixel in Y direction. |
| z | <code>number</code> | Position of pixel in Z direction. |

<a name="Matrix+getPixelKeysByOrder"></a>

### matrix.getPixelKeysByOrder(firstAxis, secondAxis, thirdAxis) ⇒ <code>Array.&lt;string&gt;</code>
Sorts the pixelKeys by given X/Y/Z order. Order of the parameters equals the order in a `repeatFor`'s "eachPixelXYZ".

**Kind**: instance method of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>Array.&lt;string&gt;</code> - All pixelKeys ordered by given axis order.  

| Param | Type | Description |
| --- | --- | --- |
| firstAxis | <code>&#x27;X&#x27;</code> \| <code>&#x27;Y&#x27;</code> \| <code>&#x27;Z&#x27;</code> | Axis with highest ordering. |
| secondAxis | <code>&#x27;X&#x27;</code> \| <code>&#x27;Y&#x27;</code> \| <code>&#x27;Z&#x27;</code> | Axis with middle ordering. |
| thirdAxis | <code>&#x27;X&#x27;</code> \| <code>&#x27;Y&#x27;</code> \| <code>&#x27;Z&#x27;</code> | Axis with lowest ordering. |

<a name="Matrix+_pixelKeyFulfillsConstraints"></a>

### matrix.\_pixelKeyFulfillsConstraints(pixelKey, constraints) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Matrix</code>](#Matrix)  
**Returns**: <code>boolean</code> - True if the pixel key fulfills all constraints, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| pixelKey | <code>string</code> | The pixel key to check against the constraints. |
| constraints | <code>object</code> | The constraints to apply. |

<a name="Meta"></a>

## Meta
Information about a fixture's author and history.

**Kind**: global class  

* [Meta](#Meta)
    * [new Meta(jsonObject)](#new_Meta_new)
    * [.authors](#Meta+authors) ⇒ <code>Array.&lt;string&gt;</code>
    * [.createDate](#Meta+createDate) ⇒ <code>Date</code>
    * [.lastModifyDate](#Meta+lastModifyDate) ⇒ <code>Date</code>
    * [.importPlugin](#Meta+importPlugin) ⇒ <code>string</code> \| <code>null</code>
    * [.importDate](#Meta+importDate) ⇒ <code>string</code> \| <code>null</code>
    * [.importComment](#Meta+importComment) ⇒ <code>string</code> \| <code>null</code>
    * [.hasImportComment](#Meta+hasImportComment) ⇒ <code>string</code> \| <code>null</code>

<a name="new_Meta_new"></a>

### new Meta(jsonObject)
Creates a new Meta instance.


| Param | Type | Description |
| --- | --- | --- |
| jsonObject | <code>object</code> | A meta object from the fixture's JSON data. |

<a name="Meta+authors"></a>

### meta.authors ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Meta</code>](#Meta)  
**Returns**: <code>Array.&lt;string&gt;</code> - Names of people who contributed to this fixture.  
<a name="Meta+createDate"></a>

### meta.createDate ⇒ <code>Date</code>
**Kind**: instance property of [<code>Meta</code>](#Meta)  
**Returns**: <code>Date</code> - When this fixture was created. Might not refer to the creation in OFL, but in the lighting software from which this fixture was imported.  
<a name="Meta+lastModifyDate"></a>

### meta.lastModifyDate ⇒ <code>Date</code>
**Kind**: instance property of [<code>Meta</code>](#Meta)  
**Returns**: <code>Date</code> - When this fixture was changed the last time. Might not refer to a modification in OFL, but in the lighting software from which this fixture was imported.  
<a name="Meta+importPlugin"></a>

### meta.importPlugin ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Meta</code>](#Meta)  
**Returns**: <code>string</code> \| <code>null</code> - The key of the plugin with which this fixture was imported. Null if it's not imported.  
<a name="Meta+importDate"></a>

### meta.importDate ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Meta</code>](#Meta)  
**Returns**: <code>string</code> \| <code>null</code> - When this fixture was imported. Null if it's not imported.  
<a name="Meta+importComment"></a>

### meta.importComment ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Meta</code>](#Meta)  
**Returns**: <code>string</code> \| <code>null</code> - A comment further describing the import process. Null if it's not imported.  
<a name="Meta+hasImportComment"></a>

### meta.hasImportComment ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Meta</code>](#Meta)  
**Returns**: <code>string</code> \| <code>null</code> - Whether there is an import comment. Always false if it's not imported.  
<a name="Mode"></a>

## Mode
A fixture's configuration that enables a fixed set of channels and channel order.

**Kind**: global class  

* [Mode](#Mode)
    * [new Mode(jsonObject, fixture)](#new_Mode_new)
    * [.jsonObject](#Mode+jsonObject) ⇒ <code>object</code>
    * [.fixture](#Mode+fixture) ⇒ [<code>Fixture</code>](#Fixture)
    * [.name](#Mode+name) ⇒ <code>string</code>
    * [.shortName](#Mode+shortName) ⇒ <code>string</code>
    * [.hasShortName](#Mode+hasShortName) ⇒ <code>boolean</code>
    * [.rdmPersonalityIndex](#Mode+rdmPersonalityIndex) ⇒ <code>number</code> \| <code>null</code>
    * [.physicalOverride](#Mode+physicalOverride) ⇒ [<code>Physical</code>](#Physical) \| <code>null</code>
    * [.physical](#Mode+physical) ⇒ [<code>Physical</code>](#Physical) \| <code>null</code>
    * [.channelKeys](#Mode+channelKeys) ⇒ <code>Array.&lt;string&gt;</code>
    * [.nullChannelCount](#Mode+nullChannelCount) ⇒ <code>number</code>
    * [.channels](#Mode+channels) ⇒ [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel)
    * [._getMatrixChannelKeysFromInsertBlock(channelInsert)](#Mode+_getMatrixChannelKeysFromInsertBlock) ⇒ <code>Array.&lt;string&gt;</code> ℗
    * [._getRepeatForPixelKeys(repeatFor)](#Mode+_getRepeatForPixelKeys) ⇒ <code>Array.&lt;string&gt;</code> ℗
    * [.getChannelIndex(channelKey, [switchingChannelBehavior])](#Mode+getChannelIndex) ⇒ <code>number</code>

<a name="new_Mode_new"></a>

### new Mode(jsonObject, fixture)
Creates a new Mode instance


| Param | Type | Description |
| --- | --- | --- |
| jsonObject | <code>object</code> | The mode object from the fixture's JSON data. |
| fixture | [<code>Fixture</code>](#Fixture) | The fixture this mode is associated to. |

<a name="Mode+jsonObject"></a>

### mode.jsonObject ⇒ <code>object</code>
**Kind**: instance property of [<code>Mode</code>](#Mode)  
**Returns**: <code>object</code> - The JSON data representing this mode. It's a fragment of a fixture's JSON data.  
<a name="Mode+fixture"></a>

### mode.fixture ⇒ [<code>Fixture</code>](#Fixture)
**Kind**: instance property of [<code>Mode</code>](#Mode)  
**Returns**: [<code>Fixture</code>](#Fixture) - The fixture this mode belongs to.  
<a name="Mode+name"></a>

### mode.name ⇒ <code>string</code>
**Kind**: instance property of [<code>Mode</code>](#Mode)  
**Returns**: <code>string</code> - The mode's name from the JSON data.  
<a name="Mode+shortName"></a>

### mode.shortName ⇒ <code>string</code>
**Kind**: instance property of [<code>Mode</code>](#Mode)  
**Returns**: <code>string</code> - A shorter mode name from the JSON data. Defaults to the normal name.  
<a name="Mode+hasShortName"></a>

### mode.hasShortName ⇒ <code>boolean</code>
**Kind**: instance property of [<code>Mode</code>](#Mode)  
**Returns**: <code>boolean</code> - Whether this mode has a short name set in the JSON data.  
<a name="Mode+rdmPersonalityIndex"></a>

### mode.rdmPersonalityIndex ⇒ <code>number</code> \| <code>null</code>
**Kind**: instance property of [<code>Mode</code>](#Mode)  
**Returns**: <code>number</code> \| <code>null</code> - The index used in the RDM protocol to reference this mode. Defaults to null.  
<a name="Mode+physicalOverride"></a>

### mode.physicalOverride ⇒ [<code>Physical</code>](#Physical) \| <code>null</code>
**Kind**: instance property of [<code>Mode</code>](#Mode)  
**Returns**: [<code>Physical</code>](#Physical) \| <code>null</code> - Extend the fixture's physical data with this physical data object when this mode is activated. Defaults to null.  
<a name="Mode+physical"></a>

### mode.physical ⇒ [<code>Physical</code>](#Physical) \| <code>null</code>
**Kind**: instance property of [<code>Mode</code>](#Mode)  
**Returns**: [<code>Physical</code>](#Physical) \| <code>null</code> - Fixture's physical with mode's physical override (if present) applied on. Null if neither fixture nor mode define physical data.  
<a name="Mode+channelKeys"></a>

### mode.channelKeys ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Mode</code>](#Mode)  
**Returns**: <code>Array.&lt;string&gt;</code> - The mode's channel keys. The count and position equals to actual DMX channel count and position.  
<a name="Mode+nullChannelCount"></a>

### mode.nullChannelCount ⇒ <code>number</code>
**Kind**: instance property of [<code>Mode</code>](#Mode)  
**Returns**: <code>number</code> - The number of null channels used in this mode.  
<a name="Mode+channels"></a>

### mode.channels ⇒ [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel)
**Kind**: instance property of [<code>Mode</code>](#Mode)  
**Returns**: [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel) - The mode's channels. The count and position equals to actual DMX channel count and position.  
<a name="Mode+_getMatrixChannelKeysFromInsertBlock"></a>

### mode.\_getMatrixChannelKeysFromInsertBlock(channelInsert) ⇒ <code>Array.&lt;string&gt;</code> ℗
Resolves the matrix channel insert block into a list of channel keys

**Kind**: instance method of [<code>Mode</code>](#Mode)  
**Returns**: <code>Array.&lt;string&gt;</code> - The resolved channel keys  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| channelInsert | <code>object</code> | The JSON channel insert block |

<a name="Mode+_getRepeatForPixelKeys"></a>

### mode.\_getRepeatForPixelKeys(repeatFor) ⇒ <code>Array.&lt;string&gt;</code> ℗
Resolves `repeatFor` keywords into a list of pixel (group) keys or just returns the given pixel (group) key array.

**Kind**: instance method of [<code>Mode</code>](#Mode)  
**Returns**: <code>Array.&lt;string&gt;</code> - The properly ordered list of pixel (group) keys.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| repeatFor | <code>string</code> \| <code>Array.&lt;string&gt;</code> | A matrix channel insert's repeatFor property. |

<a name="Mode+getChannelIndex"></a>

### mode.getChannelIndex(channelKey, [switchingChannelBehavior]) ⇒ <code>number</code>
**Kind**: instance method of [<code>Mode</code>](#Mode)  
**Returns**: <code>number</code> - The index of the given channel in this mode or -1 if not found.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| channelKey | <code>string</code> |  | The key of the channel to get the index for. |
| [switchingChannelBehavior] | [<code>SwitchingChannelBehavior</code>](#SwitchingChannelBehavior) | <code>&#x27;all&#x27;</code> | Controls how switching channels are counted, see [usesChannelKey](#SwitchingChannel+usesChannelKey) for possible values. |

<a name="NullChannel"></a>

## NullChannel ⇐ [<code>CoarseChannel</code>](#CoarseChannel)
Dummy channel used to represent `null` in a mode's channel list.

**Kind**: global class  
**Extends**: [<code>CoarseChannel</code>](#CoarseChannel)  

* [NullChannel](#NullChannel) ⇐ [<code>CoarseChannel</code>](#CoarseChannel)
    * [new NullChannel(fixture)](#new_NullChannel_new)
    * [.jsonObject](#CoarseChannel+jsonObject) ⇒ <code>object</code>
    * [.fixture](#CoarseChannel+fixture) ⇒ [<code>Fixture</code>](#Fixture)
    * [.name](#CoarseChannel+name) ⇒ <code>string</code>
    * [.type](#CoarseChannel+type) ⇒ <code>string</code>
    * [.color](#CoarseChannel+color) ⇒ <code>string</code> \| <code>null</code>
    * [.fineChannelAliases](#CoarseChannel+fineChannelAliases) ⇒ <code>Array.&lt;string&gt;</code>
    * [.fineChannels](#CoarseChannel+fineChannels) ⇒ [<code>Array.&lt;FineChannel&gt;</code>](#FineChannel)
    * [.maxResolution](#CoarseChannel+maxResolution) ⇒ [<code>Resolution</code>](#Resolution)
    * [.dmxValueResolution](#CoarseChannel+dmxValueResolution) ⇒ [<code>Resolution</code>](#Resolution)
    * [.maxDmxBound](#CoarseChannel+maxDmxBound) ⇒ <code>number</code>
    * [.hasDefaultValue](#CoarseChannel+hasDefaultValue) ⇒ <code>boolean</code>
    * [.defaultValue](#CoarseChannel+defaultValue) ⇒ <code>number</code>
    * [._defaultValuePerResolution](#CoarseChannel+_defaultValuePerResolution) ⇒ <code>Record.&lt;Resolution, number&gt;</code> ℗
    * [.hasHighlightValue](#CoarseChannel+hasHighlightValue) ⇒ <code>boolean</code>
    * [.highlightValue](#CoarseChannel+highlightValue) ⇒ <code>number</code>
    * [._highlightValuePerResolution](#CoarseChannel+_highlightValuePerResolution) ⇒ <code>Record.&lt;Resolution, number&gt;</code> ℗
    * [.isInverted](#CoarseChannel+isInverted) ⇒ <code>boolean</code>
    * [.isConstant](#CoarseChannel+isConstant) ⇒ <code>boolean</code>
    * [.canCrossfade](#CoarseChannel+canCrossfade) ⇒ <code>boolean</code>
    * [.precedence](#CoarseChannel+precedence) ⇒ <code>&#x27;HTP&#x27;</code> \| <code>&#x27;LTP&#x27;</code>
    * [.switchingChannelAliases](#CoarseChannel+switchingChannelAliases) ⇒ <code>Array.&lt;string&gt;</code>
    * [.switchingChannels](#CoarseChannel+switchingChannels) ⇒ [<code>Array.&lt;SwitchingChannel&gt;</code>](#SwitchingChannel)
    * [.switchToChannelKeys](#CoarseChannel+switchToChannelKeys) ⇒ <code>Array.&lt;string&gt;</code>
    * [.capabilities](#CoarseChannel+capabilities) ⇒ [<code>Array.&lt;Capability&gt;</code>](#Capability)
    * [.isHelpWanted](#CoarseChannel+isHelpWanted) ⇒ <code>boolean</code>
    * [.key](#AbstractChannel+key) ⇒ <code>string</code>
    * [.uniqueName](#AbstractChannel+uniqueName) ⇒ <code>string</code>
    * [.pixelKey](#AbstractChannel+pixelKey) ⇒ <code>string</code> \| <code>null</code>
    * [.ensureProperResolution(uncheckedResolution)](#CoarseChannel+ensureProperResolution)
    * [.getResolutionInMode(mode, switchingChannelBehavior)](#CoarseChannel+getResolutionInMode) ⇒ [<code>Resolution</code>](#Resolution)
    * [.getDefaultValueWithResolution(desiredResolution)](#CoarseChannel+getDefaultValueWithResolution) ⇒ <code>number</code>
    * [.getHighlightValueWithResolution(desiredResolution)](#CoarseChannel+getHighlightValueWithResolution) ⇒ <code>number</code>

<a name="new_NullChannel_new"></a>

### new NullChannel(fixture)
Creates a new NullChannel instance by creating a Channel object with NoFunction channel data.
Uses a unique uuid as channel key.


| Param | Type | Description |
| --- | --- | --- |
| fixture | [<code>Fixture</code>](#Fixture) | The fixture this channel is associated to. |

<a name="CoarseChannel+jsonObject"></a>

### nullChannel.jsonObject ⇒ <code>object</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>jsonObject</code>](#CoarseChannel+jsonObject)  
**Returns**: <code>object</code> - The channel data from the fixture's JSON.  
<a name="CoarseChannel+fixture"></a>

### nullChannel.fixture ⇒ [<code>Fixture</code>](#Fixture)
Overrides [`AbstractChannel.fixture`](#AbstractChannel+fixture).

**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>fixture</code>](#CoarseChannel+fixture)  
**Returns**: [<code>Fixture</code>](#Fixture) - The fixture instance this channel is associated to.  
<a name="CoarseChannel+name"></a>

### nullChannel.name ⇒ <code>string</code>
Overrides [`AbstractChannel.name`](#AbstractChannel+name).

**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>name</code>](#CoarseChannel+name)  
**Returns**: <code>string</code> - The channel name if present or else the channel key.  
<a name="CoarseChannel+type"></a>

### nullChannel.type ⇒ <code>string</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>type</code>](#CoarseChannel+type)  
**Returns**: <code>string</code> - The channel type, derived from the channel's capability types.  
<a name="CoarseChannel+color"></a>

### nullChannel.color ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>color</code>](#CoarseChannel+color)  
**Returns**: <code>string</code> \| <code>null</code> - The color of an included ColorIntensity capability, null if there's no such capability.  
<a name="CoarseChannel+fineChannelAliases"></a>

### nullChannel.fineChannelAliases ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>fineChannelAliases</code>](#CoarseChannel+fineChannelAliases)  
**Returns**: <code>Array.&lt;string&gt;</code> - This channel's fine channel aliases, ordered by resolution (coarsest first).  
<a name="CoarseChannel+fineChannels"></a>

### nullChannel.fineChannels ⇒ [<code>Array.&lt;FineChannel&gt;</code>](#FineChannel)
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>fineChannels</code>](#CoarseChannel+fineChannels)  
**Returns**: [<code>Array.&lt;FineChannel&gt;</code>](#FineChannel) - This channel's fine channels, ordered by resolution (coarsest first).  
<a name="CoarseChannel+maxResolution"></a>

### nullChannel.maxResolution ⇒ [<code>Resolution</code>](#Resolution)
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>maxResolution</code>](#CoarseChannel+maxResolution)  
**Returns**: [<code>Resolution</code>](#Resolution) - How fine this channel can be used at its maximum. Equals the amount of coarse and fine channels.  
<a name="CoarseChannel+dmxValueResolution"></a>

### nullChannel.dmxValueResolution ⇒ [<code>Resolution</code>](#Resolution)
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>dmxValueResolution</code>](#CoarseChannel+dmxValueResolution)  
**Returns**: [<code>Resolution</code>](#Resolution) - How fine this channel is declared in the JSON data. Defaults to [maxResolution](#CoarseChannel+maxResolution).  
<a name="CoarseChannel+maxDmxBound"></a>

### nullChannel.maxDmxBound ⇒ <code>number</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>maxDmxBound</code>](#CoarseChannel+maxDmxBound)  
**Returns**: <code>number</code> - The maximum DMX value in the highest possible resolution. E.g. 65535 for a 16bit channel.  
<a name="CoarseChannel+hasDefaultValue"></a>

### nullChannel.hasDefaultValue ⇒ <code>boolean</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>hasDefaultValue</code>](#CoarseChannel+hasDefaultValue)  
**Returns**: <code>boolean</code> - Whether this channel has a defaultValue.  
<a name="CoarseChannel+defaultValue"></a>

### nullChannel.defaultValue ⇒ <code>number</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>defaultValue</code>](#CoarseChannel+defaultValue)  
**Returns**: <code>number</code> - The DMX value this channel initially should be set to. Specified in the finest possible resolution. Defaults to 0.  
<a name="CoarseChannel+_defaultValuePerResolution"></a>

### nullChannel.\_defaultValuePerResolution ⇒ <code>Record.&lt;Resolution, number&gt;</code> ℗
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>\_defaultValuePerResolution</code>](#CoarseChannel+_defaultValuePerResolution)  
**Returns**: <code>Record.&lt;Resolution, number&gt;</code> - The default DMX value of this channel in the given resolution, for all resolutions up to the channel's maximum resolution.  
**Access**: private  
<a name="CoarseChannel+hasHighlightValue"></a>

### nullChannel.hasHighlightValue ⇒ <code>boolean</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>hasHighlightValue</code>](#CoarseChannel+hasHighlightValue)  
**Returns**: <code>boolean</code> - Whether this channel has a highlightValue.  
<a name="CoarseChannel+highlightValue"></a>

### nullChannel.highlightValue ⇒ <code>number</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>highlightValue</code>](#CoarseChannel+highlightValue)  
**Returns**: <code>number</code> - A DMX value that "highlights" the function of this channel. Specified in the finest possible resolution. Defaults to the highest possible DMX value.  
<a name="CoarseChannel+_highlightValuePerResolution"></a>

### nullChannel.\_highlightValuePerResolution ⇒ <code>Record.&lt;Resolution, number&gt;</code> ℗
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>\_highlightValuePerResolution</code>](#CoarseChannel+_highlightValuePerResolution)  
**Returns**: <code>Record.&lt;Resolution, number&gt;</code> - The highlight DMX value of this channel in the given resolution, for all resolutions up to the channel's maximum resolution.  
**Access**: private  
<a name="CoarseChannel+isInverted"></a>

### nullChannel.isInverted ⇒ <code>boolean</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>isInverted</code>](#CoarseChannel+isInverted)  
**Returns**: <code>boolean</code> - Whether a fader for this channel should be displayed upside down.  
<a name="CoarseChannel+isConstant"></a>

### nullChannel.isConstant ⇒ <code>boolean</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>isConstant</code>](#CoarseChannel+isConstant)  
**Returns**: <code>boolean</code> - Whether this channel should constantly stay at the same value.  
<a name="CoarseChannel+canCrossfade"></a>

### nullChannel.canCrossfade ⇒ <code>boolean</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>canCrossfade</code>](#CoarseChannel+canCrossfade)  
**Returns**: <code>boolean</code> - Whether switching from one DMX value to another in this channel can be faded smoothly.  
<a name="CoarseChannel+precedence"></a>

### nullChannel.precedence ⇒ <code>&#x27;HTP&#x27;</code> \| <code>&#x27;LTP&#x27;</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>precedence</code>](#CoarseChannel+precedence)  
**Returns**: <code>&#x27;HTP&#x27;</code> \| <code>&#x27;LTP&#x27;</code> - The channel's behavior when being affected by multiple faders: HTP (Highest Takes Precedent) or LTP (Latest Takes Precedent).  
<a name="CoarseChannel+switchingChannelAliases"></a>

### nullChannel.switchingChannelAliases ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>switchingChannelAliases</code>](#CoarseChannel+switchingChannelAliases)  
**Returns**: <code>Array.&lt;string&gt;</code> - Aliases of the switching channels defined by this channel, ordered by appearance in the JSON.  
<a name="CoarseChannel+switchingChannels"></a>

### nullChannel.switchingChannels ⇒ [<code>Array.&lt;SwitchingChannel&gt;</code>](#SwitchingChannel)
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>switchingChannels</code>](#CoarseChannel+switchingChannels)  
**Returns**: [<code>Array.&lt;SwitchingChannel&gt;</code>](#SwitchingChannel) - Switching channels defined by this channel, ordered by appearance in the JSON.  
<a name="CoarseChannel+switchToChannelKeys"></a>

### nullChannel.switchToChannelKeys ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>switchToChannelKeys</code>](#CoarseChannel+switchToChannelKeys)  
**Returns**: <code>Array.&lt;string&gt;</code> - The keys of the channels to which the switching channels defined by this channel can be switched to.  
<a name="CoarseChannel+capabilities"></a>

### nullChannel.capabilities ⇒ [<code>Array.&lt;Capability&gt;</code>](#Capability)
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>capabilities</code>](#CoarseChannel+capabilities)  
**Returns**: [<code>Array.&lt;Capability&gt;</code>](#Capability) - All capabilities of this channel, ordered by DMX range.  
<a name="CoarseChannel+isHelpWanted"></a>

### nullChannel.isHelpWanted ⇒ <code>boolean</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>isHelpWanted</code>](#CoarseChannel+isHelpWanted)  
**Returns**: <code>boolean</code> - True if help is needed in a capability of this channel, false otherwise.  
<a name="AbstractChannel+key"></a>

### nullChannel.key ⇒ <code>string</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>key</code>](#AbstractChannel+key)  
**Returns**: <code>string</code> - The channel key.  
<a name="AbstractChannel+uniqueName"></a>

### nullChannel.uniqueName ⇒ <code>string</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>uniqueName</code>](#AbstractChannel+uniqueName)  
**Returns**: <code>string</code> - Unique version of this channel's name.  
**See**: [uniqueChannelNames](#Fixture+uniqueChannelNames)  
<a name="AbstractChannel+pixelKey"></a>

### nullChannel.pixelKey ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>pixelKey</code>](#AbstractChannel+pixelKey)  
**Returns**: <code>string</code> \| <code>null</code> - The key of the pixel (group) that this channel is associated to. Defaults to null.  
<a name="CoarseChannel+ensureProperResolution"></a>

### nullChannel.ensureProperResolution(uncheckedResolution)
Checks the given resolution if it can safely be used in this channel.

**Kind**: instance method of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>ensureProperResolution</code>](#CoarseChannel+ensureProperResolution)  
**Throws**:

- <code>RangeError</code> If the given resolution is invalid in this channel.


| Param | Type | Description |
| --- | --- | --- |
| uncheckedResolution | [<code>Resolution</code>](#Resolution) | The resolution to be checked. |

<a name="CoarseChannel+getResolutionInMode"></a>

### nullChannel.getResolutionInMode(mode, switchingChannelBehavior) ⇒ [<code>Resolution</code>](#Resolution)
**Kind**: instance method of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>getResolutionInMode</code>](#CoarseChannel+getResolutionInMode)  
**Returns**: [<code>Resolution</code>](#Resolution) - How fine this channel is used in the given mode. 0 if the channel isn't used at all.  

| Param | Type | Description |
| --- | --- | --- |
| mode | [<code>Mode</code>](#Mode) | The mode in which this channel is used. |
| switchingChannelBehavior | [<code>SwitchingChannelBehavior</code>](#SwitchingChannelBehavior) | How switching channels are treated, see [getChannelIndex](#Mode+getChannelIndex). |

<a name="CoarseChannel+getDefaultValueWithResolution"></a>

### nullChannel.getDefaultValueWithResolution(desiredResolution) ⇒ <code>number</code>
**Kind**: instance method of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>getDefaultValueWithResolution</code>](#CoarseChannel+getDefaultValueWithResolution)  
**Returns**: <code>number</code> - The DMX value this channel initially should be set to, scaled to match the given resolution.  

| Param | Type | Description |
| --- | --- | --- |
| desiredResolution | [<code>Resolution</code>](#Resolution) | The grade of resolution the defaultValue should be scaled to. |

<a name="CoarseChannel+getHighlightValueWithResolution"></a>

### nullChannel.getHighlightValueWithResolution(desiredResolution) ⇒ <code>number</code>
**Kind**: instance method of [<code>NullChannel</code>](#NullChannel)  
**Overrides**: [<code>getHighlightValueWithResolution</code>](#CoarseChannel+getHighlightValueWithResolution)  
**Returns**: <code>number</code> - A DMX value that "highlights" the function of this channel, scaled to match the given resolution.  

| Param | Type | Description |
| --- | --- | --- |
| desiredResolution | [<code>Resolution</code>](#Resolution) | The grade of resolution the highlightValue should be scaled to. |

<a name="Physical"></a>

## Physical
A fixture's technical data, belonging to the hardware and not the DMX protocol.

**Kind**: global class  

* [Physical](#Physical)
    * [new Physical(jsonObject)](#new_Physical_new)
    * [.jsonObject](#Physical+jsonObject) ⇒ <code>object</code>
    * [.dimensions](#Physical+dimensions) ⇒ <code>Array.&lt;number&gt;</code> \| <code>null</code>
    * [.width](#Physical+width) ⇒ <code>number</code> \| <code>null</code>
    * [.height](#Physical+height) ⇒ <code>number</code> \| <code>null</code>
    * [.depth](#Physical+depth) ⇒ <code>number</code> \| <code>null</code>
    * [.weight](#Physical+weight) ⇒ <code>number</code> \| <code>null</code>
    * [.power](#Physical+power) ⇒ <code>number</code> \| <code>null</code>
    * [.powerConnectors](#Physical+powerConnectors) ⇒ <code>Record.&lt;string, string&gt;</code>
    * [.DMXconnector](#Physical+DMXconnector) ⇒ <code>string</code> \| <code>null</code>
    * [.hasBulb](#Physical+hasBulb) ⇒ <code>boolean</code> \| <code>null</code>
    * [.bulbType](#Physical+bulbType) ⇒ <code>string</code> \| <code>null</code>
    * [.bulbColorTemperature](#Physical+bulbColorTemperature) ⇒ <code>number</code> \| <code>null</code>
    * [.bulbLumens](#Physical+bulbLumens) ⇒ <code>number</code> \| <code>null</code>
    * [.hasLens](#Physical+hasLens) ⇒ <code>boolean</code> \| <code>null</code>
    * [.lensName](#Physical+lensName) ⇒ <code>string</code> \| <code>null</code>
    * [.lensDegreesMin](#Physical+lensDegreesMin) ⇒ <code>number</code> \| <code>null</code>
    * [.lensDegreesMax](#Physical+lensDegreesMax) ⇒ <code>number</code> \| <code>null</code>
    * [.hasMatrixPixels](#Physical+hasMatrixPixels) ⇒ <code>boolean</code>
    * [.matrixPixelsDimensions](#Physical+matrixPixelsDimensions) ⇒ <code>Array.&lt;number&gt;</code> \| <code>null</code>
    * [.matrixPixelsSpacing](#Physical+matrixPixelsSpacing) ⇒ <code>Array.&lt;number&gt;</code> \| <code>null</code>

<a name="new_Physical_new"></a>

### new Physical(jsonObject)
Creates a new Physical instance.


| Param | Type | Description |
| --- | --- | --- |
| jsonObject | <code>object</code> | A fixture's or mode's physical JSON data. |

<a name="Physical+jsonObject"></a>

### physical.jsonObject ⇒ <code>object</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>object</code> - The object from the JSON data that is represented by this Physical object.  
<a name="Physical+dimensions"></a>

### physical.dimensions ⇒ <code>Array.&lt;number&gt;</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>Array.&lt;number&gt;</code> \| <code>null</code> - Width, height and depth of the fixture in millimeters. Defaults to null.  
<a name="Physical+width"></a>

### physical.width ⇒ <code>number</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>number</code> \| <code>null</code> - Width of the fixture in millimeters. Defaults to null.  
<a name="Physical+height"></a>

### physical.height ⇒ <code>number</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>number</code> \| <code>null</code> - Height of the fixture in millimeters. Defaults to null.  
<a name="Physical+depth"></a>

### physical.depth ⇒ <code>number</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>number</code> \| <code>null</code> - Depth of the fixture in millimeters. Defaults to null.  
<a name="Physical+weight"></a>

### physical.weight ⇒ <code>number</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>number</code> \| <code>null</code> - Weight of the fixture in kilograms. Defaults to null.  
<a name="Physical+power"></a>

### physical.power ⇒ <code>number</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>number</code> \| <code>null</code> - Power consumption of the fixture in watts. Defaults to null.  
<a name="Physical+powerConnectors"></a>

### physical.powerConnectors ⇒ <code>Record.&lt;string, string&gt;</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>Record.&lt;string, string&gt;</code> - Power connector information.  
<a name="Physical+DMXconnector"></a>

### physical.DMXconnector ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>string</code> \| <code>null</code> - The DMX plug to be used to control the fixture, e.g. "3-pin" (XLR). Defaults to null.  
<a name="Physical+hasBulb"></a>

### physical.hasBulb ⇒ <code>boolean</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>boolean</code> \| <code>null</code> - Whether physical data about the light source is available.  
<a name="Physical+bulbType"></a>

### physical.bulbType ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>string</code> \| <code>null</code> - The kind of lamp that is used in the fixture, e.g. "LED". Defaults to null.  
<a name="Physical+bulbColorTemperature"></a>

### physical.bulbColorTemperature ⇒ <code>number</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>number</code> \| <code>null</code> - The color temperature of the bulb in kelvins. Defaults to null.  
<a name="Physical+bulbLumens"></a>

### physical.bulbLumens ⇒ <code>number</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>number</code> \| <code>null</code> - The luminous flux of the bulb in lumens. Defaults to null.  
<a name="Physical+hasLens"></a>

### physical.hasLens ⇒ <code>boolean</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>boolean</code> \| <code>null</code> - Whether physical data about the lens is available.  
<a name="Physical+lensName"></a>

### physical.lensName ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>string</code> \| <code>null</code> - The kind of lens that is used in the fixture, e.g. "Fresnel". Defaults to null.  
<a name="Physical+lensDegreesMin"></a>

### physical.lensDegreesMin ⇒ <code>number</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>number</code> \| <code>null</code> - The minimum possible beam angle in degrees. Defaults to null.  
<a name="Physical+lensDegreesMax"></a>

### physical.lensDegreesMax ⇒ <code>number</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>number</code> \| <code>null</code> - The maximum possible beam angle in degrees. Defaults to null.  
<a name="Physical+hasMatrixPixels"></a>

### physical.hasMatrixPixels ⇒ <code>boolean</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>boolean</code> - Whether physical data about the matrix is available.  
<a name="Physical+matrixPixelsDimensions"></a>

### physical.matrixPixelsDimensions ⇒ <code>Array.&lt;number&gt;</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>Array.&lt;number&gt;</code> \| <code>null</code> - Width, height, depth of a matrix pixel in millimeters.  
<a name="Physical+matrixPixelsSpacing"></a>

### physical.matrixPixelsSpacing ⇒ <code>Array.&lt;number&gt;</code> \| <code>null</code>
**Kind**: instance property of [<code>Physical</code>](#Physical)  
**Returns**: <code>Array.&lt;number&gt;</code> \| <code>null</code> - XYZ-Spacing between matrix pixels in millimeters.  
<a name="Range"></a>

## Range
Represents a range from one integer to a higher or equal integer. Primarily used for DMX ranges of capabilities.

**Kind**: global class  

* [Range](#Range)
    * [new Range(rangeArray)](#new_Range_new)
    * _instance_
        * [.start](#Range+start) ⇒ <code>number</code>
        * [.end](#Range+end) ⇒ <code>number</code>
        * [.center](#Range+center) ⇒ <code>number</code>
        * [.contains(value)](#Range+contains) ⇒ <code>boolean</code>
        * [.overlapsWith(range)](#Range+overlapsWith) ⇒ <code>boolean</code>
        * [.overlapsWithOneOf(ranges)](#Range+overlapsWithOneOf) ⇒ <code>boolean</code>
        * [.isAdjacentTo(range)](#Range+isAdjacentTo) ⇒ <code>boolean</code>
        * [.getRangeMergedWith(range)](#Range+getRangeMergedWith) ⇒ [<code>Range</code>](#Range)
        * [.toString()](#Range+toString) ⇒ <code>string</code>
    * _static_
        * [.getMergedRanges(ranges)](#Range.getMergedRanges) ⇒ [<code>Array.&lt;Range&gt;</code>](#Range)

<a name="new_Range_new"></a>

### new Range(rangeArray)
Creates a new Range instance.


| Param | Type | Description |
| --- | --- | --- |
| rangeArray | <code>Array.&lt;number&gt;</code> | Array of start and end value. Start value may not be greater than end value. |

<a name="Range+start"></a>

### range.start ⇒ <code>number</code>
**Kind**: instance property of [<code>Range</code>](#Range)  
**Returns**: <code>number</code> - The start number of the range. Lower or equal to end.  
<a name="Range+end"></a>

### range.end ⇒ <code>number</code>
**Kind**: instance property of [<code>Range</code>](#Range)  
**Returns**: <code>number</code> - The end number of the range. Higher or equal to start.  
<a name="Range+center"></a>

### range.center ⇒ <code>number</code>
**Kind**: instance property of [<code>Range</code>](#Range)  
**Returns**: <code>number</code> - The arithmetic mean of start and end value. Can be a fraction.  
<a name="Range+contains"></a>

### range.contains(value) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Range</code>](#Range)  
**Returns**: <code>boolean</code> - Whether the given number is inside this range, i.e. if it's not lower than the start value and not higher than the end value.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>number</code> | The number to check whether it's in the range. |

<a name="Range+overlapsWith"></a>

### range.overlapsWith(range) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Range</code>](#Range)  
**Returns**: <code>boolean</code> - Whether this range overlaps with the given one.  

| Param | Type | Description |
| --- | --- | --- |
| range | [<code>Range</code>](#Range) | Another Range object. |

<a name="Range+overlapsWithOneOf"></a>

### range.overlapsWithOneOf(ranges) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Range</code>](#Range)  
**Returns**: <code>boolean</code> - Whether this range overlaps with any of the given ones.  

| Param | Type | Description |
| --- | --- | --- |
| ranges | [<code>Array.&lt;Range&gt;</code>](#Range) | An array of Range objects. |

<a name="Range+isAdjacentTo"></a>

### range.isAdjacentTo(range) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Range</code>](#Range)  
**Returns**: <code>boolean</code> - Whether this range is exactly next to the given one, i.e. the lower range's end value is by 1 lower than the higher range's start value.  

| Param | Type | Description |
| --- | --- | --- |
| range | [<code>Range</code>](#Range) | Another Range object. |

<a name="Range+getRangeMergedWith"></a>

### range.getRangeMergedWith(range) ⇒ [<code>Range</code>](#Range)
**Kind**: instance method of [<code>Range</code>](#Range)  
**Returns**: [<code>Range</code>](#Range) - A new range that covers both the initial and the other range.  

| Param | Type | Description |
| --- | --- | --- |
| range | [<code>Range</code>](#Range) | Another range to merge with. |

<a name="Range+toString"></a>

### range.toString() ⇒ <code>string</code>
**Kind**: instance method of [<code>Range</code>](#Range)  
**Returns**: <code>string</code> - Textual representation of this range.  
<a name="Range.getMergedRanges"></a>

### Range.getMergedRanges(ranges) ⇒ [<code>Array.&lt;Range&gt;</code>](#Range)
Merge specified Range objects. Asserts that ranges don't overlap and that all ranges are valid (start<=end).

**Kind**: static method of [<code>Range</code>](#Range)  
**Returns**: [<code>Array.&lt;Range&gt;</code>](#Range) - Merged ranges.  

| Param | Type | Description |
| --- | --- | --- |
| ranges | [<code>Array.&lt;Range&gt;</code>](#Range) | Range objects to merge into as few ranges as possible. |

<a name="Resource"></a>

## Resource
Information about a resource.

**Kind**: global class  

* [Resource](#Resource)
    * [new Resource(jsonObject)](#new_Resource_new)
    * [.name](#Resource+name) ⇒ <code>string</code>
    * [.keywords](#Resource+keywords) ⇒ <code>Array.&lt;string&gt;</code>
    * [.source](#Resource+source) ⇒ <code>string</code> \| <code>null</code>
    * [.key](#Resource+key) ⇒ <code>string</code>
    * [.type](#Resource+type) ⇒ <code>string</code>
    * [.alias](#Resource+alias) ⇒ <code>string</code> \| <code>null</code>
    * [.hasImage](#Resource+hasImage) ⇒ <code>boolean</code>
    * [.imageExtension](#Resource+imageExtension) ⇒ <code>string</code> \| <code>null</code>
    * [.imageMimeType](#Resource+imageMimeType) ⇒ <code>string</code> \| <code>null</code>
    * [.imageData](#Resource+imageData) ⇒ <code>string</code> \| <code>null</code>
    * [.imageEncoding](#Resource+imageEncoding) ⇒ <code>&#x27;base64&#x27;</code> \| <code>&#x27;utf8&#x27;</code> \| <code>null</code>
    * [.imageDataUrl](#Resource+imageDataUrl) ⇒ <code>string</code> \| <code>null</code>

<a name="new_Resource_new"></a>

### new Resource(jsonObject)
Creates a new Resource instance.


| Param | Type | Description |
| --- | --- | --- |
| jsonObject | <code>object</code> | An embedded resource object from the fixture's JSON data. |

<a name="Resource+name"></a>

### resource.name ⇒ <code>string</code>
**Kind**: instance property of [<code>Resource</code>](#Resource)  
**Returns**: <code>string</code> - The resource's name.  
<a name="Resource+keywords"></a>

### resource.keywords ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>Resource</code>](#Resource)  
**Returns**: <code>Array.&lt;string&gt;</code> - An array of keywords belonging to this resource.  
<a name="Resource+source"></a>

### resource.source ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Resource</code>](#Resource)  
**Returns**: <code>string</code> \| <code>null</code> - The source this resource was taken from, or null if it's not specified.  
<a name="Resource+key"></a>

### resource.key ⇒ <code>string</code>
**Kind**: instance property of [<code>Resource</code>](#Resource)  
**Returns**: <code>string</code> - The resource key.  
<a name="Resource+type"></a>

### resource.type ⇒ <code>string</code>
**Kind**: instance property of [<code>Resource</code>](#Resource)  
**Returns**: <code>string</code> - The resource name, i.e. its directory.  
<a name="Resource+alias"></a>

### resource.alias ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Resource</code>](#Resource)  
**Returns**: <code>string</code> \| <code>null</code> - The resource alias, as specified in the fixture, or null if the resource was referenced directly.  
<a name="Resource+hasImage"></a>

### resource.hasImage ⇒ <code>boolean</code>
**Kind**: instance property of [<code>Resource</code>](#Resource)  
**Returns**: <code>boolean</code> - True if this resource has an associated image, false otherwise.  
<a name="Resource+imageExtension"></a>

### resource.imageExtension ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Resource</code>](#Resource)  
**Returns**: <code>string</code> \| <code>null</code> - The resource image's file extension, or null if there is no image.  
<a name="Resource+imageMimeType"></a>

### resource.imageMimeType ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Resource</code>](#Resource)  
**Returns**: <code>string</code> \| <code>null</code> - The resource image's MIME type, or null if there is no image.  
<a name="Resource+imageData"></a>

### resource.imageData ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Resource</code>](#Resource)  
**Returns**: <code>string</code> \| <code>null</code> - The resource image data (base64 or utf8 encoded), or null if there is no image.  
<a name="Resource+imageEncoding"></a>

### resource.imageEncoding ⇒ <code>&#x27;base64&#x27;</code> \| <code>&#x27;utf8&#x27;</code> \| <code>null</code>
**Kind**: instance property of [<code>Resource</code>](#Resource)  
**Returns**: <code>&#x27;base64&#x27;</code> \| <code>&#x27;utf8&#x27;</code> \| <code>null</code> - The resource image's data encoding, or null if there is no image.  
<a name="Resource+imageDataUrl"></a>

### resource.imageDataUrl ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>Resource</code>](#Resource)  
**Returns**: <code>string</code> \| <code>null</code> - A data URL containing the resource image, or null if there is no image.  
<a name="SwitchingChannel"></a>

## SwitchingChannel ⇐ [<code>AbstractChannel</code>](#AbstractChannel)
Represents a channel that switches its behavior depending on trigger channel's value.
The different behaviors are implemented as different [CoarseChannel](#CoarseChannel)s or [FineChannel](#FineChannel)s.

**Kind**: global class  
**Extends**: [<code>AbstractChannel</code>](#AbstractChannel)  

* [SwitchingChannel](#SwitchingChannel) ⇐ [<code>AbstractChannel</code>](#AbstractChannel)
    * [new SwitchingChannel(alias, triggerChannel)](#new_SwitchingChannel_new)
    * [.triggerChannel](#SwitchingChannel+triggerChannel) ⇒ [<code>AbstractChannel</code>](#AbstractChannel)
    * [.fixture](#SwitchingChannel+fixture) ⇒ [<code>Fixture</code>](#Fixture)
    * [.triggerCapabilities](#SwitchingChannel+triggerCapabilities) ⇒ [<code>Array.&lt;TriggerCapability&gt;</code>](#TriggerCapability)
    * [.triggerRanges](#SwitchingChannel+triggerRanges) ⇒ <code>Record.&lt;string, Array.&lt;Range&gt;&gt;</code>
    * [.defaultChannelKey](#SwitchingChannel+defaultChannelKey) ⇒ <code>string</code>
    * [.defaultChannel](#SwitchingChannel+defaultChannel) ⇒ [<code>AbstractChannel</code>](#AbstractChannel)
    * [.switchToChannelKeys](#SwitchingChannel+switchToChannelKeys) ⇒ <code>Array.&lt;string&gt;</code>
    * [.switchToChannels](#SwitchingChannel+switchToChannels) ⇒ [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel)
    * [.isHelpWanted](#SwitchingChannel+isHelpWanted) ⇒ <code>boolean</code>
    * [.key](#AbstractChannel+key) ⇒ <code>string</code>
    * [.name](#AbstractChannel+name) ⇒ <code>string</code>
    * [.uniqueName](#AbstractChannel+uniqueName) ⇒ <code>string</code>
    * [.pixelKey](#AbstractChannel+pixelKey) ⇒ <code>string</code> \| <code>null</code>
    * [.usesChannelKey(channelKey, [switchingChannelBehavior])](#SwitchingChannel+usesChannelKey) ⇒ <code>boolean</code>

<a name="new_SwitchingChannel_new"></a>

### new SwitchingChannel(alias, triggerChannel)
Creates a new SwitchingChannel instance.


| Param | Type | Description |
| --- | --- | --- |
| alias | <code>string</code> | The unique switching channel alias as defined in the trigger channel's `switchChannels` properties. |
| triggerChannel | [<code>AbstractChannel</code>](#AbstractChannel) | The channel whose DMX value this channel depends on. |

<a name="SwitchingChannel+triggerChannel"></a>

### switchingChannel.triggerChannel ⇒ [<code>AbstractChannel</code>](#AbstractChannel)
**Kind**: instance property of [<code>SwitchingChannel</code>](#SwitchingChannel)  
**Returns**: [<code>AbstractChannel</code>](#AbstractChannel) - The channel whose DMX value this switching channel depends on.  
<a name="SwitchingChannel+fixture"></a>

### switchingChannel.fixture ⇒ [<code>Fixture</code>](#Fixture)
Overrides [`AbstractChannel.fixture`](#AbstractChannel+fixture).

**Kind**: instance property of [<code>SwitchingChannel</code>](#SwitchingChannel)  
**Overrides**: [<code>fixture</code>](#AbstractChannel+fixture)  
**Returns**: [<code>Fixture</code>](#Fixture) - The fixture in which this channel is used.  
<a name="SwitchingChannel+triggerCapabilities"></a>

### switchingChannel.triggerCapabilities ⇒ [<code>Array.&lt;TriggerCapability&gt;</code>](#TriggerCapability)
**Kind**: instance property of [<code>SwitchingChannel</code>](#SwitchingChannel)  
**Returns**: [<code>Array.&lt;TriggerCapability&gt;</code>](#TriggerCapability) - The trigger channel's capabilities in a compact form to only include the DMX range and which channel should be switched to. DMX values are given in the trigger channel's highest possible resolution.  
<a name="SwitchingChannel+triggerRanges"></a>

### switchingChannel.triggerRanges ⇒ <code>Record.&lt;string, Array.&lt;Range&gt;&gt;</code>
**Kind**: instance property of [<code>SwitchingChannel</code>](#SwitchingChannel)  
**Returns**: <code>Record.&lt;string, Array.&lt;Range&gt;&gt;</code> - Keys of channels that can be switched to pointing to an array of DMX values the trigger channel must be set to to active the channel. DMX values are given in the trigger channel's highest possible resolution.  
<a name="SwitchingChannel+defaultChannelKey"></a>

### switchingChannel.defaultChannelKey ⇒ <code>string</code>
**Kind**: instance property of [<code>SwitchingChannel</code>](#SwitchingChannel)  
**Returns**: <code>string</code> - The key of the channel that is activated when the trigger channel is set to its default value.  
<a name="SwitchingChannel+defaultChannel"></a>

### switchingChannel.defaultChannel ⇒ [<code>AbstractChannel</code>](#AbstractChannel)
**Kind**: instance property of [<code>SwitchingChannel</code>](#SwitchingChannel)  
**Returns**: [<code>AbstractChannel</code>](#AbstractChannel) - The channel that is activated when the trigger channel is set to its default value.  
<a name="SwitchingChannel+switchToChannelKeys"></a>

### switchingChannel.switchToChannelKeys ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>SwitchingChannel</code>](#SwitchingChannel)  
**Returns**: <code>Array.&lt;string&gt;</code> - All channel keys this channel can be switched to.  
<a name="SwitchingChannel+switchToChannels"></a>

### switchingChannel.switchToChannels ⇒ [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel)
**Kind**: instance property of [<code>SwitchingChannel</code>](#SwitchingChannel)  
**Returns**: [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel) - All channels this channel can be switched to.  
<a name="SwitchingChannel+isHelpWanted"></a>

### switchingChannel.isHelpWanted ⇒ <code>boolean</code>
**Kind**: instance property of [<code>SwitchingChannel</code>](#SwitchingChannel)  
**Returns**: <code>boolean</code> - True if help is needed in one of the switched channels, false otherwise.  
<a name="AbstractChannel+key"></a>

### switchingChannel.key ⇒ <code>string</code>
**Kind**: instance property of [<code>SwitchingChannel</code>](#SwitchingChannel)  
**Overrides**: [<code>key</code>](#AbstractChannel+key)  
**Returns**: <code>string</code> - The channel key.  
<a name="AbstractChannel+name"></a>

### switchingChannel.name ⇒ <code>string</code>
Override this method for more sensible implementation.

**Kind**: instance property of [<code>SwitchingChannel</code>](#SwitchingChannel)  
**Overrides**: [<code>name</code>](#AbstractChannel+name)  
**Returns**: <code>string</code> - The channel key (as name).  
<a name="AbstractChannel+uniqueName"></a>

### switchingChannel.uniqueName ⇒ <code>string</code>
**Kind**: instance property of [<code>SwitchingChannel</code>](#SwitchingChannel)  
**Overrides**: [<code>uniqueName</code>](#AbstractChannel+uniqueName)  
**Returns**: <code>string</code> - Unique version of this channel's name.  
**See**: [uniqueChannelNames](#Fixture+uniqueChannelNames)  
<a name="AbstractChannel+pixelKey"></a>

### switchingChannel.pixelKey ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>SwitchingChannel</code>](#SwitchingChannel)  
**Overrides**: [<code>pixelKey</code>](#AbstractChannel+pixelKey)  
**Returns**: <code>string</code> \| <code>null</code> - The key of the pixel (group) that this channel is associated to. Defaults to null.  
<a name="SwitchingChannel+usesChannelKey"></a>

### switchingChannel.usesChannelKey(channelKey, [switchingChannelBehavior]) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>SwitchingChannel</code>](#SwitchingChannel)  
**Returns**: <code>boolean</code> - Whether this SwitchingChannel contains the given channel key.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| channelKey | <code>string</code> |  | The channel key to search for. |
| [switchingChannelBehavior] | [<code>SwitchingChannelBehavior</code>](#SwitchingChannelBehavior) | <code>&#x27;all&#x27;</code> | Define which channels to include in the search. |

<a name="TemplateChannel"></a>

## TemplateChannel
Represents a blueprint channel of which several similar channels can be generated.
Currently used to create matrix channels.

**Kind**: global class  

* [TemplateChannel](#TemplateChannel)
    * [new TemplateChannel(key, jsonObject, fixture)](#new_TemplateChannel_new)
    * _instance_
        * [.allTemplateKeys](#TemplateChannel+allTemplateKeys) ⇒ <code>Array.&lt;string&gt;</code>
        * [.possibleMatrixChannelKeys](#TemplateChannel+possibleMatrixChannelKeys) ⇒ <code>Map.&lt;string, Array.&lt;string&gt;&gt;</code>
        * [.createMatrixChannels()](#TemplateChannel+createMatrixChannels) ⇒ [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel)
    * _static_
        * [.resolveTemplateObject(object, variables)](#TemplateChannel.resolveTemplateObject) ⇒ <code>object</code>
        * [.resolveTemplateString(string, variables)](#TemplateChannel.resolveTemplateString) ⇒ <code>string</code>

<a name="new_TemplateChannel_new"></a>

### new TemplateChannel(key, jsonObject, fixture)
Creates new TemplateChannel instance. Also clears cache by setting jsonObject.


| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The templateChannel's key with the required variables. |
| jsonObject | <code>object</code> | The template's JSON data which looks pretty similar to a normal channel's data except that channel aliases must include variables. |
| fixture | [<code>Fixture</code>](#Fixture) | The Fixture instance. |

<a name="TemplateChannel+allTemplateKeys"></a>

### templateChannel.allTemplateKeys ⇒ <code>Array.&lt;string&gt;</code>
**Kind**: instance property of [<code>TemplateChannel</code>](#TemplateChannel)  
**Returns**: <code>Array.&lt;string&gt;</code> - Template keys and aliases introduced by this channel, i.e. the channel key itself and defined fine and switching channels.  
<a name="TemplateChannel+possibleMatrixChannelKeys"></a>

### templateChannel.possibleMatrixChannelKeys ⇒ <code>Map.&lt;string, Array.&lt;string&gt;&gt;</code>
**Kind**: instance property of [<code>TemplateChannel</code>](#TemplateChannel)  
**Returns**: <code>Map.&lt;string, Array.&lt;string&gt;&gt;</code> - All template keys pointing to the key resolved with each pixel key to a matrix channel key.  
<a name="TemplateChannel+createMatrixChannels"></a>

### templateChannel.createMatrixChannels() ⇒ [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel)
Creates matrix channels from this template channel (together with its fine and switching channels if defined) and all pixel keys.

**Kind**: instance method of [<code>TemplateChannel</code>](#TemplateChannel)  
**Returns**: [<code>Array.&lt;AbstractChannel&gt;</code>](#AbstractChannel) - The generated channels associated to the given pixel key and its fine and switching channels.  
<a name="TemplateChannel.resolveTemplateObject"></a>

### TemplateChannel.resolveTemplateObject(object, variables) ⇒ <code>object</code>
Replaces the specified variables in the specified object by cloning the object.

**Kind**: static method of [<code>TemplateChannel</code>](#TemplateChannel)  
**Returns**: <code>object</code> - A copy of the object with replaced variables.  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>object</code> | The object which has to be modified. |
| variables | <code>Record.&lt;string, string&gt;</code> | Each variable (without $) pointing to its value. |

<a name="TemplateChannel.resolveTemplateString"></a>

### TemplateChannel.resolveTemplateString(string, variables) ⇒ <code>string</code>
Replaces the specified variables in the specified string.

**Kind**: static method of [<code>TemplateChannel</code>](#TemplateChannel)  
**Returns**: <code>string</code> - The modified string.  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The string which has to be modified. |
| variables | <code>Record.&lt;string, string&gt;</code> | Each variable (without $) pointing to its value. |

<a name="Wheel"></a>

## Wheel
Information about a fixture's wheel.

**Kind**: global class  

* [Wheel](#Wheel)
    * [new Wheel(wheelName, jsonObject)](#new_Wheel_new)
    * [.name](#Wheel+name) ⇒ <code>string</code>
    * [.direction](#Wheel+direction) ⇒ <code>&#x27;CW&#x27;</code> \| <code>&#x27;CCW&#x27;</code>
    * [.type](#Wheel+type) ⇒ <code>string</code>
    * [.slots](#Wheel+slots) ⇒ <code>Array.&lt;object&gt;</code>
    * [.getSlot(slotNumber)](#Wheel+getSlot) ⇒ <code>object</code>
    * [.getAbsoluteSlotIndex(slotNumber)](#Wheel+getAbsoluteSlotIndex) ⇒ <code>number</code>
    * [.getSlotsOfType(type)](#Wheel+getSlotsOfType) ⇒ [<code>Array.&lt;WheelSlot&gt;</code>](#WheelSlot)

<a name="new_Wheel_new"></a>

### new Wheel(wheelName, jsonObject)
Creates a new Wheel instance.


| Param | Type | Description |
| --- | --- | --- |
| wheelName | <code>string</code> | The wheel's name, like specified in the JSON. |
| jsonObject | <code>object</code> | A wheel object from the fixture's JSON data. |

<a name="Wheel+name"></a>

### wheel.name ⇒ <code>string</code>
**Kind**: instance property of [<code>Wheel</code>](#Wheel)  
**Returns**: <code>string</code> - The wheel's name.  
<a name="Wheel+direction"></a>

### wheel.direction ⇒ <code>&#x27;CW&#x27;</code> \| <code>&#x27;CCW&#x27;</code>
**Kind**: instance property of [<code>Wheel</code>](#Wheel)  
**Returns**: <code>&#x27;CW&#x27;</code> \| <code>&#x27;CCW&#x27;</code> - The direction the wheel's slots are arranged in. Defaults to clockwise.  
<a name="Wheel+type"></a>

### wheel.type ⇒ <code>string</code>
**Kind**: instance property of [<code>Wheel</code>](#Wheel)  
**Returns**: <code>string</code> - The type of the Wheel, i.e. the most frequent slot type (except for animation gobo wheels; the wheel type is AnimationGobo there).  
<a name="Wheel+slots"></a>

### wheel.slots ⇒ <code>Array.&lt;object&gt;</code>
**Kind**: instance property of [<code>Wheel</code>](#Wheel)  
**Returns**: <code>Array.&lt;object&gt;</code> - Array of wheel slots.  
<a name="Wheel+getSlot"></a>

### wheel.getSlot(slotNumber) ⇒ <code>object</code>
**Kind**: instance method of [<code>Wheel</code>](#Wheel)  
**Returns**: <code>object</code> - The slot object. Can be a split slot object, if a non-integer index is specified.  

| Param | Type | Description |
| --- | --- | --- |
| slotNumber | <code>number</code> | The one-based slot number. |

<a name="Wheel+getAbsoluteSlotIndex"></a>

### wheel.getAbsoluteSlotIndex(slotNumber) ⇒ <code>number</code>
**Kind**: instance method of [<code>Wheel</code>](#Wheel)  
**Returns**: <code>number</code> - The zero-based slot index, bounded by the number of slots.  

| Param | Type | Description |
| --- | --- | --- |
| slotNumber | <code>number</code> | The one-based slot number, can be smaller than 1 and greater than the number of slots. |

<a name="Wheel+getSlotsOfType"></a>

### wheel.getSlotsOfType(type) ⇒ [<code>Array.&lt;WheelSlot&gt;</code>](#WheelSlot)
**Kind**: instance method of [<code>Wheel</code>](#Wheel)  
**Returns**: [<code>Array.&lt;WheelSlot&gt;</code>](#WheelSlot) - All slots with the given type.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The wheel slot type to search for. |

<a name="WheelSlot"></a>

## WheelSlot
Information about a single wheel slot (or a split slot).

**Kind**: global class  

* [WheelSlot](#WheelSlot)
    * [new WheelSlot(jsonObject, wheel, floorSlot, ceilSlot)](#new_WheelSlot_new)
    * [.isSplitSlot](#WheelSlot+isSplitSlot) ⇒ <code>boolean</code>
    * [.type](#WheelSlot+type) ⇒ <code>string</code>
    * [.nthOfType](#WheelSlot+nthOfType) ⇒ <code>number</code>
    * [.resource](#WheelSlot+resource) ⇒ [<code>Resource</code>](#Resource) \| <code>string</code> \| <code>null</code>
    * [.name](#WheelSlot+name) ⇒ <code>string</code>
    * [.colors](#WheelSlot+colors) ⇒ <code>Array.&lt;string&gt;</code> \| <code>null</code>
    * [.colorTemperature](#WheelSlot+colorTemperature) ⇒ [<code>Entity</code>](#Entity) \| <code>null</code>
    * [.facets](#WheelSlot+facets) ⇒ <code>number</code> \| <code>null</code>
    * [.openPercent](#WheelSlot+openPercent) ⇒ [<code>Entity</code>](#Entity) \| <code>null</code>
    * [.frostIntensity](#WheelSlot+frostIntensity) ⇒ [<code>Entity</code>](#Entity) \| <code>null</code>
    * [.floorSlot](#WheelSlot+floorSlot) ⇒ [<code>WheelSlot</code>](#WheelSlot) \| <code>null</code>
    * [.ceilSlot](#WheelSlot+ceilSlot) ⇒ [<code>WheelSlot</code>](#WheelSlot) \| <code>null</code>

<a name="new_WheelSlot_new"></a>

### new WheelSlot(jsonObject, wheel, floorSlot, ceilSlot)
Creates a new WheelSlot instance.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| jsonObject | <code>object</code> \| <code>null</code> |  | A wheel slot object from the fixture's JSON data. If null, this WheelSlot is a split slot. |
| wheel | [<code>Wheel</code>](#Wheel) |  | The wheel that this slot belongs to. |
| floorSlot | [<code>WheelSlot</code>](#WheelSlot) \| <code>null</code> | <code></code> | For split slots, the WheelSlot instance at the start. |
| ceilSlot | [<code>WheelSlot</code>](#WheelSlot) \| <code>null</code> | <code></code> | For split slots, the WheelSlot instance at the end. |

<a name="WheelSlot+isSplitSlot"></a>

### wheelSlot.isSplitSlot ⇒ <code>boolean</code>
**Kind**: instance property of [<code>WheelSlot</code>](#WheelSlot)  
**Returns**: <code>boolean</code> - True if this WheelSlot instance represents a split slot.  
<a name="WheelSlot+type"></a>

### wheelSlot.type ⇒ <code>string</code>
**Kind**: instance property of [<code>WheelSlot</code>](#WheelSlot)  
**Returns**: <code>string</code> - The slot's type.  
<a name="WheelSlot+nthOfType"></a>

### wheelSlot.nthOfType ⇒ <code>number</code>
**Kind**: instance property of [<code>WheelSlot</code>](#WheelSlot)  
**Returns**: <code>number</code> - The zero-based index of this slot amongst all slots with the same type in this wheel.  
<a name="WheelSlot+resource"></a>

### wheelSlot.resource ⇒ [<code>Resource</code>](#Resource) \| <code>string</code> \| <code>null</code>
**Kind**: instance property of [<code>WheelSlot</code>](#WheelSlot)  
**Returns**: [<code>Resource</code>](#Resource) \| <code>string</code> \| <code>null</code> - The gobo resource object if it was previously embedded, or the gobo resource reference string, or null if no resource is specified for the slot.  
<a name="WheelSlot+name"></a>

### wheelSlot.name ⇒ <code>string</code>
**Kind**: instance property of [<code>WheelSlot</code>](#WheelSlot)  
**Returns**: <code>string</code> - The wheel slot's name.  
<a name="WheelSlot+colors"></a>

### wheelSlot.colors ⇒ <code>Array.&lt;string&gt;</code> \| <code>null</code>
**Kind**: instance property of [<code>WheelSlot</code>](#WheelSlot)  
**Returns**: <code>Array.&lt;string&gt;</code> \| <code>null</code> - The colors of this wheel slot, or null if this slot has no colors.  
<a name="WheelSlot+colorTemperature"></a>

### wheelSlot.colorTemperature ⇒ [<code>Entity</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>WheelSlot</code>](#WheelSlot)  
**Returns**: [<code>Entity</code>](#Entity) \| <code>null</code> - For Color slots, the slot's color temperature. Null if this slot has no color temperature.  
<a name="WheelSlot+facets"></a>

### wheelSlot.facets ⇒ <code>number</code> \| <code>null</code>
**Kind**: instance property of [<code>WheelSlot</code>](#WheelSlot)  
**Returns**: <code>number</code> \| <code>null</code> - For Prism slots, the number of prism facets. Null if number of facets is not defined.  
<a name="WheelSlot+openPercent"></a>

### wheelSlot.openPercent ⇒ [<code>Entity</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>WheelSlot</code>](#WheelSlot)  
**Returns**: [<code>Entity</code>](#Entity) \| <code>null</code> - For Iris slots, the slot's openPercent value. Null if this slot has no openPercent value.  
<a name="WheelSlot+frostIntensity"></a>

### wheelSlot.frostIntensity ⇒ [<code>Entity</code>](#Entity) \| <code>null</code>
**Kind**: instance property of [<code>WheelSlot</code>](#WheelSlot)  
**Returns**: [<code>Entity</code>](#Entity) \| <code>null</code> - For Frost slots, the slot's frost intensity. Null if this slot has no frost intensity.  
<a name="WheelSlot+floorSlot"></a>

### wheelSlot.floorSlot ⇒ [<code>WheelSlot</code>](#WheelSlot) \| <code>null</code>
**Kind**: instance property of [<code>WheelSlot</code>](#WheelSlot)  
**Returns**: [<code>WheelSlot</code>](#WheelSlot) \| <code>null</code> - For split slots, the floor (start) slot. Null for non-split slots.  
<a name="WheelSlot+ceilSlot"></a>

### wheelSlot.ceilSlot ⇒ [<code>WheelSlot</code>](#WheelSlot) \| <code>null</code>
**Kind**: instance property of [<code>WheelSlot</code>](#WheelSlot)  
**Returns**: [<code>WheelSlot</code>](#WheelSlot) \| <code>null</code> - For split slots, the ceil (end) slot. Null for non-split slots.  
<a name="Resolution"></a>

## Resolution : <code>number</code>
1 for 8bit, 2 for 16bit, ...

**Kind**: global typedef  
<a name="TriggerCapability"></a>

## TriggerCapability : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| dmxRange | [<code>Range</code>](#Range) | The DMX range that triggers the switching channel. |
| switchTo | <code>string</code> | The channel to switch to in the given DMX range. |

<a name="SwitchingChannelBehavior"></a>

## SwitchingChannelBehavior : <code>&#x27;keyOnly&#x27;</code> \| <code>&#x27;defaultOnly&#x27;</code> \| <code>&#x27;switchedOnly&#x27;</code> \| <code>&#x27;all&#x27;</code>
**Kind**: global typedef  
