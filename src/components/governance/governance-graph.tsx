'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { GovRule, RuleRelationship } from '@/types/governance';
import { enhancedGovernanceService } from '@/services/governance.service.enhanced';

interface Node {
  id: string;
  x: number;
  y: number;
  rule: GovRule;
}

interface Edge {
  source: string;
  target: string;
  type: string;
}

export function GovernanceGraph() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = () => {
    const rules = enhancedGovernanceService.listGovRules({ status: 'active' });
    const relationships = enhancedGovernanceService.listRelationships();

    // Create nodes with circular layout
    const radius = 250;
    const centerX = 400;
    const centerY = 300;
    const angleStep = (2 * Math.PI) / Math.max(rules.length, 1);

    const graphNodes: Node[] = rules.map((rule: GovRule, i: number) => ({
      id: rule.id,
      x: centerX + radius * Math.cos(i * angleStep),
      y: centerY + radius * Math.sin(i * angleStep),
      rule,
    }));

    const graphEdges: Edge[] = relationships.map((rel: RuleRelationship) => ({
      source: rel.sourceRuleId,
      target: rel.targetRuleId,
      type: rel.relationshipType,
    }));

    setNodes(graphNodes);
    setEdges(graphEdges);
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      culture: '#3b82f6',
      drops: '#8b5cf6',
      ops: '#10b981',
      social: '#f59e0b',
      agents: '#ef4444',
      pickleball: '#06b6d4',
      meta: '#ec4899',
      world: '#6366f1',
      other: '#6b7280',
    };
    return colors[category] || '#6b7280';
  };

  const getEdgeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'supersedes': '#8b5cf6',
      'depends-on': '#3b82f6',
      'conflicts-with': '#ef4444',
      'implements': '#10b981',
      'derives-from': '#f59e0b',
      'exception-to': '#f97316',
    };
    return colors[type] || '#6b7280';
  };

  const getNodePosition = (nodeId: string): { x: number; y: number } | null => {
    const node = nodes.find((n: Node) => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Governance Relationship Graph</CardTitle>
          <Button onClick={loadGraph} size="sm" variant="outline">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1">
            <svg
              ref={svgRef}
              width="800"
              height="600"
              className="border rounded-lg bg-gray-50"
              viewBox="0 0 800 600"
            >
              {/* Draw edges */}
              {edges.map((edge: Edge, i: number) => {
                const sourcePos = getNodePosition(edge.source);
                const targetPos = getNodePosition(edge.target);
                
                if (!sourcePos || !targetPos) return null;

                return (
                  <g key={i}>
                    <line
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke={getEdgeColor(edge.type)}
                      strokeWidth="2"
                      strokeOpacity="0.6"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })}

              {/* Arrow marker */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#6b7280" opacity="0.6" />
                </marker>
              </defs>

              {/* Draw nodes */}
              {nodes.map((node: Node) => (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="30"
                    fill={getCategoryColor(node.rule.category)}
                    stroke={selectedNode?.id === node.id ? '#000' : '#fff'}
                    strokeWidth={selectedNode?.id === node.id ? '3' : '2'}
                    opacity="0.8"
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {node.rule.code.substring(0, 8)}
                  </text>
                </g>
              ))}
            </svg>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="text-xs font-semibold">Categories:</div>
              {['culture', 'drops', 'ops', 'social', 'agents', 'pickleball', 'meta', 'world', 'other'].map((cat) => (
                <div key={cat} className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCategoryColor(cat) }}
                  />
                  <span className="text-xs capitalize">{cat}</span>
                </div>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <div className="text-xs font-semibold">Relationships:</div>
              {['supersedes', 'depends-on', 'conflicts-with', 'implements', 'derives-from', 'exception-to'].map((type) => (
                <div key={type} className="flex items-center gap-1">
                  <div
                    className="w-8 h-0.5"
                    style={{ backgroundColor: getEdgeColor(type) }}
                  />
                  <span className="text-xs">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedNode && (
            <div className="w-64 space-y-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Selected Rule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="font-semibold">{selectedNode.rule.name}</p>
                    <p className="text-xs text-gray-500">{selectedNode.rule.code}</p>
                  </div>
                  <Badge>{selectedNode.rule.category}</Badge>
                  <Badge variant="outline">{selectedNode.rule.ruleType}</Badge>
                  <p className="text-xs">{selectedNode.rule.description}</p>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">Severity:</span> {selectedNode.rule.severity}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">Enforcement:</span> {selectedNode.rule.enforcementStyle}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">Precedence:</span> {selectedNode.rule.precedenceLevel}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {nodes.length === 0 && (
          <p className="text-gray-500 text-center py-12">
            No active rules with relationships to display. Create rules and relationships to see the graph.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
