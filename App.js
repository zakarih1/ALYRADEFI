import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';
import Voting from "./contracts/Voting.json";

import getWeb3 from "./getWeb3";
import "./App.css";

class App extends Component {
state = { web3: null, accounts: null, contract: null,names: null, whitelist: null,proposer : null,workflowStatus : 0,voteCount: null,vote : null,winningProposalID:null,winnerName: null};

// 3 "whitelist" à ne pas confondre : variable globale, fonction, et const.
  componentWillMount = async () => {
    try {
      // Récupérer le provider web3
      const web3 = await getWeb3();
  
      // Utiliser web3 pour récupérer les comptes de l’utilisateur (MetaMask dans notre cas) 
      const accounts = await web3.eth.getAccounts();

      // Récupérer l’instance du smart contract “Voting” avec web3 et les informations du déploiement du fichier (client/src/contracts/Voting.json)
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Voting.networks[networkId];
	  const instance = new web3.eth.Contract(
        Voting.abi,
        deployedNetwork && deployedNetwork.address,
      );
     
	 
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance}, this.runInit);
      } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`,
      );
      console.error(error);
    }
  };

// fallback pour chaque event. Pr les fallback, updater les variables d état de
//mon fichier App.js
// event :  déclaration . declenchement d une fct, apellé "fallback"
//puis MAJ de l'état ( "this.state"  , fct de base de React pour MAJ du rendering)


  runInit = async() => {
    const {contract} = this.state;
    // récupérer la liste des comptes autorisés
    const whitelist = await contract.methods.getAddresses().call();
    console.log('whitelist',whitelist);
	// Mettre à jour le state 
    // Temps entre execution transaction et recuperation de la WLIST AVEC GETaDRESS
	//Le getAdress est fct  view (pas de transaction): dde direct à la memoire, rep directe
    this.setState({ whitelist: whitelist });
  }; 

  whitelist = async() => {
   const { accounts, contract} = this.state;
   const address = this.address.value;
       console.log('address',address);

    // Interaction avec le smart contract pour ajouter un compte 
    await contract.methods.whitelist(address).send({from: accounts[0]});
 
    // Récupérer la liste des comptes autorisés
    this.runInit();  }

 
 workflowStatus = async() => {   
   const {accounts, contract} = this.state;
    await contract.methods.nextStage().send({from: accounts[0]});
	
 	this.setState({ workflowStatus :this.state.workflowStatus+1 });
 console.log('workflowStatus =',this.state.workflowStatus);}
;
	 
  proposer = async() => {
   const {accounts,contract} = this.state;
   const names = this.names.value;      
   console.log('names =',names);
    console.log('contract =',contract);
//const proposer = contract.methods.getPrp().call();

 try{
	     console.log('accounts =',accounts);
  // probleme ici...
  await contract.methods.proposer(names).send({from: accounts[0]});
   } catch (error) {
      // Catch any errors for any of the above operations.
      alert(`a revoir! `, );
      console.error(error);
    }
    this.runNext();  } 

    runNext = async() => {
    const {contract} = this.state; 
     const proposer = await contract.methods.getPrp().call();
    console.log('proposer =',proposer);

    this.setState({ proposer: proposer }); }


vote = async() => {
    const {accounts, contract } = this.state;
	const votedProposalId=this.votedProposalId.value;
    console.log('votedProposalId =',votedProposalId);

    await contract.methods.vote(accounts[0],votedProposalId).send({from: accounts[0]});
    const vote = await contract.methods.getVote().call();
    // Mettre à jour le state 
    this.setState({ vote: vote });
	}; 
  
 winnerName=async()=> {
   const {contract } = this.state;
   //await contract.methods.winningProposalID();
   const winningProposalID=await contract.methods.winningProposalID().call();
    		    console.log('winningProposalID =',winningProposalID);
  // const winnerName=await contract.methods.winnerName().send({from: accounts[0]});
   const winnerName=await contract.methods.winnerName().call();
 	
	console.log('winnerName =',winnerName);
// Mettre à jour le state 
    this.setState({ winnerName: winnerName });
};   
 //Affichage partiel suivant l'état 

// à recupérer et comparer à la whitelist pour déterminer si owner (ou account[0]) ou pas
// à partir de ces états (owner et state), on peut afficher , ou pas, des parties HTML
// switchcase
render() {
    const { whitelist,proposer} = this.state;
	
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div>
            <h2 className="text-center">Vote en assemblée</h2>
            <hr></hr>
            <br></br>
        </div>
		
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Liste des comptes autorisés</strong></Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>@</th>
                      </tr>
                    </thead>
                    <tbody>
          {whitelist !== null && whitelist.map((a) => <tr><td>{a}</td></tr>)}
                    </tbody>
                  </Table>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
        <br></br>
		
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Autoriser un nouveau compte</strong></Card.Header>
            <Card.Body>
              <Form.Group controlId="formAddress">
                <Form.Control type="textarea" id="address"
                ref={(input) => { this.address = input }}/>
              </Form.Group>
              <Button onClick={ this.whitelist } variant="dark" > Autoriser </Button>
            </Card.Body>
          </Card>
          </div>
        <br></br>
               
	
      <div style={{display: 'flex', justifyContent: 'center'}}>
            <Card style={{ width: '50rem' }}>
              <Card.Header><strong>Situation du processus de vote</strong></Card.Header>
     <Button onClick={ this.workflowStatus } variant="dark" > Etape Suivante</Button>           
        Etape actuelle : <b>{this.state.workflowStatus}</b> <br/> 
			  <Card.Body>
        		<p class="card-text">  
		      0  Enrengistrements des électeurs<br/>
			  1  Début des enrengistrements des propositions<br/>
			  2  Fin des enrengistrements   <br/>	  
              3  Début du vote              <br/>
              4  Fin du vote                <br/>
              5  Décomptage des bulletins	<br/> </p>
	          </Card.Body>
            </Card>		
       </div>
	   

		       	       
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
		  <Card.Header><strong>Liste des propositions</strong></Card.Header>
            <Card.Body>
			                 <Form.Label column="lg" lg={15}>
          Si proposition déjà présente, merci de ne pas en rajouter de semblabe.
                   </Form.Label>                     
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
					  <th>
 					  </th>
				   </tr>
                    </thead>
                    <tbody>
{proposer!== null && 
[Array.from(proposer)].map((names,voteCount) => <tr><td>proposition n°{voteCount}  :  {names}</td></tr>)}
				   </tbody>
                  </Table>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
          </div>
        <br></br>
		
    <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Soumettre  une proposition</strong></Card.Header>
            <Card.Body>
              <Form.Group controlId="ControlTextarea">
                <Form.Control type="textarea" 
                ref={(input) => { this.names = input }}
                />
              </Form.Group>
              <Button onClick={ this.proposer } variant="dark" > Autoriser </Button>
            </Card.Body>
          </Card>
          </div>
        <br></br>
		
		
	    <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
           <Card.Header><strong>Voter pour une proposition</strong></Card.Header>
            <Card.Body>
              <Form.Group controlId="ControlTextNumber">
                <Form.Control type="number" 
                ref={(input) => { this.votedProposalId = input }}
                />
              </Form.Group>
              <Button onClick={ this.vote} variant="dark" > Voter </Button>
            </Card.Body>
           </Card>
          </div>
       <br></br>		
		
     <div style={{display: 'flex', justifyContent: 'center'}}>
         <Card style={{ width: '50rem' }}>
          <Card.Header><strong>Publier le résultat du décompte</strong></Card.Header>
 				   		{(this.state.winnerName)}
                <Button onClick={ this.winnerName } variant="dark" > Afficher le résultat des votes </Button>
           </Card>
          </div>
        <br></br>
      </div>

    );
  }
}

export default App;