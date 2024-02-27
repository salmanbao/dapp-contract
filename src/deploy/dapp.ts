import { ethers } from "hardhat";
import {  Address ,DeployFunction, Deployment } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { contracts } from "../ts/deploy";

const deployContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments } = hre;
  const { deploy, get } = deployments;

  let token: Deployment;
  let topup: Deployment;
  let [deployer] = await hre.ethers.getSigners();


  // Deploy Topup Token Contract
  await deploy(contracts.TopupToken, {
    from: deployer.address,
    args: [],
    log: true,
    deterministicDeployment: false,
  });

  token = await get(contracts.TopupToken);

  // Deploy Topup Topup Contract
  await deploy(contracts.Dapp, {
    from: deployer.address,
    args: [token.address],
    log: true,
    deterministicDeployment: false,
  });
  topup = await get(contracts.Dapp);

  console.table({
    token: token.address,
    topup: topup.address,
  });

  // Verify Deployed Contracts
  await verifyContract(hre, token.address, []);
  await verifyContract(hre, topup.address, [token.address]);
};

const verifyContract = async (
  hre: HardhatRuntimeEnvironment,
  contractAddress: Address,
  constructorArgsParams: unknown[]
) => {
  try {
    await hre.run("verify", {
      address: contractAddress,
      constructorArgsParams: constructorArgsParams,
    });
  } catch (error) {
    console.log(
      `Smart contract at address ${contractAddress} is already verified`
    );
  }
};

export default deployContract;
