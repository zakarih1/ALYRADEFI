// SPDX-License-Identifier: MIT
pragma solidity 0.5.16;
//import "@openzeppelin/contracts/ownership/Ownable.sol";
 

contract Voting{
mapping(address => Voter) public voters;
event Proposer(string  names);

// Type pour une proposition.
struct Proposal {
string name;
uint voteCount;}


struct Voter {
bool hasVoted;
uint votedProposalId;}


// Un tableau dynamique de structs `Proposal`.
Proposal[] public proposals;

event VoterRegistered(address voterAddress);
event ProposalsRegistrationStarted();
event ProposalsRegistrationEnded();
event ProposalRegistered(uint proposalId);
event VotingSessionStarted();
event VotingSessionEnded();
event Voted (address voter, uint proposalId);
event VotesTallied();


enum WorkflowStatus {
RegisteringVoters,
ProposalsRegistrationStarted,
ProposalsRegistrationEnded,
VotingSessionStarted,
VotingSessionEnded,
VotesTallied}
       
mapping(address=> bool) public _whitelist;
address[] public addresses;
event Whitelisted(address _address); 
      

	  // Le workflow par défaut,est le suivant :
WorkflowStatus public workflowStatus= WorkflowStatus.RegisteringVoters;

event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
 
function nextStage() public {
workflowStatus = WorkflowStatus((uint(workflowStatus) + 1));
   if (workflowStatus == WorkflowStatus(1)) { emit ProposalsRegistrationStarted();}
   if (workflowStatus == WorkflowStatus(2)) { emit ProposalsRegistrationEnded();}
   if (workflowStatus == WorkflowStatus(3)) { emit VotingSessionStarted();}
   if (workflowStatus == WorkflowStatus(4)) { emit VotingSessionEnded();}
   if (workflowStatus == WorkflowStatus(5)) { emit VotesTallied();}
emit WorkflowStatusChange(WorkflowStatus(uint(workflowStatus)-1),WorkflowStatus( uint(workflowStatus) ) )
;}

function whitelist(address _address) public {
    require(!_whitelist[_address],"This address is already whitelisted !");
    _whitelist[_address] = true;
    addresses.push(_address);
    emit Whitelisted(_address);    }
	
function isWhitelist(address _address) public view returns(bool){
        return _whitelist[_address];    }
		
function getAddresses() public view returns(address[] memory)
                       {return addresses;}
 
function getStatus() public view returns (WorkflowStatus)
                    {return workflowStatus;}

function proposer(string  memory names) public {
    assert(isWhitelist(msg.sender));
    assert((workflowStatus ==WorkflowStatus(1)));
  proposals.push(Proposal({name: names,voteCount: 0})  );}
			
 function getPrp() public view returns (string memory names) {
    return proposals[proposals.length-1].name; }     	    
 
 function vote(address voterAddress,uint votedProposalId) public {
        Voter storage sender = voters[msg.sender];
		require((workflowStatus == WorkflowStatus(3)),"le vote n'a pas encore commence");
 		require(!sender.hasVoted, "a deja vote.");
 	    sender.hasVoted= true;
        //sender.vote= votedProposalId;
        // Si `votedProposalId` n'est pas un index valide, une erreur sera levée et l'exécution annulée
        proposals[votedProposalId].voteCount += 1;
		emit Voted (voterAddress, votedProposalId);    }

	
///  Calcule la proposition gagnante en prenant tous les votes précédents en compte.
 function winningProposalID() public view returns (uint winningProposalID_){
    require((workflowStatus == WorkflowStatus(5)),"comptage  indisponible");
            uint winningVoteCount = 0;
	for (uint p = 0; p < proposals.length; p++){
       if (proposals[p].voteCount > winningVoteCount){
                        winningVoteCount = proposals[p].voteCount;
                   		winningProposalID_ = p;}} }

function winnerName() public view returns (string memory winnerName_){
        winnerName_ = proposals[winningProposalID()].name;}

}