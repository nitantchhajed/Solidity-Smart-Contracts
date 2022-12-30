// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Funding {
    struct Campaign {
        address owner; //address of the owner of the campaign
        string title;  //title of campaign
        string description; //description of campaign
        uint256 target; //target amount to be achieved
        uint256 deadline; //deadline of the campaign
        uint256 amountCollected; //amount collected
        string image; //url of the camapaign Image
        address[] donators; //array of addresses of donators
        uint256[] donations; //array of amounts of donations

    }

    mapping(uint256 => Campaign) public campaigns; //created a mapping to access the campaign

    uint256 public numberOfCampaigns = 0; //global variable Initialised with 0


// public function to create a campaign which will return the ID of the Campaign
function createCampaign(address _owner, string memory _title, string memory _description, uint256 _target, uint256 _deadline, string memory _image ) public returns(uint256) {

        Campaign storage campaign = campaigns[numberOfCampaigns]; //creating a new campaign 
        require(campaign.deadline < block.timestamp, "The deadline should be a date in future" ); //checking the condition is valid

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description= _description;
        campaign.target = _target;
        campaign.amountCollected = 0;
        campaign.deadline = _deadline;
        campaign.image = _image;

        numberOfCampaigns++;

        return numberOfCampaigns-1; //will return the most recent campaign

}


//public function to donate to the campaign
function donateToCampaign(uint256 _id) public payable {   //it will take only _id as parameter to determine donate to which ID, it is payable bcs we are sending tokens throughout this function
    uint256 amount =msg.value;
    
    Campaign storage campaign = campaigns[_id];  //campaign where we want to donate to

    campaign.donators.push(msg.sender); //pushing the address of the donator
    campaign.donations.push(amount); //pushing the amount

    //making transaction
    (bool sent,) = payable(campaign.owner).call{value:amount}(""); //bool sent will let us know transaction is sent or not. payable(campaign.owner)- sending to the owner of campaign

    if(sent) {
        campaign.amountCollected = campaign.amountCollected + amount; //updating the total amount collected for campaign
    }
}


//function to get the list of Donators
function getDonators(uint256 _id)view public returns(address[] memory, uint256[] memory) { //takes campaign id as parameter,
                                                                                    // it is a view function will only return array of addresses and array of number of donations

    return (campaigns[_id].donators, campaigns[_id].donations );  

}



//function to get the list of Campaign
function getCampaigns() public view returns(Campaign[] memory) { //function with no parameters, only returns array of campaigns from memory

    Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns); //created a new array type variable allCampaigns,
                                        // created an empty array with same number of empty structs and of length equal to number of total campaigns.

    for(uint i=0; i<numberOfCampaigns; i++) { //loop through all of campaigns and populate them
        Campaign storage item = campaigns[i];   //get a Campaign from storage and call it item and populate to i
        allCampaigns[i] = item;

    }
    return allCampaigns;
}

}