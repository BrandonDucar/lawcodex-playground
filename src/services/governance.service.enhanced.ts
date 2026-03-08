import { v4 as uuidv4 } from '@/lib/uuid';
import type {
  GovRule,
  Amendment,
  EnforcementGroup,
  GovTagDefinition,
  RuleAttachment,
  CreateGovRuleInput,
  UpdateGovRuleInput,
  CreateAmendmentInput,
  CreateEnforcementGroupInput,
  CreateTagDefinitionInput,
  CreateRuleAttachmentInput,
  GovRulesFilter,
  AmendmentsFilter,
  AuditReport,
  TargetType,
  RuleRelationship,
  CreateRuleRelationshipInput,
  RelationshipsFilter,
  RuleTemplate,
  CreateRuleTemplateInput,
  RuleCitation,
  CreateRuleCitationInput,
  RuleComment,
  CreateRuleCommentInput,
  CommentsFilter,
  EnforcementIncident,
  CreateEnforcementIncidentInput,
  IncidentsFilter,
  RuleVersion,
  ConflictReport,
  ImpactReport,
  GovernanceMetrics,
  ExportFormat,
} from '@/types/governance';
import { storageService } from './storage.service';

export class EnhancedGovernanceService {
  // ============================================================================
  // CORE RULE OPERATIONS
  // ============================================================================

  createGovRule(input: CreateGovRuleInput): GovRule {
    const now = new Date().toISOString();
    const rule: GovRule = {
      id: uuidv4(),
      name: input.name,
      code: input.code,
      category: input.category,
      description: input.description,
      ruleType: input.ruleType,
      appliesToTypes: input.appliesToTypes,
      appliesToRefs: input.appliesToRefs || [],
      severity: input.severity || 'medium',
      enforcementStyle: input.enforcementStyle || 'soft-advice',
      status: input.status || 'draft',
      notes: input.notes || '',
      tags: input.tags || [],
      seoTitle: `DreamNet Rule: ${input.name}`,
      seoDescription: input.description.substring(0, 160),
      seoKeywords: [input.category, input.ruleType, input.code],
      seoHashtags: [`#${input.category}`, `#${input.ruleType}`, '#DreamNet'],
      altText: `Governance rule for ${input.name}`,
      createdAt: now,
      updatedAt: now,
      effectiveFrom: input.effectiveFrom,
      expiresAt: input.expiresAt,
      seasonalScope: input.seasonalScope,
      precedenceLevel: input.precedenceLevel || 5,
      canBeOverriddenBy: input.canBeOverriddenBy,
    };

    // Create initial version
    this.createVersion(rule.id, 'Initial creation', 'system', rule);

    storageService.addRule(rule);
    return rule;
  }

  updateGovRule(id: string, updates: UpdateGovRuleInput): GovRule | null {
    const rule = storageService.getRule(id);
    if (!rule) return null;

    // Create version before update
    this.createVersion(id, 'Rule updated', 'manual-update', rule);

    storageService.updateRule(id, updates);
    return storageService.getRule(id) || null;
  }

  getGovRule(id: string): GovRule | null {
    return storageService.getRule(id) || null;
  }

  listGovRules(filter?: GovRulesFilter): GovRule[] {
    let rules = storageService.getRules();

    if (filter) {
      if (filter.category) {
        rules = rules.filter((rule: GovRule) => rule.category === filter.category);
      }
      if (filter.ruleType) {
        rules = rules.filter((rule: GovRule) => rule.ruleType === filter.ruleType);
      }
      if (filter.severity) {
        rules = rules.filter((rule: GovRule) => rule.severity === filter.severity);
      }
      if (filter.enforcementStyle) {
        rules = rules.filter((rule: GovRule) => rule.enforcementStyle === filter.enforcementStyle);
      }
      if (filter.status) {
        rules = rules.filter((rule: GovRule) => rule.status === filter.status);
      }
      if (filter.tag) {
        rules = rules.filter((rule: GovRule) => rule.tags.includes(filter.tag as string));
      }
      if (filter.precedenceLevel !== undefined) {
        rules = rules.filter((rule: GovRule) => rule.precedenceLevel === filter.precedenceLevel);
      }
      if (filter.isActive) {
        const now = new Date().toISOString();
        rules = rules.filter((rule: GovRule) => {
          const afterStart = !rule.effectiveFrom || rule.effectiveFrom <= now;
          const beforeEnd = !rule.expiresAt || rule.expiresAt >= now;
          return afterStart && beforeEnd;
        });
      }
    }

    return rules;
  }

  deleteGovRule(id: string): void {
    storageService.deleteRule(id);
  }

  // ============================================================================
  // ENHANCEMENT 7: NATURAL LANGUAGE SEARCH
  // ============================================================================

  searchRulesByDescription(query: string): GovRule[] {
    const rules = storageService.getRules();
    const lowerQuery = query.toLowerCase();

    return rules.filter((rule: GovRule) => {
      const searchableText = [
        rule.name,
        rule.description,
        rule.notes,
        rule.code,
        ...rule.seoKeywords,
        ...rule.tags,
      ].join(' ').toLowerCase();

      return searchableText.includes(lowerQuery);
    });
  }

  // ============================================================================
  // AMENDMENT OPERATIONS
  // ============================================================================

  createAmendment(input: CreateAmendmentInput): Amendment {
    const amendment: Amendment = {
      id: uuidv4(),
      ruleId: input.ruleId,
      title: input.title,
      description: input.description,
      amendmentType: input.amendmentType,
      createdAt: new Date().toISOString(),
      status: 'proposed',
      notes: '',
    };

    storageService.addAmendment(amendment);
    return amendment;
  }

  updateAmendment(id: string, updates: Partial<Amendment>): Amendment | null {
    const amendment = storageService.getAmendment(id);
    if (!amendment) return null;

    storageService.updateAmendment(id, updates);
    return storageService.getAmendment(id) || null;
  }

  approveAmendment(id: string): Amendment | null {
    const amendment = storageService.getAmendment(id);
    if (!amendment) return null;

    const rule = storageService.getRule(amendment.ruleId);
    if (!rule) return null;

    storageService.updateAmendment(id, { status: 'approved' });

    // Create version when amendment is approved
    this.createVersion(
      amendment.ruleId,
      `Amendment approved: ${amendment.title}`,
      id,
      rule
    );

    // Apply amendment modifications
    if (amendment.amendmentType === 'modification') {
      storageService.updateRule(amendment.ruleId, {
        notes: `${rule.notes}\n\nAmendment ${id} approved: ${amendment.description}`,
      });
    } else if (amendment.amendmentType === 'repeal') {
      storageService.updateRule(amendment.ruleId, { status: 'deprecated' });
    }

    return storageService.getAmendment(id) || null;
  }

  rejectAmendment(id: string): Amendment | null {
    const amendment = storageService.getAmendment(id);
    if (!amendment) return null;

    storageService.updateAmendment(id, { status: 'rejected' });
    return storageService.getAmendment(id) || null;
  }

  listAmendments(filter?: AmendmentsFilter): Amendment[] {
    let amendments = storageService.getAmendments();

    if (filter) {
      if (filter.ruleId) {
        amendments = amendments.filter((a: Amendment) => a.ruleId === filter.ruleId);
      }
      if (filter.status) {
        amendments = amendments.filter((a: Amendment) => a.status === filter.status);
      }
      if (filter.amendmentType) {
        amendments = amendments.filter((a: Amendment) => a.amendmentType === filter.amendmentType);
      }
    }

    return amendments;
  }

  getAmendment(id: string): Amendment | null {
    return storageService.getAmendment(id) || null;
  }

  // ============================================================================
  // ENFORCEMENT GROUP OPERATIONS
  // ============================================================================

  createEnforcementGroup(input: CreateEnforcementGroupInput): EnforcementGroup {
    const now = new Date().toISOString();
    const group: EnforcementGroup = {
      id: uuidv4(),
      name: input.name,
      description: input.description,
      roles: input.roles,
      agentIds: input.agentIds || [],
      tags: input.tags || [],
      notes: input.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    storageService.addEnforcementGroup(group);
    return group;
  }

  updateEnforcementGroup(id: string, updates: Partial<EnforcementGroup>): EnforcementGroup | null {
    const group = storageService.getEnforcementGroup(id);
    if (!group) return null;

    storageService.updateEnforcementGroup(id, updates);
    return storageService.getEnforcementGroup(id) || null;
  }

  listEnforcementGroups(): EnforcementGroup[] {
    return storageService.getEnforcementGroups();
  }

  getEnforcementGroup(id: string): EnforcementGroup | null {
    return storageService.getEnforcementGroup(id) || null;
  }

  // ============================================================================
  // TAG DEFINITION OPERATIONS
  // ============================================================================

  createTagDefinition(input: CreateTagDefinitionInput): GovTagDefinition {
    const now = new Date().toISOString();
    const tagDef: GovTagDefinition = {
      id: uuidv4(),
      tag: input.tag,
      description: input.description,
      applicableToTypes: input.applicableToTypes,
      notes: input.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    storageService.addTagDefinition(tagDef);
    return tagDef;
  }

  updateTagDefinition(id: string, updates: Partial<GovTagDefinition>): GovTagDefinition | null {
    const tagDef = storageService.getTagDefinition(id);
    if (!tagDef) return null;

    storageService.updateTagDefinition(id, updates);
    return storageService.getTagDefinition(id) || null;
  }

  listTagDefinitions(): GovTagDefinition[] {
    return storageService.getTagDefinitions();
  }

  getTagDefinition(id: string): GovTagDefinition | null {
    return storageService.getTagDefinition(id) || null;
  }

  // ============================================================================
  // RULE ATTACHMENT OPERATIONS
  // ============================================================================

  attachRule(input: CreateRuleAttachmentInput): RuleAttachment {
    const attachment: RuleAttachment = {
      id: uuidv4(),
      ruleId: input.ruleId,
      targetType: input.targetType,
      targetRef: input.targetRef,
      notes: input.notes || '',
      createdAt: new Date().toISOString(),
    };

    storageService.addRuleAttachment(attachment);
    return attachment;
  }

  removeRuleAttachment(id: string): void {
    storageService.deleteRuleAttachment(id);
  }

  getRuleAttachments(ruleId?: string): RuleAttachment[] {
    const attachments = storageService.getRuleAttachments();
    if (ruleId) {
      return attachments.filter((a: RuleAttachment) => a.ruleId === ruleId);
    }
    return attachments;
  }

  // ============================================================================
  // ENHANCEMENT 1: RULE RELATIONSHIPS & DEPENDENCIES
  // ============================================================================

  createRelationship(input: CreateRuleRelationshipInput): RuleRelationship {
    const relationship: RuleRelationship = {
      id: uuidv4(),
      sourceRuleId: input.sourceRuleId,
      targetRuleId: input.targetRuleId,
      relationshipType: input.relationshipType,
      notes: input.notes || '',
      createdAt: new Date().toISOString(),
    };

    storageService.addRelationship(relationship);
    return relationship;
  }

  listRelationships(filter?: RelationshipsFilter): RuleRelationship[] {
    let relationships = storageService.getRelationships();

    if (filter) {
      if (filter.sourceRuleId) {
        relationships = relationships.filter((r: RuleRelationship) => r.sourceRuleId === filter.sourceRuleId);
      }
      if (filter.targetRuleId) {
        relationships = relationships.filter((r: RuleRelationship) => r.targetRuleId === filter.targetRuleId);
      }
      if (filter.relationshipType) {
        relationships = relationships.filter((r: RuleRelationship) => r.relationshipType === filter.relationshipType);
      }
    }

    return relationships;
  }

  deleteRelationship(id: string): void {
    storageService.deleteRelationship(id);
  }

  // ============================================================================
  // ENHANCEMENT 2: CONFLICT DETECTION ENGINE
  // ============================================================================

  detectRuleConflicts(): ConflictReport[] {
    const rules = storageService.getRules().filter((r: GovRule) => r.status === 'active');
    const conflicts: ConflictReport[] = [];

    // Clear old conflicts
    storageService.clearConflicts();

    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const rule1 = rules[i];
        const rule2 = rules[j];

        // Check for mandate vs prohibition conflicts
        if (
          (rule1.ruleType === 'mandate' && rule2.ruleType === 'prohibition') ||
          (rule1.ruleType === 'prohibition' && rule2.ruleType === 'mandate')
        ) {
          const hasOverlap = rule1.appliesToTypes.some((type: string) => 
            rule2.appliesToTypes.includes(type)
          );

          if (hasOverlap) {
            const conflict: ConflictReport = {
              id: uuidv4(),
              conflictType: 'mandate-prohibition',
              severity: 'critical',
              rule1,
              rule2,
              description: `Rule "${rule1.name}" mandates actions that "${rule2.name}" prohibits.`,
              detectedAt: new Date().toISOString(),
            };
            conflicts.push(conflict);
            storageService.addConflict(conflict);
          }
        }

        // Check for restriction conflicts
        if (rule1.ruleType === 'restriction' && rule2.ruleType === 'restriction') {
          const hasOverlap = rule1.appliesToTypes.some((type: string) => 
            rule2.appliesToTypes.includes(type)
          );

          if (hasOverlap && rule1.description.toLowerCase().includes('must') && 
              rule2.description.toLowerCase().includes('cannot')) {
            const conflict: ConflictReport = {
              id: uuidv4(),
              conflictType: 'restriction-restriction',
              severity: 'high',
              rule1,
              rule2,
              description: `Restrictions in "${rule1.name}" and "${rule2.name}" may conflict.`,
              detectedAt: new Date().toISOString(),
            };
            conflicts.push(conflict);
            storageService.addConflict(conflict);
          }
        }
      }
    }

    return conflicts;
  }

  getConflicts(): ConflictReport[] {
    return storageService.getConflicts();
  }

  deleteConflict(id: string): void {
    storageService.deleteConflict(id);
  }

  // ============================================================================
  // ENHANCEMENT 4: RULE TEMPLATES & PATTERNS
  // ============================================================================

  createTemplate(input: CreateRuleTemplateInput): RuleTemplate {
    const now = new Date().toISOString();
    const template: RuleTemplate = {
      id: uuidv4(),
      name: input.name,
      category: input.category,
      description: input.description,
      templateFields: input.templateFields,
      generatedRulePattern: input.generatedRulePattern,
      createdAt: now,
      updatedAt: now,
    };

    storageService.addTemplate(template);
    return template;
  }

  listTemplates(): RuleTemplate[] {
    return storageService.getTemplates();
  }

  getTemplate(id: string): RuleTemplate | null {
    return storageService.getTemplate(id) || null;
  }

  updateTemplate(id: string, updates: Partial<RuleTemplate>): RuleTemplate | null {
    const template = storageService.getTemplate(id);
    if (!template) return null;

    storageService.updateTemplate(id, updates);
    return storageService.getTemplate(id) || null;
  }

  deleteTemplate(id: string): void {
    storageService.deleteTemplate(id);
  }

  // ============================================================================
  // ENHANCEMENT 5: IMPACT ANALYSIS
  // ============================================================================

  analyzeRuleImpact(ruleId: string): ImpactReport | null {
    const rule = storageService.getRule(ruleId);
    if (!rule) return null;

    const attachments = storageService.getRuleAttachments().filter(
      (a: RuleAttachment) => a.ruleId === ruleId
    );

    const relationships = storageService.getRelationships();
    const relatedRelationships = relationships.filter(
      (r: RuleRelationship) => r.sourceRuleId === ruleId || r.targetRuleId === ruleId
    );

    const dependentRuleIds = relatedRelationships
      .filter((r: RuleRelationship) => r.relationshipType === 'depends-on' && r.targetRuleId === ruleId)
      .map((r: RuleRelationship) => r.sourceRuleId);

    const dependentRules = storageService.getRules().filter((r: GovRule) => 
      dependentRuleIds.includes(r.id)
    );

    const enforcementGroups = storageService.getEnforcementGroups().filter((group: EnforcementGroup) =>
      group.tags.some((tag: string) => rule.tags.includes(tag)) ||
      group.name.toLowerCase().includes(rule.category.toLowerCase())
    );

    let disruptionLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (rule.severity === 'critical' || dependentRules.length > 5) {
      disruptionLevel = 'critical';
    } else if (rule.severity === 'high' || dependentRules.length > 2) {
      disruptionLevel = 'high';
    } else if (attachments.length > 5 || dependentRules.length > 0) {
      disruptionLevel = 'medium';
    }

    const impactSummary = `Rule "${rule.name}" affects ${attachments.length} target(s), has ${relatedRelationships.length} relationship(s), and ${dependentRules.length} dependent rule(s). Estimated disruption: ${disruptionLevel}.`;

    return {
      ruleId,
      rule,
      affectedTargets: attachments,
      dependentRules,
      relatedRelationships,
      enforcementGroups,
      estimatedDisruptionLevel: disruptionLevel,
      impactSummary,
    };
  }

  // ============================================================================
  // ENHANCEMENT 8: RULE CITATION SYSTEM
  // ============================================================================

  createCitation(input: CreateRuleCitationInput): RuleCitation {
    const citation: RuleCitation = {
      id: uuidv4(),
      citingRuleId: input.citingRuleId,
      citedRuleId: input.citedRuleId,
      citationType: input.citationType,
      citationText: input.citationText,
      createdAt: new Date().toISOString(),
    };

    storageService.addCitation(citation);
    return citation;
  }

  listCitations(ruleId?: string): RuleCitation[] {
    const citations = storageService.getCitations();
    if (ruleId) {
      return citations.filter(
        (c: RuleCitation) => c.citingRuleId === ruleId || c.citedRuleId === ruleId
      );
    }
    return citations;
  }

  deleteCitation(id: string): void {
    storageService.deleteCitation(id);
  }

  // ============================================================================
  // ENHANCEMENT 11: RULE DISCUSSION THREADS
  // ============================================================================

  createComment(input: CreateRuleCommentInput): RuleComment {
    const comment: RuleComment = {
      id: uuidv4(),
      ruleId: input.ruleId,
      author: input.author,
      commentType: input.commentType,
      text: input.text,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    storageService.addComment(comment);
    return comment;
  }

  listComments(filter?: CommentsFilter): RuleComment[] {
    let comments = storageService.getComments();

    if (filter) {
      if (filter.ruleId) {
        comments = comments.filter((c: RuleComment) => c.ruleId === filter.ruleId);
      }
      if (filter.author) {
        comments = comments.filter((c: RuleComment) => c.author === filter.author);
      }
      if (filter.commentType) {
        comments = comments.filter((c: RuleComment) => c.commentType === filter.commentType);
      }
      if (filter.resolved !== undefined) {
        comments = comments.filter((c: RuleComment) => c.resolved === filter.resolved);
      }
    }

    return comments;
  }

  updateComment(id: string, updates: Partial<RuleComment>): RuleComment | null {
    const comment = storageService.getComment(id);
    if (!comment) return null;

    storageService.updateComment(id, updates);
    return storageService.getComment(id) || null;
  }

  deleteComment(id: string): void {
    storageService.deleteComment(id);
  }

  // ============================================================================
  // ENHANCEMENT 12: ENFORCEMENT INCIDENT LOGGING
  // ============================================================================

  createIncident(input: CreateEnforcementIncidentInput): EnforcementIncident {
    const incident: EnforcementIncident = {
      id: uuidv4(),
      ruleId: input.ruleId,
      targetType: input.targetType,
      targetRef: input.targetRef,
      incidentType: input.incidentType,
      description: input.description,
      enforcementGroupId: input.enforcementGroupId,
      resolution: input.resolution,
      timestamp: new Date().toISOString(),
    };

    storageService.addIncident(incident);
    return incident;
  }

  listIncidents(filter?: IncidentsFilter): EnforcementIncident[] {
    let incidents = storageService.getIncidents();

    if (filter) {
      if (filter.ruleId) {
        incidents = incidents.filter((i: EnforcementIncident) => i.ruleId === filter.ruleId);
      }
      if (filter.targetType) {
        incidents = incidents.filter((i: EnforcementIncident) => i.targetType === filter.targetType);
      }
      if (filter.incidentType) {
        incidents = incidents.filter((i: EnforcementIncident) => i.incidentType === filter.incidentType);
      }
      if (filter.enforcementGroupId) {
        incidents = incidents.filter((i: EnforcementIncident) => i.enforcementGroupId === filter.enforcementGroupId);
      }
    }

    return incidents;
  }

  updateIncident(id: string, updates: Partial<EnforcementIncident>): EnforcementIncident | null {
    const incident = storageService.getIncident(id);
    if (!incident) return null;

    storageService.updateIncident(id, updates);
    return storageService.getIncident(id) || null;
  }

  deleteIncident(id: string): void {
    storageService.deleteIncident(id);
  }

  // ============================================================================
  // ENHANCEMENT 14: RULE VERSIONING & CHANGELOG
  // ============================================================================

  private createVersion(
    ruleId: string,
    changes: string,
    changedBy: string,
    snapshot: Partial<GovRule>
  ): void {
    const versions = storageService.getVersions().filter((v: RuleVersion) => v.ruleId === ruleId);
    const version: RuleVersion = {
      id: uuidv4(),
      ruleId,
      version: versions.length + 1,
      changes,
      changedBy,
      timestamp: new Date().toISOString(),
      snapshot,
    };

    storageService.addVersion(version);
  }

  getRuleVersions(ruleId: string): RuleVersion[] {
    return storageService.getVersions().filter((v: RuleVersion) => v.ruleId === ruleId);
  }

  getRuleChangelog(ruleId: string): string {
    const versions = this.getRuleVersions(ruleId);
    
    let changelog = `=== RULE CHANGELOG: ${ruleId} ===\n\n`;
    
    versions.forEach((version: RuleVersion) => {
      changelog += `Version ${version.version} - ${version.timestamp}\n`;
      changelog += `Changed by: ${version.changedBy}\n`;
      changelog += `Changes: ${version.changes}\n`;
      changelog += '─'.repeat(60) + '\n\n';
    });

    return changelog;
  }

  // ============================================================================
  // ENHANCEMENT 9: GOVERNANCE METRICS DASHBOARD
  // ============================================================================

  getGovernanceMetrics(): GovernanceMetrics {
    const rules = storageService.getRules();
    const amendments = storageService.getAmendments();
    const relationships = storageService.getRelationships();
    const incidents = storageService.getIncidents();
    const conflicts = storageService.getConflicts();
    const attachments = storageService.getRuleAttachments();

    const rulesByCategory: Record<string, number> = {};
    const rulesBySeverity: Record<string, number> = {};
    const rulesByStatus: Record<string, number> = {};

    let totalPrecedence = 0;

    rules.forEach((rule: GovRule) => {
      rulesByCategory[rule.category] = (rulesByCategory[rule.category] || 0) + 1;
      rulesBySeverity[rule.severity] = (rulesBySeverity[rule.severity] || 0) + 1;
      rulesByStatus[rule.status] = (rulesByStatus[rule.status] || 0) + 1;
      totalPrecedence += rule.precedenceLevel;
    });

    const activeAmendments = amendments.filter((a: Amendment) => a.status === 'proposed').length;
    const approvedAmendments = amendments.filter((a: Amendment) => a.status === 'approved').length;
    const totalAmendments = amendments.length;
    const amendmentApprovalRate = totalAmendments > 0 
      ? Math.round((approvedAmendments / totalAmendments) * 100) / 100
      : 0;

    // Most attached rules
    const attachmentCounts = new Map<string, number>();
    attachments.forEach((att: RuleAttachment) => {
      attachmentCounts.set(att.ruleId, (attachmentCounts.get(att.ruleId) || 0) + 1);
    });

    const mostAttached = Array.from(attachmentCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ruleId, count]) => {
        const rule = storageService.getRule(ruleId);
        return rule ? { rule, attachmentCount: count } : null;
      })
      .filter((item): item is { rule: GovRule; attachmentCount: number } => item !== null);

    // Orphaned rules (no attachments)
    const attachedRuleIds = new Set(attachments.map((att: RuleAttachment) => att.ruleId));
    const orphanedRules = rules.filter((rule: GovRule) => !attachedRuleIds.has(rule.id));

    return {
      totalRules: rules.length,
      rulesByCategory,
      rulesBySeverity,
      rulesByStatus,
      activeAmendments,
      amendmentApprovalRate,
      mostAttachedRules: mostAttached,
      orphanedRules,
      conflictingRules: conflicts.length,
      totalRelationships: relationships.length,
      totalIncidents: incidents.length,
      averagePrecedenceLevel: rules.length > 0 ? Math.round((totalPrecedence / rules.length) * 10) / 10 : 0,
    };
  }

  // ============================================================================
  // GOVERNANCE AUDIT
  // ============================================================================

  runGovernanceAudit(targetType: TargetType, targetRef: string): AuditReport {
    const attachments = storageService.getRuleAttachments()
      .filter((a: RuleAttachment) => a.targetType === targetType && a.targetRef === targetRef);

    const ruleIds = attachments.map((a: RuleAttachment) => a.ruleId);
    const rules = storageService.getRules().filter((r: GovRule) => ruleIds.includes(r.id));

    const activeRules = rules.filter((r: GovRule) => r.status === 'active');
    const recommendations = activeRules.filter((r: GovRule) => r.ruleType === 'recommendation');
    const restrictions = activeRules.filter((r: GovRule) => r.ruleType === 'restriction');
    const mandates = activeRules.filter((r: GovRule) => r.ruleType === 'mandate');
    const deprecatedRules = rules.filter((r: GovRule) => r.status === 'deprecated' || r.status === 'superseded');

    const allAmendments = storageService.getAmendments();
    const relatedAmendments = allAmendments.filter((a: Amendment) => 
      ruleIds.includes(a.ruleId) && a.status === 'proposed'
    );

    const summary = this.generateAuditSummary(activeRules, recommendations, restrictions, mandates, deprecatedRules);

    return {
      targetType,
      targetRef,
      activeRules,
      recommendations,
      restrictions,
      mandates,
      deprecatedRules,
      relatedAmendments,
      summary,
    };
  }

  private generateAuditSummary(
    activeRules: GovRule[],
    recommendations: GovRule[],
    restrictions: GovRule[],
    mandates: GovRule[],
    deprecatedRules: GovRule[]
  ): string {
    let summary = '=== GOVERNANCE AUDIT SUMMARY ===\n\n';

    summary += `Total Active Rules: ${activeRules.length}\n`;
    summary += `Recommendations: ${recommendations.length}\n`;
    summary += `Restrictions: ${restrictions.length}\n`;
    summary += `Mandates: ${mandates.length}\n`;
    summary += `Deprecated/Superseded: ${deprecatedRules.length}\n\n`;

    if (restrictions.length > 0) {
      summary += '🚫 RESTRICTIONS:\n';
      restrictions.forEach((r: GovRule) => {
        summary += `  - ${r.name} (${r.code}): ${r.description}\n`;
      });
      summary += '\n';
    }

    if (mandates.length > 0) {
      summary += '✅ MANDATES:\n';
      mandates.forEach((r: GovRule) => {
        summary += `  - ${r.name} (${r.code}): ${r.description}\n`;
      });
      summary += '\n';
    }

    if (recommendations.length > 0) {
      summary += '💡 RECOMMENDATIONS:\n';
      recommendations.forEach((r: GovRule) => {
        summary += `  - ${r.name} (${r.code}): ${r.description}\n`;
      });
      summary += '\n';
    }

    return summary;
  }

  // ============================================================================
  // GOVERNANCE MAP GENERATION
  // ============================================================================

  generateGovernanceMap(): string {
    const rules = storageService.getRules();
    const categories = ['culture', 'drops', 'ops', 'social', 'agents', 'pickleball', 'meta', 'world', 'other'];
    
    let map = '╔════════════════════════════════════════════════════════════════╗\n';
    map += '║         DREAMNET GOVERNANCE MAP - COMPLETE CODEX              ║\n';
    map += '╚════════════════════════════════════════════════════════════════╝\n\n';

    categories.forEach((category: string) => {
      const categoryRules = rules.filter((r: GovRule) => r.category === category && r.status === 'active');
      
      if (categoryRules.length > 0) {
        map += `\n${'═'.repeat(60)}\n`;
        map += `${category.toUpperCase()} GOVERNANCE\n`;
        map += `${'═'.repeat(60)}\n\n`;

        const ruleTypes = ['principle', 'policy', 'mandate', 'restriction', 'prohibition', 'recommendation'];
        
        ruleTypes.forEach((type: string) => {
          const typeRules = categoryRules.filter((r: GovRule) => r.ruleType === type);
          
          if (typeRules.length > 0) {
            map += `  ${type.toUpperCase()}S:\n`;
            typeRules.forEach((r: GovRule) => {
              map += `    • ${r.name} (${r.code})\n`;
              map += `      ${r.description}\n`;
              map += `      Severity: ${r.severity} | Enforcement: ${r.enforcementStyle}\n\n`;
            });
          }
        });
      }
    });

    return map;
  }

  // ============================================================================
  // ENHANCEMENT 13: MULTI-FORMAT EXPORT
  // ============================================================================

  exportConstitution(format: ExportFormat = 'text'): string {
    const content = this.exportDreamNetConstitution();
    
    switch (format) {
      case 'json':
        return JSON.stringify({
          type: 'DreamNet Constitution',
          version: '1.0',
          generated: new Date().toISOString(),
          content,
          rules: storageService.getRules(),
          enforcementGroups: storageService.getEnforcementGroups(),
          tagDefinitions: storageService.getTagDefinitions(),
        }, null, 2);
      
      case 'markdown':
        return content.replace(/╔|╚|═|║/g, '').replace(/─/g, '-');
      
      case 'yaml':
        const yamlContent = `
type: "DreamNet Constitution"
version: "1.0"
generated: "${new Date().toISOString()}"
content: |
${content.split('\n').map((line: string) => '  ' + line).join('\n')}
`;
        return yamlContent;
      
      default:
        return content;
    }
  }

  exportPolicies(format: ExportFormat = 'text'): string {
    const content = this.exportGovernancePolicies();
    
    switch (format) {
      case 'json':
        return JSON.stringify({
          type: 'DreamNet Policy Book',
          generated: new Date().toISOString(),
          content,
          policies: storageService.getRules().filter((r: GovRule) => 
            r.ruleType === 'policy' || r.ruleType === 'mandate'
          ),
        }, null, 2);
      
      case 'markdown':
        return content.replace(/╔|╚|═|║/g, '').replace(/─/g, '-');
      
      default:
        return content;
    }
  }

  // ============================================================================
  // CONSTITUTION EXPORT
  // ============================================================================

  exportDreamNetConstitution(): string {
    const rules = storageService.getRules().filter((r: GovRule) => r.status === 'active');
    const tagDefinitions = storageService.getTagDefinitions();
    const enforcementGroups = storageService.getEnforcementGroups();

    let constitution = '╔════════════════════════════════════════════════════════════════╗\n';
    constitution += '║                                                                ║\n';
    constitution += '║              THE DREAMNET CONSTITUTION v1.0                    ║\n';
    constitution += '║                                                                ║\n';
    constitution += '║           The Foundational Law of the DreamNet Realm          ║\n';
    constitution += '║                                                                ║\n';
    constitution += '╚════════════════════════════════════════════════════════════════╝\n\n';

    constitution += 'PREAMBLE\n';
    constitution += '═'.repeat(60) + '\n\n';
    constitution += 'We, the architects and citizens of DreamNet, establish this Constitution\n';
    constitution += 'to define the principles, policies, and operational frameworks that govern\n';
    constitution += 'our digital realm. This document serves as the supreme law, guiding all\n';
    constitution += 'agents, flows, territories, and cultural expressions within the ecosystem.\n\n';
    constitution += `Ratified: ${new Date().toISOString()}\n`;
    constitution += `Total Active Rules: ${rules.length}\n`;
    constitution += `Enforcement Groups: ${enforcementGroups.length}\n`;
    constitution += `Governance Tags: ${tagDefinitions.length}\n\n\n`;

    constitution += 'ARTICLE I: FOUNDATIONAL PRINCIPLES\n';
    constitution += '═'.repeat(60) + '\n\n';
    const principles = rules.filter((r: GovRule) => r.ruleType === 'principle');
    principles.forEach((r: GovRule, i: number) => {
      constitution += `Section ${i + 1}: ${r.name} (${r.code})\n`;
      constitution += `${r.description}\n`;
      constitution += `Category: ${r.category} | Severity: ${r.severity}\n\n`;
    });

    constitution += '\n\nARTICLE II: OPERATIONAL POLICIES\n';
    constitution += '═'.repeat(60) + '\n\n';
    const categories = ['culture', 'drops', 'ops', 'social', 'agents', 'pickleball', 'meta', 'world', 'other'];
    
    categories.forEach((category: string) => {
      const categoryRules = rules.filter((r: GovRule) => r.category === category && r.ruleType === 'policy');
      
      if (categoryRules.length > 0) {
        constitution += `\n${category.toUpperCase()} POLICIES:\n\n`;
        categoryRules.forEach((r: GovRule) => {
          constitution += `  • ${r.name} (${r.code})\n`;
          constitution += `    ${r.description}\n`;
          constitution += `    Enforcement: ${r.enforcementStyle} | Severity: ${r.severity}\n\n`;
        });
      }
    });

    constitution += '\n\nARTICLE III: MANDATES & RESTRICTIONS\n';
    constitution += '═'.repeat(60) + '\n\n';
    
    constitution += 'MANDATES (Required Actions):\n\n';
    const mandates = rules.filter((r: GovRule) => r.ruleType === 'mandate');
    mandates.forEach((r: GovRule) => {
      constitution += `  ✓ ${r.name} (${r.code})\n`;
      constitution += `    ${r.description}\n`;
      constitution += `    Applies to: ${r.appliesToTypes.join(', ')}\n\n`;
    });

    constitution += '\nRESTRICTIONS (Limitations):\n\n';
    const restrictions = rules.filter((r: GovRule) => r.ruleType === 'restriction');
    restrictions.forEach((r: GovRule) => {
      constitution += `  ⊗ ${r.name} (${r.code})\n`;
      constitution += `    ${r.description}\n`;
      constitution += `    Applies to: ${r.appliesToTypes.join(', ')}\n\n`;
    });

    constitution += '\nPROHIBITIONS (Forbidden Actions):\n\n';
    const prohibitions = rules.filter((r: GovRule) => r.ruleType === 'prohibition');
    prohibitions.forEach((r: GovRule) => {
      constitution += `  ✕ ${r.name} (${r.code})\n`;
      constitution += `    ${r.description}\n`;
      constitution += `    Severity: ${r.severity}\n\n`;
    });

    constitution += '\n\nARTICLE IV: ENFORCEMENT STRUCTURE\n';
    constitution += '═'.repeat(60) + '\n\n';
    
    enforcementGroups.forEach((group: EnforcementGroup) => {
      constitution += `${group.name.toUpperCase()}\n`;
      constitution += `  ${group.description}\n`;
      constitution += `  Roles: ${group.roles.join(', ')}\n`;
      constitution += `  Agent Count: ${group.agentIds.length}\n\n`;
    });

    constitution += '\n\nAPPENDIX A: GOVERNANCE TAG REGISTRY\n';
    constitution += '═'.repeat(60) + '\n\n';
    
    tagDefinitions.forEach((tag: GovTagDefinition) => {
      constitution += `[${tag.tag}]\n`;
      constitution += `  ${tag.description}\n`;
      constitution += `  Applicable to: ${tag.applicableToTypes.join(', ')}\n\n`;
    });

    constitution += '\n\nAPPENDIX B: RULE SUMMARY BY CATEGORY\n';
    constitution += '═'.repeat(60) + '\n\n';
    
    categories.forEach((category: string) => {
      const count = rules.filter((r: GovRule) => r.category === category).length;
      constitution += `${category.toUpperCase()}: ${count} rules\n`;
    });

    constitution += '\n\n' + '═'.repeat(60) + '\n';
    constitution += 'END OF CONSTITUTION\n';
    constitution += '═'.repeat(60) + '\n';

    return constitution;
  }

  exportGovernancePolicies(): string {
    const rules = storageService.getRules().filter((r: GovRule) => r.status === 'active');
    const policies = rules.filter((r: GovRule) => r.ruleType === 'policy' || r.ruleType === 'mandate');
    const enforcementGroups = storageService.getEnforcementGroups();

    let doc = '╔════════════════════════════════════════════════════════════════╗\n';
    doc += '║                                                                ║\n';
    doc += '║         DREAMNET OPERATIONAL POLICY BOOK                      ║\n';
    doc += '║                                                                ║\n';
    doc += '╚════════════════════════════════════════════════════════════════╝\n\n';

    doc += `Generated: ${new Date().toISOString()}\n`;
    doc += `Total Operational Policies: ${policies.length}\n\n\n`;

    doc += 'POLICY INDEX\n';
    doc += '═'.repeat(60) + '\n\n';
    
    policies.forEach((p: GovRule, i: number) => {
      doc += `${i + 1}. ${p.name} (${p.code}) - ${p.category}\n`;
    });

    doc += '\n\n';
    doc += 'DETAILED POLICY SPECIFICATIONS\n';
    doc += '═'.repeat(60) + '\n\n';

    policies.forEach((policy: GovRule, i: number) => {
      doc += `\nPOLICY ${i + 1}: ${policy.name}\n`;
      doc += '─'.repeat(60) + '\n';
      doc += `Code: ${policy.code}\n`;
      doc += `Category: ${policy.category}\n`;
      doc += `Type: ${policy.ruleType}\n`;
      doc += `Severity: ${policy.severity}\n`;
      doc += `Enforcement Style: ${policy.enforcementStyle}\n\n`;
      doc += `Description:\n${policy.description}\n\n`;
      doc += `Applies To Types: ${policy.appliesToTypes.join(', ')}\n`;
      
      if (policy.appliesToRefs.length > 0) {
        doc += `Applies To Refs: ${policy.appliesToRefs.join(', ')}\n`;
      }

      const responsibleGroups = enforcementGroups.filter((group: EnforcementGroup) => 
        group.tags.some((tag: string) => policy.tags.includes(tag)) ||
        policy.category === 'culture' && group.name.toLowerCase().includes('culture') ||
        policy.category === 'drops' && group.name.toLowerCase().includes('drop') ||
        policy.category === 'ops' && group.name.toLowerCase().includes('ops')
      );

      if (responsibleGroups.length > 0) {
        doc += `\nResponsible Enforcement Groups:\n`;
        responsibleGroups.forEach((group: EnforcementGroup) => {
          doc += `  - ${group.name}\n`;
        });
      }

      if (policy.notes) {
        doc += `\nNotes:\n${policy.notes}\n`;
      }

      doc += '\n';
    });

    doc += '\n' + '═'.repeat(60) + '\n';
    doc += 'END OF POLICY BOOK\n';
    doc += '═'.repeat(60) + '\n';

    return doc;
  }
}

export const enhancedGovernanceService = new EnhancedGovernanceService();
