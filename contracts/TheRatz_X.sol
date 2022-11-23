// SPDX-License-Identifier: UNLICENSED


// The difference between "TheRatz_X" and "TheRatz_Y" contracts is:
// The level up methods for tokens are different approaches.
// "TheRatz_X" methods to level up are split in 2 options: 1)Payment, 2)Cracking a code.
// "TheRatz_Y" has only one method to level up with both: Payment + Crack a code. 


pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";


// Cheeze(ERC20) Interface
// Connection between the Cheeze(ERC20) contract with the present contract.
interface ICheeze{
    function balanceOf(address account) external view returns (uint256);
}


contract TheRatz_X is ERC721Enumerable, Ownable{

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    using Strings for uint256;

    string private notRevealedUri;
    uint256 public levelUpPrice = 1e18;
    address public cheezeTokenAddress;
    string public baseExtension = ".json";
    bool public revealed = false;
    uint256 public publicMintPrice;
    uint256 public whitelistMintPrice;
    bool public isWhitelistActive = false;
    bool public isPublicActive = false;
    uint256 public maxSupply;
    mapping(address => bool) private whitelisted;
    mapping(uint256 => uint256) private tokenIdToLevel;
    mapping(uint256 => string) private levelToBaseURI;
    mapping(uint256 => bytes32) private levelToRiddleHash;


    constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 _maxSupply, 
        address _setCheezeContractAddress,
        uint256 _publicMintPrice,
        uint256 _whitelistMintPrice
        ) 
        ERC721(_name, _symbol) {
        console.log("The contract has been deployed!");
        maxSupply = _maxSupply;
        cheezeTokenAddress = _setCheezeContractAddress;
        publicMintPrice = _publicMintPrice;
        whitelistMintPrice = _whitelistMintPrice;
    }


    // Check the actual level of your token.
    function checkTokenLevel(uint256 _tokenId) public view returns(uint256) {
        return tokenIdToLevel[_tokenId];
    }


    // Only contract owner can use this function.
    // Push multiple answers at once.
    // Insert the riddle answers according to their level.
    // Format: ["hash", "hash", "hash", etc...]
    function setAllRiddleAnswers(bytes32[] memory _answer) public onlyOwner {
        uint256 _index = 0;

        for(uint256 _level = 1; _level < 5; _level++){
            levelToRiddleHash[_level] = _answer[_index];
            _index++;
        }
    }


    // Only contract owner can use this function.
    // Push one-by-one answer, or update a certain one.
    // Format: Add "0x" to every hash, example 0xhash...
    function updateRiddleAnswer(bytes32 _answer, uint256 _level) external onlyOwner {
        levelToRiddleHash[_level] = _answer;
    }


    // Only contract owner can use this function.
    // Delete all the riddle answers. Be careful!
    function deleteAllRiddleAnswers() external onlyOwner{
       for(uint256 _key = 1; _key < 5; _key++){
            delete levelToRiddleHash[_key];
       }
    }


    ///Level up you token by cracking the code. 
    ///Only token owners can use this function.
    ///_response: Answer to solve a riddle. 
    ///tokenId: The id of the token you want to level up. 
    ///return The new level of a token.
    function levelUpWithCode(string memory _response, uint256 _tokenId) external returns(uint256 newLevel) {
        require(balanceOf(msg.sender) >= 1, "Error, you're not a token owner");
        require(tokenIdToLevel[_tokenId] < 5, "Error, exceed level expectations");

        uint256 currentLevel = tokenIdToLevel[_tokenId];
        
        bytes32 _bytes32Response = keccak256(abi.encodePacked(_response));

        if(levelToRiddleHash[currentLevel] == _bytes32Response){
            return tokenIdToLevel[_tokenId]++;
        }

    }
    

    // Level up you token by paying with Cheeze. 
    // Only token owners can use this function.
    //_tokenId: The id of the token you want to level up. 
    // The new level of a token.
    function levelUpWithPayment(uint256 _tokenId) external payable returns(uint256) {
        require(balanceOf(msg.sender) >= 1, "Error, you're not a token owner");
        require(tokenIdToLevel[_tokenId] < 5, "Error, exceed level expectations");
        require(_exists(_tokenId), "Error: nonexistent token");
        require(ICheeze(cheezeTokenAddress).balanceOf(msg.sender) >= levelUpPrice, "Error, not enough cheeze");
        
        return tokenIdToLevel[_tokenId]++;
    }


    //Level down you token by paying with Cheeze. 
    // Only token owners can use this function.
    //_tokenId: The id of the token you want to level up. 
    // The new level of a token.
    function levelDownWithPayment(uint256 _tokenId) external payable returns(uint256) {
        require(balanceOf(msg.sender) >= 1, "Error, you're not a token owner");
        require(ICheeze(cheezeTokenAddress).balanceOf(msg.sender) >= levelUpPrice, "Error, not enough cheeze");
        require(tokenIdToLevel[_tokenId] > 1, "Error, token level can't go down to zero");

        return tokenIdToLevel[_tokenId]--;
    }


    // Only contract owner can use this function.
    // Activate or deactivate whitelist minting.
    function flipIsWhitelistActive() external onlyOwner {
        isWhitelistActive = !false;
    }

    // Only contract owner can use this function.
    //Activate or deactivate public minting.
    function flipIsPublicActive() external onlyOwner {
        isPublicActive = !false;
    }


    //Only contract owner can use this function.
    //Update public minting price.
    function updatePublicMintPrice(uint256 _newAmount) external onlyOwner {
        publicMintPrice = _newAmount;
    }


    //Only contract owner can use this function.
    //Update whitelist minting price.
    function updateWhitelistMintPrice(uint256 _newAmount) external onlyOwner {
        whitelistMintPrice = _newAmount;
    }


    ///Only contract owner can use this function.
    ///Update token max supply.
    function updateMaxSupply(uint256 _newMaxSupply) external onlyOwner {
        maxSupply = _newMaxSupply;
    }


    ///Only contract owner can use this function.
    ///Add a list of address to join the whitelist.
    function addWhitelist(address[] calldata _addresses) external onlyOwner {
        for(uint256 _index; _index < _addresses.length; _index++){
            whitelisted[_addresses[_index]] = true;
        }
    }
    

    ///Only contract owner can use this function.
    ///Delete an address from the whitelist.
    function removeWhitelistedUser(address _user) external onlyOwner {
        whitelisted[_user] = false;
    }


    ///Only contract owner can use this function.
    ///Be careful you will not be able to revert the change!
    function reveal() external onlyOwner {
        revealed = true;
    }


    ///Only contract owner can use this function.
    ///Add multiple base URIs for each level of the tokens.
     function setMultipleBaseURIs(string[5] memory _newBaseURI) external onlyOwner {
        uint256 _index = 0;
        uint256 _level = 1;
        for(_level; _level < 6; _level++){
           levelToBaseURI[_level] = _newBaseURI[_index];
           _index++;
        }
    }


    ///Only contract owner can use this function.
    ///Add one by one base URIs for each level of the tokens.
    function updateOneBaseURI(string memory _newBaseURI, uint256 _level) external onlyOwner {
        levelToBaseURI[_level] = _newBaseURI;
    }


    ///Only contract owner can use this function.
    ///Set the not revealed base URI.
    function setNotRevealedUri(string memory _notRevealedUri) external onlyOwner {
        notRevealedUri = _notRevealedUri;
    }


    ///Only contract owner can use this function.
    ///Set the base extension of the URI files.
    function setBaseExtension(string memory _baseExtension) external onlyOwner {
        baseExtension = _baseExtension;
    }


    ///Override function from the OpenZippelin ERC721 contract.
    ///This method is used by the NFTs marketplaces to set and presents the proper base URI for each token.
    ///return: The actual Uniform Resource Identifier (URI) for tokenId token.
    function tokenURI(uint256 _tokenId) public view virtual override returns(string memory _tokeURI){
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");

        if(revealed == false){
            return notRevealedUri;
        }

        string memory currentBaseURI = levelToBaseURI[tokenIdToLevel[_tokenId]];
        return bytes(currentBaseURI).length > 0 ? 
            string(abi.encodePacked(currentBaseURI, _tokenId.toString(), baseExtension)) : "";   
        
    }


    // Check how many tokens an address own.
    // How many tokens an address has.
    function walletOfOwner(address _owner) external view returns(uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);

        for(uint256 _index; _index < ownerTokenCount; _index++){
            tokenIds[_index] = tokenOfOwnerByIndex(_owner, _index);
        }

        return tokenIds;
    }


    // Minting function.
    // Whitelist users can mint 2 tokens per transactions.
    // Public users can mint 1 token per transactions.
    function mint(uint256 _mintAmount) external payable {
        require(maxSupply > totalSupply(), "Error, sold out!");

        if(whitelisted[msg.sender] == true){
            require(isWhitelistActive, "Error, whitelist is not active");
            require(msg.value >= _mintAmount * whitelistMintPrice, "Error, not enough ether");
            require(_mintAmount <= 2, "Error, you can't mint more than 2 per transaction");

        }

        if(whitelisted[msg.sender] == false){
            require(isPublicActive, "Error, public mint is not active");
            require(msg.value >= _mintAmount * publicMintPrice, "Error, not enough ether");
            require(_mintAmount == 1, "Error, you can't mint more than 1 per transaction");

        }

        for(uint256 _nfts; _nfts < _mintAmount; _nfts++){
            uint256 newItemId = _tokenIds.current();
            _safeMint(msg.sender, newItemId);
            tokenIdToLevel[newItemId] = 1;
            _tokenIds.increment();
            console.log("NFT w/ ID %s has been minted to %s", newItemId, msg.sender);
        }
    }


    // Only contract owner can use this function.
    // Withdraw the money saved in the contract.
    function withdraw() external onlyOwner{
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success);
    }

}