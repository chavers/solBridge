import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { Oft } from "../target/types/oft";
import * as addr from "../deployments/solana-testnet/OFT.json";
import * as s from "../../../../../secret.json";


const initOFT = async () => {
  const connection = new web3.Connection("https://api.devnet.solana.com");
  const programId = new web3.PublicKey(addr.programId);
  const registrar = web3.Keypair.fromSecretKey(anchor.utils.bytes.bs58.decode(s.REGISTRAR_SECRET));
  const wallet = new anchor.Wallet(registrar);
  const option = anchor.AnchorProvider.defaultOptions();
  const provider = new anchor.AnchorProvider(connection, wallet, option);
  anchor.setProvider(provider);
  const program = anchor.workspace.Oft as anchor.Program<Oft>;

   const endpointProgram = new web3.PublicKey(addr.programId);
  const oftStore = new web3.PublicKey(addr.oftStore);
  const [lzReceiveTypesAccounts, _] = await anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(anchor.utils.bytes.utf8.encode("LzReceiveTypes")), oftStore.toBuffer()]
    , programId);

console.log("lzReceiveTypesAccounts", lzReceiveTypesAccounts.toBase58());
const tt = await program.account.lzReceiveTypesAccounts.fetch(lzReceiveTypesAccounts);
console.log("lzReceiveTypesAccounts", tt);
const yy = await program.account.oftStore.fetch(oftStore);
console.log("oftStore", yy);

  // const tx = await program.methods.initOft({
  //   oft_type: "Native",
  //   admin: admin,
  //   shared_decimals: 2,
  //   endpoint_program: endpointProgram
  // })
  //   .accounts({
  //     payer: registrar.publicKey,
  //     oftStore: oftStore,
  //     lzReceiveTypesAccounts: lzReceiveTypesAccounts,
  //     tokenMint: new anchor.web3.PublicKey(addr.mint),
  //     tokenEscrow: new anchor.web3.PublicKey(addr.escrow),
  //     tokenProgram: TOKEN_2022_PROGRAM_ID,
  //     systemProgram: anchor.web3.SystemProgram.programId
  //   });

};

initOFT();