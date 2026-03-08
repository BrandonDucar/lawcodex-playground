'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { RuleComment, CommentType, GovRule } from '@/types/governance';
import { enhancedGovernanceService } from '@/services/governance.service.enhanced';

interface DiscussionThreadsProps {
  ruleId?: string;
}

export function DiscussionThreads({ ruleId }: DiscussionThreadsProps) {
  const [comments, setComments] = useState<RuleComment[]>([]);
  const [rules, setRules] = useState<GovRule[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    ruleId: ruleId || '',
    author: '',
    commentType: 'question' as CommentType,
    text: '',
  });

  useEffect(() => {
    loadData();
  }, [ruleId]);

  const loadData = () => {
    if (ruleId) {
      setComments(enhancedGovernanceService.listComments({ ruleId }));
    } else {
      setComments(enhancedGovernanceService.listComments());
    }
    setRules(enhancedGovernanceService.listGovRules());
  };

  const handleCreate = () => {
    if (!formData.ruleId || !formData.author || !formData.text) return;
    
    enhancedGovernanceService.createComment(formData);
    setFormData({
      ruleId: ruleId || '',
      author: '',
      commentType: 'question',
      text: '',
    });
    setIsCreating(false);
    loadData();
  };

  const toggleResolved = (id: string, resolved: boolean) => {
    enhancedGovernanceService.updateComment(id, { resolved: !resolved });
    loadData();
  };

  const handleDelete = (id: string) => {
    enhancedGovernanceService.deleteComment(id);
    loadData();
  };

  const getRuleName = (id: string): string => {
    const rule = rules.find((r: GovRule) => r.id === id);
    return rule ? `${rule.name} (${rule.code})` : 'Unknown Rule';
  };

  const getCommentTypeColor = (type: CommentType): string => {
    const colors: Record<CommentType, string> = {
      question: 'bg-blue-500',
      concern: 'bg-yellow-500',
      support: 'bg-green-500',
      'revision-request': 'bg-orange-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Discussion Threads</CardTitle>
          <Button onClick={() => setIsCreating(!isCreating)} size="sm">
            {isCreating ? 'Cancel' : 'Add Comment'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isCreating && (
          <div className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
            {!ruleId && (
              <div>
                <Label>Rule</Label>
                <Select
                  value={formData.ruleId}
                  onValueChange={(value) => setFormData({ ...formData, ruleId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rule" />
                  </SelectTrigger>
                  <SelectContent>
                    {rules.map((rule: GovRule) => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.name} ({rule.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Your Name</Label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Your name or identity"
              />
            </div>

            <div>
              <Label>Comment Type</Label>
              <Select
                value={formData.commentType}
                onValueChange={(value) => setFormData({ ...formData, commentType: value as CommentType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="concern">Concern</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="revision-request">Revision Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Comment</Label>
              <Textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Share your thoughts..."
                rows={4}
              />
            </div>

            <Button onClick={handleCreate} className="w-full">Post Comment</Button>
          </div>
        )}

        <div className="space-y-3">
          {comments.length === 0 && (
            <p className="text-gray-500 text-center py-8">No comments yet. Start the discussion!</p>
          )}

          {comments.map((comment: RuleComment) => (
            <div
              key={comment.id}
              className={`border rounded-lg p-4 ${comment.resolved ? 'bg-gray-50 opacity-75' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">{comment.author}</span>
                    <Badge className={getCommentTypeColor(comment.commentType)}>
                      {comment.commentType}
                    </Badge>
                    {comment.resolved && <Badge variant="outline">Resolved</Badge>}
                  </div>
                  {!ruleId && (
                    <p className="text-xs text-gray-500 mb-2">
                      On: {getRuleName(comment.ruleId)}
                    </p>
                  )}
                  <p className="text-sm">{comment.text}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleResolved(comment.id, comment.resolved)}
                  >
                    {comment.resolved ? 'Unresolve' : 'Resolve'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(comment.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
