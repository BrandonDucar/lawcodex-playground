'use client';

import { useState } from 'react';
import { governanceService } from '@/services/governance.service';
import type { CreateAmendmentInput, GovRule } from '@/types/governance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface AmendmentFormProps {
  rule: GovRule;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AmendmentForm({ rule, onSuccess, onCancel }: AmendmentFormProps): JSX.Element {
  const [formData, setFormData] = useState<CreateAmendmentInput>({
    ruleId: rule.id,
    title: '',
    description: '',
    amendmentType: 'clarification',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    governanceService.createAmendment(formData);
    toast.success('Amendment created successfully');
    onSuccess();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Amendment for: {rule.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Amendment Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amendmentType">Amendment Type *</Label>
            <Select
              value={formData.amendmentType}
              onValueChange={(value: string) => 
                setFormData({ ...formData, amendmentType: value as CreateAmendmentInput['amendmentType'] })
              }
            >
              <SelectTrigger id="amendmentType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clarification">Clarification</SelectItem>
                <SelectItem value="modification">Modification</SelectItem>
                <SelectItem value="exception">Exception</SelectItem>
                <SelectItem value="override">Override</SelectItem>
                <SelectItem value="repeal">Repeal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Create Amendment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
