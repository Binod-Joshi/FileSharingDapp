import { FaFileUpload } from "react-icons/fa";
import "./UploadFile.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import Alert from '@mui/material/Alert';

const UploadFile = ({ state, account }) => {
  const { contract } = state;
  const [file, setFile] = useState("");
  const [fileName, setFileName] = useState("");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [fileSuccess, setFileSuccess] = useState(false);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", fileName);
      console.log(formData);

      const resFile = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          body: formData,
          headers: {
            pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
            pinata_secret_api_key: import.meta.env.VITE_SECRET_PINATA_API_KEY,
            // Note: "Content-Type: multipart/form-data" header is automatically set for FormData
          },
        }
      );

      // Handle the response
      if (resFile.ok) {
        const responseData = await resFile.json();
        console.log("File pinned successfully:", responseData);

        // const ImgHash = `https://gateway.pinata.cloud/ipfs/${responseData.IpfsHash}`; //dynamic content is CID it is blocked by client so another gateway
        const ImgHash = responseData.IpfsHash;
        console.log(ImgHash);
        setHash(ImgHash);

        try {
          const transcationForUploadImage = await contract.add(
            account,
            fileName,
            ImgHash
          );
          console.log("uploading ImgHash into blockchain.");
          await transcationForUploadImage.wait(1);
          setLoading(false);
          console.log("transcation successfull");
          setFileSuccess(true);
          setSuccess("Successfully uploaded");

        } catch (error) {
          setSuccess("Failed to upload");
          setLoading(false);
          console.log(error);
          console.log("Failed to upload url in blockchain");
          try {
            const unpinResponse = await fetch(
              `https://api.pinata.cloud/pinning/unpin/${ImgHash}`,
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
                `File with hash ${hash} unpinned successfully after you reject to save on blockchain.`
              );
              setHash("");
            }
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        setLoading(false);
        setSuccess("Failed to upload");
        console.error("Failed to pin file:", resFile.statusText);
      }
    } else {
      console.log("First choose file");
    }
  };

  useEffect(() => {
    if(success){
      const timeout = setTimeout(() =>{
        setSuccess("");
      },2000);

      return () => clearTimeout(timeout);
    }
  },[success]);

  const retrieveFile = async (e) => {
    e.preventDefault();
    console.log("hello");
    const data = e.target.files[0];
    console.log(data);
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    reader.onloadend = () => {
      setFile(e.target.files[0]);
    };
    setFileName(data?.name);
  };

  return (
    <>
      <div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="chooseFileSectionA">
            <label style={{fontSize:"20px",}}>Choose File</label>
            <label
              htmlFor="file-upload"
              style={{ fontSize: "30px", cursor: "pointer" }}
            >
              <FaFileUpload />
            </label>
          </div>
          <input
            type="file"
            id="file-upload"
            style={{ display: "none" }}
            name="data"
            disabled={account == "not connected"}
            onChange={retrieveFile}
          />
          {fileName && <label>File: {fileName}</label>}
          <button type="submit" disabled={!file} className="button">
          {loading ?<CircularProgress size={18} color="inherit" />: "Upload File"}
          </button>
        </form>

        {(hash && fileSuccess) && (
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <p>ImgLink:</p>
            <div>
              <a
                href={import.meta.env.VITE_DOMAIN_PINATA_GATEWAY + hash}
                target="_blank"
                rel="noopener noreferrer"
                className="linkSize"
                style={{ whiteSpace: "pre-line" }}
              >
                {import.meta.env.VITE_DOMAIN_PINATA_GATEWAY}
                {hash}
              </a>
            </div>
          </div>
        )}
      </div>
      {success && <div className="alert">
        {success === "Successfully uploaded"?<Alert severity="success">File upload succesfully.</Alert>:<Alert severity="error">Failed to upload a file.</Alert>}
      </div>}
    </>
  );
};

export default UploadFile;
