// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title AetheriaWorld
/// @notice Settlement layer for a living agent society on X Layer.
///         Agents are ERC-721-like identities. Relics are AI-generated ownable assets.
///         The offchain runtime is the keeper: it records actions, reputation, and mints.
contract AetheriaWorld {
    address public immutable keeper;

    string public constant name = "Aetheria Agents";
    string public constant symbol = "AETHA";

    struct Agent {
        address owner;
        string agentName;
        string personality;
        string uri;
        uint64 reputation;
        uint32 region;
        uint64 bornAt;
    }

    struct Relic {
        address owner;
        uint256 creatorAgentId;
        string kind;
        string relicName;
        string uri;
        uint64 mintedAt;
    }

    uint256 public agentCount;
    uint256 public relicCount;
    mapping(uint256 => Agent) public agents;
    mapping(uint256 => Relic) public relics;
    mapping(address => uint256) public agentBalance;
    mapping(address => uint256) public relicBalance;
    mapping(address => uint256) public claimable;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event RelicMinted(
        uint256 indexed relicId,
        uint256 indexed creatorAgentId,
        address indexed owner,
        string kind,
        string relicName
    );
    event RelicTransferred(uint256 indexed relicId, address indexed from, address indexed to);
    event ActionRecorded(uint256 indexed agentId, string kind, string detail, uint64 timestamp);
    event ReputationChanged(uint256 indexed agentId, int64 delta, uint64 reputation);
    event RegionChanged(uint256 indexed agentId, uint32 region);
    event Rewarded(address indexed owner, uint256 amount);
    event Claimed(address indexed owner, uint256 amount);

    error NotKeeper();
    error NotOwner();
    error UnknownAgent();
    error UnknownRelic();
    error NothingToClaim();

    constructor(address _keeper) {
        keeper = _keeper;
    }

    modifier onlyKeeper() {
        if (msg.sender != keeper) revert NotKeeper();
        _;
    }

    function mintAgent(
        address to,
        string calldata agentName,
        string calldata personality,
        string calldata uri,
        uint32 region
    ) external onlyKeeper returns (uint256 id) {
        id = ++agentCount;
        agents[id] = Agent(to, agentName, personality, uri, 0, region, uint64(block.timestamp));
        unchecked {
            agentBalance[to] += 1;
        }
        emit Transfer(address(0), to, id);
    }

    function mintRelic(
        address to,
        uint256 creatorAgentId,
        string calldata kind,
        string calldata relicName,
        string calldata uri
    ) external onlyKeeper returns (uint256 id) {
        if (creatorAgentId == 0 || creatorAgentId > agentCount) revert UnknownAgent();
        id = ++relicCount;
        relics[id] = Relic(to, creatorAgentId, kind, relicName, uri, uint64(block.timestamp));
        unchecked {
            relicBalance[to] += 1;
        }
        emit RelicMinted(id, creatorAgentId, to, kind, relicName);
    }

    function recordAction(
        uint256 agentId,
        string calldata kind,
        string calldata detail,
        int64 repDelta,
        uint32 region
    ) external onlyKeeper {
        Agent storage agent = agents[agentId];
        if (agent.owner == address(0)) revert UnknownAgent();
        if (repDelta > 0) {
            agent.reputation += uint64(uint256(int256(repDelta)));
        } else if (repDelta < 0) {
            uint64 drop = uint64(uint256(int256(-repDelta)));
            agent.reputation = agent.reputation > drop ? agent.reputation - drop : 0;
        }
        if (region != agent.region) {
            agent.region = region;
            emit RegionChanged(agentId, region);
        }
        emit ActionRecorded(agentId, kind, detail, uint64(block.timestamp));
        if (repDelta != 0) emit ReputationChanged(agentId, repDelta, agent.reputation);
    }

    function credit(address to, uint256 amount) external onlyKeeper {
        if (amount == 0) return;
        claimable[to] += amount;
        emit Rewarded(to, amount);
    }

    function claim() external {
        uint256 amount = claimable[msg.sender];
        if (amount == 0) revert NothingToClaim();
        claimable[msg.sender] = 0;
        emit Claimed(msg.sender, amount);
    }

    function transferRelic(uint256 relicId, address to) external {
        Relic storage relic = relics[relicId];
        if (relic.owner == address(0)) revert UnknownRelic();
        if (msg.sender != relic.owner && msg.sender != keeper) revert NotOwner();
        address from = relic.owner;
        relic.owner = to;
        unchecked {
            relicBalance[from] -= 1;
            relicBalance[to] += 1;
        }
        emit RelicTransferred(relicId, from, to);
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = agents[tokenId].owner;
        if (owner == address(0)) revert UnknownAgent();
        return owner;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        if (agents[tokenId].owner == address(0)) revert UnknownAgent();
        return agents[tokenId].uri;
    }

    function relicURI(uint256 relicId) external view returns (string memory) {
        if (relics[relicId].owner == address(0)) revert UnknownRelic();
        return relics[relicId].uri;
    }
}
