// @ts-ignore: for "npm:"
import { secp256k1 } from "npm:@noble/curves@1.1.0/secp256k1";

import type { KemPrimitives } from "../../interfaces/kemPrimitives.ts";
import type { KdfInterface } from "../../interfaces/kdfInterface.ts";

import { Algorithm } from "../../algorithm.ts";
import {
  KEM_USAGES,
  LABEL_DKP_PRK,
  LABEL_SK,
} from "../../interfaces/kemPrimitives.ts";
import { XCryptoKey } from "../../xCryptoKey.ts";

import { EMPTY } from "../../consts.ts";

const ALG_NAME = "ECDH";

export class Secp256k1 extends Algorithm implements KemPrimitives {
  private _hkdf: KdfInterface;
  private _nPk: number;
  private _nSk: number;

  constructor(hkdf: KdfInterface) {
    super();
    this._hkdf = hkdf;
    this._nPk = 33;
    this._nSk = 32;
  }

  public async serializePublicKey(key: CryptoKey): Promise<ArrayBuffer> {
    return await this._serializePublicKey(key as XCryptoKey);
  }

  public async deserializePublicKey(key: ArrayBuffer): Promise<CryptoKey> {
    return await this._deserializePublicKey(key);
  }

  public async importKey(
    format: "raw",
    key: ArrayBuffer,
    isPublic: boolean,
  ): Promise<CryptoKey> {
    if (format !== "raw") {
      throw new Error("Unsupported format");
    }
    return await this._importKey(key, isPublic);
  }

  public async derivePublicKey(key: CryptoKey): Promise<CryptoKey> {
    return await this._derivePublicKey(key as XCryptoKey);
  }

  public async generateKeyPair(): Promise<CryptoKeyPair> {
    const rawSk = secp256k1.utils.randomPrivateKey();
    const sk = new XCryptoKey(ALG_NAME, rawSk, "private", KEM_USAGES);
    const pk = await this.derivePublicKey(sk);
    return { publicKey: pk, privateKey: sk };
  }

  public async deriveKeyPair(ikm: ArrayBuffer): Promise<CryptoKeyPair> {
    const dkpPrk = await this._hkdf.labeledExtract(
      EMPTY,
      LABEL_DKP_PRK,
      new Uint8Array(ikm),
    );
    const rawSk = await this._hkdf.labeledExpand(
      dkpPrk,
      LABEL_SK,
      EMPTY,
      this._nSk,
    );
    const sk = new XCryptoKey(
      ALG_NAME,
      new Uint8Array(rawSk),
      "private",
      KEM_USAGES,
    );
    return {
      privateKey: sk,
      publicKey: await this.derivePublicKey(sk),
    };
  }

  public async dh(sk: CryptoKey, pk: CryptoKey): Promise<ArrayBuffer> {
    return await this._dh(sk as XCryptoKey, pk as XCryptoKey);
  }

  private _serializePublicKey(k: XCryptoKey): Promise<ArrayBuffer> {
    return new Promise((resolve) => {
      resolve(k.key.buffer);
    });
  }

  private _deserializePublicKey(k: ArrayBuffer): Promise<CryptoKey> {
    return new Promise((resolve, reject) => {
      if (k.byteLength !== this._nPk) {
        reject(new Error("Invalid public key for the ciphersuite"));
      } else {
        resolve(new XCryptoKey(ALG_NAME, new Uint8Array(k), "public"));
      }
    });
  }

  private _importKey(key: ArrayBuffer, isPublic: boolean): Promise<CryptoKey> {
    return new Promise((resolve, reject) => {
      if (isPublic && key.byteLength !== this._nPk) {
        reject(new Error("Invalid public key for the ciphersuite"));
      }
      if (!isPublic && key.byteLength !== this._nSk) {
        reject(new Error("Invalid private key for the ciphersuite"));
      }
      resolve(
        new XCryptoKey(
          ALG_NAME,
          new Uint8Array(key),
          isPublic ? "public" : "private",
          isPublic ? [] : KEM_USAGES,
        ),
      );
    });
  }

  private _derivePublicKey(k: XCryptoKey): Promise<CryptoKey> {
    return new Promise((resolve) => {
      const pk = secp256k1.getPublicKey(k.key);
      resolve(new XCryptoKey(ALG_NAME, pk, "public"));
    });
  }

  private _dh(sk: XCryptoKey, pk: XCryptoKey): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      try {
        resolve(secp256k1.getSharedSecret(sk.key, pk.key).buffer);
      } catch (e: unknown) {
        reject(e);
      }
    });
  }
}