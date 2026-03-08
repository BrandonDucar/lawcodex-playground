'use client';

import { useState, useEffect } from 'react';
import { governanceService } from '@/services/governance.service';
import type { GovRule, GovRulesFilter } from '@/types/governance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface RulesListProps {
  onSelectRule: (rule: GovRule) => void;
  onCreateRule: () => void;
}

export function RulesList({ onSelectRule, onCreateRule }: RulesListProps): JSX.Element {
  const [rules, setRules] = useState<GovRule[]>([]);
  const [filter, setFilter] = useState<GovRulesFilter>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadRules = (): void => {
    const allRules = governanceService.listGovRules(filter);
    const filtered = allRules.filter((rule: GovRule) => 
      searchTerm === '' ||
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setRules(filtered);
  };

  useEffect(() => {
    loadRules();
  }, [filter, searchTerm]);

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      'none': 'bg-gray-500',
      'low': 'bg-blue-500',
      'medium': 'bg-yellow-500',
      'high': 'bg-orange-500',
      'critical': 'bg-red-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-600',
      'active': 'bg-green-600',
      'deprecated': 'bg-orange-600',
      'superseded': 'bg-purple-600'
    };
    return colors[status] || 'bg-gray-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Governance Rules</h2>
        <Button onClick={onCreateRule}>Create Rule</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search rules..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />

        <Select
          value={filter.category || 'all'}
          onValueChange={(value: string) => 
            setFilter({ ...filter, category: value === 'all' ? undefined : value as GovRulesFilter['category'] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="culture">Culture</SelectItem>
            <SelectItem value="drops">Drops</SelectItem>
            <SelectItem value="ops">Ops</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="agents">Agents</SelectItem>
            <SelectItem value="pickleball">Pickleball</SelectItem>
            <SelectItem value="meta">Meta</SelectItem>
            <SelectItem value="world">World</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filter.ruleType || 'all'}
          onValueChange={(value: string) => 
            setFilter({ ...filter, ruleType: value === 'all' ? undefined : value as GovRulesFilter['ruleType'] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="principle">Principle</SelectItem>
            <SelectItem value="policy">Policy</SelectItem>
            <SelectItem value="recommendation">Recommendation</SelectItem>
            <SelectItem value="restriction">Restriction</SelectItem>
            <SelectItem value="mandate">Mandate</SelectItem>
            <SelectItem value="prohibition">Prohibition</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filter.status || 'all'}
          onValueChange={(value: string) => 
            setFilter({ ...filter, status: value === 'all' ? undefined : value as GovRulesFilter['status'] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="deprecated">Deprecated</SelectItem>
            <SelectItem value="superseded">Superseded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-gray-400">
        {rules.length} rule{rules.length !== 1 ? 's' : ''} found
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rules.map((rule: GovRule) => (
          <Card 
            key={rule.id} 
            className="cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => onSelectRule(rule)}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-start justify-between">
                <span className="flex-1">{rule.name}</span>
                <Badge className={`${getStatusColor(rule.status)} ml-2`}>
                  {rule.status}
                </Badge>
              </CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{rule.code}</Badge>
                <Badge variant="outline">{rule.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                {rule.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="text-xs">{rule.ruleType}</Badge>
                <Badge className={`text-xs ${getSeverityColor(rule.severity)}`}>
                  {rule.severity}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {rule.enforcementStyle}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rules.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            No rules found. Create your first governance rule to begin building the DreamNet Constitution.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
