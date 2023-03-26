# ata-network-relayer
To run this NodeJS service:

 ●	Run ```npm i``` to install packages
 
 ●	Rename ```.env.example``` as ```.env``` and add your MONGODB_PSWD and your RELAYER_KEYS (private key).
 
 ●	Run ```npm run dev``` to start the relayer microservice.
 
 
 ## Should be noted

Since NodeJS cannot handle concurrency, I have made a recursive function with status to execute transaction based on a QUEUE algorithm. 

There is an issue in the contract couldn't resolve within the dealine.

Issue:  *Even though the user user gives approval for the relayer, when relayer executes the transaction, it reverts with the message "Insufficient Allowance".*
 
The Receiver contract didn't use delegate for many vulnerability reason:

   > Transaction will be expensive
   
   > The contract should not have any vullnerability, should be audited to pass the all the best cases.
   
   > Since the contract access caller's storage
   
However, the 3 token contract was deployed by myself so I tried using delegate call after submitting the assignment during my free time, I was able to execute the transaction but i can see the internal transaction fails. Which means the solution provided isn't executing the expected result.

I have provided the contract details that is deployed and tested using delegate call below (check the transaction details):
   
 >  [0x06aed3816d318ed837d0bd5a232a5a26ef530267](https://mumbai.polygonscan.com/address/0x06aed3816d318ed837d0bd5a232a5a26ef530267)
 
 
  
  
