// PagePress v0.0.6 - 2025-12-03
// Utility for properly duplicating Craft.js nodes with fresh IDs
// Uses SerializedNodes which are plain objects without circular references

import type { SerializedNode, SerializedNodes } from '@craftjs/core';

/**
 * Generate a unique ID for cloned nodes - matches Craft.js format
 */
export function generateNodeId(): string {
  // Generate ID similar to Craft.js's getRandomId
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Deep clone serialized nodes with completely fresh IDs.
 * SerializedNodes don't have circular references so JSON.parse/stringify works.
 */
export function cloneSerializedNodesWithFreshIds(
  nodes: SerializedNodes,
  rootNodeId: string
): { nodes: SerializedNodes; newRootId: string } {
  const idMapping: Record<string, string> = {};
  const clonedNodes: SerializedNodes = {};

  // First pass: create new IDs for all nodes
  const nodeIds = Object.keys(nodes);
  for (const oldId of nodeIds) {
    idMapping[oldId] = generateNodeId();
  }

  // Second pass: clone nodes with new IDs and update references
  for (const oldId of nodeIds) {
    const node = nodes[oldId];
    const newId = idMapping[oldId];

    // Create a clean clone of the serialized node (no cyclic refs here)
    // Deep clone the entire node first to get all properties
    const clonedNode: SerializedNode = JSON.parse(JSON.stringify(node));

    // Update parent reference (root node should have no parent)
    if (oldId === rootNodeId) {
      // Root of cloned tree - parent will be set by add()
      // Set to undefined - Craft.js will set it when adding
      clonedNode.parent = undefined as unknown as string;
    } else if (node.parent && idMapping[node.parent]) {
      clonedNode.parent = idMapping[node.parent];
    }

    // Update children references
    if (node.nodes && Array.isArray(node.nodes)) {
      clonedNode.nodes = node.nodes.map((childId: string) => 
        idMapping[childId] || childId
      );
    }

    // Update linked nodes references
    if (node.linkedNodes) {
      const newLinkedNodes: Record<string, string> = {};
      for (const [key, linkedId] of Object.entries(node.linkedNodes)) {
        newLinkedNodes[key] = idMapping[linkedId as string] || (linkedId as string);
      }
      clonedNode.linkedNodes = newLinkedNodes;
    }

    clonedNodes[newId] = clonedNode;
  }

  return {
    nodes: clonedNodes,
    newRootId: idMapping[rootNodeId],
  };
}

/**
 * Recursively collect all serialized nodes starting from a root
 */
export function collectSerializedNodes(
  query: { 
    node: (id: string) => { 
      toSerializedNode: () => SerializedNode; 
      get: () => { data: { nodes?: string[]; linkedNodes?: Record<string, string> } } 
    } 
  },
  nodeId: string
): SerializedNodes {
  const serializedNodes: SerializedNodes = {};
  
  const collectRecursive = (nId: string) => {
    try {
      // toSerializedNode() is safe - it returns a plain object without circular refs
      const serialized = query.node(nId).toSerializedNode();
      serializedNodes[nId] = serialized;
      
      // Get children from the serialized node directly
      const childNodes = serialized.nodes || [];
      for (const childId of childNodes) {
        collectRecursive(childId);
      }
      
      // Get linked nodes
      const linkedNodes = serialized.linkedNodes || {};
      for (const linkedId of Object.values(linkedNodes)) {
        collectRecursive(linkedId as string);
      }
    } catch (error) {
      console.error(`Error collecting node ${nId}:`, error);
    }
  };
  
  collectRecursive(nodeId);
  return serializedNodes;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EditorQuery = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EditorActions = any;

/**
 * Create a duplicate of a node with fresh IDs
 * Returns the new root node ID or null if failed
 */
export function duplicateNode(
  query: EditorQuery,
  actions: EditorActions,
  nodeId: string,
  parentId: string,
  insertIndex: number
): string | null {
  try {
    // Step 1: Collect all serialized nodes (safe, no circular refs)
    const serializedNodes = collectSerializedNodes(query, nodeId);
    
    // Step 2: Clone with fresh IDs
    const { nodes: clonedNodes, newRootId } = cloneSerializedNodesWithFreshIds(
      serializedNodes,
      nodeId
    );
    
    // Step 3: Parse and add each node starting from the root
    // We need to add nodes in the correct order (parent before children)
    const addedNodes = new Set<string>();
    
    const addNodeRecursive = (clonedId: string, targetParentId: string, index?: number) => {
      if (addedNodes.has(clonedId)) return;
      
      const serializedNode = clonedNodes[clonedId];
      if (!serializedNode) return;
      
      // Parse the serialized node to a real node
      const freshNode = query.parseSerializedNode(serializedNode).toNode((node: { id: string }) => {
        node.id = clonedId;
      });
      
      // Add to editor
      actions.add(freshNode, targetParentId, index);
      addedNodes.add(clonedId);
      
      // Add children (they will be added to this node)
      const children = serializedNode.nodes || [];
      children.forEach((childId: string, idx: number) => {
        addNodeRecursive(childId, clonedId, idx);
      });
      
      // Add linked nodes
      const linkedNodes = serializedNode.linkedNodes || {};
      Object.values(linkedNodes).forEach((linkedId) => {
        addNodeRecursive(linkedId as string, clonedId);
      });
    };
    
    // Add the root node first
    addNodeRecursive(newRootId, parentId, insertIndex);
    
    return newRootId;
  } catch (error) {
    console.error('Duplicate error:', error);
    return null;
  }
}