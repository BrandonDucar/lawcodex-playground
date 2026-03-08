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
} from '@/types/governance';
import { storageService } from './storage.service';

export class GovernanceService {
  // Rule Operations
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
    };

    storageService.addRule(rule);
    return rule;
  }

  updateGovRule(id: string, updates: UpdateGovRuleInput): GovRule | null {
    const rule = storageService.getRule(id);
    if (!rule) return null;

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
    }

    return rules;
  }

  deleteGovRule(id: string): void {
    storageService.deleteRule(id);
  }

  // Amendment Operations
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

    storageService.updateAmendment(id, { status: 'approved' });

    // Apply amendment modifications to the rule if it's a modification type
    if (amendment.amendmentType === 'modification') {
      const rule = storageService.getRule(amendment.ruleId);
      if (rule) {
        storageService.updateRule(amendment.ruleId, {
          notes: `${rule.notes}\n\nAmendment ${id} approved: ${amendment.description}`,
        });
      }
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

  // Enforcement Group Operations
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

  // Tag Definition Operations
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

  // Rule Attachment Operations
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

  // Governance Audit
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

  // Governance Map Generation
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

  // Constitution Export
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

  // Governance Policies Export
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

      // Find responsible enforcement groups
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

export const governanceService = new GovernanceService();
