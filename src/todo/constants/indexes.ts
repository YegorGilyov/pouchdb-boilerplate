// Database index specifications
export const todoDBIndexes = [
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
      fields: ['type', 'categoryIds']
    },
    name: 'idx-type-categoryIds'
  },
  {
    index: {
      fields: ['type', 'createdAt', 'categoryIds']
    },
    name: 'idx-type-createdAt-categoryIds'
  }
] as const;