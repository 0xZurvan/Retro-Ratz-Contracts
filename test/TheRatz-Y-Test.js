const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber = require('bignumber.js');

describe("Deployment", function () {

  let theRatzY;
  let cheezeToken;
  let owner;
  let address1;
  let address2;
  let address3;
  let address4;

   beforeEach(async function() {
    const cheezeContractName = "Cheeze";
    const contractName = "TheRatz_Y";
    const contractSymbol = "TRY";
    const maxSupply = 10000;
    const whitelistPrice = 0;
    const publicMintPrice = 0;
    [owner, address1, address2, address3, address4] = await ethers.getSigners();
    const smartContract = await ethers.getContractFactory(contractName);
    const cheezeContract = await ethers.getContractFactory(cheezeContractName);
    cheezeToken = await cheezeContract.deploy(owner.address);
    await cheezeToken.connect(owner).deployed();

    
    theRatzY = await smartContract.deploy(
      contractName, 
      contractSymbol, 
      maxSupply,
      cheezeToken.address,
      whitelistPrice,
      publicMintPrice
    );

    await theRatzY.connect(owner).deployed();
    console.log(`${contractName} deployed to: ${theRatzY.address}`);
    console.log(`${cheezeContractName} deployed to: ${cheezeToken.address}`);
    
  });


  describe("Mint mechanism", function() {

    it("Should activate public minting", async function() {
      await theRatzY.connect(owner).flipIsPublicActive();
      const isPublicActive = await theRatzY.isPublicActive();
  
      expect(isPublicActive).to.be.true;
  
    });


    it("Should activate whitelist minting", async function() {
      await theRatzY.connect(owner).flipIsWhitelistActive();
      const isWhitelistActive = await theRatzY.isWhitelistActive();
  
      expect(isWhitelistActive).to.be.true;
  
    });


    it("Should add address to the whitelist", async function () {
        
      let addresses = await theRatzY.connect(owner).addWhitelist([
        address2.address,
        address3.address,
        address4.address
      ]);

      await theRatzY.connect(owner).flipIsWhitelistActive();

      let _index = 0;
      for(_index; _index < addresses.length; _index++) {
        await theRatzY.connect(addresses[_index]).mint(1);
        expect(await theRatzY.balanceOf(addresses[_index].address)).to.equal(1);
      } 
      

    });


    it("Should mint tokens for public users", async function () {
      await theRatzY.connect(owner).flipIsPublicActive();
      await theRatzY.connect(address1).mint(1);
      expect(await theRatzY.balanceOf(address1.address)).to.equal(1);

    });


  });

  
  describe("Riddle mechanism", function() {


    it("Should level up a token", async function() {
      await theRatzY.connect(owner).setAllRiddleAnswers([
        "0x6d255fc3390ee6b41191da315958b7d6a1e5b17904cc7683558f98acc57977b4",
        "0x4da432f1ecd4c0ac028ebde3a3f78510a21d54087b161590a63080d33b702b8d",
        "0x204558076efb2042ebc9b034aab36d85d672d8ac1fa809288da5b453a4714aae",
        "0x87ce9fb076e206b40a6ab86e39ba8d0097abec87a8fa990c91a1d0b9269835ae"
      ]);

      let riddleAnswers = ["test1", "test2", "test3", "test4"];

      await theRatzY.connect(owner).flipIsPublicActive();
      await theRatzY.connect(address3).mint(1);
      const ethPayment = {value: ethers.utils.parseEther("5")}
      await cheezeToken.connect(address3).buy(address3.address, 5, ethPayment);

      let _index = 0;
      let _level = 1;
      for(_index; _index < riddleAnswers.length; _index++) {
        await theRatzY.connect(address3).levelUpWithPayment(riddleAnswers[_index], 0);
        _level++;

        expect(await theRatzY.checkTokenLevel(0)).to.equal(_level);

      }
      

    });
    

    it("Should level down a token", async function() {
      await theRatzY.connect(owner).setAllRiddleAnswers([
        "0x6d255fc3390ee6b41191da315958b7d6a1e5b17904cc7683558f98acc57977b4",
        "0x4da432f1ecd4c0ac028ebde3a3f78510a21d54087b161590a63080d33b702b8d",
        "0x204558076efb2042ebc9b034aab36d85d672d8ac1fa809288da5b453a4714aae",
        "0x87ce9fb076e206b40a6ab86e39ba8d0097abec87a8fa990c91a1d0b9269835ae",

      ]);

      let riddleAnswers = ["test1", "test2", "test3", "test4"];

      await theRatzY.connect(owner).flipIsPublicActive();
      await theRatzY.connect(address3).mint(1);
      const ethPayment = {value: ethers.utils.parseEther("10")}
      await cheezeToken.connect(address3).buy(address3.address, 10, ethPayment);

      let _index = 0;
      let _level = 1;

      for(_index; _index < riddleAnswers.length; _index++) {
        await theRatzY.connect(address3).levelUpWithPayment(riddleAnswers[_index], 0);
        _level++;

        expect(await theRatzY.checkTokenLevel(0)).to.equal(_level);

      }

      for(_index; _index < riddleAnswers.length; _index++) {
        await theRatzY.connect(address3).levelDownWithPayment(0);
        _level--;

        expect(await theRatzY.checkTokenLevel(0)).to.equal(_level);

      }

    });


    it("Should set many riddle answers at once", async function() {
      await theRatzY.connect(owner).setAllRiddleAnswers([
        "0x6d255fc3390ee6b41191da315958b7d6a1e5b17904cc7683558f98acc57977b4",
        "0x4da432f1ecd4c0ac028ebde3a3f78510a21d54087b161590a63080d33b702b8d",
        "0x204558076efb2042ebc9b034aab36d85d672d8ac1fa809288da5b453a4714aae",
        "0x87ce9fb076e206b40a6ab86e39ba8d0097abec87a8fa990c91a1d0b9269835ae",

      ]);

      let riddleAnswers = ["test1", "test2", "test3", "test4"];

      await theRatzY.connect(owner).flipIsPublicActive();
      await theRatzY.connect(address3).mint(1);
      const ethPayment = {value: ethers.utils.parseEther("5")}
      await cheezeToken.connect(address3).buy(address3.address, 5, ethPayment);

      let _index = 0;
      let _level = 1;

      for(_index; _index < riddleAnswers.length; _index++) {
        await theRatzY.connect(address3).levelUpWithPayment(riddleAnswers[_index], 0);
        _level++;

        expect(await theRatzY.checkTokenLevel(0)).to.equal(_level);

      }

    });


    it("Should update the riddle answer", async function() {

      await theRatzY.connect(owner).setAllRiddleAnswers([
        "0x6d255fc3390ee6b41191da315958b7d6a1e5b17904cc7683558f98acc57977b4",
        "0x4da432f1ecd4c0ac028ebde3a3f78510a21d54087b161590a63080d33b702b8d",
        "0x204558076efb2042ebc9b034aab36d85d672d8ac1fa809288da5b453a4714aae",
        "0x87ce9fb076e206b40a6ab86e39ba8d0097abec87a8fa990c91a1d0b9269835ae",

      ]);

      let riddleAnswers = ["test1", "test2", "test3", "test4"];

      await theRatzY.connect(owner).updateRiddleAnswer(
        2, "0xae97a5225f8c75b0b4009ef4df5d49e645f48f8c0e65eb68483d1dd8f42acf41");
      
      riddleAnswers[1] = "new test2";  

      await theRatzY.connect(owner).flipIsPublicActive();
      await theRatzY.connect(address3).mint(1);
      const ethPayment = {value: ethers.utils.parseEther("10")}
      await cheezeToken.connect(address3).buy(address3.address, 10, ethPayment);

      let _index = 0;
      let _level = 1;
      for(_index; _index < riddleAnswers.length; _index++) {
        await theRatzY.connect(address3).levelUpWithPayment(riddleAnswers[_index], 0);
        _level++;

        expect(await theRatzY.checkTokenLevel(0)).to.equal(_level);

      }

    });


    it("Should delete all riddle answers", async function() {
      await theRatzY.connect(owner).setAllRiddleAnswers([
        "0x6d255fc3390ee6b41191da315958b7d6a1e5b17904cc7683558f98acc57977b4",
        "0x4da432f1ecd4c0ac028ebde3a3f78510a21d54087b161590a63080d33b702b8d",
        "0x204558076efb2042ebc9b034aab36d85d672d8ac1fa809288da5b453a4714aae",
        "0x87ce9fb076e206b40a6ab86e39ba8d0097abec87a8fa990c91a1d0b9269835ae"
      ]);

      let riddleAnswers = ["test1", "test2", "test3", "test4"];

      await theRatzY.connect(owner).deleteAllRiddleAnswers();
      
      await theRatzY.connect(owner).flipIsPublicActive();
      await theRatzY.connect(address3).mint(1);
      const ethPayment = {value: ethers.utils.parseEther("5")}
      await cheezeToken.connect(address3).buy(address3.address, 5, ethPayment);

      let _index = 0;
      let _level = 1;
      for(_index; _index < riddleAnswers.length; _index++) {
        await theRatzY.connect(address3).levelUpWithPayment(riddleAnswers[_index], 0);
        _level++;

        expect(await theRatzY.checkTokenLevel(0)).to.not.equal(_level);

      }

    });


    it("Should show the token level", async function() {
      await theRatzY.connect(owner).flipIsPublicActive();
      await theRatzY.connect(address2).mint(1);
      expect(await theRatzY.checkTokenLevel(0)).to.equal(1);

    });

  });


  describe("Dynamic mechanism", function() {

    it("Should turn into true the revealed variable", async function() {
      await theRatzY.connect(owner).reveal();
      expect(await theRatzY.revealed()).to.be.true;

    });

    it("Should set multiple base URIs", async function() {
      
      await theRatzY.connect(owner).setMultipleBaseURIs([
        "URI-1",
        "URI-2",
        "URI-3",
        "URI-4",
        "URI-5"
      ]);

      let baseURIs = ["URI-10.json", "URI-20.json", "URI-30.json", "URI-40.json", "URI-50.json"];

      await theRatzY.connect(owner).reveal();

      await theRatzY.connect(owner).setAllRiddleAnswers([
        "0x6d255fc3390ee6b41191da315958b7d6a1e5b17904cc7683558f98acc57977b4",
        "0x4da432f1ecd4c0ac028ebde3a3f78510a21d54087b161590a63080d33b702b8d",
        "0x204558076efb2042ebc9b034aab36d85d672d8ac1fa809288da5b453a4714aae",
        "0x87ce9fb076e206b40a6ab86e39ba8d0097abec87a8fa990c91a1d0b9269835ae"
      ]);

      let riddleAnswers = ["test1", "test2", "test3", "test4"];

      await theRatzY.connect(owner).flipIsPublicActive();
      await theRatzY.connect(address3).mint(1);
      const ethPayment = {value: ethers.utils.parseEther("20")}
      await cheezeToken.connect(address3).buy(address3.address, 10, ethPayment);

      let _index = 0;
      for(_index; _index < riddleAnswers.length; _index++) {
        let currentURI = baseURIs[_index];
        expect(await theRatzY.tokenURI(0)).to.equal(currentURI);
        await theRatzY.connect(address3).levelUpWithPayment(riddleAnswers[_index], 0);

      }

    });

    it("Should update one base URI", async function() {

      await theRatzY.connect(owner).setMultipleBaseURIs([
        "URI-1",
        "URI-2",
        "URI-3",
        "URI-4",
        "URI-5"
      ]);
    
      let baseURIs = ["URI-10.json", "URI-20.json", "URI-30.json", "URI-40.json", "URI-50.json"];
      await theRatzY.connect(owner).updateOneBaseURI("URI-6", 5);
      baseURIs[4] = "URI-60.json";

      await theRatzY.connect(owner).reveal();

      await theRatzY.connect(owner).setAllRiddleAnswers([
        "0x6d255fc3390ee6b41191da315958b7d6a1e5b17904cc7683558f98acc57977b4",
        "0x4da432f1ecd4c0ac028ebde3a3f78510a21d54087b161590a63080d33b702b8d",
        "0x204558076efb2042ebc9b034aab36d85d672d8ac1fa809288da5b453a4714aae",
        "0x87ce9fb076e206b40a6ab86e39ba8d0097abec87a8fa990c91a1d0b9269835ae"
      ]);

      let riddleAnswers = ["test1", "test2", "test3", "test4"];

      await theRatzY.connect(owner).flipIsPublicActive();
      await theRatzY.connect(address3).mint(1);
      const ethPayment = {value: ethers.utils.parseEther("20")}
      await cheezeToken.connect(address3).buy(address3.address, 10, ethPayment);

      let _index = 0;
      for(_index; _index < riddleAnswers.length; _index++) {
        let currentURI = baseURIs[_index];
        expect(await theRatzY.tokenURI(0)).to.equal(currentURI);
        await theRatzY.connect(address3).levelUpWithPayment(riddleAnswers[_index], 0);

      }

    });

    it("Should set the no revealed URI", async function() {
      await theRatzY.connect(owner).setNotRevealedUri("notRevealedUri");
      await theRatzY.connect(owner).flipIsPublicActive();
      await theRatzY.connect(address3).mint(1);
      expect(await theRatzY.tokenURI(0)).to.equal("notRevealedUri");

    });

    it("Should update the base extension", async function() {
      await theRatzY.connect(owner).updateBaseExtension(".json2");
      expect(await theRatzY.baseExtension()).to.equal(".json2");
    });

  });


  describe("Max supply and price updates", function() {

    it("Should update the public mint price", async function() {
      await theRatzY.connect(owner).updatePublicMintPrice(1);
      expect(await theRatzY.publicMintPrice()).to.equal(1);
    });

    it("Should update the whitelist mint price", async function() {
      await theRatzY.connect(owner).updateWhitelistMintPrice(1);
      expect(await theRatzY.whitelistMintPrice()).to.equal(1);

    });

    it("Should update the contract max supply", async function() {
      await theRatzY.connect(owner).updateMaxSupply(2000);
      expect(await theRatzY.maxSupply()).to.equal(2000);
    });

  });

  it("Should return how many tokens an address own", async function() {

    let ownersAddr = [address1.address, address2.address, address3.address];
    let owners = [address1, address2, address3];
  
    await theRatzY.connect(owner).flipIsPublicActive();

    let _index = 0;
    for(_index; _index < owners.length; _index++) {
      await theRatzY.connect(owners[_index]).mint(1);

      let tokensOwned = new BigNumber(await theRatzY.walletOfOwner(ownersAddr[_index]));
      expect(tokensOwned.toNumber()).to.equal(_index);
    }

  });


  it("Should withdraw the money from the contract to the owner", async function() {
    await theRatzY.connect(owner).flipIsPublicActive();
    await theRatzY.connect(owner).updatePublicMintPrice(5);
    const ethPayment = {value: ethers.utils.parseEther("5")}
    await theRatzY.connect(address3).mint(1, ethPayment);
    await theRatzY.connect(owner).withdraw();
    let ownerBalance = await theRatzY.balanceOf(owner.address);
    expect(await theRatzY.balanceOf(theRatzY.address)).to.equal(ownerBalance);

  });


});
