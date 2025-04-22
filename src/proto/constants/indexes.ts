// Database index specifications
export const dbIndexes = [
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
      fields: ['type', 'name', 'denormAvailableToUserIds']
    },
    name: 'idx-type-name-availableTo'
  },
  {
    index: {
      fields: ['type', 'name', 'denormAvailableInSpaceIds']
    },
    name: 'idx-type-name-availableIn'
  },
  {
    index: {
      fields: ['type', 'name', 'denormCanBeReusedByUserIds']
    },
    name: 'idx-type-name-canBeReusedBy'
  }
] as const; 