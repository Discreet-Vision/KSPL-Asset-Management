// ==================== GRAPHQL SCHEMA DEFINITION ====================
// Schema definition (GraphQL SDL format) defining types, queries, nested relationships, and mutations.

export const GraphQLSchemaSDL = `
  type OperatingSystem {
    name: String!
    version: String!
    kernel: String
  }

  type SoftwareItem {
    name: String!
    version: String!
    publisher: String!
  }

  type AssetRelationship {
    type: String!
    targetId: String!
    targetName: String!
  }

  type Asset {
    id: ID!
    name: String!
    serialNumber: String!
    category: String!
    subCategory: String!
    status: String!
    lifecycleState: String!
    criticality: String!
    location: String!
    department: String!
    tenantId: String!
    ownerUser: String
    ownerEmail: String
    purchaseCost: String
    contractValue: String
    operatingSystem: OperatingSystem
    installedSoftware: [SoftwareItem!]!
    relationships: [AssetRelationship!]!
  }

  type CIRelationshipTarget {
    id: ID!
    name: String!
    type: String!
  }

  type CIRelationship {
    relationshipType: String!
    target: CIRelationshipTarget!
  }

  type ConfigurationItem {
    id: ID!
    name: String!
    type: String!
    criticality: String!
    status: String!
    tenantId: String!
    relationships: [CIRelationship!]!
  }

  type BlastRadiusNode {
    ciId: String!
    name: String!
    type: String!
    relationshipType: String!
    depth: Int!
    criticality: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type AssetConnection {
    nodes: [Asset!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type WorkflowExecutionResult {
    executionId: ID!
    workflowId: String!
    status: String!
    startedAt: String!
    targetEntityId: String!
  }

  type Query {
    asset(id: ID!): Asset
    assets(first: Int, after: String, status: String, location: String): AssetConnection!
    ci(id: ID!): ConfigurationItem
    cis: [ConfigurationItem!]!
    blastRadius(ciId: String!, depth: Int): [BlastRadiusNode!]!
  }

  type Mutation {
    executeWorkflow(workflowId: String!, targetEntityId: String!): WorkflowExecutionResult!
    approveWorkflowTask(taskId: String!, decision: String!): Boolean!
  }
`;
