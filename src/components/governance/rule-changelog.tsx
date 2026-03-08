'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { GovRule, RuleVersion } from '@/types/governance';
import { enhancedGovernanceService } from '@/services/governance.service.enhanced';

export function RuleChangelog() {
  const [rules, setRules] = useState<GovRule[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [versions, setVersions] = useState<RuleVersion[]>([]);
  const [changelog, setChangelog] = useState<string>('');

  useEffect(() => {
    setRules(enhancedGovernanceService.listGovRules());
  }, []);

  useEffect(() => {
    if (selectedRuleId) {
      const ruleVersions = enhancedGovernanceService.getRuleVersions(selectedRuleId);
      setVersions(ruleVersions);
      const changelogText = enhancedGovernanceService.getRuleChangelog(selectedRuleId);
      setChangelog(changelogText);
    } else {
      setVersions([]);
      setChangelog('');
    }
  }, [selectedRuleId]);

  const copyChangelog = () => {
    navigator.clipboard.writeText(changelog);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rule Version History & Changelog</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={selectedRuleId} onValueChange={setSelectedRuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rule to view history" />
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
            {selectedRuleId && (
              <Button onClick={copyChangelog} variant="outline">
                Copy Changelog
              </Button>
            )}
          </div>

          {versions.length > 0 && (
            <div className="space-y-3">
              {versions.map((version: RuleVersion) => (
                <div key={version.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Version {version.version}</Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(version.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1">{version.changes}</p>
                  <p className="text-xs text-gray-600">Changed by: {version.changedBy}</p>
                  
                  {version.snapshot && Object.keys(version.snapshot).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">View snapshot</summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(version.snapshot, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedRuleId && versions.length === 0 && (
            <p className="text-gray-500 text-center py-8">No version history available for this rule.</p>
          )}

          {!selectedRuleId && (
            <p className="text-gray-500 text-center py-8">Select a rule to view its version history.</p>
          )}

          {changelog && (
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Full Changelog:</h4>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap">
                {changelog}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
