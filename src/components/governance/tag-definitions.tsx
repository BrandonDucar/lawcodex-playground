'use client';

import { useState, useEffect } from 'react';
import { governanceService } from '@/services/governance.service';
import type { GovTagDefinition, CreateTagDefinitionInput } from '@/types/governance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export function TagDefinitions(): JSX.Element {
  const [tags, setTags] = useState<GovTagDefinition[]>([]);
  const [selectedTag, setSelectedTag] = useState<GovTagDefinition | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateTagDefinitionInput>({
    tag: '',
    description: '',
    applicableToTypes: [],
    notes: '',
  });
  const [typesInput, setTypesInput] = useState<string>('');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = (): void => {
    const allTags = governanceService.listTagDefinitions();
    setTags(allTags);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const finalData: CreateTagDefinitionInput = {
      ...formData,
      applicableToTypes: typesInput.split(',').map((s: string) => s.trim()).filter(Boolean),
    };

    if (selectedTag) {
      governanceService.updateTagDefinition(selectedTag.id, finalData);
      toast.success('Tag definition updated');
    } else {
      governanceService.createTagDefinition(finalData);
      toast.success('Tag definition created');
    }

    setShowForm(false);
    setSelectedTag(null);
    resetForm();
    loadTags();
  };

  const resetForm = (): void => {
    setFormData({
      tag: '',
      description: '',
      applicableToTypes: [],
      notes: '',
    });
    setTypesInput('');
  };

  const handleEdit = (tag: GovTagDefinition): void => {
    setSelectedTag(tag);
    setFormData({
      tag: tag.tag,
      description: tag.description,
      applicableToTypes: tag.applicableToTypes,
      notes: tag.notes,
    });
    setTypesInput(tag.applicableToTypes.join(', '));
    setShowForm(true);
  };

  const handleCreate = (): void => {
    setSelectedTag(null);
    resetForm();
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tag Definitions</h2>
        <Button onClick={handleCreate}>Create Tag</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map((tag: GovTagDefinition) => (
          <Card 
            key={tag.id} 
            className="cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => handleEdit(tag)}
          >
            <CardHeader>
              <CardTitle className="text-lg">
                <Badge variant="secondary" className="text-base">
                  {tag.tag}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-3">
                {tag.description}
              </p>
              <div className="text-xs text-gray-500">
                Applicable to: {tag.applicableToTypes.join(', ')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tags.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            No tag definitions yet. Create tags to categorize and organize governance rules.
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTag ? 'Edit Tag Definition' : 'Create Tag Definition'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tag">Tag Name *</Label>
              <Input
                id="tag"
                value={formData.tag}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, tag: e.target.value })
                }
                placeholder="e.g., high-risk, sacred-object"
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
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicableToTypes">Applicable To Types (comma-separated) *</Label>
              <Input
                id="applicableToTypes"
                value={typesInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setTypesInput(e.target.value)
                }
                placeholder="e.g., rule, amendment, agent, flow"
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
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedTag ? 'Update Tag' : 'Create Tag'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
