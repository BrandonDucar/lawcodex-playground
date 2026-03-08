'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { GovRule, ImpactReport } from '@/types/governance';
import { enhancedGovernanceService } from '@/services/governance.service.enhanced';

export function ImpactAnalyzer() {
  const [rules, setRules] = useState<GovRule[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [impact, setImpact] = useState<ImpactReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setRules(enhancedGovernanceService.listGovRules());
  }, []);

  const runAnalysis = () => {
    if (!selectedRuleId) return;
    
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = enhancedGovernanceService.analyzeRuleImpact(selectedRuleId);
      setImpact(result);
      setIsAnalyzing(false);
    }, 300);
  };

  const getDisruptionColor = (level: string): string => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500',
    };
    return colors[level] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={selectedRuleId} onValueChange={setSelectedRuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rule to analyze" />
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
            <Button onClick={runAnalysis} disabled={!selectedRuleId || isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Impact'}
            </Button>
          </div>

          {isAnalyzing && (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-pulse">Calculating impact...</div>
            </div>
          )}

          {impact && !isAnalyzing && (
            <div className="space-y-4 mt-6">
              <Alert>
                <AlertDescription>{impact.impactSummary}</AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Disruption Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={`${getDisruptionColor(impact.estimatedDisruptionLevel)} text-white text-lg px-4 py-2`}>
                      {impact.estimatedDisruptionLevel.toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Affected Targets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{impact.affectedTargets.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Dependent Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{impact.dependentRules.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Relationships</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{impact.relatedRelationships.length}</p>
                  </CardContent>
                </Card>
              </div>

              {impact.dependentRules.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Dependent Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {impact.dependentRules.map((rule: GovRule) => (
                        <div key={rule.id} className="border rounded p-2">
                          <p className="font-medium text-sm">{rule.name}</p>
                          <p className="text-xs text-gray-500">{rule.code}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {impact.enforcementGroups.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Enforcement Groups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {impact.enforcementGroups.map((group) => (
                        <div key={group.id} className="border rounded p-2">
                          <p className="font-medium text-sm">{group.name}</p>
                          <p className="text-xs text-gray-500">{group.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
