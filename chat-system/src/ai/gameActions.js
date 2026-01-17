export const ACTIONS = {
  BUILD: "BUILD",
  ATTACK: "ATTACK",
  TRADE_OFFER: "TRADE_OFFER",
  END_TURN: "END_TURN"
};

export const RESOURCES = {
  WOOD: "WOOD",
  STONE: "STONE",
  GLASS: "GLASS",
  FORCE: "FORCE",
  LIGHTNING: "LIGHTNING"
};

export const REGIONS = {
  SKY: "SKY",
  FOREST: "FOREST",
  WATERS: "WATERS",
  VILLAGES: "VILLAGES",
  MOUNTAINS: "MOUNTAINS"
};

// Region value scores for strategic evaluation
export const REGION_VALUES = {
  SKY: 1,
  FOREST: 3,       // Good for resources
  WATERS: 2,
  VILLAGES: 4,     // High value target
  MOUNTAINS: 2
};
  