import type { Kem, Kdf, Aead } from '../identifiers';

/**
 * The parameters used to configure the {@link CipherSuite}.
 *
 * @public
 */
export interface CipherSuiteParams {

  /** The type of KEM (Key Encapsulation Mechanism) */
  kem: Kem;

  /** The type of KDF (Key Derivation Function) */
  kdf: Kdf;

  /** The type of AEAD (Authenticated Encryption with Addtional Data) encryption function */
  aead: Aead;
}
