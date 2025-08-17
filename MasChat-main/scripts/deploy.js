const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting MassCoin deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Deploy MassCoin contract
  console.log("\n📦 Deploying MassCoin contract...");
  const MassCoin = await hre.ethers.getContractFactory("MassCoin");
  const massCoin = await MassCoin.deploy();
  await massCoin.deployed();
  console.log("✅ MassCoin deployed to:", massCoin.address);

  // Deploy Staking contract
  console.log("\n📦 Deploying MassCoinStaking contract...");
  const MassCoinStaking = await hre.ethers.getContractFactory("MassCoinStaking");
  const staking = await MassCoinStaking.deploy(massCoin.address);
  await staking.deployed();
  console.log("✅ MassCoinStaking deployed to:", staking.address);

  // Set up contract relationships
  console.log("\n🔗 Setting up contract relationships...");
  
  // Set staking contract in MassCoin
  const setStakingTx = await massCoin.updateStakingContract(staking.address);
  await setStakingTx.wait();
  console.log("✅ Staking contract set in MassCoin");

  // Update platform address to deployer (can be changed later)
  const setPlatformTx = await massCoin.updatePlatformAddress(deployer.address);
  await setPlatformTx.wait();
  console.log("✅ Platform address set in MassCoin");

  // Verify contracts on Etherscan (if not on local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Verifying contracts on Etherscan...");
    
    try {
      await hre.run("verify:verify", {
        address: massCoin.address,
        constructorArguments: [],
      });
      console.log("✅ MassCoin verified on Etherscan");
    } catch (error) {
      console.log("⚠️ MassCoin verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: staking.address,
        constructorArguments: [massCoin.address],
      });
      console.log("✅ MassCoinStaking verified on Etherscan");
    } catch (error) {
      console.log("⚠️ MassCoinStaking verification failed:", error.message);
    }
  }

  // Deployment summary
  console.log("\n🎉 Deployment completed successfully!");
  console.log("=" * 50);
  console.log("📋 Contract Addresses:");
  console.log("MassCoin:", massCoin.address);
  console.log("MassCoinStaking:", staking.address);
  console.log("Platform Address:", deployer.address);
  console.log("=" * 50);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      massCoin: massCoin.address,
      staking: staking.address,
    },
    timestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  fs.writeFileSync(
    `deployment-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`📄 Deployment info saved to deployment-${hre.network.name}.json`);

  return {
    massCoin: massCoin.address,
    staking: staking.address,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
