import { createServer } from 'http';
import { PassThrough, Readable } from 'stream';
import assert from 'assert';
import { afterEach, describe, expect, it } from 'vitest';
import getRawBody from 'raw-body';
import listen from 'async-listen';
import {
  ArtifactExistsRequest,
  ArtifactGetRequest,
  ArtifactPutRequest,
} from '../src/index';
import { writeToStream } from './utils/write-to-stream';
import type { URL } from 'url';
import type { IncomingMessage } from 'http';

describe('ArtifactGetRequest', () => {
  let server: ReturnType<typeof createServer>;
  afterEach(() => {
    server.close();
  });

  it('gets artifact as buffer', async () => {
    const data = Buffer.from('hello world');
    server = createServer((req: IncomingMessage, res) => {
      getRawBody(req, () => {
        res.statusCode = 200;
        res.end(data);
      });
    });

    const address = (await listen(server)) as URL;
    const get = new ArtifactGetRequest('token', address.href, 'user-agent');
    const buf = await get.buffer();
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf).toEqual(data);
  });

  it('gets artifact as stream', async () => {
    const data = Buffer.from('hello world');
    server = createServer((req: IncomingMessage, res) => {
      getRawBody(req, () => {
        res.statusCode = 200;
        res.end(data);
      });
    });

    const address = (await listen(server)) as URL;
    const get = new ArtifactGetRequest('token', address.href, 'user-agent');
    const stream = await get.stream();
    expect(stream).toBeInstanceOf(Readable);
    const buf = await getRawBody(stream);
    expect(buf).toEqual(data);
  });

  it('throws on 403', async () => {
    server = createServer((req: IncomingMessage, res) => {
      getRawBody(req, (_err, _body) => {
        res.statusCode = 403;
        // Return the request body as the response to verfiy it was sent correctly
        res.end(
          JSON.stringify({
            error: {
              code: 'forbidden',
              message: 'Not authorized',
            },
          }),
        );
      });
    });

    const address = (await listen(server)) as URL;
    const get = new ArtifactGetRequest('token', address.href, 'user-agent');
    await expect(get.buffer()).rejects.toThrow('Not authorized');
  });
});

describe('ArtifactPutRequest', () => {
  let server: ReturnType<typeof createServer>;
  afterEach(() => {
    server.close();
  });

  it('puts artifact as buffer', async () => {
    server = createServer((req: IncomingMessage, res) => {
      getRawBody(req, (_err, body) => {
        res.statusCode = 202;
        // Return the request body as the response to verfiy it was sent correctly
        res.end(body);
      });
    });

    const address = (await listen(server)) as URL;
    const put = new ArtifactPutRequest('token', address.href, 'user-agent');
    const putData = Buffer.from('hello world');
    await put.buffer(putData);

    assert(put.response);
    const mirroredData = await getRawBody(Readable.from(put.response.body));
    expect(mirroredData).toEqual(putData);
  });

  it('puts artifact as stream', async () => {
    server = createServer((req: IncomingMessage, res) => {
      getRawBody(req, (_err, body) => {
        res.statusCode = 202;
        // Return the request body as the response to verfiy it was sent correctly
        res.end(body);
      });
    });

    const address = (await listen(server)) as URL;
    const put = new ArtifactPutRequest('token', address.href, 'user-agent');
    const putData = Buffer.from('hello world');
    const stream = new PassThrough();
    writeToStream(stream, putData);
    await put.stream(stream);

    assert(put.response);
    const mirroredData = await getRawBody(Readable.from(put.response.body));
    expect(mirroredData).toEqual(putData);
  });

  it('throws 403 error', async () => {
    server = createServer((req: IncomingMessage, res) => {
      getRawBody(req, (_err, _body) => {
        res.statusCode = 403;
        // Return the request body as the response to verfiy it was sent correctly
        res.end(
          JSON.stringify({
            error: {
              code: 'forbidden',
              message: 'Not authorized',
            },
          }),
        );
      });
    });

    const address = (await listen(server)) as URL;
    const put = new ArtifactPutRequest('token', address.href, 'user-agent');
    const putData = Buffer.from('hello world');

    await expect(put.buffer(putData)).rejects.toThrow('Not authorized');
  });
});

describe('ArtifactExistsRequest', () => {
  let server: ReturnType<typeof createServer>;
  afterEach(() => {
    server.close();
  });

  it('returns true when artifact exists', async () => {
    server = createServer((req: IncomingMessage, res) => {
      getRawBody(req, (_err, _body) => {
        res.statusCode = 200;
        res.end();
      });
    });

    const address = (await listen(server)) as URL;
    const exists = new ArtifactExistsRequest(
      'token',
      address.href,
      'user-agent',
    );
    const doesExist = await exists.send();
    expect(doesExist).toBe(true);
  });

  it('returns false when artifact does NOT exist', async () => {
    server = createServer((req: IncomingMessage, res) => {
      getRawBody(req, (_err, _body) => {
        res.statusCode = 404;
        res.end();
      });
    });

    const address = (await listen(server)) as URL;
    const exists = new ArtifactExistsRequest(
      'token',
      address.href,
      'user-agent',
    );
    const doesExist = await exists.send();
    expect(doesExist).toBe(false);
  });

  it('throws error when status code is 403', async () => {
    server = createServer((req: IncomingMessage, res) => {
      getRawBody(req, (_err, _body) => {
        res.statusCode = 403;
        res.end();
      });
    });

    const address = (await listen(server)) as URL;
    const exists = new ArtifactExistsRequest(
      'token',
      address.href,
      'user-agent',
    );
    await expect(exists.send()).rejects.toThrowError('Not authorized');
  });
});
