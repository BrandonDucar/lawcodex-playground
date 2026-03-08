'use client';

import { useState, useEffect } from 'react';
import { governanceService } from '@/services/governance.service';
import type { EnforcementGroup, CreateEnforcementGroupInput } from '@/types/governance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export function EnforcementGroups(): JSX.Element {
  const [groups, setGroups] = useState<EnforcementGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<EnforcementGroup | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateEnforcementGroupInput>({
    name: '',
    description: '',
    roles: [],
    agentIds: [],
    tags: [],
    notes: '',
  });
  const [rolesInput, setRolesInput] = useState<string>('');
  const [agentIdsInput, setAgentIdsInput] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = (): void => {
    const allGroups = governanceService.listEnforcementGroups();
    setGroups(allGroups);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const finalData: CreateEnforcementGroupInput = {
      ...formData,
      roles: rolesInput.split(',').map((s: string) => s.trim()).filter(Boolean),
      agentIds: agentIdsInput.split(',').map((s: string) => s.trim()).filter(Boolean),
      tags: tagsInput.split(',').map((s: string) => s.trim()).filter(Boolean),
    };

    if (selectedGroup) {
      governanceService.updateEnforcementGroup(selectedGroup.id, finalData);
      toast.success('Enforcement group updated');
    } else {
      governanceService.createEnforcementGroup(finalData);
      toast.success('Enforcement group created');
    }

    setShowForm(false);
    setSelectedGroup(null);
    resetForm();
    loadGroups();
  };

  const resetForm = (): void => {
    setFormData({
      name: '',
      description: '',
      roles: [],
      agentIds: [],
      tags: [],
      notes: '',
    });
    setRolesInput('');
    setAgentIdsInput('');
    setTagsInput('');
  };

  const handleEdit = (group: EnforcementGroup): void => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      roles: group.roles,
      agentIds: group.agentIds,
      tags: group.tags,
      notes: group.notes,
    });
    setRolesInput(group.roles.join(', '));
    setAgentIdsInput(group.agentIds.join(', '));
    setTagsInput(group.tags.join(', '));
    setShowForm(true);
  };

  const handleCreate = (): void => {
    setSelectedGroup(null);
    resetForm();
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Enforcement Groups</h2>
        <Button onClick={handleCreate}>Create Group</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group: EnforcementGroup) => (
          <Card 
            key={group.id} 
            className="cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => handleEdit(group)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {group.description}
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Roles:</span> {group.roles.length}
                </div>
                <div>
                  <span className="text-gray-400">Agents:</span> {group.agentIds.length}
                </div>
                {group.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {group.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            No enforcement groups yet. Create your first group to organize governance enforcement.
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedGroup ? 'Edit Enforcement Group' : 'Create Enforcement Group'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name *</Label>
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
              <Label htmlFor="roles">Roles (comma-separated) *</Label>
              <Input
                id="roles"
                value={rolesInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setRolesInput(e.target.value)
                }
                placeholder="e.g., monitor-memes, check-drop-flow, culture-guardian"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agentIds">Agent IDs (comma-separated)</Label>
              <Input
                id="agentIds"
                value={agentIdsInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setAgentIdsInput(e.target.value)
                }
                placeholder="e.g., agent-001, agent-002"
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
                placeholder="e.g., culture, enforcement, monitoring"
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
                {selectedGroup ? 'Update Group' : 'Create Group'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
