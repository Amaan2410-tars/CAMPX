type Jwk = JsonWebKey;

function u8ToB64(u8: Uint8Array): string {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}

function b64ToU8(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

function randomIv(): Uint8Array {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  return iv;
}

async function derivePassphraseKey(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function deriveAesKey(sharedSecret: ArrayBuffer, info: string): Promise<CryptoKey> {
  const hkdfKey = await crypto.subtle.importKey("raw", sharedSecret, "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(32), // stable zero-salt; security comes from ECDH secret
      info: new TextEncoder().encode(info),
    },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function generateIdentityKeypair(): Promise<{ publicJwk: Jwk; privateJwk: Jwk }> {
  const kp = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
    "deriveBits",
  ]);
  const publicJwk = (await crypto.subtle.exportKey("jwk", kp.publicKey)) as Jwk;
  const privateJwk = (await crypto.subtle.exportKey("jwk", kp.privateKey)) as Jwk;
  return { publicJwk, privateJwk };
}

export async function importPublicKey(jwk: Jwk): Promise<CryptoKey> {
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDH", namedCurve: "P-256" }, true, []);
}

export async function importPrivateKey(jwk: Jwk): Promise<CryptoKey> {
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDH", namedCurve: "P-256" }, false, [
    "deriveBits",
  ]);
}

export async function encryptForRecipient(
  plaintext: string,
  recipientIdentityPubJwk: Jwk,
): Promise<{
  version: number;
  ephemeralPubJwk: Jwk;
  nonceB64: string;
  ciphertextB64: string;
}> {
  const recipientPub = await importPublicKey(recipientIdentityPubJwk);
  const eph = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
    "deriveBits",
  ]);
  const shared = await crypto.subtle.deriveBits({ name: "ECDH", public: recipientPub }, eph.privateKey, 256);
  const aes = await deriveAesKey(shared, "campx-dm-v1");
  const iv = randomIv();
  const pt = new TextEncoder().encode(plaintext);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aes, pt));
  const ephPubJwk = (await crypto.subtle.exportKey("jwk", eph.publicKey)) as Jwk;
  return {
    version: 1,
    ephemeralPubJwk: ephPubJwk,
    nonceB64: u8ToB64(iv),
    ciphertextB64: u8ToB64(ct),
  };
}

export async function decryptFromSenderEphemeral(
  ciphertextB64: string,
  nonceB64: string,
  senderEphemeralPubJwk: Jwk,
  myIdentityPrivJwk: Jwk,
): Promise<string> {
  const myPriv = await importPrivateKey(myIdentityPrivJwk);
  const senderEphPub = await importPublicKey(senderEphemeralPubJwk);
  const shared = await crypto.subtle.deriveBits({ name: "ECDH", public: senderEphPub }, myPriv, 256);
  const aes = await deriveAesKey(shared, "campx-dm-v1");
  const iv = b64ToU8(nonceB64);
  const ct = b64ToU8(ciphertextB64);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aes, ct);
  return new TextDecoder().decode(pt);
}

export async function encryptPrivateKeyBackup(
  myIdentityPrivJwk: Jwk,
  passphrase: string,
): Promise<{ kdf: { alg: string; iter: number; hash: string }; saltB64: string; nonceB64: string; ciphertextB64: string }> {
  const iter = 310_000;
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const key = await derivePassphraseKey(passphrase, salt, iter);
  const iv = randomIv();
  const pt = new TextEncoder().encode(JSON.stringify(myIdentityPrivJwk));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, pt));
  return {
    kdf: { alg: "PBKDF2", iter, hash: "SHA-256" },
    saltB64: u8ToB64(salt),
    nonceB64: u8ToB64(iv),
    ciphertextB64: u8ToB64(ct),
  };
}

export async function decryptPrivateKeyBackup(
  backup: { kdf: { iter: number }; saltB64: string; nonceB64: string; ciphertextB64: string },
  passphrase: string,
): Promise<Jwk> {
  const salt = b64ToU8(backup.saltB64);
  const key = await derivePassphraseKey(passphrase, salt, backup.kdf.iter);
  const iv = b64ToU8(backup.nonceB64);
  const ct = b64ToU8(backup.ciphertextB64);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return JSON.parse(new TextDecoder().decode(pt)) as Jwk;
}

