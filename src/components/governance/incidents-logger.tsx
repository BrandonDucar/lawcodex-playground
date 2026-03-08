'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { EnforcementIncident, IncidentType, TargetType, GovRule, EnforcementGroup } from '@/types/governance';
import { enhancedGovernanceService } from '@/services/governance.service.enhanced';

export function IncidentsLogger() {
  const [incidents, setIncidents] = useState<EnforcementIncident[]>([]);
  const [rules, setRules] = useState<GovRule[]>([]);
  const [groups, setGroups] = useState<EnforcementGroup[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    ruleId: '',
    targetType: 'app' as TargetType,
    targetRef: '',
    incidentType: 'violation' as IncidentType,
    description: '',
    enforcementGroupId: '',
    resolution: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIncidents(enhancedGovernanceService.listIncidents());
    setRules(enhancedGovernanceService.listGovRules());
    setGroups(enhancedGovernanceService.listEnforcementGroups());
  };

  const handleCreate = () => {
    if (!formData.ruleId || !formData.targetRef || !formData.description) return;
    
    enhancedGovernanceService.createIncident(formData);
    setFormData({
      ruleId: '',
      targetType: 'app',
      targetRef: '',
      incidentType: 'violation',
      description: '',
      enforcementGroupId: '',
      resolution: '',
    });
    setIsCreating(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    enhancedGovernanceService.deleteIncident(id);
    loadData();
  };

  const getRuleName = (id: string): string => {
    const rule = rules.find((r: GovRule) => r.id === id);
    return rule ? `${rule.name} (${rule.code})` : 'Unknown Rule';
  };

  const getGroupName = (id: string): string => {
    const group = groups.find((g: EnforcementGroup) => g.id === id);
    return group ? group.name : 'N/A';
  };

  const getIncidentTypeColor = (type: IncidentType): string => {
    const colors: Record<IncidentType, string> = {
      violation: 'bg-red-600',
      'edge-case': 'bg-yellow-500',
      'exception-granted': 'bg-blue-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Enforcement Incidents</CardTitle>
          <Button onClick={() => setIsCreating(!isCreating)} size="sm">
            {isCreating ? 'Cancel' : 'Log Incident'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isCreating && (
          <div className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
            <div>
              <Label>Rule</Label>
              <Select
                value={formData.ruleId}
                onValueChange={(value) => setFormData({ ...formData, ruleId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rule" />
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target Type</Label>
                <Select
                  value={formData.targetType}
                  onValueChange={(value) => setFormData({ ...formData, targetType: value as TargetType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app">App</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="flow">Flow</SelectItem>
                    <SelectItem value="timeline">Timeline</SelectItem>
                    <SelectItem value="identity">Identity</SelectItem>
                    <SelectItem value="territory-node">Territory Node</SelectItem>
                    <SelectItem value="scenario">Scenario</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Incident Type</Label>
                <Select
                  value={formData.incidentType}
                  onValueChange={(value) => setFormData({ ...formData, incidentType: value as IncidentType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="violation">Violation</SelectItem>
                    <SelectItem value="edge-case">Edge Case</SelectItem>
                    <SelectItem value="exception-granted">Exception Granted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Target Reference</Label>
              <Input
                value={formData.targetRef}
                onChange={(e) => setFormData({ ...formData, targetRef: e.target.value })}
                placeholder="ID or name of the target"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the incident..."
                rows={3}
              />
            </div>

            <div>
              <Label>Enforcement Group (Optional)</Label>
              <Select
                value={formData.enforcementGroupId}
                onValueChange={(value) => setFormData({ ...formData, enforcementGroupId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select group (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {groups.map((group: EnforcementGroup) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Resolution</Label>
              <Textarea
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                placeholder="How was this resolved or what action was taken?"
                rows={2}
              />
            </div>

            <Button onClick={handleCreate} className="w-full">Log Incident</Button>
          </div>
        )}

        <div className="space-y-3">
          {incidents.length === 0 && (
            <p className="text-gray-500 text-center py-8">No incidents logged yet.</p>
          )}

          {incidents.map((incident: EnforcementIncident) => (
            <div key={incident.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getIncidentTypeColor(incident.incidentType)}>
                      {incident.incidentType}
                    </Badge>
                    <Badge variant="outline">{incident.targetType}</Badge>
                  </div>
                  <p className="text-sm font-semibold mb-1">Rule: {getRuleName(incident.ruleId)}</p>
                  <p className="text-sm text-gray-600 mb-1">Target: {incident.targetRef}</p>
                  <p className="text-sm mb-2">{incident.description}</p>
                  {incident.resolution && (
                    <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                      <p className="text-xs font-semibold text-green-800 mb-1">Resolution:</p>
                      <p className="text-xs text-green-700">{incident.resolution}</p>
                    </div>
                  )}
                  {incident.enforcementGroupId && (
                    <p className="text-xs text-gray-500 mt-2">
                      Handled by: {getGroupName(incident.enforcementGroupId)}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(incident.id)}
                >
                  Delete
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(incident.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
