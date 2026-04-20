import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { isSameColor } from "./compare-color";

// custom element <theme-overview> uit Lit
@customElement("theme-overview")
export class ThemeOverview extends LitElement {
  json: object[] = [];
  constructor() {
    // constructor wordt voor elk element 1x aangeroepen
    // `super` is de `LitElement` `constructor` functie, die moet ook weer aangeroepen worden
    super();
    // TODO: Don't run this in the constructor, this is just WIP, but should make it in production
    this.analyse();
  }
  async analyse() {
    // scraper server must have been started using `pnpm run start:scraper`
    // TODO: make `url` configurable
    const data = await fetch("/scraper/api/v1/css-design-tokens?url=fdnd.nl");

    // Parse `json` from scraper result
    const tokens = await data.json();

    if (Array.isArray(tokens)) {
      // If all went well, we'll have an array with tokens info
      this.json = tokens;
    } else {
      // If something went wrong, reset the array so we'll never look at old tokens
      // when something broke.
      this.json = [];
    }

    // render the new analysis
    this.render();

    // ...and actually render it!
    // TODO: remove this, and just call `analyse` at a better time than in the constructor
    this.requestUpdate();
  }

  render() {
    // TODO: Get color values from `fdnd.tokens.json`
    const niceColors = ["#9F77EE", "#89E2C1", "#FFFC96", "#05053F", "#ECECEC"];

    // TODO: first filter out all tokens that aren't even colors
    const evilTokens = this.json.filter(
      (token) =>
        !niceColors.find((niceColor) =>
          isSameColor(
            niceColor,
            token["$extensions"][
              "nl.nldesignsystem.theme-wizard.css-authored-as"
            ],
          ),
        ),
    );
    const niceTokens = this.json.filter((token) =>
      niceColors.find((niceColor) =>
        isSameColor(
          niceColor,
          token["$extensions"][
            "nl.nldesignsystem.theme-wizard.css-authored-as"
          ],
        ),
      ),
    );

    console.log({ tokens: this.json, evilTokens, niceTokens });

    return html`<h2>tokens</h2>
      <ul>
        ${this.json.map(
          (token) =>
            html`<li
              style="color: ${token["$extensions"][
                "nl.nldesignsystem.theme-wizard.css-authored-as"
              ]}"
            >
              token:
              <code
                >${token["$extensions"][
                  "nl.nldesignsystem.theme-wizard.css-authored-as"
                ]}</code
              >
            </li>`,
        )}
      </ul>
      <h2>nice tokens ❤️</h2>
      <ul>
        ${niceTokens.map(
          (token) =>
            html`<li
              style="color: ${token["$extensions"][
                "nl.nldesignsystem.theme-wizard.css-authored-as"
              ]}"
            >
              token:
              <code
                >${token["$extensions"][
                  "nl.nldesignsystem.theme-wizard.css-authored-as"
                ]}</code
              >
            </li>`,
        )}
      </ul>
      <h2>evil tokens!!!</h2>
      <ul>
        ${evilTokens
          .filter((token) => token["$type"] === "color")
          .map(
            (token) =>
              html`<li
                style="color: ${token["$extensions"][
                  "nl.nldesignsystem.theme-wizard.css-authored-as"
                ]}"
              >
                token:
                <code
                  >${token["$extensions"][
                    "nl.nldesignsystem.theme-wizard.css-authored-as"
                  ]}</code
                >
              </li>`,
          )}
      </ul>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "theme-overview": ThemeOverview;
  }
}
