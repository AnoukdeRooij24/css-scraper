import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { isSameColor } from "./compare-color";
import {
  walkTokens,
  isRef,
} from "@nl-design-system-community/design-tokens-schema";
import fdnd from "./fdnd.tokens.json";

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
    let niceColors: unknown[] = [];
    // check welke kleur tokens er in de fdnd tokens staan,
    // met isRef kijk je of het referenties zijn naar andere kleuren, als dit niet waar is (! = not true) EN (&&) het type van de token is een kleur dan worden ze getoont
    walkTokens(fdnd, (token) => {
      if (!isRef(token.$value) && token.$type === "color") {
        niceColors = [...niceColors, token.$value];
        console.log(token);
      }
    });

    // TODO: first filter out all tokens that aren't even colors
    const evilTokens = this.json.filter(
      (token) =>
        !niceColors.find((niceColor) =>
          isSameColor(
            String(niceColor),
            String(token["$extensions"][
              "nl.nldesignsystem.theme-wizard.css-authored-as"
            ]),
          ),
        ),
    );
    const niceTokens = this.json.filter((token) =>
      niceColors.find((niceColor) =>
        isSameColor(
          String(niceColor),
          String(token["$extensions"][
            "nl.nldesignsystem.theme-wizard.css-authored-as"
          ]),
        ),
      ),
    );

    console.log({ tokens: this.json, evilTokens, niceTokens });
    console.log( niceColors )

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
      <h2>Colors 🌈</h2>
      <ul>
        ${niceColors.length === 0 
            ? html`<li style="color: black">Fout: Er worden geen kleuren uit het NL Design System gebruikt.</li>` 
            : html `<li style="color: black"> Goed: ${niceColors.length} kleur tokens gevonden! </li>`}
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
