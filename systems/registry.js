// systems/registry.js — EntryRegistry: the content graph
// Entries are nodes, links are typed edges.
// The graph IS the game — mechanics traverse it at runtime.

export class EntryRegistry {
  #entries = new Map();
  #links = [];
  #outIdx = new Map();  // entryId -> [{link, target}]
  #inIdx  = new Map();  // entryId -> [{link, source}]
  #typeIdx = new Map(); // entryType -> [entry]

  constructor(entries, links) {
    // entries can be an object {id: entry} or array of entries
    const entryList = Array.isArray(entries) ? entries : Object.values(entries);
    for (const e of entryList) {
      this.#entries.set(e.id, e);
      if (!this.#typeIdx.has(e.type)) this.#typeIdx.set(e.type, []);
      this.#typeIdx.get(e.type).push(e);
    }

    this.#links = links;
    for (const link of links) {
      // outgoing index
      if (!this.#outIdx.has(link.source)) this.#outIdx.set(link.source, []);
      this.#outIdx.get(link.source).push({ link, target: link.target });

      // incoming index
      if (!this.#inIdx.has(link.target)) this.#inIdx.set(link.target, []);
      this.#inIdx.get(link.target).push({ link, source: link.source });
    }
  }

  get(id) {
    return this.#entries.get(id);
  }

  has(id) {
    return this.#entries.has(id);
  }

  // All entries linked FROM this entry with a given link type
  // registry.outgoing("h_blizzard", "threatens") -> [district entries...]
  outgoing(entryId, linkType) {
    const edges = this.#outIdx.get(entryId) || [];
    const filtered = linkType ? edges.filter(e => e.link.type === linkType) : edges;
    return filtered.map(e => ({
      entry: this.#entries.get(e.target),
      link: e.link,
    })).filter(e => e.entry);
  }

  // All entries linked TO this entry with a given link type
  // registry.incoming("h_blizzard", "mitigates") -> [infrastructure entries...]
  incoming(entryId, linkType) {
    const edges = this.#inIdx.get(entryId) || [];
    const filtered = linkType ? edges.filter(e => e.link.type === linkType) : edges;
    return filtered.map(e => ({
      entry: this.#entries.get(e.source),
      link: e.link,
    })).filter(e => e.entry);
  }

  // All entries of a given type
  ofType(type) {
    return this.#typeIdx.get(type) || [];
  }

  // Get the link between two specific entries
  link(sourceId, targetId) {
    return this.#links.find(l => l.source === sourceId && l.target === targetId) || null;
  }

  // All links of a given type
  linksOfType(linkType) {
    return this.#links.filter(l => l.type === linkType);
  }

  // Compute total mitigation for a hazard by walking mitigates links
  // and checking which infrastructure is built (via state)
  totalMitigation(hazardId, state) {
    const mitigators = this.incoming(hazardId, "mitigates");
    let total = 0;
    for (const { entry, link } of mitigators) {
      const infraState = state.get(`infrastructure.${entry.id}`);
      if (infraState?.built) {
        total += link.value ?? entry.mitigationValue ?? 0;
      }
    }
    return total;
  }

  // All entries as an array
  all() {
    return [...this.#entries.values()];
  }

  // All links
  allLinks() {
    return this.#links;
  }

  // Validate: find broken links (source or target doesn't exist)
  validate() {
    const errors = [];
    for (const link of this.#links) {
      if (!this.#entries.has(link.source)) {
        errors.push(`Link references missing source: ${link.source} -[${link.type}]-> ${link.target}`);
      }
      if (!this.#entries.has(link.target)) {
        errors.push(`Link references missing target: ${link.source} -[${link.type}]-> ${link.target}`);
      }
    }
    return errors;
  }
}
