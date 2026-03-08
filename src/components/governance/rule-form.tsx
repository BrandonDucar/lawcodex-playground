'use client';

import { useState } from 'react';
import { governanceService } from '@/services/governance.service';
import type { CreateGovRuleInput, GovRule } from '@/types/governance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface RuleFormProps {
  rule?: GovRule;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RuleForm({ rule, onSuccess, onCancel }: RuleFormProps): JSX.Element {
  const [formData, setFormData] = useState<CreateGovRuleInput>({
    name: rule?.name || '',
    code: rule?.code || '',
    category: rule?.category || 'other',
    description: rule?.description || '',
    ruleType: rule?.ruleType || 'policy',
    appliesToTypes: rule?.appliesToTypes || [],
    appliesToRefs: rule?.appliesToRefs || [],
    severity: rule?.severity || 'medium',
    enforcementStyle: rule?.enforcementStyle || 'soft-advice',
    status: rule?.status || 'draft',
    tags: rule?.tags || [],
    notes: rule?.notes || '',
  });

  const [appliesToTypesInput, setAppliesToTypesInput] = useState<string>(
    rule?.appliesToTypes.join(', ') || ''
  );
  const [appliesToRefsInput, setAppliesToRefsInput] = useState<string>(
    rule?.appliesToRefs.join(', ') || ''
  );
  const [tagsInput, setTagsInput] = useState<string>(
    rule?.tags.join(', ') || ''
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const finalData: CreateGovRuleInput = {
      ...formData,
      appliesToTypes: appliesToTypesInput.split(',').map((s: string) => s.trim()).filter(Boolean),
      appliesToRefs: appliesToRefsInput.split(',').map((s: string) => s.trim()).filter(Boolean),
      tags: tagsInput.split(',').map((s: string) => s.trim()).filter(Boolean),
    };

    if (rule) {
      governanceService.updateGovRule(rule.id, finalData);
      toast.success('Rule updated successfully');
    } else {
      governanceService.createGovRule(finalData);
      toast.success('Rule created successfully');
    }

    onSuccess();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{rule ? 'Edit Rule' : 'Create New Rule'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Rule Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="e.g., RULE_NO_CHAOS"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: string) => 
                  setFormData({ ...formData, category: value as CreateGovRuleInput['category'] })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruleType">Rule Type *</Label>
              <Select
                value={formData.ruleType}
                onValueChange={(value: string) => 
                  setFormData({ ...formData, ruleType: value as CreateGovRuleInput['ruleType'] })
                }
              >
                <SelectTrigger id="ruleType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="principle">Principle</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="recommendation">Recommendation</SelectItem>
                  <SelectItem value="restriction">Restriction</SelectItem>
                  <SelectItem value="mandate">Mandate</SelectItem>
                  <SelectItem value="prohibition">Prohibition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value: string) => 
                  setFormData({ ...formData, severity: value as CreateGovRuleInput['severity'] })
                }
              >
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="enforcementStyle">Enforcement Style</Label>
              <Select
                value={formData.enforcementStyle}
                onValueChange={(value: string) => 
                  setFormData({ ...formData, enforcementStyle: value as CreateGovRuleInput['enforcementStyle'] })
                }
              >
                <SelectTrigger id="enforcementStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soft-advice">Soft Advice</SelectItem>
                  <SelectItem value="agent-enforced">Agent Enforced</SelectItem>
                  <SelectItem value="backend-enforced">Backend Enforced</SelectItem>
                  <SelectItem value="human-reviewed">Human Reviewed</SelectItem>
                  <SelectItem value="narrative-enforced">Narrative Enforced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) => 
                  setFormData({ ...formData, status: value as CreateGovRuleInput['status'] })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                  <SelectItem value="superseded">Superseded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appliesToTypes">Applies To Types (comma-separated)</Label>
            <Input
              id="appliesToTypes"
              value={appliesToTypesInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setAppliesToTypesInput(e.target.value)
              }
              placeholder="e.g., culture-coin, drop, agent, flow"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appliesToRefs">Applies To Refs (comma-separated)</Label>
            <Input
              id="appliesToRefs"
              value={appliesToRefsInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setAppliesToRefsInput(e.target.value)
              }
              placeholder="e.g., drop-123, agent-456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setTagsInput(e.target.value)
              }
              placeholder="e.g., high-risk, sacred-object"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {rule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
