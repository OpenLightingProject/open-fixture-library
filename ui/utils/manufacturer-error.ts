/**
 * Maps a failed manufacturer `useFetch` result to the error the page throws.
 *
 * `ofetch` exposes `statusCode` as a getter over the response status, so a
 * response-less failure (DNS, timeout, API unreachable) has no status. Such an
 * infrastructure failure must stay a 500; only a successful request that
 * returned no manufacturer is a 404.
 */
export interface FetchErrorLike {
  statusCode?: number;
  statusMessage?: string;
  data?: unknown;
}

export interface ManufacturerLoadError {
  statusCode: number;
  statusMessage: string;
  data?: unknown;
}

/**
 * Builds the `createError` payload for the manufacturer page.
 * @param {FetchErrorLike | undefined} error - The `useFetch` error, if any.
 * @returns {ManufacturerLoadError} The status, message and data to throw.
 */
export function getManufacturerLoadError(error: FetchErrorLike | undefined): ManufacturerLoadError {
  return {
    statusCode: error ? (error.statusCode ?? 500) : 404,
    statusMessage: error?.statusMessage ?? (error ? 'Manufacturer could not be loaded' : 'Manufacturer not found'),
    data: error?.data,
  };
}
