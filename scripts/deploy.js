const hre = require('hardhat');

async function main(){
  const fileSharingFactory = await hre.ethers.getContractFactory("FileShare");
  console.log("deploying...");
  const fileSharing = await fileSharingFactory.deploy();
  await fileSharing.waitForDeployment();

  console.log(`The Deployed contract address is ${fileSharing.target}`); // 0x3457a0AF30CCBC5E5732C5026b5E4C9Ac46E5c8f

  //now verifying process
  console.log(hre.network.config.chainId);
  if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log(`waiting for 6 confirmation.`);
    await fileSharing.deploymentTransaction().wait(6);
    await verify(fileSharing.target,[]);
  }
}

async function verify(contractAddress,args){
  console.log(`verifying contract address..`);
  try {
    await hre.run(`verify:verify`,{
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (error) {
    if (error.message.toLowerCase().includes(`already verified`)) {
      console.log(`Already verified`);
    }else{
      console.log(error);
    }
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
})