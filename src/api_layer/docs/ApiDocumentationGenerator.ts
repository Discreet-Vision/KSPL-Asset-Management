// ==================== API DOCUMENTATION GENERATOR ====================
// Isolated documentation generator for OpenAPI 3.0 / Swagger and GraphQL SDL export.

import { GraphQLSchemaSDL } from '../graphql/GraphQLSchemaBuilder';

export class ApiDocumentationGenerator {
  public static getOpenApiSpec(): Record<string, any> {
    return {
      openapi: '3.0.3',
      info: {
        title: 'Enterprise ITAM Integration REST API',
        version: '1.0.0',
        description: 'RESTful API integration layer for external ITSM, HRIS, ERP, and Procurement systems.',
      },
      servers: [{ url: '/api/v1/integration', description: 'Production Integration Gateway' }],
      paths: {
        '/assets': {
          get: {
            summary: 'Retrieve ITAM Hardware & Virtual Assets',
            parameters: [
              { name: 'status', in: 'query', schema: { type: 'string' } },
              { name: 'location', in: 'query', schema: { type: 'string' } },
            ],
            responses: { 200: { description: 'Standard API envelope containing array of assets' } },
          },
        },
        '/cis': {
          get: {
            summary: 'Retrieve CMDB Configuration Items',
            responses: { 200: { description: 'Array of CIs with relationships' } },
          },
        },
        '/workflows': {
          post: {
            summary: 'Trigger Long-Running Durable Workflow',
            headerParameters: [{ name: 'Idempotency-Key', schema: { type: 'string' } }],
            responses: { 201: { description: 'Workflow execution created' } },
          },
        },
      },
    };
  }

  public static getGraphQLSdl(): string {
    return GraphQLSchemaSDL;
  }
}
