import { useState } from "react";
import "./GetFile.css";

const GetFile = ({ state, account }) => {
  const { contract } = state;
  console.log(account);
  const [selectedOption, setSelectedOption] = useState("Get: Own/OtherFile");
  const [otherAddress, setOtherAddress] = useState("");
  const [ownFile, setOwnFile] = useState(true);
  const [files,setFiles] = useState([]);

//   const files = [
//     {
//       id: "1",
//       name: "book",
//       scr: "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
//     },
//     {
//       id: "2",
//       name: "book1",
//       scr: "https://images.unsplash.com/photo-1443068493411-0fa75e5a8b10?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     },
//     {
//       id: "3",
//       name: "book3",
//       scr: "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
//     },
//     {
//       id: "4",
//       name: "book4",
//       scr: "https://images.unsplash.com/photo-1443068493411-0fa75e5a8b10?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     },
//     {
//       id: "5",
//       name: "book5",
//       scr: "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
//     },
//     {
//       id: "6",
//       name: "book6",
//       scr: "https://images.unsplash.com/photo-1443068493411-0fa75e5a8b10?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     },
//   ];
  console.log(otherAddress);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    if (e.target.value == "other") {
        console.log("other");
      setOwnFile(false);
    }else if (ownFile == false) {
        setOwnFile(true)
    }
  };

  const handleGetFiles = async () => {
    let currentAddress;
    if(ownFile == true){
        currentAddress = account;
    }else{
        currentAddress = otherAddress;
    }
    if (currentAddress) {
        try {
            const transactionsForGettingFile = await contract.display(currentAddress);
            console.log("wait for some time(getting image)..")
            // await transactionsForGettingFile.wait(1);
            console.log("Files getted successfully");
            setFiles(transactionsForGettingFile);
        } catch (error) {
            console.log(error);
            console.log('failed to get files')
        }
    }else{
        console.log("please send address/public key");
    }

  };

  console.log(files);

  return (
    <>
      <div className="getData">
        <div className="select">
          <select
            value={selectedOption}
            onChange={handleOptionChange}
            className="selectOption"
          >
            <option value="own">Own File</option>
            <option value="other">Other File</option>
          </select>
        </div>
        {!ownFile && (
          <input
            type="text"
            placeholder="address of other account"
            value={address}
            onChange={(e) => setOtherAddress(e.target.value)}
            className="inputField"
          />
        )}
        <button onClick={handleGetFiles} style={{ margin: "15px 0" }}>
          Get Files
        </button>
      </div>

      {/* <div className="files">
        {files &&
          files?.map((file, _id) => {
            const { name, scr, id } = file;
            return (
              <div className="singleFile" key={_id}>
                <img className="image" src={scr} alt="" />
                <div className="data">
                  <p>id: {id}</p>
                  <p>name: {name}</p>
                </div>
              </div>
            );
          })}
      </div> */}
    </>
  );
};

export default GetFile;
