'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ConflictReport } from '@/types/governance';
import { enhancedGovernanceService } from '@/services/governance.service.enhanced';

export function ConflictDetector() {
  const [conflicts, setConflicts] = useState<ConflictReport[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);

  useEffect(() => {
    loadConflicts();
  }, []);

  const loadConflicts = () => {
    setConflicts(enhancedGovernanceService.getConflicts());
    const existing = enhancedGovernanceService.getConflicts();
    if (existing.length > 0) {
      setLastScan(new Date().toISOString());
    }
  };

  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const detected = enhancedGovernanceService.detectRuleConflicts();
      setConflicts(detected);
      setLastScan(new Date().toISOString());
      setIsScanning(false);
    }, 500);
  };

  const handleDismiss = (id: string) => {
    enhancedGovernanceService.deleteConflict(id);
    loadConflicts();
  };

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
    };
    return colors[severity] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Conflict Detection Engine</CardTitle>
            {lastScan && (
              <p className="text-sm text-gray-500 mt-1">
                Last scan: {new Date(lastScan).toLocaleString()}
              </p>
            )}
          </div>
          <Button onClick={runScan} disabled={isScanning}>
            {isScanning ? 'Scanning...' : 'Run Conflict Scan'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {conflicts.length === 0 && !isScanning && (
          <Alert>
            <AlertDescription>
              ✅ No conflicts detected. Your governance rules are consistent.
            </AlertDescription>
          </Alert>
        )}

        {isScanning && (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-pulse">Analyzing rule consistency...</div>
          </div>
        )}

        <div className="space-y-4 mt-4">
          {conflicts.map((conflict: ConflictReport) => (
            <div key={conflict.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(conflict.severity)}>
                    {conflict.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{conflict.conflictType}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(conflict.id)}
                >
                  Dismiss
                </Button>
              </div>

              <p className="text-sm font-semibold mb-2">{conflict.description}</p>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-xs text-gray-500 mb-1">RULE 1</p>
                  <p className="font-semibold">{conflict.rule1.name}</p>
                  <p className="text-sm text-gray-600">{conflict.rule1.code}</p>
                  <Badge className="mt-2">{conflict.rule1.ruleType}</Badge>
                </div>

                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-xs text-gray-500 mb-1">RULE 2</p>
                  <p className="font-semibold">{conflict.rule2.name}</p>
                  <p className="text-sm text-gray-600">{conflict.rule2.code}</p>
                  <Badge className="mt-2">{conflict.rule2.ruleType}</Badge>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Detected: {new Date(conflict.detectedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
