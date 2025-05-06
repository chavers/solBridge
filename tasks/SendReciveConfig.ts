import * as web3 from "@solana/web3.js";
import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  clusterApiUrl,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, createInitializeMintInstruction, getMintLen } from "@solana/spl-token";
import { getKeypairFromFile, getExplorerLink } from "@solana-developers/helpers";
import { OFT_DECIMALS } from "@layerzerolabs/oft-v2-solana-sdk";
import { OftTools, OFT_SEED, getProgramKeypair  } from "@layerzerolabs/lz-solana-sdk-v2";
import { addressToBytes32 } from "@layerzerolabs/lz-v2-utilities";
import * as addr from "../deployments/solana-testnet/OFT.json";
import * as lzSol from "@layerzerolabs/lz-solana-sdk-v2";
const CHAIN = "devnet";

const main = async () => {
  const connection = new Connection(clusterApiUrl(CHAIN));
  //
  // const userKp = await getKeypairFromFile("../oft-solana/target/deploy/token-keypair.json");
  // const mintKp = await getKeypairFromFile("../oft-solana/target/deploy/mint-keypair.json");
  // const lockKp = await getKeypairFromFile("../oft-solana/target/deploy/lockbox-keypair.json");
  //
  // const ULN_PROGRAM_ID = new PublicKey("7a4WjyR8VZ7yZz5XJAKm39BUGn5iT9CKcv2pmG9tdXVH");
  //
  const OFT_PROGRAM_ID =  new web3.PublicKey(addr.programId);
  const Escrow = new web3.PublicKey(addr.escrow);
  const OFT_SEED = "OFT";
  //
  const peers = [{ dstEid: 40161, peerAddress: addressToBytes32("0xfcdcd0124eec9134eb0a5050608e6bbd34dfdab3") }];

  //
  // 1. initializeMintInstruction
  //
  // const minimumBalanceForMint = await connection.getMinimumBalanceForRentExemption(getMintLen([]));
  // const initializeMintInstructionTx = new Transaction().add(
  //   SystemProgram.createAccount({
  //     fromPubkey: userKp.publicKey,
  //     newAccountPubkey: mintKp.publicKey,
  //     space: getMintLen([]),
  //     lamports: minimumBalanceForMint,
  //     programId: TOKEN_PROGRAM_ID,
  //   }),
  //   await createInitializeMintInstruction(
  //     mintKp.publicKey, // mint public key
  //     OFT_DECIMALS, // decimals
  //     userKp.publicKey, // mint authority
  //     null, // freeze authority (not used here)
  //     TOKEN_PROGRAM_ID, // token program id
  //   ),
  // );
  // const initMintInstructionSig = await sendAndConfirmTransaction(connection, initializeMintInstructionTx, [
  //   userKp,
  //   mintKp,
  // ]);
  // const initializeMintInstructionLink = getExplorerLink("tx", initMintInstructionSig, CHAIN);
  // console.log(`✅ Mint Initialization Complete! View the transaction here: ${initializeMintInstructionLink}`);

  //
  // 2. createInitAdapterOftIx
  //
  // const initAdapterOftIxTx = new Transaction().add(
  //   await OftTools.createInitAdapterOftIx(
  //     userKp.publicKey,
  //     userKp.publicKey,
  //     mintKp.publicKey,
  //     userKp.publicKey,
  //     lockKp.publicKey,
  //     6,
  //     TOKEN_PROGRAM_ID,
  //   ),
  // );
  // const initAdapterOftIxSig = await sendAndConfirmTransaction(connection, initAdapterOftIxTx, [userKp, lockKp]);
  // const initAdapterOftIxLink = getExplorerLink("tx", initAdapterOftIxSig, CHAIN);
  // console.log(`✅ OFT Adapter Initialization Complete! View the transaction here: ${initAdapterOftIxLink}`);

  //
  // 3. Peers
  //
  const [oftConfig] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(OFT_SEED), Escrow.toBuffer()],
    OFT_PROGRAM_ID,
  );
  console.log('oftConfig', oftConfig.toBase58());

  for (const peer of peers) {
    //
    // 3.1. createInitNonceIx
    //
    const initNonceIxTx = new Transaction().add(
      await  OftTools.createInitNonceIx(
        userKp.publicKey, // Wallet public key
        peer.dstEid, // Destination Endpoint ID (dstEid)
        oftConfig, // Derived OFT Config PDA
        peer.peerAddress, // Peer EVM address converted to bytes32
      ),
    );
    const initNonceIxSig = await sendAndConfirmTransaction(connection, initNonceIxTx, [userKp], {
      commitment: `confirmed`,
    });
    const initNonceIxLink = getExplorerLink("tx", initNonceIxSig, CHAIN);
    console.log(`✅ You initialized the peer account! View the transaction here: ${initNonceIxLink}`);

    //
    // 3.2. createInitSendLibraryIx
    //
    const initSendLibraryIxTx = new Transaction().add(
      await OftTools.createInitSendLibraryIx(userKp.publicKey, oftConfig, peer.dstEid),
    );
    const initSendLibraryIxSig = await sendAndConfirmTransaction(connection, initSendLibraryIxTx, [userKp], {
      commitment: `confirmed`,
    });
    const initSendLibraryIxLink = getExplorerLink("tx", initSendLibraryIxSig, CHAIN);
    console.log(`✅ You initialized the send library! View the transaction here: ${initSendLibraryIxLink}`);

    //
    // 3.3. createSetSendLibraryIx
    //
    const setSendLibraryIxTx = new Transaction().add(
      await OftTools.createSetSendLibraryIx(userKp.publicKey, oftConfig, ULN_PROGRAM_ID, peer.dstEid),
    );
    const setSendLibraryIxSig = await sendAndConfirmTransaction(connection, setSendLibraryIxTx, [userKp]);
    const setSendLibraryIxLink = getExplorerLink("tx", setSendLibraryIxSig, CHAIN);
    console.log(`✅ You set the send library! View the transaction here: ${setSendLibraryIxLink}`);

    //
    // 3.4. createInitReceiveLibraryIx
    //
    const initReceiveLibraryIxTx = new Transaction().add(
      await OftTools.createInitReceiveLibraryIx(userKp.publicKey, oftConfig, peer.dstEid),
    );
    const initReceiveLibraryIxSig = await sendAndConfirmTransaction(connection, initReceiveLibraryIxTx, [userKp], {
      commitment: `confirmed`,
    });
    const initReceiveLibraryIxLink = getExplorerLink("tx", initReceiveLibraryIxSig, CHAIN);
    console.log(`✅ You initialized the receive library! View the transaction here: ${initReceiveLibraryIxLink}`);

    //
    // 3.5. createSetReceiveLibraryIx
    //
    const setReceiveLibraryTx = new Transaction().add(
      await OftTools.createSetReceiveLibraryIx(userKp.publicKey, oftConfig, ULN_PROGRAM_ID, peer.dstEid, 0n),
    );
    const setReceiveLibrarySig = await sendAndConfirmTransaction(connection, setReceiveLibraryTx, [userKp]);
    const setReceiveLibraryLink = getExplorerLink("tx", setReceiveLibrarySig, CHAIN);
    console.log(`✅ You set the receive library! View the transaction here: ${setReceiveLibrarySig}`);

    //
    // 3.6. createSetPeerIx
    //
    const setPeerIxTx = new Transaction().add(
      await OftTools.createSetPeerIx(userKp.publicKey, oftConfig, peer.dstEid, Array.from(peer.peerAddress)),
    );
    const setPeerIxSig = await sendAndConfirmTransaction(connection, setPeerIxTx, [userKp]);
    const setPeerIxLink = getExplorerLink("tx", setPeerIxSig, CHAIN);
    console.log(`✅ You set the peer! View the transaction here: ${setPeerIxLink}`);
  }

};


main();
