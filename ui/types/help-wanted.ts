/** The channel data embedded in a capability for the help-wanted dialog. */
export interface HelpWantedChannel {
  key?: string;
  name?: string;
  fixture?: {
    manufacturer: { key: string };
    key: string;
  };
}

/** The fixture, capability or plugin context shown in the help-wanted dialog. */
export interface HelpWantedModel {
  helpWanted?: string | null;
  name?: string;
  rawDmxRange?: string;
  _channel?: HelpWantedChannel;
  manufacturer?: { key: string };
  key?: string;
}
