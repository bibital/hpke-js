import { CipherSuite, DhkemP256HkdfSha256, HkdfSha256 } from "@hpke/core";
import { Chacha20Poly1305 } from "@hpke/chacha20poly1305";

async function doHpke() {
  const suite = new CipherSuite({
    kem: new DhkemP256HkdfSha256(),
    kdf: new HkdfSha256(),
    aead: new Chacha20Poly1305(),
  });

  const rkp = await suite.kem.generateKeyPair();

  // A sender encrypts a message.
  const sender = await suite.createSenderContext({
    recipientPublicKey: rkp.publicKey,
  });
  const ct = await sender.seal(new TextEncoder().encode("Hello world!"));

  // A recipient decrypts it.
  const recipient = await suite.createRecipientContext({
    recipientKey: rkp.privateKey,
    enc: sender.enc,
  });
  const pt = await recipient.open(ct);

  // Hello world!
  console.log(new TextDecoder().decode(pt));
}

try {
  doHpke();
} catch (e) {
  console.log("Error:", e.message);
}