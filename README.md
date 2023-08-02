# ata-network-relayer
To run this NodeJS service:

 ●	Run ```npm i``` to install packages
 
 ●	Rename ```.env.example``` as ```.env``` and add your MONGODB_PSWD and your RELAYER_KEYS (private key).
 
 ●	Run ```npm run dev``` to start the relayer microservice.
 
 
 
 ## Should be noted

Since NodeJS cannot handle concurrency, I have made a recursive function with status to execute transaction based on a QUEUE algorithm. 

below is the contract details that is deployed and tested using delegate call below (check the transaction details):
   
 >  [0x06aed3816d318ed837d0bd5a232a5a26ef530267](https://mumbai.polygonscan.com/address/0x06aed3816d318ed837d0bd5a232a5a26ef530267)
 
 
 
 
  
  
