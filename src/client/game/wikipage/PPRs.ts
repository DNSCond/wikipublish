// PersonalPreventRuleset

export class PersonalPreventRule extends HTMLElement {
  constructor(rule: any = null) {
    super();
    if (rule) {

    }
    this.attachShadow({ mode: 'open' }).innerHTML = `<dl class=dl></dl>`;

  }
}

export class PersonalPreventRuleset extends HTMLElement {
  constructor(json: any = null) {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = ``;
    const rules = json?.rules;
    if (Array.isArray(rules)) {
      for (const element of rules) {
        this.append(new PersonalPreventRule(element));
      }
    }
  }
}

customElements.define('personalprevent-rule', PersonalPreventRule);
customElements.define('personalprevent-ruleset', PersonalPreventRuleset);
