// systems/schema.js — JSON Schema definitions + validator for all game content types
// Validates scenarios, interventions, conversations, entries, and links.
// Used by the authoring tool and at dev-time to catch content errors.

// ── Schema Definitions ─────────────────────────────────────────

export const SCHEMAS = {

  // ── Scenario Event ─────────────────────────────────────────
  scenario: {
    type: 'object',
    required: ['id', 'headline', 'narrative', 'conditions'],
    properties: {
      id:        { type: 'string', pattern: '^evt_' },
      headline:  { type: 'string', minLength: 1 },
      narrative: { type: 'string', minLength: 1 },
      phase:     { type: 'string', enum: ['distant', 'escalation', 'crisis', 'aftermath'] },
      pool:      { type: 'string', description: 'Event pool name for random selection' },
      priority:  { type: 'number', description: 'Higher priority fires first within same week' },
      repeatable:{ type: 'boolean' },
      conditions: {
        type: 'array',
        items: { $ref: '#/$defs/condition' },
      },
      effects: {
        type: 'array',
        items: { $ref: '#/$defs/effect' },
      },
      chains: {
        type: 'array',
        items: {
          type: 'object',
          required: ['eventId', 'delay'],
          properties: {
            eventId: { type: 'string' },
            delay:   { type: 'number', minimum: 1, description: 'Weeks delay before chained event' },
          },
        },
      },
    },
    $defs: {
      condition: {
        type: 'object',
        required: ['type'],
        properties: {
          type: {
            type: 'string',
            enum: [
              // Temporal
              'week', 'weekRange', 'weekAfter', 'weekBefore',
              // Trust / Resilience
              'trustBelow', 'trustAbove',
              // Disorder (dual metre)
              'disorderAbove', 'disorderBelow',
              // Resources
              'reserveBelow', 'reserveAbove',
              // Knowledge
              'insightCount', 'insightCategory', 'patternExists',
              // Flags
              'flag', 'notFlag',
              // District
              'districtVisited', 'districtNotVisited', 'visitedCount',
              // Policy
              'policyActive',
              // Combinators
              'AND', 'OR', 'NOT',
            ],
          },
          // Temporal
          value:    { type: ['number', 'string'] },
          min:      { type: 'number' },
          max:      { type: 'number' },
          // Trust/resource
          district: { type: 'string' },
          scope:    { type: 'string', enum: ['citywide', 'any', 'all', 'district'] },
          // Insight
          category: { type: 'string', enum: ['HEALTH', 'HOUSING', 'INFRA', 'SERVICES', 'SAFETY', 'ASSET'] },
          count:    { type: 'number', minimum: 1 },
          // Combinators
          conditions: { type: 'array', items: { $ref: '#/$defs/condition' } },
          condition:  { $ref: '#/$defs/condition' },
        },
      },
      effect: {
        type: 'object',
        required: ['type'],
        properties: {
          type: {
            type: 'string',
            enum: [
              'trust', 'reserve', 'flag', 'removeFlag', 'feed_item',
              'knowledge', 'trustScope', 'queueEvent', 'addModifier',
              // Disorder (dual metre)
              'disorder', 'disorderScope',
            ],
          },
          // Trust
          district: { type: 'string' },
          delta:    { type: 'number' },
          // Scoped trust
          scope:    { type: 'string', enum: ['all', 'lowest_trust', 'highest_trust', 'all_below', 'all_above', 'bloc', 'visited', 'unvisited'] },
          threshold:{ type: 'number' },
          bloc:     { type: 'string' },
          modifier: {
            type: 'object',
            properties: {
              source: { type: 'string' },
              label:  { type: 'string' },
              value:  { type: 'number' },
              decay:  { type: 'number' },
              expiresWeek: { type: 'number' },
            },
          },
          // Flag
          value: { type: 'string' },
          // Feed
          text:     { type: 'string' },
          feedType: { type: 'string', enum: ['news', 'chatter', 'reaction', 'dm'] },
          // Queue
          eventId:  { type: 'string' },
          delay:    { type: 'number', minimum: 1 },
        },
      },
    },
  },

  // ── Intervention ───────────────────────────────────────────
  intervention: {
    type: 'object',
    required: ['id', 'name', 'tier', 'cost', 'description', 'trustEffect'],
    properties: {
      id:          { type: 'string', pattern: '^int_' },
      name:        { type: 'string', minLength: 1 },
      tier:        { type: 'string', enum: ['generic', 'informed', 'pattern'] },
      cost:        { type: 'number', minimum: 0 },
      description: { type: 'string', minLength: 1 },
      trustEffect: {
        type: 'object',
        required: ['targeted', 'citywide'],
        properties: {
          targeted: { type: 'number' },
          citywide: { type: 'number' },
        },
      },
      concernEffect: {
        type: ['object', 'null'],
        patternProperties: {
          '.*': { type: 'number' },
        },
      },
      requiredCategory: { type: 'string', enum: ['HEALTH', 'HOUSING', 'INFRA', 'SERVICES', 'SAFETY', 'ASSET'] },
      requiredCount:    { type: 'number', minimum: 1 },
      requiredPattern:  { type: 'string' },
      repeatable:       { type: 'boolean' },
      target:           { type: 'string', enum: ['single', 'citywide', 'category', 'pattern'] },
    },
  },

  // ── Conversation ───────────────────────────────────────────
  conversation: {
    type: 'object',
    required: ['character', 'exchanges'],
    properties: {
      character: {
        type: 'object',
        required: ['name', 'role', 'initials'],
        properties: {
          name:     { type: 'string', minLength: 1 },
          role:     { type: 'string', minLength: 1 },
          initials: { type: 'string', minLength: 1, maxLength: 3 },
        },
      },
      exchanges: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['npc', 'choices'],
          properties: {
            npc: { type: 'string', minLength: 1 },
            choices: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['text', 'depth'],
                properties: {
                  text:  { type: 'string', minLength: 1 },
                  depth: { type: 'number', enum: [0, 1, 2] },
                },
              },
            },
            insight: {
              type: 'object',
              properties: {
                category: { type: 'string', enum: ['HEALTH', 'HOUSING', 'INFRA', 'SERVICES', 'SAFETY', 'ASSET'] },
                text:     { type: 'string', minLength: 1 },
              },
            },
          },
        },
      },
    },
  },

  // ── District Entry ─────────────────────────────────────────
  district: {
    type: 'object',
    required: ['id', 'type', 'label', 'boro', 'bloc', 'pop', 'baseResilience', 'position', 'concerns'],
    properties: {
      id:             { type: 'string', pattern: '^d_' },
      type:           { type: 'string', const: 'district' },
      label:          { type: 'string', minLength: 1 },
      boro:           { type: 'string', enum: ['The Bronx', 'Manhattan', 'Queens', 'Brooklyn', 'Staten Island'] },
      bloc:           { type: 'string', enum: ['working', 'finance', 'realestate', 'progressives', 'labor'] },
      region:         { type: 'string' },
      pop:            { type: 'number', minimum: 1 },
      baseResilience: { type: 'number', minimum: 0, maximum: 100 },
      position:       {
        type: 'object',
        required: ['x', 'y'],
        properties: { x: { type: 'number' }, y: { type: 'number' } },
      },
      concern:  { type: 'string' },
      concerns: {
        type: 'object',
        required: ['health', 'housing', 'transit', 'safety', 'infra', 'services'],
        properties: {
          health:   { type: 'number', minimum: 0, maximum: 10 },
          housing:  { type: 'number', minimum: 0, maximum: 10 },
          transit:  { type: 'number', minimum: 0, maximum: 10 },
          safety:   { type: 'number', minimum: 0, maximum: 10 },
          infra:    { type: 'number', minimum: 0, maximum: 10 },
          services: { type: 'number', minimum: 0, maximum: 10 },
        },
      },
      character: {
        type: ['object', 'null'],
        properties: {
          name:     { type: 'string' },
          role:     { type: 'string' },
          initials: { type: 'string' },
        },
      },
      vulnerabilities: { type: 'array', items: { type: 'string' } },
    },
  },

  // ── Bento Tile ─────────────────────────────────────────────
  tile: {
    type: 'object',
    required: ['id', 'type', 'label', 'size', 'cost'],
    properties: {
      id:    { type: 'string' },
      type:  { type: 'string', enum: ['WHERE', 'WHAT', 'HOW', 'FUNDING'] },
      label: { type: 'string', minLength: 1 },
      size:  {
        type: 'array',
        items: { type: 'number', minimum: 1, maximum: 5 },
        minItems: 2,
        maxItems: 2,
      },
      cost:        { type: 'number', minimum: 0 },
      resilience:  { type: 'number' },
      disorder:    { type: 'number' },
      desc:        { type: 'string' },
      tags:        { type: 'array', items: { type: 'string' } },
      targets:     { type: ['array', 'string'] },
      mutatesFrom: { type: ['string', 'null'] },
      requiredInsightCategory: { type: 'string', enum: ['HEALTH', 'HOUSING', 'INFRA', 'SERVICES', 'SAFETY', 'ASSET'] },
      requiredInsightCount:    { type: 'number', minimum: 1 },
      requiresSelection:       { type: 'boolean' },
    },
  },

  // ── Synergy Rule ──────────────────────────────────────────
  synergy: {
    type: 'object',
    required: ['id', 'tiles', 'label', 'resilienceBonus'],
    properties: {
      id:                { type: 'string', pattern: '^syn_' },
      tiles:             { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 },
      alsoMatches:       { type: 'array', items: { type: 'string' } },
      label:             { type: 'string', minLength: 1 },
      desc:              { type: 'string' },
      resilienceBonus:   { type: 'number' },
      disorderReduction: { type: 'number' },
    },
  },

  // ── Conflict Rule ─────────────────────────────────────────
  conflict: {
    type: 'object',
    required: ['id', 'tiles', 'label'],
    properties: {
      id:               { type: 'string', pattern: '^con_' },
      tiles:            { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 },
      label:            { type: 'string', minLength: 1 },
      desc:             { type: 'string' },
      resiliencePenalty: { type: 'number' },
      disorderCost:     { type: 'number' },
    },
  },

  // ── Link (content graph edge) ──────────────────────────────
  link: {
    type: 'object',
    required: ['source', 'target', 'type'],
    properties: {
      source: { type: 'string', minLength: 1 },
      target: { type: 'string', minLength: 1 },
      type:   {
        type: 'string',
        enum: [
          'threatens', 'mitigates', 'protects', 'cascades', 'causes',
          'affects', 'costs', 'builds', 'requires', 'exposed_to',
          'cares_about', 'occurs_in',
        ],
      },
      weight:    { type: 'number' },
      value:     { type: 'number' },
      condition: { type: 'string' },
    },
  },
};


// ── Validator ──────────────────────────────────────────────────

export class SchemaValidator {

  // Validate a single item against a named schema
  // Returns { valid: boolean, errors: string[] }
  validate(data, schemaName) {
    const schema = SCHEMAS[schemaName];
    if (!schema) return { valid: false, errors: [`Unknown schema: ${schemaName}`] };
    const errors = [];
    this.#check(data, schema, schemaName, errors, schema.$defs || {});
    return { valid: errors.length === 0, errors };
  }

  // Validate an array of items
  validateAll(items, schemaName) {
    const results = [];
    for (let i = 0; i < items.length; i++) {
      const r = this.validate(items[i], schemaName);
      if (!r.valid) {
        results.push({ index: i, id: items[i]?.id || `[${i}]`, errors: r.errors });
      }
    }
    return { valid: results.length === 0, results };
  }

  // Cross-reference validation: check that all district/entry references exist
  validateReferences(scenarios, districtIds, flagsUsed) {
    const errors = [];
    const allIds = new Set(districtIds);

    for (const evt of scenarios) {
      // Check district references in conditions
      for (const cond of (evt.conditions || [])) {
        this.#checkConditionRefs(cond, allIds, evt.id, errors);
      }
      // Check district references in effects
      for (const eff of (evt.effects || [])) {
        if (eff.district && !allIds.has(eff.district)) {
          errors.push(`${evt.id}: effect references unknown district '${eff.district}'`);
        }
      }
      // Check chained event references
      for (const chain of (evt.chains || [])) {
        const target = scenarios.find(e => e.id === chain.eventId);
        if (!target) {
          errors.push(`${evt.id}: chains to unknown event '${chain.eventId}'`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // ── Internal ─────────────────────────────────────────────

  #checkConditionRefs(cond, validIds, evtId, errors) {
    if (cond.district && !validIds.has(cond.district)) {
      errors.push(`${evtId}: condition references unknown district '${cond.district}'`);
    }
    if (cond.conditions) {
      for (const c of cond.conditions) this.#checkConditionRefs(c, validIds, evtId, errors);
    }
    if (cond.condition) {
      this.#checkConditionRefs(cond.condition, validIds, evtId, errors);
    }
  }

  #check(data, schema, path, errors, defs) {
    if (!schema) return;

    // Handle $ref
    if (schema.$ref) {
      const refName = schema.$ref.replace('#/$defs/', '');
      const refSchema = defs[refName];
      if (refSchema) this.#check(data, refSchema, path, errors, defs);
      return;
    }

    // Type check
    if (schema.type) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type];
      const actualType = data === null ? 'null' : Array.isArray(data) ? 'array' : typeof data;
      if (!types.includes(actualType)) {
        errors.push(`${path}: expected ${types.join('|')}, got ${actualType}`);
        return;
      }
    }

    // Const
    if (schema.const !== undefined && data !== schema.const) {
      errors.push(`${path}: expected '${schema.const}', got '${data}'`);
    }

    // Enum
    if (schema.enum && !schema.enum.includes(data)) {
      errors.push(`${path}: '${data}' not in [${schema.enum.join(', ')}]`);
    }

    // String constraints
    if (typeof data === 'string') {
      if (schema.minLength && data.length < schema.minLength) {
        errors.push(`${path}: string too short (min ${schema.minLength})`);
      }
      if (schema.maxLength && data.length > schema.maxLength) {
        errors.push(`${path}: string too long (max ${schema.maxLength})`);
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
        errors.push(`${path}: '${data}' doesn't match pattern /${schema.pattern}/`);
      }
    }

    // Number constraints
    if (typeof data === 'number') {
      if (schema.minimum !== undefined && data < schema.minimum) {
        errors.push(`${path}: ${data} < minimum ${schema.minimum}`);
      }
      if (schema.maximum !== undefined && data > schema.maximum) {
        errors.push(`${path}: ${data} > maximum ${schema.maximum}`);
      }
    }

    // Object
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      // Required fields
      if (schema.required) {
        for (const key of schema.required) {
          if (data[key] === undefined) {
            errors.push(`${path}: missing required field '${key}'`);
          }
        }
      }
      // Property schemas
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (data[key] !== undefined) {
            this.#check(data[key], propSchema, `${path}.${key}`, errors, defs);
          }
        }
      }
    }

    // Array
    if (Array.isArray(data)) {
      if (schema.minItems && data.length < schema.minItems) {
        errors.push(`${path}: array too short (min ${schema.minItems})`);
      }
      if (schema.items) {
        for (let i = 0; i < data.length; i++) {
          this.#check(data[i], schema.items, `${path}[${i}]`, errors, defs);
        }
      }
    }
  }
}
