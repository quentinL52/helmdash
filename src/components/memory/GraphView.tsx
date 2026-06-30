'use client';

import React, { useEffect, useState } from 'react';

// Simplified types reflecting our database models
export interface GraphNode {
  id: string;
  type: string;
  name: string;
  description: string | null;
}

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: string;
  sourceNode: GraphNode;
  targetNode: GraphNode;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function GraphView({ userId }: { userId: string }) {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, we would fetch this from an API route.
    // For MVP, we simulate fetching the graph data.
    const fetchGraph = async () => {
      try {
        const response = await fetch(`/api/memory/graph?userId=${userId}`);
        if (response.ok) {
          const json = await response.json();
          setData(json);
        } else {
          console.error('Failed to fetch graph data, status:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch graph data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchGraph();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading Knowledge Graph...</div>
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-xl border border-dashed p-8">
        <h3 className="text-lg font-medium text-foreground">Knowledge Graph Empty</h3>
        <p className="text-sm text-muted-foreground text-center">
          Add some memory notes to start building your personal knowledge graph.
        </p>
      </div>
    );
  }

  // Group nodes by type
  const nodesByType = data.nodes.reduce((acc, node) => {
    if (!acc[node.type]) acc[node.type] = [];
    acc[node.type].push(node);
    return acc;
  }, {} as Record<string, GraphNode[]>);

  // Helper to find connections for a node
  const getNodeConnections = (nodeId: string) => {
    const outgoing = data.edges.filter(e => e.sourceNodeId === nodeId);
    const incoming = data.edges.filter(e => e.targetNodeId === nodeId);
    return { outgoing, incoming };
  };

  return (
    <div className="space-y-8">
      {Object.entries(nodesByType).map(([type, nodes]) => (
        <div key={type} className="space-y-4">
          <h2 className="text-xl font-semibold capitalize tracking-tight">{type}s</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {nodes.map(node => {
              const { outgoing, incoming } = getNodeConnections(node.id);
              return (
                <div 
                  key={node.id} 
                  className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-all hover:shadow-md"
                >
                  <h3 className="font-medium text-lg">{node.name}</h3>
                  {node.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {node.description}
                    </p>
                  )}
                  
                  {(outgoing.length > 0 || incoming.length > 0) && (
                    <div className="mt-4 space-y-2 border-t pt-4">
                      {outgoing.map(edge => (
                        <div key={edge.id} className="flex items-center text-xs">
                          <span className="font-mono text-[10px] uppercase text-muted-foreground px-2 py-0.5 bg-muted rounded mr-2">
                            {edge.relationType}
                          </span>
                          <span className="truncate flex-1">
                            → {edge.targetNode?.name || 'Unknown'}
                          </span>
                        </div>
                      ))}
                      {incoming.map(edge => (
                        <div key={edge.id} className="flex items-center text-xs">
                          <span className="font-mono text-[10px] uppercase text-muted-foreground px-2 py-0.5 bg-muted rounded mr-2">
                            {edge.relationType}
                          </span>
                          <span className="truncate flex-1">
                            ← {edge.sourceNode?.name || 'Unknown'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
