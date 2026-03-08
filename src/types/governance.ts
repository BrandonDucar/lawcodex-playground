export type RuleCategory = 
  | "culture"
  | "drops"
  | "ops"
  | "social"
  | "agents"
  | "pickleball"
  | "meta"
  | "world"
  | "other";

export type RuleType =
  | "principle"
  | "policy"
  | "recommendation"
  | "restriction"
  | "mandate"
  | "prohibition";

export type Severity =
  | "none"
  | "low"
  | "medium"
  | "high"
  | "critical";

export type EnforcementStyle =
  | "soft-advice"
  | "agent-enforced"
  | "backend-enforced"
  | "human-reviewed"
  | "narrative-enforced";

export type RuleStatus = "draft" | "active" | "deprecated" | "superseded";

export type AmendmentType =
  | "clarification"
  | "modification"
  | "exception"
  | "override"
  | "repeal";

export type AmendmentStatus = "proposed" | "approved" | "rejected";

export type TargetType =
  | "app"
  | "agent"
  | "flow"
  | "timeline"
  | "identity"
  | "territory-node"
  | "scenario"
  | "other";

export type VoteType = "for" | "against" | "abstain";

export type RelationshipType =
  | "supersedes"
  | "depends-on"
  | "conflicts-with"
  | "implements"
  | "derives-from"
  | "exception-to";

export type CitationType =
  | "supports"
  | "clarifies"
  | "restricts"
  | "extends";

export type CommentType =
  | "question"
  | "concern"
  | "support"
  | "revision-request";

export type IncidentType =
  | "violation"
  | "edge-case"
  | "exception-granted";

export type ExportFormat =
  | "json"
  | "markdown"
  | "yaml"
  | "pdf"
  | "text";

export type DisruptionLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface SEOMetadata {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  seoHashtags: string[];
  altText: string;
}

// Enhanced GovRule with time-based and precedence features
export interface GovRule extends SEOMetadata {
  id: string;
  name: string;
  code: string;
  category: RuleCategory;
  description: string;
  ruleType: RuleType;
  appliesToTypes: string[];
  appliesToRefs: string[];
  severity: Severity;
  enforcementStyle: EnforcementStyle;
  status: RuleStatus;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  
  // Enhancement: Time-based rules
  effectiveFrom?: string;
  expiresAt?: string;
  seasonalScope?: string[];
  
  // Enhancement: Rule precedence/hierarchy
  precedenceLevel: number; // 1 = constitutional, 10 = operational guideline
  canBeOverriddenBy?: string[]; // role IDs that can override
}

export interface Amendment {
  id: string;
  ruleId: string;
  title: string;
  description: string;
  amendmentType: AmendmentType;
  createdAt: string;
  status: AmendmentStatus;
  notes: string;
}

export interface EnforcementGroup {
  id: string;
  name: string;
  description: string;
  roles: string[];
  agentIds: string[];
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface GovTagDefinition {
  id: string;
  tag: string;
  description: string;
  applicableToTypes: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface RuleAttachment {
  id: string;
  ruleId: string;
  targetType: TargetType;
  targetRef: string;
  notes: string;
  createdAt: string;
}

export interface GovernanceVote {
  id: string;
  ruleId: string;
  voter: string;
  vote: VoteType;
  justification: string;
  timestamp: string;
}

// Enhancement 1: Rule Relationships & Dependencies
export interface RuleRelationship {
  id: string;
  sourceRuleId: string;
  targetRuleId: string;
  relationshipType: RelationshipType;
  notes: string;
  createdAt: string;
}

// Enhancement 4: Rule Templates & Patterns
export interface RuleTemplate {
  id: string;
  name: string;
  category: RuleCategory;
  description: string;
  templateFields: TemplateField[];
  generatedRulePattern: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateField {
  name: string;
  type: string;
  defaultValue: string | number | boolean;
  required: boolean;
}

// Enhancement 8: Rule Citation System
export interface RuleCitation {
  id: string;
  citingRuleId: string;
  citedRuleId: string;
  citationType: CitationType;
  citationText: string;
  createdAt: string;
}

// Enhancement 11: Rule Discussion Threads
export interface RuleComment {
  id: string;
  ruleId: string;
  author: string;
  commentType: CommentType;
  text: string;
  timestamp: string;
  resolved: boolean;
}

// Enhancement 12: Enforcement Incident Logging
export interface EnforcementIncident {
  id: string;
  ruleId: string;
  targetType: TargetType;
  targetRef: string;
  incidentType: IncidentType;
  description: string;
  enforcementGroupId?: string;
  resolution: string;
  timestamp: string;
}

// Enhancement 14: Rule Versioning & Changelog
export interface RuleVersion {
  id: string;
  ruleId: string;
  version: number;
  changes: string;
  changedBy: string; // amendment ID or user
  timestamp: string;
  snapshot: Partial<GovRule>;
}

// Enhancement 2: Conflict Detection
export interface ConflictReport {
  id: string;
  conflictType: string;
  severity: Severity;
  rule1: GovRule;
  rule2: GovRule;
  description: string;
  detectedAt: string;
}

// Enhancement 5: Impact Analysis
export interface ImpactReport {
  ruleId: string;
  rule: GovRule;
  affectedTargets: RuleAttachment[];
  dependentRules: GovRule[];
  relatedRelationships: RuleRelationship[];
  enforcementGroups: EnforcementGroup[];
  estimatedDisruptionLevel: DisruptionLevel;
  impactSummary: string;
}

// Enhancement 9: Governance Metrics
export interface GovernanceMetrics {
  totalRules: number;
  rulesByCategory: Record<string, number>;
  rulesBySeverity: Record<string, number>;
  rulesByStatus: Record<string, number>;
  activeAmendments: number;
  amendmentApprovalRate: number;
  mostAttachedRules: Array<{ rule: GovRule; attachmentCount: number }>;
  orphanedRules: GovRule[];
  conflictingRules: number;
  totalRelationships: number;
  totalIncidents: number;
  averagePrecedenceLevel: number;
}

export interface AuditReport {
  targetType: TargetType;
  targetRef: string;
  activeRules: GovRule[];
  recommendations: GovRule[];
  restrictions: GovRule[];
  mandates: GovRule[];
  deprecatedRules: GovRule[];
  relatedAmendments: Amendment[];
  summary: string;
}

// Input types
export interface CreateGovRuleInput {
  name: string;
  code: string;
  category: RuleCategory;
  description: string;
  ruleType: RuleType;
  appliesToTypes: string[];
  appliesToRefs?: string[];
  severity?: Severity;
  enforcementStyle?: EnforcementStyle;
  status?: RuleStatus;
  tags?: string[];
  notes?: string;
  effectiveFrom?: string;
  expiresAt?: string;
  seasonalScope?: string[];
  precedenceLevel?: number;
  canBeOverriddenBy?: string[];
}

export interface UpdateGovRuleInput extends Partial<CreateGovRuleInput> {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seoHashtags?: string[];
  altText?: string;
}

export interface CreateAmendmentInput {
  ruleId: string;
  title: string;
  description: string;
  amendmentType: AmendmentType;
}

export interface CreateEnforcementGroupInput {
  name: string;
  description: string;
  roles: string[];
  agentIds?: string[];
  tags?: string[];
  notes?: string;
}

export interface CreateTagDefinitionInput {
  tag: string;
  description: string;
  applicableToTypes: string[];
  notes?: string;
}

export interface CreateRuleAttachmentInput {
  ruleId: string;
  targetType: TargetType;
  targetRef: string;
  notes?: string;
}

export interface CreateRuleRelationshipInput {
  sourceRuleId: string;
  targetRuleId: string;
  relationshipType: RelationshipType;
  notes?: string;
}

export interface CreateRuleTemplateInput {
  name: string;
  category: RuleCategory;
  description: string;
  templateFields: TemplateField[];
  generatedRulePattern: string;
}

export interface CreateRuleCitationInput {
  citingRuleId: string;
  citedRuleId: string;
  citationType: CitationType;
  citationText: string;
}

export interface CreateRuleCommentInput {
  ruleId: string;
  author: string;
  commentType: CommentType;
  text: string;
}

export interface CreateEnforcementIncidentInput {
  ruleId: string;
  targetType: TargetType;
  targetRef: string;
  incidentType: IncidentType;
  description: string;
  enforcementGroupId?: string;
  resolution: string;
}

// Filter types
export interface GovRulesFilter {
  category?: RuleCategory;
  ruleType?: RuleType;
  severity?: Severity;
  enforcementStyle?: EnforcementStyle;
  status?: RuleStatus;
  tag?: string;
  precedenceLevel?: number;
  isActive?: boolean; // checks effectiveFrom/expiresAt
}

export interface AmendmentsFilter {
  ruleId?: string;
  status?: AmendmentStatus;
  amendmentType?: AmendmentType;
}

export interface RelationshipsFilter {
  sourceRuleId?: string;
  targetRuleId?: string;
  relationshipType?: RelationshipType;
}

export interface CommentsFilter {
  ruleId?: string;
  author?: string;
  commentType?: CommentType;
  resolved?: boolean;
}

export interface IncidentsFilter {
  ruleId?: string;
  targetType?: TargetType;
  incidentType?: IncidentType;
  enforcementGroupId?: string;
}
