'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { RuleRelationship, RelationshipType, GovRule } from '@/types/governance';
import { enhancedGovernanceService } from '@/services/governance.service.enhanced';

interface RelationshipsManagerProps {
  ruleId?: string;
}

export function RelationshipsManager({ ruleId }: RelationshipsManagerProps) {
  const [relationships, setRelationships] = useState<RuleRelationship[]>([]);
  const [rules, setRules] = useState<GovRule[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    sourceRuleId: ruleId || '',
    targetRuleId: '',
    relationshipType: 'depends-on' as RelationshipType,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [ruleId]);

  const loadData = () => {
    if (ruleId) {
      const rels = enhancedGovernanceService.listRelationships({ sourceRuleId: ruleId });
      const targetRels = enhancedGovernanceService.listRelationships({ targetRuleId: ruleId });
      setRelationships([...rels, ...targetRels]);
    } else {
      setRelationships(enhancedGovernanceService.listRelationships());
    }
    setRules(enhancedGovernanceService.listGovRules());
  };

  const handleCreate = () => {
    if (!formData.sourceRuleId || !formData.targetRuleId) return;
    
    enhancedGovernanceService.createRelationship(formData);
    setFormData({
      sourceRuleId: ruleId || '',
      targetRuleId: '',
      relationshipType: 'depends-on',
      notes: '',
    });
    setIsCreating(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    enhancedGovernanceService.deleteRelationship(id);
    loadData();
  };

  const getRuleName = (id: string): string => {
    const rule = rules.find((r: GovRule) => r.id === id);
    return rule ? `${rule.name} (${rule.code})` : 'Unknown Rule';
  };

  const getRelationshipColor = (type: RelationshipType): string => {
    const colors: Record<RelationshipType, string> = {
      'supersedes': 'bg-purple-500',
      'depends-on': 'bg-blue-500',
      'conflicts-with': 'bg-red-500',
      'implements': 'bg-green-500',
      'derives-from': 'bg-yellow-500',
      'exception-to': 'bg-orange-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rule Relationships</CardTitle>
          <Button onClick={() => setIsCreating(!isCreating)} size="sm">
            {isCreating ? 'Cancel' : 'Add Relationship'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isCreating && (
          <div className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
            <div>
              <Label>Source Rule</Label>
              <Select
                value={formData.sourceRuleId}
                onValueChange={(value) => setFormData({ ...formData, sourceRuleId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source rule" />
                </SelectTrigger>
                <SelectContent>
                  {rules.map((rule: GovRule) => (
                    <SelectItem key={rule.id} value={rule.id}>
                      {rule.name} ({rule.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Relationship Type</Label>
              <Select
                value={formData.relationshipType}
                onValueChange={(value) => setFormData({ ...formData, relationshipType: value as RelationshipType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supersedes">Supersedes</SelectItem>
                  <SelectItem value="depends-on">Depends On</SelectItem>
                  <SelectItem value="conflicts-with">Conflicts With</SelectItem>
                  <SelectItem value="implements">Implements</SelectItem>
                  <SelectItem value="derives-from">Derives From</SelectItem>
                  <SelectItem value="exception-to">Exception To</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target Rule</Label>
              <Select
                value={formData.targetRuleId}
                onValueChange={(value) => setFormData({ ...formData, targetRuleId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target rule" />
                </SelectTrigger>
                <SelectContent>
                  {rules.filter((r: GovRule) => r.id !== formData.sourceRuleId).map((rule: GovRule) => (
                    <SelectItem key={rule.id} value={rule.id}>
                      {rule.name} ({rule.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional context..."
              />
            </div>

            <Button onClick={handleCreate} className="w-full">Create Relationship</Button>
          </div>
        )}

        <div className="space-y-3">
          {relationships.length === 0 && (
            <p className="text-gray-500 text-center py-8">No relationships defined yet.</p>
          )}
          
          {relationships.map((rel: RuleRelationship) => (
            <div key={rel.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{getRuleName(rel.sourceRuleId)}</span>
                    <Badge className={getRelationshipColor(rel.relationshipType)}>
                      {rel.relationshipType}
                    </Badge>
                    <span className="font-medium text-sm">{getRuleName(rel.targetRuleId)}</span>
                  </div>
                  {rel.notes && <p className="text-sm text-gray-600">{rel.notes}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(rel.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
