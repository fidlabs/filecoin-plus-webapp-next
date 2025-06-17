export class HTTPError extends Error {
  constructor(
    public readonly status: Response["status"],
    message: string
  ) {
    super(message);
  }
}

export function isHTTPError(input: unknown): input is HTTPError {
  return input instanceof HTTPError;
}

export function httpErrorFromResponse(
  response: Response,
  message?: string
): HTTPError | null {
  if (response.ok) {
    return null;
  }

  return new HTTPError(response.status, message ?? response.statusText);
}

export function throwHTTPErrorOrSkip(response: Response, message?: string) {
  const maybeError = httpErrorFromResponse(response, message);

  if (maybeError !== null) {
    throw maybeError;
  }
}
