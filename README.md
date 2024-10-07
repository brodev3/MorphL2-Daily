# MorphL2-Daily
 
<p>
      <img src="https://i.ibb.co/3sHQCSp/av.jpg" >
</p>

<p >
   <img src="https://img.shields.io/badge/build-v_1.0-brightgreen?label=Version" alt="Version">
</p>


## About

This software allows users to automatically collect daily rewards from morphl2.io. Additionally, it participates in voting processes to utilize the collected rewards.



## Features
- Randomized voting to ensure all votes are utilized in each voting session.
- Supports user masking and simulation.
- Operates with requests and a single transaction in the BSC network, requiring a BNB fee for claiming.
- Supports SOCKS5 proxies.
- Randomly collects rewards throughout the day and during the first launch within the specified MAXTIME.

 ## Configuration
 Before starting, you need to configure the ```.env``` file. Open ```.env``` and set the following parameters:
 
    
    DECRYPT = 
    MESSAGE = "Sup bro"
    POLYGON_RPC_URL = "https://bsc-dataseed.bnbchain.org"
    CONTRACT = "0x45C36b3eE5f6c9b4b494515b21A59B8b78336536"
    MAXTIME = 10000

    
Explanation of parameters:
- **DECRYPT**: Used for encrypted text. If not needed, leave it empty. If needed, set to ```1```.
- **MESSAGE**: A phrase for decryption.
- **POLYGON_RPC_URL**: The RPC URL of the token's network.
- **CONTRACT**: The Morph contract address.
- **MAXTIME**: The maximum time (in milliseconds) that will be randomly assigned to delay the execution of start each wallet. All accounts will be triggered within this random delay. For example, if MAXTIME is set to 5000, the start can occur anytime between 1 second and 5 seconds (1000-5000 milliseconds).

 ## Wallet Configuration
Fill out the ```w.csv``` file with the wallets to be used for token transfers. The first row with the value ```1``` is a header and must not be removed. Below the header, insert data in the format:

    privateKey;proxyHost:proxyPort:proxyLogin:proxyPassword

 ## How to Start

1. Node JS
2. Clone the repository to your disk
3. Configure ```.env``` with the appropriate parameters
4. Add wallet information to ```w.csv```
5. Launch the console (for example, Windows PowerShell)
6. Specify the working directory where you have uploaded the repository in the console using the CD command
    ```
    cd C:\Program Files\brothers
    ```
7. Install packages
   
    ```
    npm install
    ```
8. Run the software, and it will transfer tokens from the specified wallets to the respective addresses. All accounts will start after a random delay, determined between 1 second and the value specified in MAXTIME.
    ```
    node index
    ```





## License

Project **brodev3**/MorphL2-Daily distributed under the MIT license.
