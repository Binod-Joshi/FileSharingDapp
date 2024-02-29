// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract FileShare {

    struct FileName{
        string fileName;
        string ipfsHash;
    }

    struct Access {
        address user;
        bool access;
    }

    mapping(address => FileName[]) value;
    mapping(address => mapping(address => bool)) ownership;
    mapping(address => Access[]) accessList;
    mapping(address => mapping(address => bool)) previousData;

    modifier onlyOwner(address _user) {
        require(msg.sender == _user, "Only owner can perform this operation"); // arkha photo delete garanjya yo round ta par gari halalo ba
        _;
    }

    modifier checkForAllowFunction(address _user){
        require(!ownership[msg.sender][_user], "Already account is allowed");
        _;
    }

    modifier checkForDisAllowFunction(address _user){
        require(ownership[msg.sender][_user], "Already account is disallow");
        _;
    }

    modifier hasPermission(address _user){
        require(msg.sender == _user || ownership[msg.sender][_user], "You haven't permission");
        _;
    }

    function add(address _user, string calldata _fileName, string calldata _ipfsHash) external {
        value[_user].push(FileName(_fileName,_ipfsHash));
    }

    function allow(address _user) external checkForAllowFunction(_user) {
        ownership[msg.sender][_user] = true;
        if (previousData[msg.sender][_user] == true) {
            for (uint256 i = 0; i < accessList[msg.sender].length; i++) {
                if (accessList[msg.sender][i].user == _user) {
                    accessList[msg.sender][i].access = true;
                }
            }
        } else {
            accessList[msg.sender].push(Access(_user, true));
            previousData[msg.sender][_user] = true;
        }
    }

    function disAllow(address _user) external checkForDisAllowFunction(_user) {
        ownership[msg.sender][_user] = false;
        for (uint256 i = 0; i < accessList[msg.sender].length; i++) {
            if (accessList[msg.sender][i].user == _user) {
                accessList[msg.sender][i].access = false;
            }
        }
    }

    function display(address _user) external view hasPermission(_user) returns (FileName[] memory) {
        return value[_user];
    }

    function shareList() external view returns (Access[] memory) {
        // to see the list of account whom we have given a access
        return accessList[msg.sender];
    }

    function deleteAllUrls(address _user) external onlyOwner(_user) { // mean photo
        delete value[_user];
    }

    function deleteOneUrl(address _user, string memory _ipfsHash) external onlyOwner(_user){
        for(uint i = 0; i<value[_user].length;i++){
            if (keccak256(abi.encodePacked(value[_user][i].ipfsHash)) == keccak256(abi.encodePacked(_ipfsHash))){
                delete value[_user][i];
                for(uint j = i; j< value[_user].length -1;j++){
                    value[_user][j] = value[_user][j+1];
                }
                value[_user].pop();
                break;
            }
        }
    }
}


    // struct Access{
    //     address user;
    //     bool access;
    // }
    // mapping(address => string[]) value; //to store the url (address of the user,list of url of  images of that user)
    // mapping(address => mapping(address=>bool)) ownership;
    // mapping(address => Access[]) accessList; //to give ownership
    // mapping(address => mapping(address=>bool)) previousData;

    // function add(address _user,string calldata url) external {
    //     value[_user].push(url);
    // }

    // function allow(address _user) external {
    //     ownership[msg.sender][_user] = true; // msg.sender is giving access to the this _user of his/her files/drive
    //     if (previousData[msg.sender][_user] == true){

    //     }else {
    //         accessList[msg.sender].push(Access(_user,true)); // msg.sender is allowing access to the user by pushing in the accessList
    //         previousData[msg.sender][_user] = true;
    //     }
    // }