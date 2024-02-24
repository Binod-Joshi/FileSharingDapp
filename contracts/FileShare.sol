// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract FileShare {

    struct Access {
        address user;
        bool access;
    }

    mapping(address => string[]) value;
    mapping(address => mapping(address => bool)) ownership;
    mapping(address => Access[]) accessList;
    mapping(address => mapping(address => bool)) previousData;

    modifier checkForAllowFunction(address _user){
        require(!ownership[msg.sender][_user], "Already account is allowed");
        _;
    }

    modifier checkForDisAllowFunction(address _user){
        require(ownership[msg.sender][_user], "Already account is disallow");
        _;
    }

    modifier hasPermission(address _user){
        require(msg.sender == _user || ownership[_user][msg.sender], "You haven't permission");
        _;
    }

    function add(address _user, string calldata url) external {
        value[_user].push(url);
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

    function display(address _user) external view hasPermission(_user) returns (string[] memory) {
        return value[_user];
    }

    function shareList() external view returns (Access[] memory) {
        // to see the list of account whom we have given a access
        return accessList[msg.sender];
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