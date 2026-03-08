'use client';

import { useState } from 'react';
import { governanceService } from '@/services/governance.service';
import type { CreateRuleAttachmentInput, GovRule } from '@/types/governance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface AttachmentFormProps {
  rule: GovRule;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AttachmentForm({ rule, onSuccess, onCancel }: AttachmentFormProps): JSX.Element {
  const [formData, setFormData] = useState<CreateRuleAttachmentInput>({
    ruleId: rule.id,
    targetType: 'app',
    targetRef: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    governanceService.attachRule(formData);
    toast.success('Rule attached successfully');
    onSuccess();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attach Rule: {rule.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="targetType">Target Type *</Label>
            <Select
              value={formData.targetType}
              onValueChange={(value: string) => 
                setFormData({ ...formData, targetType: value as CreateRuleAttachmentInput['targetType'] })
              }
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
            <Label htmlFor="targetRef">Target Reference *</Label>
            <Input
              id="targetRef"
              value={formData.targetRef}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setFormData({ ...formData, targetRef: e.target.value })
              }
              placeholder="e.g., drop-123, agent-456, culture-coin-789"
              required
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
              Attach Rule
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
