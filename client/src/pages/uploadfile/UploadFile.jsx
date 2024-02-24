import { FaFileUpload } from "react-icons/fa";
import "./UploadFile.css";
import { useState } from "react";

const UploadFile = ({state,account}) => {
  const {contract} = state;
  const [file, setFile] = useState("");
  const [fileName, setFileName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
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

        const ImgHash = `https://gateway.pinata.cloud/ipfs/${responseData.IpfsHash}`; //dynamic content is CID
        console.log(ImgHash);

        try {
          const transcationForUploadImage = await contract.add(account,ImgHash);
          console.log("uploading ImgHash into blockchain.")
          await transcationForUploadImage.wait(1);
          console.log("transcation successfull");
          alert("ImgHash is uploaded Successfully");

        } catch (error) {
          console.log(error);
          console.log("Failed to upload url in blockchain");
        }

      } else {
        console.error("Failed to pin file:", resFile.statusText);
      }

    } else {
      console.log("First choose file");
    }
  };

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
            <label>Choose File</label>
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
            onChange={retrieveFile}
          />
          {fileName && <label>File: {fileName}</label>}
          <button type="submit" disabled={!file}>Upload File</button> 
        </form>
      </div>
    </>
  );
};

export default UploadFile;
