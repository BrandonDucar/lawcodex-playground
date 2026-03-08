'use client';

import { useState } from 'react';
import { governanceService } from '@/services/governance.service';
import type { AuditReport, TargetType } from '@/types/governance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function AuditView(): JSX.Element {
  const [targetType, setTargetType] = useState<TargetType>('app');
  const [targetRef, setTargetRef] = useState<string>('');
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);

  const handleRunAudit = (): void => {
    if (!targetRef.trim()) {
      toast.error('Please enter a target reference');
      return;
    }

    const report = governanceService.runGovernanceAudit(targetType, targetRef);
    setAuditReport(report);
    toast.success('Audit completed');
  };

  const handleCopySummary = (): void => {
    if (auditReport) {
      navigator.clipboard.writeText(auditReport.summary);
      toast.success('Summary copied to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Governance Audit</h2>

      <Card>
        <CardHeader>
          <CardTitle>Run Audit for Target</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetType">Target Type</Label>
              <Select
                value={targetType}
                onValueChange={(value: string) => setTargetType(value as TargetType)}
              >
                <SelectTrigger id="targetType">
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

            <div className="space-y-2">
              <Label htmlFor="targetRef">Target Reference</Label>
              <Input
                id="targetRef"
                value={targetRef}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetRef(e.target.value)}
                placeholder="e.g., drop-123, agent-456"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleRunAudit} className="w-full">
                Run Audit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {auditReport && (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Audit Summary</CardTitle>
                <Button variant="outline" size="sm" onClick={handleCopySummary}>
                  Copy Summary
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Badge variant="outline" className="mr-2">{auditReport.targetType}</Badge>
                <span className="font-mono text-sm">{auditReport.targetRef}</span>
              </div>
              <ScrollArea className="h-[300px] w-full rounded border border-gray-700 p-4">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                  {auditReport.summary}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Rules ({auditReport.activeRules.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {auditReport.activeRules.map((rule) => (
                      <div key={rule.id} className="border border-gray-700 rounded p-3">
                        <div className="font-semibold">{rule.name}</div>
                        <div className="text-sm text-gray-400">{rule.code}</div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{rule.ruleType}</Badge>
                          <Badge className="text-xs">{rule.severity}</Badge>
                        </div>
                      </div>
                    ))}
                    {auditReport.activeRules.length === 0 && (
                      <p className="text-gray-400 text-center py-4">No active rules</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations ({auditReport.recommendations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {auditReport.recommendations.map((rule) => (
                      <div key={rule.id} className="border border-gray-700 rounded p-3">
                        <div className="font-semibold">{rule.name}</div>
                        <p className="text-sm text-gray-400 mt-1">{rule.description}</p>
                      </div>
                    ))}
                    {auditReport.recommendations.length === 0 && (
                      <p className="text-gray-400 text-center py-4">No recommendations</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-500">Restrictions ({auditReport.restrictions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {auditReport.restrictions.map((rule) => (
                      <div key={rule.id} className="border border-orange-700 rounded p-3">
                        <div className="font-semibold">{rule.name}</div>
                        <p className="text-sm text-gray-400 mt-1">{rule.description}</p>
                      </div>
                    ))}
                    {auditReport.restrictions.length === 0 && (
                      <p className="text-gray-400 text-center py-4">No restrictions</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-500">Mandates ({auditReport.mandates.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {auditReport.mandates.map((rule) => (
                      <div key={rule.id} className="border border-green-700 rounded p-3">
                        <div className="font-semibold">{rule.name}</div>
                        <p className="text-sm text-gray-400 mt-1">{rule.description}</p>
                      </div>
                    ))}
                    {auditReport.mandates.length === 0 && (
                      <p className="text-gray-400 text-center py-4">No mandates</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {auditReport.relatedAmendments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Amendments ({auditReport.relatedAmendments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditReport.relatedAmendments.map((amendment) => (
                    <div key={amendment.id} className="border border-yellow-700 rounded p-3">
                      <div className="font-semibold">{amendment.title}</div>
                      <p className="text-sm text-gray-400 mt-1">{amendment.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{amendment.amendmentType}</Badge>
                        <Badge className="text-xs bg-yellow-600">{amendment.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
