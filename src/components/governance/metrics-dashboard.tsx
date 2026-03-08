'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GovernanceMetrics } from '@/types/governance';
import { enhancedGovernanceService } from '@/services/governance.service.enhanced';

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = () => {
    const data = enhancedGovernanceService.getGovernanceMetrics();
    setMetrics(data);
  };

  if (!metrics) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Governance Health Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Rules</p>
              <p className="text-3xl font-bold text-blue-600">{metrics.totalRules}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Active Amendments</p>
              <p className="text-3xl font-bold text-yellow-600">{metrics.activeAmendments}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Relationships</p>
              <p className="text-3xl font-bold text-purple-600">{metrics.totalRelationships}</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Conflicts</p>
              <p className="text-3xl font-bold text-red-600">{metrics.conflictingRules}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Amendment Success Rate</p>
              <p className="text-3xl font-bold text-green-600">
                {Math.round(metrics.amendmentApprovalRate * 100)}%
              </p>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Incidents Logged</p>
              <p className="text-3xl font-bold text-indigo-600">{metrics.totalIncidents}</p>
            </div>
            
            <div className="bg-pink-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Orphaned Rules</p>
              <p className="text-3xl font-bold text-pink-600">{metrics.orphanedRules.length}</p>
            </div>
            
            <div className="bg-teal-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Avg Precedence</p>
              <p className="text-3xl font-bold text-teal-600">{metrics.averagePrecedenceLevel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rules by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(metrics.rulesByCategory).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{category}</span>
                  <Badge>{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rules by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(metrics.rulesBySeverity).map(([severity, count]) => (
                <div key={severity} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{severity}</span>
                  <Badge variant={severity === 'critical' ? 'destructive' : 'default'}>{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rules by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(metrics.rulesByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{status}</span>
                  <Badge variant={status === 'active' ? 'default' : 'outline'}>{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {metrics.mostAttachedRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Most Attached Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.mostAttachedRules.map(({ rule, attachmentCount }) => (
                <div key={rule.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium text-sm">{rule.name}</p>
                    <p className="text-xs text-gray-500">{rule.code}</p>
                  </div>
                  <Badge>{attachmentCount} attachments</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {metrics.orphanedRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Orphaned Rules (No Attachments)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.orphanedRules.map((rule) => (
                <div key={rule.id} className="border rounded p-2">
                  <p className="font-medium text-sm">{rule.name}</p>
                  <p className="text-xs text-gray-500">{rule.code}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
