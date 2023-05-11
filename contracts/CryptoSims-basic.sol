// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TheFunixCryptoSim is ERC721, Ownable  {

    // TASK #1: Define Name and Symbol of our Token
    // - Symbol: FCS
    // - Name: TheFunixCryptoSims
    // HINTS:
    // - Call [name] function and [symbol] function to check
    //
	
    // *** START Code here***
    
    constructor() ERC721("TheFunixCryptoSims", "FCS") {		
        createGenesis();
    }
    
    // *** END Code here***

    // This struct will be used to represent the attributes of CryptoSim
    struct SimAttributes {
		// 0 -> 3
        uint8 body;

        // 0 -> 7
        uint8 eye;

        // 0 -> 127
        uint8 hairstyle;

        // 0 -> 31
        uint8 outfit;

        // 0 -> 31
        uint8 accessory;

        // 0 -> 3
        uint8 hiddenGenes;

        // 0 - 255
        uint8 generation;
    }

    // This struct will be used to represent one sim
    struct Sim {
        SimAttributes attributes;
        uint256 matronId;
        uint256 sireId;
    }
    
    // List of existing sims. Use as CryptoSims' "database"
    Sim[] public sims;
    
    // Event that will be emitted whenever a new sim is created
    event Birth(
        address owner,
        uint256 id,
        uint256 matronId,
        uint256 sireId,
        SimAttributes attributes
    );

    /** @dev Function to determine a sim's characteristics.
      * @param matronId ID of sim's matron (one parent)
      * @param sireId ID of sim's sire (other parent)
      * @return The sim's attributes
      */
    function generateSimGenes(
        uint256 matronId,
        uint256 sireId
    )
        internal
        returns (SimAttributes memory)
    {
        SimAttributes memory matronAttr = sims[matronId].attributes;
        SimAttributes memory sireAttr = sims[sireId].attributes;

        // TASK #2: Define HiddenGenes X of new Sim
        uint8 x = matronAttr.hiddenGenes;
        // START Code here
        if (matronAttr.hiddenGenes == sireAttr.hiddenGenes) {
            x = (x * sireAttr.hiddenGenes + 3) % 4; //(xm * xs + 3)%4
        } else if (x < sireAttr.hiddenGenes) {
            x = sireAttr.hiddenGenes;
        }
        // END Code here

        
        // Init new object to store new Sim's attributes 
        SimAttributes memory attributes = SimAttributes({
          body: 0,
          eye: 0,
          hairstyle: 0,
          outfit: 0,
          accessory: 0,
          hiddenGenes: 0,
          generation: 0
        });

        // TASK #3: Calculate new Sim's generation
        attributes.generation = matronAttr.generation + 1;
        if (sireAttr.generation > matronAttr.generation) {
            // START CODE HERE
            attributes.generation = sireAttr.generation + 1;
            // END CODE HERE
        }

        // TASK #4: Calculate remaining atrributes
        // START CODE HERE
        if (x==0) {
            attributes.hiddenGenes = 0;
            attributes.eye = sireAttr.eye;
            attributes.hairstyle = matronAttr.hairstyle;
            attributes.outfit = (matronAttr.outfit + sireAttr.outfit + 1) % 32;
            attributes.accessory = (matronAttr.accessory + sireAttr.accessory) % 32;
        } else if (x==1) {
            attributes.hiddenGenes = 1;
            attributes.eye = matronAttr.eye;
            attributes.hairstyle = (sireAttr.hairstyle - matronAttr.hairstyle + 128) % 128;
            attributes.outfit = (matronAttr.outfit + sireAttr.outfit + 1) % 32;
            attributes.accessory = (matronAttr.accessory + sireAttr.accessory) % 32;
        } else if (x==2) {
            attributes.hiddenGenes = 2;
            attributes.eye = (sireAttr.eye + matronAttr.eye) % 8;
            attributes.hairstyle = (sireAttr.hairstyle - matronAttr.hairstyle + 128) % 128;
            attributes.outfit = (matronAttr.outfit + sireAttr.outfit) % 32;
            attributes.accessory = (matronAttr.accessory + sireAttr.accessory + 31) % 32;
        } else if  (x==3) {
            attributes.hiddenGenes = 3;
            attributes.eye = (sireAttr.eye + matronAttr.eye) % 8;
            attributes.hairstyle = sireAttr.hairstyle;
            attributes.outfit = (matronAttr.outfit + sireAttr.outfit) % 32;
            attributes.accessory = (matronAttr.accessory + sireAttr.accessory + 31) % 32;
        }
        attributes.body = (matronAttr.body * sireAttr.body + 3) % 4;
        // END CODE HERE



        return attributes;
    }


    /** @dev Function to create a new sim
      * @param matron ID of new sim's matron (one parent)
      * @param sire ID of new sim's sire (other parent)
      * @param owner Address of new sim's owner
      * @return The new sim's ID
      */
    function createSim(
        uint256 matron,
        uint256 sire,
        address owner
    )
        internal
        returns (uint)
    {
        require(owner != address(0));

        // Create new sim attributes based on matron and sire
        SimAttributes memory newAtrributes = generateSimGenes(matron, sire);
        
        Sim memory newSim = Sim({
            attributes: newAtrributes,
            matronId: matron,
            sireId: sire
        });

        // Add new Sim to array of sims
        sims.push(newSim);
        uint256 newSimId =  sims.length -  1;

        // Create new NFT with ID is New Sim's ID, and owner is defined
        super._mint(owner, newSimId);

        // Emit Birth event
        emit Birth(
            owner,
            newSimId,
            newSim.matronId,
            newSim.sireId,
            newSim.attributes
        );
        return newSimId;
    }


    function createGenesis() internal {
        SimAttributes memory firstAtrributes = SimAttributes({
          body: 0,
          eye: 0,
          hairstyle: 0,
          outfit: 0,
          accessory: 0,
          hiddenGenes: 1,
          generation: 0
        });

        SimAttributes memory secondAtrributes = SimAttributes({
          body: 3,
          eye: 7,
          hairstyle: 127,
          outfit: 31,
          accessory: 31,
          hiddenGenes: 2,
          generation: 0
        });
        
        sims.push(Sim({
            attributes: firstAtrributes,
            matronId: 0,
            sireId: 0
        }));

        super._mint(msg.sender, 0);

        sims.push(Sim({
            attributes: secondAtrributes,
            matronId: 0,
            sireId: 0
        }));

        super._mint(msg.sender, 1);
    }

  
    /** @dev Function to allow user to buy a new sim (calls createSim())
      * @return The new sim's ID
      */
    function buySim() external payable returns (uint256) {
		// READ MORE: In the real project, we will check whether 0.02 ether is sent. 
        // require(msg.value == 0.02 ether);
        
        return createSim(0, (sims.length - 1) % sims.length, msg.sender);
    }
    
    /** @dev Function to breed 2 sims to create a new one
      * @param matronId ID of new sim's matron (one parent)
      * @param sireId ID of new sim's sire (other parent)
      * @return The new sim's ID
      */
    function breedSim(uint256 matronId, uint256 sireId) external payable returns (uint256) {
        // READ MORE: In the real project, we will check whether 0.02 ether is sent. 
        // require(msg.value == 0.05 ether);
        return createSim(matronId, sireId, msg.sender);
    }
    
    /** @dev Function to retrieve a specific sim's details.
      * @param simId ID of the sim who's details will be retrieved
      * @return An array, [sim's ID, sim's genes, matron's ID, sire's ID]
      */
    function getSimDetails(uint256 simId) external view returns (uint256, SimAttributes memory, uint256, uint256) {
        Sim storage sim = sims[simId];
        return (simId, sim.attributes, sim.matronId, sim.sireId);
    }
    
    /** @dev Function to get a list of owned sims' IDs
      * @return A uint array which contains IDs of all owned sims
      */
    function ownedSims() external view returns(uint256[] memory) {
        uint256 simCount = balanceOf(msg.sender);
        if (simCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](simCount);
            uint256 totalSims = sims.length;
            uint256 resultIndex = 0;
            uint256 simId = 0;
            while (simId < totalSims) {

                if (ownerOf(simId) == msg.sender) {
                    result[resultIndex] = simId;
                    resultIndex = resultIndex + 1;
                }

                simId = simId + 1;
            }
            return result;
        }
    }
}