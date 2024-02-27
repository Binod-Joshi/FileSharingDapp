import { useEffect, useState } from "react";
import "./GetFile.css";
import { Link } from "react-router-dom";
import { FaFilePdf } from "react-icons/fa";
import { Alert, Backdrop, CircularProgress } from "@mui/material";

const GetFile = ({ state, account }) => {
  const { contract } = state;
  const [selectedOption, setSelectedOption] = useState("Get: Own/OtherFile");
  const [otherAddress, setOtherAddress] = useState("");
  const [ownFile, setOwnFile] = useState(true);
  const [filess, setFiless] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteNum, setDeleteNum] = useState("");
  const [selectedIpfsHash, setSelectedIpfsHash] = useState("");
  const [loading,setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [length, setLength] = useState("1");

  const getFileType = (name) => {
    const extension = name?.split(".")?.pop()?.toLowerCase();
    return extension;
  };
  console.log(otherAddress);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    if (e.target.value == "other") {
      console.log("other");
      setOwnFile(false);
      setFiless([]);
    } else if (ownFile == false) {
      setOwnFile(true);
      setFiless([]);
    }
  };

  const handleGetFiles = async () => {
    let currentAddress;
    console.log(account);
    if (ownFile == true) {
      currentAddress = account;
    } else {
      currentAddress = otherAddress;
    }
    if (currentAddress) {
      try {
        const transactionsForGettingFile = await contract.display(
          currentAddress
        );
        console.log("wait for some time(getting image)..");
        console.log("Files getted successfully");
        setLength(transactionsForGettingFile?.length);
        setFiless(transactionsForGettingFile);
      } catch (error) {
        setSuccess(error.revert.args[0]);
        console.log(error.revert.args[0]);
        console.log("failed to get files");
      }
    } else {
      setSuccess("please send address/public key")
      console.log("please send address/public key");
    }
  };

  const handleDeleteFiles = async (data, ipfs) => {
    setDeleting(!deleting);
    console.log(data);
    setDeleteNum(data);
    setSelectedIpfsHash(ipfs);
  };
  console.log(success);

  const okDelete = async () => {
    setLoading(true);
    setDeleting(false);
    if (deleteNum === "one") {
      console.log(deleteNum + " " + selectedIpfsHash);
      try {
        const transactionsForDeleteOne = await contract.deleteOneUrl(
          account,
          selectedIpfsHash
        );
        await transactionsForDeleteOne.wait(1);
        console.log("succesfully deleted this file from blockchain");

        // now deleting(mean unpinning from node)
        // Step 1: Unpin the file from Pinata
        try {
          const unpinResponse = await fetch(
            `https://api.pinata.cloud/pinning/unpin/${selectedIpfsHash}`,
            {
              method: "DELETE",
              headers: {
                pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
                pinata_secret_api_key: import.meta.env
                  .VITE_SECRET_PINATA_API_KEY,
              },
            }
          );

          if (unpinResponse.ok) {
            console.log(
              `File with hash ${selectedIpfsHash} unpinned successfully.`
            );
            
            const updatedFiles = filess.filter(
              (file) => file.ipfsHash !== selectedIpfsHash
            );

            setFiless(updatedFiles);
            setLoading(false);
            setSuccess("file deleted successfully")
          } else {
            setLoading(false);
            console.error("Failed to unpin file:", unpinResponse.statusText);
            return;
          }
        } catch (error) {
          setLoading(false);
          console.error("Error while unpinning:", error);
          return;
        }
      } catch (error) {
        setLoading(false);
        setSuccess("deletion failed")
        console.log(error);
      }
    } else if (deleteNum === "all") {
      console.log(deleteNum + " " + selectedIpfsHash);
      try {
        const transactionsForDeleteAll = await contract.deleteAllUrls(account);
        await transactionsForDeleteAll.wait(1);
        console.log("successfully deletedall from blockchain");
        // now unpinning all files from pinata ipfsHash

        try {
          const unpinFiles = filess?.map((file) => {
            fetch(`https://api.pinata.cloud/pinning/unpin/${file.ipfsHash}`, {
              method: "DELETE",
              headers: {
                pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
                pinata_secret_api_key: import.meta.env
                  .VITE_SECRET_PINATA_API_KEY,
              },
            });
          });

          // Wait for all unpin requests to complete
          const unpinResponses = await Promise.all(unpinFiles);

          console.log(unpinResponses);

          console.log("All files are successfully unpinned.");
          setFiless([]);
          setLoading(false);
          setSuccess("file deleted successfully")
        } catch (error) {
          setLoading(false);
          console.log(error);
        }
      } catch (error) {
        setLoading(false);
        setSuccess("deletion failed")
        console.log(error);
      }
    } else {
      console.log("firstSelectOne");
    }
    setLoading(false);
  };

  useEffect(() => {
    setLength(1);
    if(success){
      const timeout = setTimeout(() => {
        setSuccess("");
      },3000)

      return () => clearTimeout(timeout);
    }
  },[success,ownFile]);

  console.log(filess);

  return (
    <>
      <div className="getData">
        <div className="select">
          <select
            value={selectedOption}
            onChange={handleOptionChange}
            className="selectOption"
          >
            <option value="own">Own Files</option>
            <option value="other">Other Files</option>
          </select>
        </div>
        {!ownFile && (
          <input
            type="text"
            placeholder="address of other account"
            value={otherAddress}
            onChange={(e) => setOtherAddress(e.target.value)}
            className="inputField"
          />
        )}
        <div>
          <button
            className="button"
            onClick={handleGetFiles}
            style={{ margin: "15px 10px" }}
          >
            Get Files
          </button>
          <button
            className="button"
            onClick={(e) => handleDeleteFiles("all")}
            style={{
              margin: "15px 0",
              backgroundColor: "rgba(255, 0, 92, 0.7)",
            }}
            disabled={!ownFile}
          >
            DeleteFiles
          </button>
        </div>
      </div>

      <div className="files">
        {filess &&
          filess?.map((file, _id) => {
            const { fileName, ipfsHash } = file;
            const url = import.meta.env.VITE_DOMAIN_PINATA_GATEWAY + ipfsHash;
            const filetype = getFileType(fileName);
            return (
              <div className="singleFile" key={_id}>
                <Link target="_blank" className="image" to={url}>
                  {filetype === "pdf" || filetype === "docx" ? (
                    <>
                      <FaFilePdf className="image" />
                    </>
                  ) : (
                    <img className="image" src={url} alt="" />
                  )}
                </Link>
                <div className={ownFile?"buttonDiv":"center"}>
                  <Link target="_blank" to={url}>
                    <button
                      className="button1"
                      style={{
                        marginRight: "5px",
                        marginTop: "5px",
                        backgroundColor: "rgba(0, 92, 172, 0.8)",
                      }}
                    >
                      View
                    </button>
                  </Link>
                  {ownFile && <button
                    onClick={(e) => handleDeleteFiles("one", ipfsHash)}
                    className="button1"
                    style={{
                      backgroundColor: "rgba(255, 0, 92, 0.8)",
                      marginTop: "5px",
                    }}
                  >
                    Delete
                  </button>}
                </div>
                <div className="data">
                  <p className="data">Filename: {fileName}</p>
                </div>
              </div>
            );
          })}
      </div>
      <div
        style={{
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {deleting && (
          <div className="buttonDiv1">
            <div>
              <p style={{ padding: "0 10px" }}>
                Are you sure you want to remove{" "}
                {deleteNum === "one" ? "this file?" : "all your files?"}
              </p>
            </div>
            <div>
              <div className="buttonDiv2">
                <button
                  onClick={okDelete}
                  className="button1"
                  style={{
                    marginRight: "5px",
                    marginTop: "5px",
                    backgroundColor: "rgba(255, 0, 92, 0.8)",
                  }}
                >
                  Yes
                </button>
                <button
                  onClick={(e) => setDeleting(false)}
                  className="button1"
                  style={{
                    backgroundColor: "rgba(0, 92, 172, 0.8)",
                    marginTop: "5px",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {success && <div className="alert">
        {success === "You haven't permission" &&<Alert severity="error">you don't have a permission.</Alert>}
        {success === "please send address/public key" &&<Alert severity="info">please send address/public key.</Alert>}
        {success === "file deleted successfully" &&<Alert severity="success">Deleted successfully.</Alert>}
        {success === "deletion failed" && <Alert severity="error">Failed to delete.</Alert>}
      </div>}
      {loading && <div>
        <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      </div>}
      {(filess && filess?.length == 0 && length == 0) ? <div>
        <p className="noFilesOrList">You haven't uploaded any files yet.</p>
      </div>:""}
    </>
  );
};

export default GetFile;
