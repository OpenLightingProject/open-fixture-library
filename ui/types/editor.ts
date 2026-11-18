/**
 * Types for the plain fixture data used by the editor.
 *
 * The editor works with schema JSON plus a few editor-only fields instead of
 * the model classes, so these interfaces describe the editor's working shapes.
 */
/** Plain physical data held by the editor. */
export interface EditorPhysical {
  dimensions?: [number, number, number] | null;
  weight?: number | null;
  power?: number | null;
  DMXconnector?: string | null;
  DMXconnectorNew?: string;
  bulb: {
    type?: string;
    colorTemperature?: number | null;
    lumens?: number | null;
  };
  lens: {
    name?: string;
    degreesMinMax?: [number, number] | null;
  };
}

/** A link in the fixture editor. */
export interface EditorLink {
  uuid: string;
  type: string;
  url: string;
}

/** A wheel slot in the editor. */
export interface EditorWheelSlot {
  uuid: string;
  type: string;
  typeData: Record<string, any>;
}

/** A capability in the editor. */
export interface EditorCapabilityData {
  uuid: string;
  open?: boolean;
  dmxRange: [number, number] | null;
  type: string;
  typeData: Record<string, any>;
}

/** The capability wizard's temporary state. */
export interface EditorWizard {
  show: boolean;
  start: number;
  width: number;
  count: number;
  templateCapability: EditorCapabilityData;
}

/** A channel in the editor, including the channel dialog's temporary fields. */
export interface EditorChannel {
  uuid: string;
  /** Set on fine channels; references their coarse channel. */
  coarseChannelId?: string;
  editMode: string;
  modeId: string;
  name: string;
  resolution: number;
  dmxValueResolution: number;
  defaultValue: string | number;
  highlightValue: string | number;
  constant: boolean | null;
  precedence: string;
  wheel: {
    direction: string;
    slots: EditorWheelSlot[];
  };
  wizard: EditorWizard;
  capabilities: EditorCapabilityData[];
}

/** A mode in the editor. */
export interface EditorMode {
  uuid: string;
  name: string;
  shortName: string;
  rdmPersonalityIndex: number | null;
  enablePhysicalOverride: boolean;
  physical: EditorPhysical;
  channels: string[];
}

/** The complete fixture data held by the editor. */
export interface EditorFixture {
  key: string;
  useExistingManufacturer: boolean;
  manufacturerKey: string;
  newManufacturerName: string;
  newManufacturerWebsite: string;
  newManufacturerComment: string;
  newManufacturerRdmId: number | null;
  name: string;
  shortName: string;
  categories: string[];
  comment: string;
  links: EditorLink[];
  rdmModelId: number | null;
  rdmSoftwareVersion: string;
  physical: EditorPhysical;
  modes: EditorMode[];
  metaAuthor: string;
  availableChannels: Record<string, EditorChannel>;
}
