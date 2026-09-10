/**
 * Downgrades Burst shutter effect to Strobe with comment.
 * @param {object} capability - The capability to check
 */
export function downgradeShutterEffect(capability) {
  if (capability.shutterEffect !== 'Burst') {
    return;
  }

  capability.shutterEffect = 'Strobe';
  capability.comment = capability.comment ? `Burst effect ${capability.comment}` : 'Burst effect';
}
