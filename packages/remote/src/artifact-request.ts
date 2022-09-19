import { Readable } from 'stream';
import fetch from 'node-fetch';
import getRawBody from 'raw-body';
import ci from 'ci-info';
import { streamToBuffer } from './utils/stream-to-buffer';
import type { Response, HeadersInit } from 'node-fetch';

export interface ArtifactOptions {
  duration?: number;
  tag?: string;
}

class ArtifactBaseRequest {
  protected readonly token: string;
  protected readonly url: string;
  protected readonly options?: ArtifactOptions;
  protected readonly userAgent: string;
  public response?: Response;

  constructor(
    token: string,
    url: string,
    userAgent: string,
    options?: ArtifactOptions,
  ) {
    this.url = url;
    this.token = token;
    this.userAgent = userAgent;
    this.options = options;
  }

  protected getHeaders(
    method: 'GET' | 'HEAD' | 'PUT',
    options?: ArtifactOptions,
  ) {
    const headers: HeadersInit = {
      Authorization: `Bearer ${this.token}`,
      'User-Agent': this.userAgent,
    };
    if (method === 'PUT') {
      headers['Content-Type'] = 'application/octet-stream';
      if (options?.duration !== undefined) {
        headers['x-artifact-duration'] = String(options.duration);
      }
      if (options?.tag !== undefined) {
        headers['x-artifact-tag'] = options.tag;
      }
    }
    if (ci.name) {
      headers['x-artifact-client-ci'] = ci.name;
    }
    headers['x-artifact-client-interactive'] = process.stdout.isTTY ? '1' : '0';
    return headers;
  }
}

export class ArtifactPutRequest extends ArtifactBaseRequest {
  async stream(artifact: Readable): Promise<void> {
    // TODO: can we use getRawBody here?
    const body = await streamToBuffer(artifact);
    const res = await fetch(this.url, {
      method: 'PUT',
      headers: this.getHeaders('PUT', this.options),
      body,
    });
    this.response = res;
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }
  }

  async buffer(artifact: Buffer): Promise<void> {
    const res = await fetch(this.url, {
      method: 'PUT',
      headers: this.getHeaders('PUT', this.options),
      body: artifact,
    });
    this.response = res;
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }
  }
}

export class ArtifactGetRequest extends ArtifactBaseRequest {
  async stream(): Promise<Readable> {
    const res = await fetch(this.url, {
      method: 'GET',
      headers: this.getHeaders('GET'),
    });
    this.response = res;
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }
    // Note: It's intentional to use Readable.from over Readable().wrap()
    // There are upstream issues related to using a Readable.wrap() in
    // combination with the stream/promises API. Namely this resolves
    // an issue for remote-nx untaring
    return Readable.from(res.body);
  }

  async buffer(): Promise<Buffer> {
    const res = await fetch(this.url, {
      method: 'GET',
      headers: this.getHeaders('GET'),
    });
    this.response = res;
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }
    const r = Readable.from(res.body);
    try {
      return await getRawBody(r, {
        length: res.headers.get('Content-Length'),
      });
    } catch (err) {
      throw new Error(
        `Error downloading artifact: Mismatched content length on response.`,
      );
    }
  }
}

export class ArtifactExistsRequest extends ArtifactBaseRequest {
  async send() {
    const res = await fetch(this.url, {
      method: 'HEAD',
      headers: this.getHeaders('HEAD'),
    });
    this.response = res;
    if (res.status === 200) {
      return true;
    }
    if (res.status === 404) {
      return false;
    }
    if (res.status === 403 || res.status === 401) {
      // This error is copied from request body of GET request
      // TODO: normalize error codes and error messages
      throw new Error(
        JSON.stringify({
          error: {
            code: 'forbidden',
            message: 'Not authorized',
          },
        }),
      );
    }
    throw new Error(`Unexpected status code: ${res.status}`);
  }
}
