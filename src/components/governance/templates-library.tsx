'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { RuleTemplate, RuleCategory } from '@/types/governance';
import { enhancedGovernanceService } from '@/services/governance.service.enhanced';

export function TemplatesLibrary() {
  const [templates, setTemplates] = useState<RuleTemplate[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'culture' as RuleCategory,
    description: '',
    generatedRulePattern: '',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    setTemplates(enhancedGovernanceService.listTemplates());
  };

  const handleCreate = () => {
    if (!formData.name || !formData.description) return;

    enhancedGovernanceService.createTemplate({
      ...formData,
      templateFields: [],
    });

    setFormData({
      name: '',
      category: 'culture',
      description: '',
      generatedRulePattern: '',
    });
    setIsCreating(false);
    loadTemplates();
  };

  const handleDelete = (id: string) => {
    enhancedGovernanceService.deleteTemplate(id);
    loadTemplates();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rule Templates Library</CardTitle>
          <Button onClick={() => setIsCreating(!isCreating)} size="sm">
            {isCreating ? 'Cancel' : 'Create Template'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isCreating && (
          <div className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
            <div>
              <Label>Template Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Drop Policy"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as RuleCategory })}
              >
                <SelectTrigger>
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

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this template's purpose..."
              />
            </div>

            <div>
              <Label>Rule Pattern</Label>
              <Textarea
                value={formData.generatedRulePattern}
                onChange={(e) => setFormData({ ...formData, generatedRulePattern: e.target.value })}
                placeholder="Template for generating rules..."
              />
            </div>

            <Button onClick={handleCreate} className="w-full">Create Template</Button>
          </div>
        )}

        <div className="space-y-3">
          {templates.length === 0 && (
            <p className="text-gray-500 text-center py-8">No templates created yet.</p>
          )}

          {templates.map((template: RuleTemplate) => (
            <div key={template.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{template.name}</h3>
                    <Badge>{template.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  {template.generatedRulePattern && (
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                      {template.generatedRulePattern}
                    </pre>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                >
                  Delete
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Created: {new Date(template.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
