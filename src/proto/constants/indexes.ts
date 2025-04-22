// Database index specifications
export const protoDBIndexes = [
  {
    index: {
      fields: ['type']
    },
    name: 'idx-type'
  },
  {
    index: {
      fields: ['type', 'name']
    },
    name: 'idx-type-name'
  },
  {
    index: {
      fields: ['type', 'name', 'availableToUserIds']
    },
    name: 'idx-type-name-availableTo'
  },
  {
    index: {
      fields: ['type', 'name', 'availableInSpaceIds']
    },
    name: 'idx-type-name-availableIn'
  },
  {
    index: {
      fields: ['type', 'name', 'canBeReusedByUserIds']
    },
    name: 'idx-type-name-canBeReusedBy'
  } 
] as const;