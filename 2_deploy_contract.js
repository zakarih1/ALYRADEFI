//var Whitelist = artifacts.require("./Whitelist.sol");
var Voting = artifacts.require("./Voting.sol");



module.exports = function (deployer) {
  deployer.deploy(Voting);
};
// module.exports = function(deployer) {
  // deployer.deploy(Whitelist);
	// // get the owner address
	// try{
		// const accounts = web3.eth.getAccounts();
		// const owner = accounts[0];
		// deployer.deploy(Voting, Whitelist.address)
	// }catch (error) {}
	// // deploy the second, with address parameter
	
// };

