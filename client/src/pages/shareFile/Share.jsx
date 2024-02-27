import { useEffect, useState } from "react";
import "./Share.css";
import { Alert, CircularProgress } from "@mui/material";

const Share = ({ state, account }) => {
  const { contract } = state;
  const [otherAddress, setOtherAddress] = useState("");
  const [accessList, setAccessList] = useState([]);
  const [loading,setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [checkButton, setCheckButton] = useState("");
  const [length,setLength] = useState("1");

  console.log(accessList);

  const handleAccessProcess = async(button) => {
    if (otherAddress) {
      setCheckButton(button)
      console.log(button);
      try {
        setLoading(true);
        if (button=="allow") {
          console.log(button);
          const transcationForGiveAccess = await contract.allow(otherAddress);
          await transcationForGiveAccess.wait(1);
          console.log("Access allowed successfully.")
          setOtherAddress("");
          console.log(transcationForGiveAccess);
          setLoading(false);
          setSuccess("Request success.")
        }else{
        console.log("disallow");
        const transcationForDisallow = await contract.disAllow(otherAddress);
        await transcationForDisallow.wait(1);
        console.log("Disallowed successfully");
        setOtherAddress("");
        console.log(transcationForDisallow);
        }
        setLoading(false);
        setSuccess("Request success.")
      
      } catch (error) {
        setLoading(false);
        setSuccess("Request failed.")
        console.log(error);
      }
    }else{
        setSuccess("Please enter a address.")
      console.log("Please enter a address.")
    }

  }

  const handleAccessList = async() => {
    try {
      const transactionsForAccessList = await contract.shareList();
      console.log(transactionsForAccessList);
      setAccessList(transactionsForAccessList);
      setLength(transactionsForAccessList?.length);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (success ==="Request success.") {
      console.log("new");
      handleAccessList();
    }
    if(success){
      const timeout = setTimeout(() => {
        setSuccess("")
      }, 2000);

      return ()=> clearTimeout(timeout);
    }
  },[success])

  return (
    <div className="shareComponent">
      <div className="sharingAccess">
        <input
          type="text"
          className="inputField"
          placeholder="Enter address you want to give access"
          value={otherAddress}
          onChange={(e) => setOtherAddress(e.target.value)}
        />
        <div>
        <button disabled={!otherAddress} onClick={() =>handleAccessProcess("allow")} className="button" style={{marginRight:"5px",marginTop:"5px",width:"150px"}}>{loading && checkButton == "allow" ?<CircularProgress size={16} color="inherit" />: "Allow Access"}</button>
        <button disabled={!otherAddress} onClick={() =>handleAccessProcess("disallow")} className="button"  style={{width:"152px",marginTop:"5px"}}>{loading && checkButton == "disallow" ?<CircularProgress size={16} color="inherit" />: "Remove Access"}</button>
        </div>
      </div>
      <div className="accessList">
        <button style={{marginBottom:"20px"}} onClick={handleAccessList} className="button">Access List</button>
        <div>
          {
            accessList && accessList?.length > 0 && <div>
              <table>
                <thead>
                  <tr>
                    <th>Address/User</th>
                    <th>Access</th>
                  </tr>
                </thead>
                <tbody>
                {accessList?.map((list,id) => {
              const {user,access} = list;
              return(
                <tr key={id}>
                  <th>{user}</th>
                  <th>{access?"true":"false"}</th>
                </tr>
              )
            })}
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
      {success && <div className="alert">
        {success === "Request success." &&<Alert severity="success">{success}</Alert>}
        {success === "Request failed" &&<Alert severity="error">{success}</Alert>}
      </div>}
      {(accessList && accessList?.length == 0 && length == 0) ? <div>
        <p className="noFilesOrList">You haven't uploaded any files yet.</p>
      </div>:""}
    </div>
  );
};

export default Share;
