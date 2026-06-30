import { PrismaClient } from '@prisma/client';
import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

const prisma = new PrismaClient();

const GraphExtractionSchema = z.object({
  nodes: z.array(z.object({
    name: z.string(),
    type: z.string().describe('e.g., Concept, Person, Project, Technology'),
    description: z.string().optional(),
  })),
  edges: z.array(z.object({
    source: z.string().describe('Name of the source node'),
    target: z.string().describe('Name of the target node'),
    relationType: z.string().describe('e.g., RELATES_TO, USES, FOUNDED_BY'),
  }))
});

export async function extractAndSaveGraphData(userId: string, content: string) {
  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: GraphExtractionSchema,
      prompt: `Extract knowledge graph nodes and edges from the following content for the user's personal knowledge graph:\n\n${content}`,
    });

    const nodeMap = new Map<string, string>();

    // Save nodes
    for (const node of object.nodes) {
      const savedNode = await prisma.graphNode.upsert({
        where: {
          userId_type_name: {
            userId,
            type: node.type,
            name: node.name
          }
        },
        update: {
          description: node.description
        },
        create: {
          userId,
          type: node.type,
          name: node.name,
          description: node.description
        }
      });
      nodeMap.set(node.name, savedNode.id);
    }

    // Save edges
    for (const edge of object.edges) {
      const sourceId = nodeMap.get(edge.source);
      const targetId = nodeMap.get(edge.target);

      if (sourceId && targetId) {
        await prisma.graphEdge.upsert({
          where: {
            sourceNodeId_targetNodeId_relationType: {
              sourceNodeId: sourceId,
              targetNodeId: targetId,
              relationType: edge.relationType
            }
          },
          update: {},
          create: {
            userId,
            sourceNodeId: sourceId,
            targetNodeId: targetId,
            relationType: edge.relationType
          }
        });
      }
    }

    return object;
  } catch (error) {
    console.error('Error extracting knowledge graph:', error);
    throw error;
  }
}

export async function getUserKnowledgeGraph(userId: string) {
  const nodes = await prisma.graphNode.findMany({
    where: { userId }
  });
  
  const edges = await prisma.graphEdge.findMany({
    where: { userId },
    include: {
      sourceNode: true,
      targetNode: true
    }
  });

  return { nodes, edges };
}
