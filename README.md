# acme-v2

An ACME client compatible with the current
[IETF ACME working draft 09][acme-draft-09] (ACME v2) as used by the free,
automated and open Certificate Authority [Let's Encrypt][letsencrypt] for their
[v2 staging endpoint][staging-endpoint].

This is a low level protocol / API client. It does not offer any automation
whatsoever. You could use this client to build higher level systems that handle
automation. If you're only looking to generate a certificate and don't
necessarily need a Node.js API, I recommend checking out [Certbot][certbot] or
another [ACME client][other-clients].

[acme-draft-09]: https://tools.ietf.org/html/draft-ietf-acme-acme-09
[letsencrypt]: https://letsencrypt.org/
[staging-endpoint]: https://community.letsencrypt.org/t/staging-endpoint-for-acme-v2/49605
[certbot]: https://certbot.eff.org/
[other-clients]: https://letsencrypt.org/docs/client-options/

##### Development Status

This project is under active development. The API is not yet finalized.

Things that should be working:

- [ ] General Protocol
  - [x] Generating keys
  - [x] Importing and exporting keys
  - [x] Generating a Certificate Signing Request (CSR)
  - [x] HTTP/S proxy support
  - [x] Retrieving and managing nonces
  - [x] Sending unsigned requests
  - [x] Sending signed requests
    - [x] `jwk` variant
    - [x] `kid` variant
  - [ ] Handling protocol errors
    - [x] Known errors are properly wrapped in custom error classes
    - [ ] Retry logic
- [x] Account management
  - [x] Creation
  - [x] Reading
  - [x] Update
  - [x] Deactivation
  - [x] Key roll over
- [ ] Orders
  - [x] Creating
  - [ ] Reading
  - [x] Listing all orders associated with an account
  - [ ] Listing the challenges of an order
  - [ ] Finalizing
- [ ] Authorization
- [ ] Certificate revocation
- [ ] Challenges
  - [ ] `http-01`
  - [ ] `tls-02`
  - [ ] `dns-01`

If you want to join efforts, open an issue and we can work together. :muscle:

## Installation

```
yarn add acme-v2
# or
npm install acme-v2
```
### Runtime environment configuration

This project uses features from the latest ES2018 specs, like Async Iterators
and ECMAScript modules. To run this client, you either need to use latest stable
Node.js version (9.4.0) and add some flags, use the current Node Nightly
(10.0.0) or configure Babel to transpile the code.

##### Node 9.4.0

```js
node --use_strict --harmony --experimental-modules server.mjs
```

##### Node Nightly 10.0.0

```js
node --use_strict --experimental-modules server.mjs
```

##### Babel

If you end up needing Babel support, please open an issue or ideally configure
Babel in a PR so everybody gets to benefit from it. :blush:

## Usage

Detailed API docs will soon be generated via esdoc. If you feel up for it, open
a PR. All the necessary inline documentation comments are already there.

For a working example, just execute `./run.sh` which will run `server.mjs`.

### Synopsis

```js
import ACMEV2Client from 'acme-v2';
import directoryUrls from 'acme-v2/directory-urls';
import generateKey from 'acme-v2/lib/generate-key';

(async () => {
  const acme = new ACMEV2Client({
    directory: await ACMEV2Client.loadDirectory(directoryUrls['letsencrypt-staging'])
  });

  // create a new account
  const account = await acme.createAccount({
    key: await generateKey('RSA'),
    contact: ['mailto:admin@example.com', 'mailto:devs@example.com'],
    termsOfServiceAgreed: true
  });
  console.log(`Created a new account: ${account.accountURL}`);
  console.log(`The asscociated key ${account.key.kid} is:`);
  console.log(account.key.toJSON(true));

  // create a new order
  const order = await account.createOrder({
    identifiers: [
      { type: 'dns', value: 'example.com' },
      { type: 'dns', value: '*.example.com' }
    ]
  });

  console.log(order);
})();
```

## Q & A

For in depth information, I recommend reading through the [Let's Encrypt
documentation][letsencrypt-docs], their [FAQ][letsencrypt-faq], the [IETF ACME
working draft][acme-draft-09] or the code base of this repository. I made sure
to add a lot of comments and documentation. Parts of the RFC have been copied
into the comments, where appropriate.

[letsencrypt-docs]: https://letsencrypt.org/docs/
[letsencrypt-faq]: https://community.letsencrypt.org/t/frequently-asked-questions-faq/26

##### What are the differences between ACME v2 and v1?

Apart from implementation details, the only user-facing key differences are:

- v2 allows you to generate **wildcard certificates**, i.e. a certificate for
`*.example.com`.
- Account creation and ToS agreement are one step instead of two.

##### What is a wildcard certificate?

A wildcard certificate for `*.example.com` is valid for all direct subdomains of
`example.com`. The certificate would be valid for the following list of domains:

- `www.example.com`
- `foo.example.com`
- `bar.example.com`

But *not* valid for:

- `example.com`
- `foo.www.example.com`
- `foo.quux.bar.example.com`

However, with Let's Encrypt, you can add up to 100 distinct names (Subject
  Alternative Names).

> ###### Can I get a certificate for multiple domain names (SAN certificates)?
>
> Yes, the same certificate can apply to up to 100 different names using the
> Subject Alternative Name (SAN) mechanism. The resulting certificates will be
> accepted by browsers for any of the domain names listed in them.

<sup>— [Let's Encrypt FAQ][letsencrypt-faq]</sup>

You cannot use a wildcard domain name as the first domain ("base domain") of
your certificate. A perfectly valid domain list would be:

- `example.com`
- `*.example.com`
- `*.foo.example.com`

The above certificate would be valid for:

- `example.com`
- `www.example.com`
- `bar.example.com`
- `foo.example.com`
- `www.foo.example.com`
- `bar.foo.example.com`
- `baz.foo.example.com`

But *not* valid for:

- `foo.bar.example.com`

Wildcard domains must be verified using the [`dns-01` challenge][dns-01].

[dns-01]: https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-8.5

#### How does the the CA know that I am the real owner of a domain?

The ACME protocol specifies a set of challenges that the CA will require you to
"solve" in order to verify ownership of a domain (zone).

#### What is a challenge and how does it work?

- Working Draft Section 8: [Identifier Validation Challenges][challenges]
- Working Draft Section 10.2: [Integrity of Authorizations][integrity]

[challenges]: https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-8
[integrity]: https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-10.2

#### What types of challenges are there and how do I perform them?

Currently, there is no built in mechanism for performing a challenge. This
client only presents you with the challenge object, which contains all
information required to perform a challenge, and a way to let the CA know that
you have performed the challenge, in order to finalize the order and retrieve
the signed certificate.

I plan on implementing some, if not all, challenges though. If you want to help,
please open an issue.

These are the challenges defined in the Working Draft:

- [`http-01`: HTTP Challenge][http-01]
- [`tls-02`: TLS with Server Name Indication (TLS SNI) Challenge
][tls-02]
- [`dns-01`: DNS Challenge][dns-01]

[http-01]: https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-8.3
[tls-02]: https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-8.4
