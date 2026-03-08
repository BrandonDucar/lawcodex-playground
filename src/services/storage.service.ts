import type { 
  GovRule, 
  Amendment, 
  EnforcementGroup, 
  GovTagDefinition, 
  RuleAttachment,
  GovernanceVote,
  RuleRelationship,
  RuleTemplate,
  RuleCitation,
  RuleComment,
  EnforcementIncident,
  RuleVersion,
  ConflictReport
} from '@/types/governance';

const STORAGE_KEYS = {
  RULES: 'dreamnet_gov_rules',
  AMENDMENTS: 'dreamnet_gov_amendments',
  ENFORCEMENT_GROUPS: 'dreamnet_gov_enforcement_groups',
  TAG_DEFINITIONS: 'dreamnet_gov_tag_definitions',
  RULE_ATTACHMENTS: 'dreamnet_gov_rule_attachments',
  VOTES: 'dreamnet_gov_votes',
  RELATIONSHIPS: 'dreamnet_gov_relationships',
  TEMPLATES: 'dreamnet_gov_templates',
  CITATIONS: 'dreamnet_gov_citations',
  COMMENTS: 'dreamnet_gov_comments',
  INCIDENTS: 'dreamnet_gov_incidents',
  VERSIONS: 'dreamnet_gov_versions',
  CONFLICTS: 'dreamnet_gov_conflicts',
} as const;

export class StorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private getItem<T>(key: string): T[] {
    if (!this.isBrowser()) return [];
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return [];
    }
  }

  private setItem<T>(key: string, value: T[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  }

  // GovRules
  getRules(): GovRule[] {
    return this.getItem<GovRule>(STORAGE_KEYS.RULES);
  }

  saveRules(rules: GovRule[]): void {
    this.setItem(STORAGE_KEYS.RULES, rules);
  }

  getRule(id: string): GovRule | undefined {
    return this.getRules().find((rule: GovRule) => rule.id === id);
  }

  addRule(rule: GovRule): void {
    const rules = this.getRules();
    rules.push(rule);
    this.saveRules(rules);
  }

  updateRule(id: string, updates: Partial<GovRule>): void {
    const rules = this.getRules();
    const index = rules.findIndex((rule: GovRule) => rule.id === id);
    if (index !== -1) {
      rules[index] = { ...rules[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveRules(rules);
    }
  }

  deleteRule(id: string): void {
    const rules = this.getRules().filter((rule: GovRule) => rule.id !== id);
    this.saveRules(rules);
  }

  // Amendments
  getAmendments(): Amendment[] {
    return this.getItem<Amendment>(STORAGE_KEYS.AMENDMENTS);
  }

  saveAmendments(amendments: Amendment[]): void {
    this.setItem(STORAGE_KEYS.AMENDMENTS, amendments);
  }

  getAmendment(id: string): Amendment | undefined {
    return this.getAmendments().find((amendment: Amendment) => amendment.id === id);
  }

  addAmendment(amendment: Amendment): void {
    const amendments = this.getAmendments();
    amendments.push(amendment);
    this.saveAmendments(amendments);
  }

  updateAmendment(id: string, updates: Partial<Amendment>): void {
    const amendments = this.getAmendments();
    const index = amendments.findIndex((amendment: Amendment) => amendment.id === id);
    if (index !== -1) {
      amendments[index] = { ...amendments[index], ...updates };
      this.saveAmendments(amendments);
    }
  }

  deleteAmendment(id: string): void {
    const amendments = this.getAmendments().filter((amendment: Amendment) => amendment.id !== id);
    this.saveAmendments(amendments);
  }

  // Enforcement Groups
  getEnforcementGroups(): EnforcementGroup[] {
    return this.getItem<EnforcementGroup>(STORAGE_KEYS.ENFORCEMENT_GROUPS);
  }

  saveEnforcementGroups(groups: EnforcementGroup[]): void {
    this.setItem(STORAGE_KEYS.ENFORCEMENT_GROUPS, groups);
  }

  getEnforcementGroup(id: string): EnforcementGroup | undefined {
    return this.getEnforcementGroups().find((group: EnforcementGroup) => group.id === id);
  }

  addEnforcementGroup(group: EnforcementGroup): void {
    const groups = this.getEnforcementGroups();
    groups.push(group);
    this.saveEnforcementGroups(groups);
  }

  updateEnforcementGroup(id: string, updates: Partial<EnforcementGroup>): void {
    const groups = this.getEnforcementGroups();
    const index = groups.findIndex((group: EnforcementGroup) => group.id === id);
    if (index !== -1) {
      groups[index] = { ...groups[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveEnforcementGroups(groups);
    }
  }

  deleteEnforcementGroup(id: string): void {
    const groups = this.getEnforcementGroups().filter((group: EnforcementGroup) => group.id !== id);
    this.saveEnforcementGroups(groups);
  }

  // Tag Definitions
  getTagDefinitions(): GovTagDefinition[] {
    return this.getItem<GovTagDefinition>(STORAGE_KEYS.TAG_DEFINITIONS);
  }

  saveTagDefinitions(tags: GovTagDefinition[]): void {
    this.setItem(STORAGE_KEYS.TAG_DEFINITIONS, tags);
  }

  getTagDefinition(id: string): GovTagDefinition | undefined {
    return this.getTagDefinitions().find((tag: GovTagDefinition) => tag.id === id);
  }

  addTagDefinition(tag: GovTagDefinition): void {
    const tags = this.getTagDefinitions();
    tags.push(tag);
    this.saveTagDefinitions(tags);
  }

  updateTagDefinition(id: string, updates: Partial<GovTagDefinition>): void {
    const tags = this.getTagDefinitions();
    const index = tags.findIndex((tag: GovTagDefinition) => tag.id === id);
    if (index !== -1) {
      tags[index] = { ...tags[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveTagDefinitions(tags);
    }
  }

  deleteTagDefinition(id: string): void {
    const tags = this.getTagDefinitions().filter((tag: GovTagDefinition) => tag.id !== id);
    this.saveTagDefinitions(tags);
  }

  // Rule Attachments
  getRuleAttachments(): RuleAttachment[] {
    return this.getItem<RuleAttachment>(STORAGE_KEYS.RULE_ATTACHMENTS);
  }

  saveRuleAttachments(attachments: RuleAttachment[]): void {
    this.setItem(STORAGE_KEYS.RULE_ATTACHMENTS, attachments);
  }

  getRuleAttachment(id: string): RuleAttachment | undefined {
    return this.getRuleAttachments().find((attachment: RuleAttachment) => attachment.id === id);
  }

  addRuleAttachment(attachment: RuleAttachment): void {
    const attachments = this.getRuleAttachments();
    attachments.push(attachment);
    this.saveRuleAttachments(attachments);
  }

  updateRuleAttachment(id: string, updates: Partial<RuleAttachment>): void {
    const attachments = this.getRuleAttachments();
    const index = attachments.findIndex((attachment: RuleAttachment) => attachment.id === id);
    if (index !== -1) {
      attachments[index] = { ...attachments[index], ...updates };
      this.saveRuleAttachments(attachments);
    }
  }

  deleteRuleAttachment(id: string): void {
    const attachments = this.getRuleAttachments().filter((attachment: RuleAttachment) => attachment.id !== id);
    this.saveRuleAttachments(attachments);
  }

  // Votes
  getVotes(): GovernanceVote[] {
    return this.getItem<GovernanceVote>(STORAGE_KEYS.VOTES);
  }

  saveVotes(votes: GovernanceVote[]): void {
    this.setItem(STORAGE_KEYS.VOTES, votes);
  }

  addVote(vote: GovernanceVote): void {
    const votes = this.getVotes();
    votes.push(vote);
    this.saveVotes(votes);
  }

  // Rule Relationships
  getRelationships(): RuleRelationship[] {
    return this.getItem<RuleRelationship>(STORAGE_KEYS.RELATIONSHIPS);
  }

  saveRelationships(relationships: RuleRelationship[]): void {
    this.setItem(STORAGE_KEYS.RELATIONSHIPS, relationships);
  }

  getRelationship(id: string): RuleRelationship | undefined {
    return this.getRelationships().find((rel: RuleRelationship) => rel.id === id);
  }

  addRelationship(relationship: RuleRelationship): void {
    const relationships = this.getRelationships();
    relationships.push(relationship);
    this.saveRelationships(relationships);
  }

  deleteRelationship(id: string): void {
    const relationships = this.getRelationships().filter((rel: RuleRelationship) => rel.id !== id);
    this.saveRelationships(relationships);
  }

  // Rule Templates
  getTemplates(): RuleTemplate[] {
    return this.getItem<RuleTemplate>(STORAGE_KEYS.TEMPLATES);
  }

  saveTemplates(templates: RuleTemplate[]): void {
    this.setItem(STORAGE_KEYS.TEMPLATES, templates);
  }

  getTemplate(id: string): RuleTemplate | undefined {
    return this.getTemplates().find((template: RuleTemplate) => template.id === id);
  }

  addTemplate(template: RuleTemplate): void {
    const templates = this.getTemplates();
    templates.push(template);
    this.saveTemplates(templates);
  }

  updateTemplate(id: string, updates: Partial<RuleTemplate>): void {
    const templates = this.getTemplates();
    const index = templates.findIndex((template: RuleTemplate) => template.id === id);
    if (index !== -1) {
      templates[index] = { ...templates[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveTemplates(templates);
    }
  }

  deleteTemplate(id: string): void {
    const templates = this.getTemplates().filter((template: RuleTemplate) => template.id !== id);
    this.saveTemplates(templates);
  }

  // Rule Citations
  getCitations(): RuleCitation[] {
    return this.getItem<RuleCitation>(STORAGE_KEYS.CITATIONS);
  }

  saveCitations(citations: RuleCitation[]): void {
    this.setItem(STORAGE_KEYS.CITATIONS, citations);
  }

  getCitation(id: string): RuleCitation | undefined {
    return this.getCitations().find((citation: RuleCitation) => citation.id === id);
  }

  addCitation(citation: RuleCitation): void {
    const citations = this.getCitations();
    citations.push(citation);
    this.saveCitations(citations);
  }

  deleteCitation(id: string): void {
    const citations = this.getCitations().filter((citation: RuleCitation) => citation.id !== id);
    this.saveCitations(citations);
  }

  // Rule Comments
  getComments(): RuleComment[] {
    return this.getItem<RuleComment>(STORAGE_KEYS.COMMENTS);
  }

  saveComments(comments: RuleComment[]): void {
    this.setItem(STORAGE_KEYS.COMMENTS, comments);
  }

  getComment(id: string): RuleComment | undefined {
    return this.getComments().find((comment: RuleComment) => comment.id === id);
  }

  addComment(comment: RuleComment): void {
    const comments = this.getComments();
    comments.push(comment);
    this.saveComments(comments);
  }

  updateComment(id: string, updates: Partial<RuleComment>): void {
    const comments = this.getComments();
    const index = comments.findIndex((comment: RuleComment) => comment.id === id);
    if (index !== -1) {
      comments[index] = { ...comments[index], ...updates };
      this.saveComments(comments);
    }
  }

  deleteComment(id: string): void {
    const comments = this.getComments().filter((comment: RuleComment) => comment.id !== id);
    this.saveComments(comments);
  }

  // Enforcement Incidents
  getIncidents(): EnforcementIncident[] {
    return this.getItem<EnforcementIncident>(STORAGE_KEYS.INCIDENTS);
  }

  saveIncidents(incidents: EnforcementIncident[]): void {
    this.setItem(STORAGE_KEYS.INCIDENTS, incidents);
  }

  getIncident(id: string): EnforcementIncident | undefined {
    return this.getIncidents().find((incident: EnforcementIncident) => incident.id === id);
  }

  addIncident(incident: EnforcementIncident): void {
    const incidents = this.getIncidents();
    incidents.push(incident);
    this.saveIncidents(incidents);
  }

  updateIncident(id: string, updates: Partial<EnforcementIncident>): void {
    const incidents = this.getIncidents();
    const index = incidents.findIndex((incident: EnforcementIncident) => incident.id === id);
    if (index !== -1) {
      incidents[index] = { ...incidents[index], ...updates };
      this.saveIncidents(incidents);
    }
  }

  deleteIncident(id: string): void {
    const incidents = this.getIncidents().filter((incident: EnforcementIncident) => incident.id !== id);
    this.saveIncidents(incidents);
  }

  // Rule Versions
  getVersions(): RuleVersion[] {
    return this.getItem<RuleVersion>(STORAGE_KEYS.VERSIONS);
  }

  saveVersions(versions: RuleVersion[]): void {
    this.setItem(STORAGE_KEYS.VERSIONS, versions);
  }

  getVersion(id: string): RuleVersion | undefined {
    return this.getVersions().find((version: RuleVersion) => version.id === id);
  }

  addVersion(version: RuleVersion): void {
    const versions = this.getVersions();
    versions.push(version);
    this.saveVersions(versions);
  }

  // Conflict Reports
  getConflicts(): ConflictReport[] {
    return this.getItem<ConflictReport>(STORAGE_KEYS.CONFLICTS);
  }

  saveConflicts(conflicts: ConflictReport[]): void {
    this.setItem(STORAGE_KEYS.CONFLICTS, conflicts);
  }

  getConflict(id: string): ConflictReport | undefined {
    return this.getConflicts().find((conflict: ConflictReport) => conflict.id === id);
  }

  addConflict(conflict: ConflictReport): void {
    const conflicts = this.getConflicts();
    conflicts.push(conflict);
    this.saveConflicts(conflicts);
  }

  deleteConflict(id: string): void {
    const conflicts = this.getConflicts().filter((conflict: ConflictReport) => conflict.id !== id);
    this.saveConflicts(conflicts);
  }

  clearConflicts(): void {
    this.saveConflicts([]);
  }

  // Clear all data
  clearAll(): void {
    if (!this.isBrowser()) return;
    Object.values(STORAGE_KEYS).forEach((key: string) => {
      localStorage.removeItem(key);
    });
  }
}

export const storageService = new StorageService();
