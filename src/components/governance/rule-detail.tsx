'use client';

import { useState, useEffect } from 'react';
import { governanceService } from '@/services/governance.service';
import type { GovRule, Amendment, RuleAttachment } from '@/types/governance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface RuleDetailProps {
  rule: GovRule;
  onEdit: () => void;
  onBack: () => void;
  onCreateAmendment: () => void;
  onAttachRule: () => void;
}

export function RuleDetail({ rule, onEdit, onBack, onCreateAmendment, onAttachRule }: RuleDetailProps): JSX.Element {
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [attachments, setAttachments] = useState<RuleAttachment[]>([]);

  useEffect(() => {
    loadData();
  }, [rule.id]);

  const loadData = (): void => {
    const ruleAmendments = governanceService.listAmendments({ ruleId: rule.id });
    const ruleAttachments = governanceService.getRuleAttachments(rule.id);
    setAmendments(ruleAmendments);
    setAttachments(ruleAttachments);
  };

  const handleGenerateAudit = (): void => {
    toast.info('Navigate to Governance Audit to run audits for specific targets');
  };

  const handleApproveAmendment = (amendmentId: string): void => {
    governanceService.approveAmendment(amendmentId);
    toast.success('Amendment approved');
    loadData();
  };

  const handleRejectAmendment = (amendmentId: string): void => {
    governanceService.rejectAmendment(amendmentId);
    toast.success('Amendment rejected');
    loadData();
  };

  const handleDeleteAttachment = (attachmentId: string): void => {
    governanceService.removeRuleAttachment(attachmentId);
    toast.success('Attachment removed');
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          ← Back to Rules
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            Edit Rule
          </Button>
          <Button onClick={onCreateAmendment}>
            Create Amendment
          </Button>
          <Button onClick={onAttachRule}>
            Attach to Target
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl">{rule.name}</CardTitle>
              <p className="text-sm text-gray-400 mt-2">Code: {rule.code}</p>
            </div>
            <Badge className={
              rule.status === 'active' ? 'bg-green-600' :
              rule.status === 'draft' ? 'bg-gray-600' :
              rule.status === 'deprecated' ? 'bg-orange-600' :
              'bg-purple-600'
            }>
              {rule.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-300">{rule.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Category</p>
              <Badge variant="outline" className="mt-1">{rule.category}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-400">Rule Type</p>
              <Badge className="mt-1">{rule.ruleType}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-400">Severity</p>
              <Badge className={`mt-1 ${
                rule.severity === 'critical' ? 'bg-red-500' :
                rule.severity === 'high' ? 'bg-orange-500' :
                rule.severity === 'medium' ? 'bg-yellow-500' :
                rule.severity === 'low' ? 'bg-blue-500' :
                'bg-gray-500'
              }`}>
                {rule.severity}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-400">Enforcement Style</p>
              <Badge variant="secondary" className="mt-1">{rule.enforcementStyle}</Badge>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2">Applies To</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-400">Types:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {rule.appliesToTypes.map((type: string) => (
                    <Badge key={type} variant="outline">{type}</Badge>
                  ))}
                </div>
              </div>
              {rule.appliesToRefs.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400">Refs:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {rule.appliesToRefs.map((ref: string) => (
                      <Badge key={ref} variant="outline">{ref}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {rule.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {rule.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {rule.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{rule.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2">SEO Metadata</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Title:</span> {rule.seoTitle}
              </div>
              <div>
                <span className="text-gray-400">Description:</span> {rule.seoDescription}
              </div>
              <div>
                <span className="text-gray-400">Keywords:</span> {rule.seoKeywords.join(', ')}
              </div>
              <div>
                <span className="text-gray-400">Hashtags:</span> {rule.seoHashtags.join(', ')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amendments ({amendments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {amendments.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No amendments yet</p>
          ) : (
            <div className="space-y-4">
              {amendments.map((amendment: Amendment) => (
                <div key={amendment.id} className="border border-gray-700 rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{amendment.title}</h4>
                      <p className="text-sm text-gray-400">{amendment.description}</p>
                    </div>
                    <Badge className={
                      amendment.status === 'approved' ? 'bg-green-600' :
                      amendment.status === 'rejected' ? 'bg-red-600' :
                      'bg-yellow-600'
                    }>
                      {amendment.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex gap-2">
                      <Badge variant="outline">{amendment.amendmentType}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(amendment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {amendment.status === 'proposed' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApproveAmendment(amendment.id)}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRejectAmendment(amendment.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rule Attachments ({attachments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {attachments.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No attachments yet</p>
          ) : (
            <div className="space-y-3">
              {attachments.map((attachment: RuleAttachment) => (
                <div key={attachment.id} className="border border-gray-700 rounded p-3 flex justify-between items-center">
                  <div>
                    <div className="flex gap-2 items-center">
                      <Badge variant="outline">{attachment.targetType}</Badge>
                      <span className="font-mono text-sm">{attachment.targetRef}</span>
                    </div>
                    {attachment.notes && (
                      <p className="text-sm text-gray-400 mt-1">{attachment.notes}</p>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteAttachment(attachment.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
