import { useState, useEffect } from "react";
import FileShare from "./artifacts/contracts/FileShare.sol/FileShare.json";
import "./App.css";
import { ethers } from "ethers";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Navbar from "./components/Navbar";
import UploadFile from "./pages/uploadfile/UploadFile";
import GetFile from "./pages/getfiles/GetFile";
import Share from "./pages/shareFile/Share";

function App() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null,
  });
  const [account, setAccount] = useState("not connected");

  useEffect(() => {
    const { ethereum } = window;
    const provider = new ethers.BrowserProvider(ethereum); // to read from the blockchain
    const template = async () => {
      try {
        if (provider) {
          const contractAddress = "0x3457a0AF30CCBC5E5732C5026b5E4C9Ac46E5c8f";
          const contractAbi = FileShare.abi;
          //Metamask part
          //1. In order do transactions on sepolia testnet
          //2. Metmask consists of infura api which actually help in connectig to the blockhain

          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
          });
          console.log(accounts);

          window.ethereum.on("accountsChanged", () => {
            window.location.reload();
          });

          const signer = await provider.getSigner(); //write the blockchain
          const address = await signer.getAddress();

          console.log(address);
          setAccount(address);

          const contract = new ethers.Contract(
            contractAddress,
            contractAbi,
            signer
          );
          // console.log(contract);
          setState({ provider, signer, contract });
        } else {
          window.alert("Metamask is not installed.");
        }
      } catch (error) {
        console.log(error);
      }
    };
    provider && template();
  }, []);

  return (
    <>
      <Router>
        <Navbar account={account}/>
        <Routes>
          <Route path="/" element={<UploadFile state={state} account={account}/>} />
          <Route path="/getfiles" element={<GetFile state={state} account={account} />} />
          <Route path="/sharefile" element={<Share state={state} account={account} />} />

          <Route path="*" element={<UploadFile state={state} account={account} />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
