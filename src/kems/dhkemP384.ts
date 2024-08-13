import { KemId } from "../../core/src/identifiers.ts";
import { HkdfSha384 } from "../kdfs/hkdfSha384.ts";
import { Dhkem } from "../../core/src/kems/dhkem.ts";
import { Ec } from "../../core/src/kems/dhkemPrimitives/ec.ts";

export class DhkemP384HkdfSha384 extends Dhkem {
  public readonly id: KemId = KemId.DhkemP384HkdfSha384;
  public readonly secretSize: number = 48;
  public readonly encSize: number = 97;
  public readonly publicKeySize: number = 97;
  public readonly privateKeySize: number = 48;

  constructor() {
    const kdf = new HkdfSha384();
    const prim = new Ec(KemId.DhkemP384HkdfSha384, kdf);
    super(KemId.DhkemP384HkdfSha384, prim, kdf);
  }
}
