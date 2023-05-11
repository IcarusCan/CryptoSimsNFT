const TheFunixCryptoSim = artifacts.require("TheFunixCryptoSim");

contract("TheFunixCryptoSim", function (/* accounts */) {
  let instance;

  before(async function () {
    instance = await TheFunixCryptoSim.deployed();
  });

  describe("Contract", function () {
    it("should deployed", function () {
      return assert.isTrue(instance !== undefined);
    });
  });

  // *** Start Code here ***
  describe("1. Token information:", async function () {
    it("1a. Should have correct token symbol", async function () {
      //erc721.symbol()
      let tokenSym = await instance.symbol();
      
      assert.equal("FCS", tokenSym.toString(), "Should have correct token symbol");
    });

    it("1b. Should have correct token name", async function () {
      //erc721.name()
      let tokenName = await instance.name();
      
      assert.equal("TheFunixCryptoSims", tokenName.toString(), "Should have correct token name")
    });
  });

  describe("2. Genesis information:", async function () {
    it("2a. Should have correct attributes for 1st genesis", async function () {
      //res = getSimDetails(0)
      //res[1].body, ... --> check
      let result = await instance.getSimDetails(0);
      let {0: simId, 1: attributes, 2: matronId, 3:sireId} = result;
      
      assert.equal(attributes.body, 0, "Should have correct body attribute")
      assert.equal(attributes.eye, 0, "Should have correct eye attribute");
      assert.equal(attributes.hairstyle, 0, "Should have correct hairstyle attribute");
      assert.equal(attributes.outfit, 0, "Should have correct outfit attribute");
      assert.equal(attributes.accessory, 0, "Should have correct accessory attribute");
      assert.equal(attributes.hiddenGenes, 1, "Should have correct hiddenGenes attribute");
      assert.equal(attributes.generation, 0, "Should have correct generation attribute");
    });

    it("2b. Should have correct attributes for 2nd genesis", async function () {
      //res = getSimDetails(1)
      //res[1].body, ... --> check
      let result = await instance.getSimDetails(1);
      let {0: simId, 1: attributes, 2: matronId, 3:sireId} = result;
      
      //assert.equal(result[1].body, 3, "Should have correct body attribute")
      assert.equal(attributes.body, 3, "Should have correct body attribute")
      assert.equal(attributes.eye, 7, "Should have correct eye attribute");
      assert.equal(attributes.hairstyle, 127, "Should have correct hairstyle attribute");
      assert.equal(attributes.outfit, 31, "Should have correct outfit attribute");
      assert.equal(attributes.accessory, 31, "Should have correct accessory attribute");
      assert.equal(attributes.hiddenGenes, 2, "Should have correct hiddenGenes attribute");
      assert.equal(attributes.generation, 0, "Should have correct generation attribute");
    });
  });

  describe("3. generateSimGenes algorithm:", async function () {
    describe("3a. New sim hidden genes X:", async function () {
      it("3a1. Should have correct hiddenGenes when hiddenGenes(matron) = hiddenGenes(sire) ", async function () {
        //breedSim(0,0) -> ID = 2
        //getSimDetails(0) -> xm = xs = 1
        //x2 = 0
        let newSim = await instance.breedSim(0,0);
        let evBirth = newSim.logs[1].args;
        let {1: id, 4: attributes} = evBirth;
        let simAttrM = await instance.getSimDetails(0);
        let simAttrS = await instance.getSimDetails(0);

        assert.isTrue(simAttrM[1].hiddenGenes == simAttrS[1].hiddenGenes);
        let x = (Number(simAttrM[1].hiddenGenes) * Number(simAttrS[1].hiddenGenes) + 3) % 4;
        assert.equal(attributes.hiddenGenes, x, "Should have correct hiddenGenes attribute");

        let simAttr = await instance.getSimDetails(id.toNumber()); //check again
        let {1: simAttributes} = simAttr;
        assert.equal(simAttributes.hiddenGenes, x, "Should have correct hiddenGenes attribute also");
      });
  
      it("3a2. Should have correct hiddenGenes when hiddenGenes(matron) < hiddenGenes(sire)", async function () {
        //breedSim(2,0) -> ID = 3
        //getSimDetails(2) -> xm = 0
        //getSimDetails(0) -> xs = 1
        //x3 = 1
        let newSim = await instance.breedSim(2,0);
        let evBirth = newSim.logs[1].args;
        let {1: id, 4: attributes} = evBirth;
        let simAttrM = await instance.getSimDetails(2);
        let simAttrS = await instance.getSimDetails(0);

        assert.isTrue(simAttrM[1].hiddenGenes < simAttrS[1].hiddenGenes);
        assert.equal(attributes.hiddenGenes, simAttrS[1].hiddenGenes, "Should have correct hiddenGenes attribute");

        let simAttr = await instance.getSimDetails(id.toNumber()); //check again
        let {1: simAttributes} = simAttr;
        assert.equal(simAttributes.hiddenGenes, simAttrS[1].hiddenGenes, "Should have correct hiddenGenes attribute also");
      });
  
      it("3a3. Should have correct hiddenGenes when hiddenGenes(matron) > hiddenGenes(sire) ", async function () {
        //breedSim(3,2) -> ID = 4
        //getSimDetails(3) -> xm = 1
        //getSimDetails(2) -> xs = 0
        //x4 = 1
        let newSim = await instance.breedSim(3,2);
        let evBirth = newSim.logs[1].args;
        let {1: id, 4: attributes} = evBirth;
        let simAttrM = await instance.getSimDetails(3);
        let simAttrS = await instance.getSimDetails(2);

        assert.isTrue(simAttrM[1].hiddenGenes > simAttrS[1].hiddenGenes);
        assert.equal(attributes.hiddenGenes, simAttrM[1].hiddenGenes, "Should have correct hiddenGenes attribute");

        let simAttr = await instance.getSimDetails(id.toNumber()); //check again
        let {1: simAttributes} = simAttr;
        assert.equal(simAttributes.hiddenGenes, simAttrM[1].hiddenGenes, "Should have correct hiddenGenes attribute also");
      });
    });

    describe("3b. All attributes of a Sim:", async function () {
      it("3b1. Should have correct attributes: Sim's generation base on Matron, hiddenGenes = 0", async function () {
        //breedSim(4,4) -> ID = 5
        //getSimDetails(5) ->  b = 3; e = 0; h = 0; o = 9; a = 0; x = 0; g = 4
        let newSim = await instance.breedSim(4,4);
        let evBirth = newSim.logs[1].args;
        let {1: id, 4: attributes} = evBirth;
        let simAttrM = await instance.getSimDetails(4);
        let simAttrS = await instance.getSimDetails(4);

        let body = (Number(simAttrM[1].body) * Number(simAttrS[1].body) + 3) % 4;
        let eye = Number(simAttrS[1].eye);
        let hairstyle = Number(simAttrM[1].hairstyle);
        let outfit = (Number(simAttrM[1].outfit) + Number(simAttrS[1].outfit) + 1) % 32;
        let accessory = (Number(simAttrM[1].accessory) + Number(simAttrS[1].accessory)) % 32;
        let hiddenGenes = 0;
        let generation = Number(simAttrM[1].generation) + 1;

        assert.equal(attributes.body, body, "Should have correct body attribute")
        assert.equal(attributes.eye, eye, "Should have correct eye attribute");
        assert.equal(attributes.hairstyle, hairstyle, "Should have correct hairstyle attribute");
        assert.equal(attributes.outfit, outfit, "Should have correct outfit attribute");
        assert.equal(attributes.accessory, accessory, "Should have correct accessory attribute");
        assert.equal(attributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute");
        assert.equal(attributes.generation, generation, "Should have correct generation attribute");

        let simAttr = await instance.getSimDetails(id.toNumber()); //check again
        let {1: simAttributes} = simAttr;
        assert.equal(simAttributes.body, body, "Should have correct body attribute also")
        assert.equal(simAttributes.eye, eye, "Should have correct eye attribute also");
        assert.equal(simAttributes.hairstyle, hairstyle, "Should have correct hairstyle attribute also");
        assert.equal(simAttributes.outfit, outfit, "Should have correct outfit attribute also");
        assert.equal(simAttributes.accessory, accessory, "Should have correct accessory attribute also");
        assert.equal(simAttributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute also");
        assert.equal(simAttributes.generation, generation, "Should have correct generation attribute also");
      });
  
      it("3b2. Should have correct attributes: Sim's generation base on Matron, hiddenGenes = 1", async function () {
        //breedSim(5,4) -> ID = 6
        //getSimDetails(6) ->  b = 3; e = 0; h = 0; o = 14; a = 0; x = 0; g = 5  
        let newSim = await instance.breedSim(5,4);
        let evBirth = newSim.logs[1].args;
        let {1: id, 4: attributes} = evBirth;
        let simAttrM = await instance.getSimDetails(5);
        let simAttrS = await instance.getSimDetails(4);

        let body = (Number(simAttrM[1].body) * Number(simAttrS[1].body) + 3) % 4;
        let eye = Number(simAttrM[1].eye);
        let hairstyle = (128 + Number(simAttrS[1].hairstyle) - Number(simAttrM[1].hairstyle)) % 128;
        let outfit = (Number(simAttrM[1].outfit) + Number(simAttrS[1].outfit) + 1) % 32;
        let accessory = (Number(simAttrM[1].accessory) + Number(simAttrS[1].accessory)) % 32;
        let hiddenGenes = 1;
        let generation = Number(simAttrM[1].generation) + 1;

        assert.equal(attributes.body, body, "Should have correct body attribute")
        assert.equal(attributes.eye, eye, "Should have correct eye attribute");
        assert.equal(attributes.hairstyle, hairstyle, "Should have correct hairstyle attribute");
        assert.equal(attributes.outfit, outfit, "Should have correct outfit attribute");
        assert.equal(attributes.accessory, accessory, "Should have correct accessory attribute");
        assert.equal(attributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute");
        assert.equal(attributes.generation, generation, "Should have correct generation attribute");

        let simAttr = await instance.getSimDetails(id.toNumber()); //check again
        let {1: simAttributes} = simAttr;
        assert.equal(simAttributes.body, body, "Should have correct body attribute also")
        assert.equal(simAttributes.eye, eye, "Should have correct eye attribute also");
        assert.equal(simAttributes.hairstyle, hairstyle, "Should have correct hairstyle attribute also");
        assert.equal(simAttributes.outfit, outfit, "Should have correct outfit attribute also");
        assert.equal(simAttributes.accessory, accessory, "Should have correct accessory attribute also");
        assert.equal(simAttributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute also");
        assert.equal(simAttributes.generation, generation, "Should have correct generation attribute also");
      });
  
      it("3b3. Should have correct attributes: Sim's generation base on Matron, hiddenGenes = 2", async function () {
        //breedSim(3,1) -> ID = 7
        //getSimDetails(7) ->  b = 0; e = 7; h = 127; o = 1; a = 30; x = 2; g = 3  
        let newSim = await instance.breedSim(3,1);
        let evBirth = newSim.logs[1].args;
        let {1: id, 4: attributes} = evBirth;
        let simAttrM = await instance.getSimDetails(3);
        let simAttrS = await instance.getSimDetails(1);

        let body = (Number(simAttrM[1].body) * Number(simAttrS[1].body) + 3) % 4;
        let eye = (Number(simAttrS[1].eye) + Number(simAttrM[1].eye)) % 8;
        let hairstyle = (128 + Number(simAttrS[1].hairstyle) - Number(simAttrM[1].hairstyle)) % 128;
        let outfit = (Number(simAttrM[1].outfit) + Number(simAttrS[1].outfit)) % 32;
        let accessory = (Number(simAttrM[1].accessory) + Number(simAttrS[1].accessory) + 31) % 32;
        let hiddenGenes = 2;
        let generation = Number(simAttrM[1].generation) + 1;

        assert.equal(attributes.body, body, "Should have correct body attribute")
        assert.equal(attributes.eye, eye, "Should have correct eye attribute");
        assert.equal(attributes.hairstyle, hairstyle, "Should have correct hairstyle attribute");
        assert.equal(attributes.outfit, outfit, "Should have correct outfit attribute");
        assert.equal(attributes.accessory, accessory, "Should have correct accessory attribute");
        assert.equal(attributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute");
        assert.equal(attributes.generation, generation, "Should have correct generation attribute");

        let simAttr = await instance.getSimDetails(id.toNumber()); //check again
        let {1: simAttributes} = simAttr;
        assert.equal(simAttributes.body, body, "Should have correct body attribute also")
        assert.equal(simAttributes.eye, eye, "Should have correct eye attribute also");
        assert.equal(simAttributes.hairstyle, hairstyle, "Should have correct hairstyle attribute also");
        assert.equal(simAttributes.outfit, outfit, "Should have correct outfit attribute also");
        assert.equal(simAttributes.accessory, accessory, "Should have correct accessory attribute also");
        assert.equal(simAttributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute also");
        assert.equal(simAttributes.generation, generation, "Should have correct generation attribute also");
      });

      it("3b4. Should have correct attributes: Sim's generation base on Matron, hiddenGenes = 3", async function () {
        //breedSim(1,1) -> ID = 8
        //getSimDetails(8) ->  b = 0; e = 6; h = 127; o = 30; a = 29; x = 3; g = 1
        let newSim = await instance.breedSim(1,1);
        let evBirth = newSim.logs[1].args;
        let {1: id, 4: attributes} = evBirth;
        let simAttrM = await instance.getSimDetails(1);
        let simAttrS = await instance.getSimDetails(1);

        let body = (Number(simAttrM[1].body) * Number(simAttrS[1].body) + 3) % 4;
        let eye = (Number(simAttrS[1].eye) + Number(simAttrM[1].eye)) % 8;
        let hairstyle = Number(simAttrS[1].hairstyle);
        let outfit = (Number(simAttrM[1].outfit) + Number(simAttrS[1].outfit)) % 32;
        let accessory = (Number(simAttrM[1].accessory) + Number(simAttrS[1].accessory) + 31) % 32;
        let hiddenGenes = 3;
        let generation = Number(simAttrM[1].generation) + 1;

        assert.equal(attributes.body, body, "Should have correct body attribute")
        assert.equal(attributes.eye, eye, "Should have correct eye attribute");
        assert.equal(attributes.hairstyle, hairstyle, "Should have correct hairstyle attribute");
        assert.equal(attributes.outfit, outfit, "Should have correct outfit attribute");
        assert.equal(attributes.accessory, accessory, "Should have correct accessory attribute");
        assert.equal(attributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute");
        assert.equal(attributes.generation, generation, "Should have correct generation attribute");

        let simAttr = await instance.getSimDetails(id.toNumber()); //check again
        let {1: simAttributes} = simAttr;
        assert.equal(simAttributes.body, body, "Should have correct body attribute also")
        assert.equal(simAttributes.eye, eye, "Should have correct eye attribute also");
        assert.equal(simAttributes.hairstyle, hairstyle, "Should have correct hairstyle attribute also");
        assert.equal(simAttributes.outfit, outfit, "Should have correct outfit attribute also");
        assert.equal(simAttributes.accessory, accessory, "Should have correct accessory attribute also");
        assert.equal(simAttributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute also");
        assert.equal(simAttributes.generation, generation, "Should have correct generation attribute also");
      });
  
      it("3b5. Should have correct attributes: Sim's generation base on Sire, hiddenGenes = 0", async function () {
        //breedSim(3,6) -> ID = 9
        //getSimDetails(9) ->  b = 0; e = 0; h = 0; o = 17; a = 0; x = 0; g = 6 
        let newSim = await instance.breedSim(3,6);
        let evBirth = newSim.logs[1].args;
        let {1: id, 4: attributes} = evBirth;
        let simAttrM = await instance.getSimDetails(3);
        let simAttrS = await instance.getSimDetails(6);

        let body = (Number(simAttrM[1].body) * Number(simAttrS[1].body) + 3) % 4;
        let eye = Number(simAttrS[1].eye);
        let hairstyle = Number(simAttrM[1].hairstyle);
        let outfit = (Number(simAttrM[1].outfit) + Number(simAttrS[1].outfit) + 1) % 32;
        let accessory = (Number(simAttrM[1].accessory) + Number(simAttrS[1].accessory)) % 32;
        let hiddenGenes = 0;
        let generation = Number(simAttrS[1].generation) + 1;

        assert.equal(attributes.body, body, "Should have correct body attribute")
        assert.equal(attributes.eye, eye, "Should have correct eye attribute");
        assert.equal(attributes.hairstyle, hairstyle, "Should have correct hairstyle attribute");
        assert.equal(attributes.outfit, outfit, "Should have correct outfit attribute");
        assert.equal(attributes.accessory, accessory, "Should have correct accessory attribute");
        assert.equal(attributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute");
        assert.equal(attributes.generation, generation, "Should have correct generation attribute");

        let simAttr = await instance.getSimDetails(id.toNumber()); //check again
        let {1: simAttributes} = simAttr;
        assert.equal(simAttributes.body, body, "Should have correct body attribute also")
        assert.equal(simAttributes.eye, eye, "Should have correct eye attribute also");
        assert.equal(simAttributes.hairstyle, hairstyle, "Should have correct hairstyle attribute also");
        assert.equal(simAttributes.outfit, outfit, "Should have correct outfit attribute also");
        assert.equal(simAttributes.accessory, accessory, "Should have correct accessory attribute also");
        assert.equal(simAttributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute also");
        assert.equal(simAttributes.generation, generation, "Should have correct generation attribute also");
      });
  
      it("3b6. Should have correct attributes: Sim's generation base on Sire, hiddenGenes = 1", async function () {
        //breedSim(5,6) -> ID = 10
        //getSimDetails(10) ->  b = 0; e = 0; h = 0; o = 24; a = 0; x = 1; g = 6  
        let newSim = await instance.breedSim(5,6);
        let evBirth = newSim.logs[1].args;
        let {1: id, 4: attributes} = evBirth;
        let simAttrM = await instance.getSimDetails(5);
        let simAttrS = await instance.getSimDetails(6);

        let body = (Number(simAttrM[1].body) * Number(simAttrS[1].body) + 3) % 4;
        let eye = Number(simAttrM[1].eye);
        let hairstyle = (128 + Number(simAttrS[1].hairstyle) - Number(simAttrM[1].hairstyle)) % 128;
        let outfit = (Number(simAttrM[1].outfit) + Number(simAttrS[1].outfit) + 1) % 32;
        let accessory = (Number(simAttrM[1].accessory) + Number(simAttrS[1].accessory)) % 32;
        let hiddenGenes = 1;
        let generation = Number(simAttrS[1].generation) + 1;

        assert.equal(attributes.body, body, "Should have correct body attribute")
        assert.equal(attributes.eye, eye, "Should have correct eye attribute");
        assert.equal(attributes.hairstyle, hairstyle, "Should have correct hairstyle attribute");
        assert.equal(attributes.outfit, outfit, "Should have correct outfit attribute");
        assert.equal(attributes.accessory, accessory, "Should have correct accessory attribute");
        assert.equal(attributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute");
        assert.equal(attributes.generation, generation, "Should have correct generation attribute");

        let simAttr = await instance.getSimDetails(id.toNumber()); //check again
        let {1: simAttributes} = simAttr;
        assert.equal(simAttributes.body, body, "Should have correct body attribute also")
        assert.equal(simAttributes.eye, eye, "Should have correct eye attribute also");
        assert.equal(simAttributes.hairstyle, hairstyle, "Should have correct hairstyle attribute also");
        assert.equal(simAttributes.outfit, outfit, "Should have correct outfit attribute also");
        assert.equal(simAttributes.accessory, accessory, "Should have correct accessory attribute also");
        assert.equal(simAttributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute also");
        assert.equal(simAttributes.generation, generation, "Should have correct generation attribute also");
      });

      it("3b7. Should have correct attributes: Sim's generation base on Sire, hiddenGenes = 2", async function () {
        //breedSim(2,7) -> ID = 11
        //getSimDetails(11) ->  b = 3; e = 7; h = 127; o = 2; a = 29; x = 2; g = 4  
        let newSim = await instance.breedSim(2,7);
        let evBirth = newSim.logs[1].args;
        let {1: id, 4: attributes} = evBirth;
        let simAttrM = await instance.getSimDetails(2);
        let simAttrS = await instance.getSimDetails(7);

        let body = (Number(simAttrM[1].body) * Number(simAttrS[1].body) + 3) % 4;
        let eye = (Number(simAttrS[1].eye) + Number(simAttrM[1].eye)) % 8;
        let hairstyle = (128 + Number(simAttrS[1].hairstyle) - Number(simAttrM[1].hairstyle)) % 128;
        let outfit = (Number(simAttrM[1].outfit) + Number(simAttrS[1].outfit)) % 32;
        let accessory = (Number(simAttrM[1].accessory) + Number(simAttrS[1].accessory) + 31) % 32;
        let hiddenGenes = 2;
        let generation = Number(simAttrS[1].generation) + 1;

        assert.equal(attributes.body, body, "Should have correct body attribute")
        assert.equal(attributes.eye, eye, "Should have correct eye attribute");
        assert.equal(attributes.hairstyle, hairstyle, "Should have correct hairstyle attribute");
        assert.equal(attributes.outfit, outfit, "Should have correct outfit attribute");
        assert.equal(attributes.accessory, accessory, "Should have correct accessory attribute");
        assert.equal(attributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute");
        assert.equal(attributes.generation, generation, "Should have correct generation attribute");

        let simAttr = await instance.getSimDetails(id.toNumber()); //check again
        let {1: simAttributes} = simAttr;
        assert.equal(simAttributes.body, body, "Should have correct body attribute also")
        assert.equal(simAttributes.eye, eye, "Should have correct eye attribute also");
        assert.equal(simAttributes.hairstyle, hairstyle, "Should have correct hairstyle attribute also");
        assert.equal(simAttributes.outfit, outfit, "Should have correct outfit attribute also");
        assert.equal(simAttributes.accessory, accessory, "Should have correct accessory attribute also");
        assert.equal(simAttributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute also");
        assert.equal(simAttributes.generation, generation, "Should have correct generation attribute also");
      });

      it("3b8. Should have correct attributes: Sim's generation base on Sire, hiddenGenes = 3", async function () {
        //breedSim(8,9) -> ID = 12
        //getSimDetails(12) ->  b = 6; e = 6; h = 0; o = 15; a = 28; x = 3; g = 7  
        let newSim = await instance.breedSim(8,9);
        let evBirth = newSim.logs[1].args;
        let {1: id, 4: attributes} = evBirth;
        let simAttrM = await instance.getSimDetails(8);
        let simAttrS = await instance.getSimDetails(9);

        let body = (Number(simAttrM[1].body) * Number(simAttrS[1].body) + 3) % 4;
        let eye = (Number(simAttrS[1].eye) + Number(simAttrM[1].eye)) % 8;
        let hairstyle = Number(simAttrS[1].hairstyle);
        let outfit = (Number(simAttrM[1].outfit) + Number(simAttrS[1].outfit)) % 32;
        let accessory = (Number(simAttrM[1].accessory) + Number(simAttrS[1].accessory) + 31) % 32;
        let hiddenGenes = 3;
        let generation = Number(simAttrS[1].generation) + 1;

        assert.equal(attributes.body, body, "Should have correct body attribute")
        assert.equal(attributes.eye, eye, "Should have correct eye attribute");
        assert.equal(attributes.hairstyle, hairstyle, "Should have correct hairstyle attribute");
        assert.equal(attributes.outfit, outfit, "Should have correct outfit attribute");
        assert.equal(attributes.accessory, accessory, "Should have correct accessory attribute");
        assert.equal(attributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute");
        assert.equal(attributes.generation, generation, "Should have correct generation attribute");

        let simAttr = await instance.getSimDetails(id.toNumber()); //check again
        let {1: simAttributes} = simAttr;
        assert.equal(simAttributes.body, body, "Should have correct body attribute also")
        assert.equal(simAttributes.eye, eye, "Should have correct eye attribute also");
        assert.equal(simAttributes.hairstyle, hairstyle, "Should have correct hairstyle attribute also");
        assert.equal(simAttributes.outfit, outfit, "Should have correct outfit attribute also");
        assert.equal(simAttributes.accessory, accessory, "Should have correct accessory attribute also");
        assert.equal(simAttributes.hiddenGenes, hiddenGenes, "Should have correct hiddenGenes attribute also");
        assert.equal(simAttributes.generation, generation, "Should have correct generation attribute also");
      });
    });
  });

  describe("4. Boundary condition of attributes:", async function () {
    it("Should have correct attributes range for every breeded Sims", async function () { 
      let listSims = await instance.ownedSims();
      
      for (let i = 0; i < listSims.length; i++) {
        let simAttr = await instance.getSimDetails(i);
        let {1: simAttributes} = simAttr;

        assert.isTrue(simAttributes.body >= 0, "Should have correct body lower bound");
        assert.isTrue(simAttributes.body <= 3, "Should have correct body upper bound");

        assert.isTrue(simAttributes.eye >= 0, "Should have correct eye lower bound");
        assert.isTrue(simAttributes.eye <= 7, "Should have correct eye upper bound");

        assert.isTrue(simAttributes.hairstyle >= 0, "Should have correct hairstyle lower bound");
        assert.isTrue(simAttributes.hairstyle <= 127, "Should have correct hairstyle upper bound");

        assert.isTrue(simAttributes.outfit >= 0, "Should have correct outfit lower bound");
        assert.isTrue(simAttributes.outfit <= 32, "Should have correct outfit upper bound");
        
        assert.isTrue(simAttributes.accessory >= 0, "Should have correct accessory lower bound");
        assert.isTrue(simAttributes.accessory <= 32, "Should have correct accessory upper bound");

        assert.isTrue(simAttributes.hiddenGenes >= 0, "Should have correct hiddenGenes lower bound");
        assert.isTrue(simAttributes.hiddenGenes <= 3, "Should have correct hiddenGenes upper bound");

        assert.isTrue(simAttributes.generation >= 0, "Should have correct generation lower bound");  
        assert.isTrue(simAttributes.generation <= 255, "Should have correct generation upper bound");  
      }
    });
  });
  // *** End Code here ***
});
