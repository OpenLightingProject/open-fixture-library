# JSON fixture format

Note that this fixture format is not intended to be used directly, as it has no way of versioning and may change without notice.

The [JS Schema](https://github.com/molnarg/js-schema) can be found in the [schema.js](schema.js) file. See there for the details of allowed properties or values. The purpose of this document is to give a high-level overview of the concepts used.


## Goals

The JSON fixture format intends to be

* readable by both humans and machines
* easily extendable
* as general as possible to include information for many fixture formats
* abstract where possible, specific where needed


## Directory structure

The manufacturer of a fixture is determined by its toplevel directory (relative to the `fixtures` directory), the fixture key is the filename without extension. Manufacturer data is stored in [manufacturers.json](manufacturers.json).


## Modes

A fixture can have multiple *modes* (also sometimes called *personalities*) like "Basic 3-channel mode" or "Extended 5-channel mode". Our modes are not allowed to have the word "mode" in them, as it is automatically appended at the end.

A mode can contain the `physical` property to override specific physical data of the fixture. E.g. one mode could set the `panMax` value different than the fixture default.


## Channels

All channels that are used in one or more modes are listed in `availableChannels`. The modes then only contain a list of the channel keys.


### Fine channels

A channel can list `fineChannelAliases` to specify which channel keys are used to descibe its finer variants.

Example: Channel `Dimmer` contains `fineChannelAliases: ["Dimmer 16-bit", "Dimmer 24-bit"]`. Mode "Normal" uses only `Dimmer` in its channel list, mode "Fine" uses `Dimmer` and `Dimmer 16-bit`, mode "Super fine" uses all three.


### Switching channels

A *switching channel* is a channel whose functionality depends on the value of another channel in the same mode.

E.g. in a given mode, the first channel could be used to select auto-programs and channel 2 could be either "Microphone Sensitivity" (if channel 1 is set to *Sound control*) or "Program Speed" (if channel 1 is set to anything else).

To define switching channels, add a `switchChannels` object to all capabilities of the dependency channel (the "Auto-Programs" channel in the example above). This object defines which *switching channel alias* is set to which *available channel key* if this capability is active. The switching channel alias is then used in the mode just like a regular channel. Note that a channel which defines switching channels needs an explicit `defaultValue` to make sure that the switching channel default is also well-defined.
